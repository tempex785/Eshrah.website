import ExamSystem from '../components/exam/ExamSystem';
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Flag, AlertCircle, Check, ArrowRight, ArrowLeft, 
  Calendar,
  ChevronUp,
  ChevronDown,
  LayoutGrid,
  MonitorPlay,
  FileText,
  ClipboardList,
  X,
  CalendarDays,
  Clock3,
  PlayCircle,
} from 'lucide-react';
import { CourseData, Page } from '../App';
import AuthPromptModal from '../components/ui/AuthPromptModal';
import { supabase } from '../lib/supabase';
import CustomVideoPlayer from '../components/ui/CustomVideoPlayer';
import { useWallet } from '../hooks/useWallet';
import CertificatePreviewModal from '../components/ui/CertificatePreviewModal';

interface CourseDetailsProps {
  course?: CourseData | null;
  isLoggedIn?: boolean;
  onNavigate?: (page: Page) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  FileText: <FileText className="w-8 h-8 text-burgundy-500" />,
  LayoutGrid: <LayoutGrid className="w-8 h-8 text-burgundy-500" />,
  MonitorPlay: <MonitorPlay className="w-8 h-8 text-burgundy-500" />,
  ClipboardList: <ClipboardList className="w-8 h-8 text-burgundy-500" />,
};

export default function CourseDetails({ course, isLoggedIn, onNavigate }: CourseDetailsProps) {
  const [openModule, setOpenModule] = useState<number | null>(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [dbSubjects, setDbSubjects] = useState<any[]>([]);
  const [activeExam, setActiveExam] = useState<any | null>(null);
  const [activeVideo, setActiveVideo] = useState<any | null>(null);
  const [weeklySchedules, setWeeklySchedules] = useState<any[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  const [showSubscribeConfirm, setShowSubscribeConfirm] = useState(false);
  const { balance, subscribeToCourse, hasSubscription, isLoading: isWalletLoading } = useWallet();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [certStudentName, setCertStudentName] = useState('');
  const [certGender, setCertGender] = useState('m');
  const [canIssueCertificate, setCanIssueCertificate] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState('');

  // Exam state
  const [userAttempts, setUserAttempts] = useState<Record<string, number>>({});
  const [isStudioMode, setIsStudioMode] = useState(false);
  const [courseProgress, setCourseProgress] = useState(0);
  const [completedItemsCount, setCompletedItemsCount] = useState(0);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [viewedVideoUrls, setViewedVideoUrls] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');

  // Pomodoro Timer State
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isPomodoroRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setIsPomodoroRunning(false);
      alert('انتهى وقت التركيز! خذ استراحة قصيرة.');
    }
    return () => clearInterval(interval);
  }, [isPomodoroRunning, pomodoroTime]);

  const formatPomodoro = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    setNotes('');
  }, [activeVideo]);

  const recordVideoView = async (videoTitle: string, videoUrl: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const studentId = session.user.id;

      // Check if view already exists
      const { data: existingView } = await supabase
        .from('video_views')
        .select('*')
        .eq('student_id', studentId)
        .eq('video_id', videoUrl)
        .maybeSingle();

      if (existingView) {
        await supabase
          .from('video_views')
          .update({
            views_count: existingView.views_count + 1,
            last_viewed_at: new Date().toISOString(),
          })
          .eq('id', existingView.id);
      } else {
        await supabase.from('video_views').insert([
          {
            student_id: studentId,
            video_id: videoUrl,
            video_title: videoTitle,
            views_count: 1,
          },
        ]);
      }

      setViewedVideoUrls((prev) => {
        const next = new Set(prev);
        next.add(videoUrl);
        return next;
      });
    } catch (error) {
      
    }
  };

  const handleStartExam = async (exam: any) => {
    if (exam.start_time && new Date() < new Date(exam.start_time)) {
      const startStr = new Date(exam.start_time).toLocaleString('ar-EG', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      alert(`لم يبدأ الامتحان بعد. موعد البدء: ${startStr}`);
      return;
    }
    if (exam.end_time && new Date() > new Date(exam.end_time)) {
      alert('انتهى وقت هذا الامتحان ولم يعد بإمكانك دخوله.');
      return;
    }
    window.scrollTo({ top: 300, behavior: 'smooth' });
    setActiveExam(exam);
  };
