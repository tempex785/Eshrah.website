import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: any, res: any) {
  try {
    // 1. Get all students
    const { data: students, error: stdError } = await supabaseAdmin
      .from('students')
      .select('id, first_name, last_name');
      
    if (stdError || !students) {
      console.error(stdError);
      return res.status(500).json({ success: false, message: 'Failed to fetch students' });
    }

    // 2. Get all completed exam attempts
    const { data: attempts, error: attemptsError } = await supabaseAdmin
      .from('exam_attempts')
      .select('user_id')
      .eq('status', 'completed');

    if (attemptsError || !attempts) {
      console.error(attemptsError);
      return res.status(500).json({ success: false, message: 'Failed to fetch attempts' });
    }

    // Count attempts per user
    const attemptCounts: Record<string, number> = {};
    attempts.forEach(a => {
      attemptCounts[a.user_id] = (attemptCounts[a.user_id] || 0) + 1;
    });

    // Compute points and rank
    const leaderboard = students.map(s => {
      const examsCount = attemptCounts[s.id] || 0;
      const points = examsCount * 10;
      const name = s.first_name ? `${s.first_name} ${s.last_name || ''}`.trim() : 'طالب';
      return {
        id: s.id,
        name,
        avatar: null,
        points
      };
    });

    // Sort by points desc
    leaderboard.sort((a, b) => b.points - a.points);
    
    // Add rank (handle ties if you want, but simple index + 1 is fine for now)
    const ranked = leaderboard.map((s, idx) => ({
      ...s,
      rank: idx + 1
    }));

    return res.json({ success: true, leaderboard: ranked.slice(0, 50) });
  } catch (error: any) {
    console.error('Leaderboard API Error:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
}
