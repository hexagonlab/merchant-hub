// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'server';
import { createClient } from '@supabase/supabase-js';
import { qrcode } from 'qrcode';
import { z } from 'zod';
import { verify } from 'djwt';

console.log('Hello from Functions!');

serve(async (req: Request) => {
  // if (req.method === 'OPTIONS') {
  //   return new Response('ok', { headers: corsHeaders });
  // }
  try {
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      // This way your row-level-security (RLS) policies are applied.
      {}
    );

    let payload;
    try {
      const auth = req.headers.get('Authorization');

      if (!auth) {
        return new Response(
          JSON.stringify({ success: false, message: 'Unauthorized' }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 401,
          }
        );
      }

      const jwt = auth.split(' ')[1];

      payload = await verify(jwt, Deno.env.get('JWT_SECRET') ?? '', 'HS256');
    } catch {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    console.log('client is: ', payload);

    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('*')
      .eq('client_id', payload.sub)
      .single();

    if (clientError) throw clientError;

    if (client.client_type !== 'MERCHANT') {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid client' }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    const { data: product, error: errorProduct } = await supabaseClient
      .from('product_lender')
      .select('product_id')
      .eq('lender_id', client.lender_id)
      .single();

    if (errorProduct) throw errorProduct;

    if (product === null) {
      console.log('Product not configured');
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    const Invoice = z.object({
      amount: z.string({
        required_error: 'Amount is required',
      }),
    });

    const requestJson = await req.json();

    const parsed = Invoice.safeParse(requestJson);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Validation error',
          details: parsed.error.errors.filter((x) => x.message),
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const invoice = {
      amount: parsed.data.amount,
      status: 'NEW',
      qr_type: 'DYNAMIC',
      merchant_branch_id: client.merchant_branch_id,
      product_id: product.product_id,
      lender_id: client.lender_id,
    };

    const { data, error } = await supabaseClient
      .from('invoices')
      .insert(invoice)
      .select()
      .single();

    if (error) throw error;

    const qrImage = await qrcode(data.qr_data);

    console.log('qrCode: ', qrImage);

    return new Response(
      JSON.stringify({
        success: true,
        invoice: data,
        qr_image: qrImage,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
