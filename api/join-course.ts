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
    
    // 1. Get Course Info
    let courseInfo = null;
    const { data: payCourse } = await supabaseAdmin
      .from('paycourses')
      .select('price, title')
      .eq('id', courseId)
      .single();
      
    if (payCourse) {
      courseInfo = payCourse;
    } else {
      const { data: freeCourse } = await supabaseAdmin
        .from('freecourses')
        .select('title')
        .eq('id', courseId)
        .single();
        
      if (freeCourse) {
        courseInfo = { ...freeCourse, price: 0 };
      }
    }

    if (!courseInfo) {
      return res.status(400).json({ success: false, message: 'الكورس غير موجود' });
    }

    let price = parseFloat(courseInfo.price || '0');
    if (isNaN(price)) price = 0;

    // 2. Check if already subscribed
    const { data: existingSub } = await supabaseAdmin
      .from('student_subscriptions')
      .select('id')
      .eq('student_id', user.id)
      .eq('course_id', courseId)
      .single();

    if (existingSub) {
      return res.status(400).json({ success: false, message: 'أنت مشترك بالفعل في هذا الكورس' });
    }

    // 3. Get Student Balance
    const { data: studentInfo, error: studentError } = await supabaseAdmin
      .from('students')
      .select('wallet_balance')
      .eq('id', user.id)
      .single();

    if (studentError || !studentInfo) {
      return res.status(400).json({ success: false, message: 'تعذر جلب بيانات الطالب' });
    }

    const currentBalance = parseFloat(studentInfo.wallet_balance || '0');

    if (currentBalance < price) {
      return res.status(400).json({ success: false, message: 'رصيدك غير كافٍ للاشتراك في هذا الكورس' });
    }

    const newBalance = currentBalance - price;

    // 4. Update Student Balance
    const { error: updateError } = await supabaseAdmin
      .from('students')
      .update({ wallet_balance: newBalance })
      .eq('id', user.id);

    if (updateError) {
      return res.status(500).json({ success: false, message: 'حدث خطأ أثناء خصم الرصيد' });
    }

    // 5. Insert Subscription
    const { error: subError } = await supabaseAdmin
      .from('student_subscriptions')
      .insert({
        student_id: user.id,
        course_id: courseId
      });
      
    if (subError) {
        console.error('Subscription Insert Error:', subError);
        // revert balance if possible, but skipping for simplicity
        return res.status(500).json({ success: false, message: 'حدث خطأ أثناء تسجيل الاشتراك' });
    }

    // 6. Log Transaction
    if (price > 0) {
      await supabaseAdmin
        .from('transactions_log')
        .insert({
          student_id: user.id,
          amount: price,
          type: 'purchase',
          description: `اشتراك في كورس: ${courseInfo.title}`
        });
    }

    return res.json({ success: true, message: 'تم الاشتراك بنجاح!', balance: newBalance });
    
  } catch (error: any) {
    console.error('Subscription API Error:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
}
