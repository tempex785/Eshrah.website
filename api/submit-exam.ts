import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { examId, isHomework, answers } = req.body;
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
    
    // Validate inputs
    if (!examId || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'بيانات الامتحان غير صالحة.' });
    }
    
    // Check if exam/assignment exists and get total marks
    const itemTable = isHomework ? 'assignments' : 'exams';
    const selectFields = isHomework ? 'id, total_marks, deadline' : 'id, total_marks, start_time, end_time';
    const { data: itemInfo, error: itemError } = await supabaseAdmin
      .from(itemTable)
      .select(selectFields)
      .eq('id', examId)
      .single();
      
    if (itemError || !itemInfo) {
      return res.status(404).json({ success: false, message: 'الامتحان/الواجب غير موجود.' });
    }
    
    // Validate time window
    const now = new Date();
    
    if (isHomework) {
      if (itemInfo.deadline) {
        const deadlineDate = new Date(itemInfo.deadline);
        if (now > deadlineDate) {
          return res.status(403).json({ success: false, message: 'عذراً، لقد انتهى موعد التسليم.' });
        }
      }
    } else {
      if (itemInfo.start_time) {
        const startDate = new Date(itemInfo.start_time);
        if (now < startDate) {
          return res.status(403).json({ success: false, message: 'عذراً، لم يبدأ هذا الامتحان بعد.' });
        }
      }
      
      if (itemInfo.end_time) {
        const endDate = new Date(itemInfo.end_time);
        if (now > endDate) {
          return res.status(403).json({ success: false, message: 'عذراً، لقد انتهى وقت هذا الامتحان.' });
        }
      }
    }
    
    const questionField = isHomework ? 'assignment_id' : 'exam_id';
    
    // Get all questions
    const { data: questions } = await supabaseAdmin
      .from('questions')
      .select('id')
      .eq(questionField, examId);
      
    if (!questions) {
      return res.status(404).json({ success: false, message: 'لا توجد أسئلة.' });
    }
    
    // Get all correct options
    const questionIds = questions.map(q => q.id);
    const { data: correctOptions } = await supabaseAdmin
      .from('options')
      .select('question_id, id')
      .in('question_id', questionIds)
      .eq('is_correct', true);
      
    const correctMap: Record<string, string> = {};
    if (correctOptions) {
      correctOptions.forEach(opt => {
        correctMap[opt.question_id] = opt.id;
      });
    }
    
    // Calculate Score
    let correctCount = 0;
    answers.forEach(ans => {
      if (ans.selected_option_id && correctMap[ans.question_id] === ans.selected_option_id) {
        correctCount++;
      }
    });
    
    // Insert attempt
    const attemptData: any = {
      user_id: user.id,
      score: correctCount,
      completed_at: new Date().toISOString()
    };
    
    if (isHomework) {
      attemptData.assignment_id = examId;
    } else {
      attemptData.exam_id = examId;
    }
    
    const { data: attemptResult, error: attemptError } = await supabaseAdmin
      .from('exam_attempts')
      .insert(attemptData)
      .select('id')
      .single();
      
    if (attemptError || !attemptResult) {
      return res.status(500).json({ success: false, message: 'حدث خطأ أثناء حفظ النتيجة.' });
    }
    
    // Insert detailed answers
    const answersToInsert = answers.map(ans => ({
      attempt_id: attemptResult.id,
      question_id: ans.question_id,
      selected_option_id: ans.selected_option_id
    }));
    
    if (answersToInsert.length > 0) {
      await supabaseAdmin
        .from('student_answers')
        .insert(answersToInsert);
    }
    
    return res.json({ success: true, score: correctCount, message: 'تم تسليم الامتحان بنجاح' });
    
  } catch (error: any) {
    console.error('Submit Exam API Error:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
}
