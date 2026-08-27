import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data: students, error: stdError } = await supabaseAdmin
      .from('students')
      .select('id, first_name, last_name, avatar_url');
      console.log(stdError);
}
run();
