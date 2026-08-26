import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { courseId } = req.body;
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    // Execute atomic transaction via PostgreSQL RPC (uses auth.uid() internally now)
    const userClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY || '', {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: rpcData, error: rpcError } = await userClient.rpc('join_course_atomic', {
      p_course_id: courseId
    });

    if (rpcError) {
      console.error('RPC Error:', rpcError);
      return res.status(500).json({ success: false, message: 'حدث خطأ أثناء الاشتراك.' });
    }

    if (!rpcData.success) {
       return res.status(400).json({ success: false, message: rpcData.message });
    }

    return res.json({ success: true, message: rpcData.message, balance: rpcData.balance });
    
  } catch (error: any) {
    console.error('Subscription API Error:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
}
