import { createClient } from '@supabase/supabase-js';

export const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const supabaseAnonKey: string =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabaseServiceKey: string = process.env.SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
