// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'server';
import { createClient } from '@supabase/supabase-js';
import { verify } from 'djwt';

console.log('Hello from Functions!');

serve(async (req) => {
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

    console.log('payload ', payload);

    const { code } = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ success: false, message: 'Code is required' }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const { data, error } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('qr_data', code)
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        invoice: data,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
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
