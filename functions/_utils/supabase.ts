import { createClient } from '@supabase/supabase-js';

export function getSupabase(env: any) {
  return createClient(
    env.VITE_SUPABASE_URL || '',
    env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || ''
  );
}
