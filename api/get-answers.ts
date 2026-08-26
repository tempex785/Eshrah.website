import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { examId, isHomework } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: 'Missing auth header' });
  
  const token = authHeader.replace('Bearer ', '');
  try {
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ success: false, message: 'Invalid token: ' + (authError?.message || '') });
    
    // Check if the item is still open
    const itemTable = isHomework ? 'assignments' : 'exams';
    const { data: itemData, error: itemError } = await supabaseAdmin
      .from(itemTable)
      .select(isHomework ? 'deadline, is_active' : 'end_time, is_active')
      .eq('id', examId)
      .single();

    if (itemError || !itemData) {
      return res.status(404).json({ success: false, message: 'الامتحان/الواجب غير موجود.' });
    }

    const now = new Date();

    if (isHomework && itemData.deadline) {
      const deadlineDate = new Date(itemData.deadline);
      if (now < deadlineDate) {
        return res.status(400).json({ success: false, message: 'لا يمكن عرض الإجابات الصحيحة قبل انتهاء موعد التسليم.' });
      }
    } else if (!isHomework) {
      if (itemData.end_time) {
        const endDate = new Date(itemData.end_time);
        if (now < endDate) {
          return res.status(400).json({ success: false, message: 'لا يمكن عرض الإجابات الصحيحة قبل انتهاء موعد الامتحان.' });
        }
      } else if (itemData.is_active) {
         // Fallback if no end_time is set
         return res.status(400).json({ success: false, message: 'لا يمكن عرض الإجابات الصحيحة لأن الامتحان لا يزال متاحاً.' });
      }
    }

    // First, verify the user has submitted this exam
    const attemptField = isHomework ? 'assignment_id' : 'exam_id';
    const { data: attempts } = await supabaseAdmin
      .from('exam_attempts')
      .select('id')
      .eq('user_id', user.id)
      .eq(attemptField, examId)
      .limit(1);
      
    if (!attempts || attempts.length === 0) {
      return res.status(400).json({ success: false, message: 'You must submit the exam first.' });
    }
    
    // Get the questions for this exam
    const qField = isHomework ? 'assignment_id' : 'exam_id';
    const { data: questions } = await supabaseAdmin
      .from('questions')
      .select('id')
      .eq(qField, examId);
      
    if (!questions || questions.length === 0) {
      return res.json({ success: true, correctOptions: {} });
    }
    
    const questionIds = questions.map(q => q.id);
    
    // Get the correct options
    const { data: correctOptionsData } = await supabaseAdmin
      .from('options')
      .select('question_id, id')
      .in('question_id', questionIds)
      .eq('is_correct', true);
      
    const correctOptions: Record<string, string> = {};
    if (correctOptionsData) {
      correctOptionsData.forEach(opt => {
        correctOptions[opt.question_id] = opt.id;
      });
    }
    
    return res.json({ success: true, correctOptions });
    
  } catch (error: any) {
    console.error('Review API Error:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم، يرجى المحاولة لاحقاً.' });
  }
}
