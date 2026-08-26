import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { code } = req.body;
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
    
    // Execute atomic transaction via PostgreSQL RPC (uses auth.uid() internally)
    const userClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY || '', {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data, error } = await userClient.rpc('redeem_charge_card', {
      p_code: code
    });
      
    if (error) {
      console.error('RPC Error:', error);
      return res.status(500).json({ success: false, message: 'حدث خطأ أثناء الشحن.' });
    }
    
    if (!data.success) {
       return res.status(400).json({ success: false, message: data.message });
    }
    
    return res.json({ success: true, message: data.message, balance: data.balance });
    
  } catch (error: any) {
    console.error('Charge API Error:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
}
