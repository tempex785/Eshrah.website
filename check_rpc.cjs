require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.rpc('join_course_atomic', { p_student_id: '00000000-0000-0000-0000-000000000000', p_course_id: '00000000-0000-0000-0000-000000000000' });
  console.log("RPC result:", error);
}
run();
