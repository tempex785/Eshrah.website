import toast from "react-hot-toast";
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
      toast('انتهى وقت التركيز! ☕ خذ استراحة قصيرة.', { icon: '👏' });
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
      toast.error(`لم يبدأ الامتحان بعد. موعد البدء: ${startStr}`);
      return;
    }
    if (exam.end_time && new Date() > new Date(exam.end_time)) {
      toast.error('انتهى وقت هذا الامتحان ولم يعد بإمكانك دخوله.');
      return;
    }
    window.scrollTo({ top: 300, behavior: 'smooth' });
    setActiveExam(exam);
  };

  useEffect(() => {
    async function fetchContent() {
      if (
        course?.id &&
        import.meta.env.VITE_SUPABASE_URL &&
        !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
      ) {
        try {
          // Fetch user session first to get attempts
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.user?.id) {
            const { data: attemptsData, error: attemptsError } = await supabase
              .from('exam_attempts')
              .select('*')
              .eq('user_id', session.user.id);

            if (!attemptsError && attemptsData) {
              const attemptsMap: Record<string, number> = {};
              attemptsData.forEach((attempt) => {
                const id = attempt.exam_id || attempt.assignment_id;
                if (id) {
                  attemptsMap[id] = (attemptsMap[id] || 0) + 1;
                }
              });
              setUserAttempts(attemptsMap);
            }

            const { data: viewsData, error: viewsError } = await supabase
              .from('video_views')
              .select('video_id')
              .eq('student_id', session.user.id);
            if (!viewsError && viewsData) {
              setViewedVideoUrls(new Set(viewsData.map((v) => v.video_id)));
            }
          }

          const { data: subsData, error: subsError } = await supabase
            .from('course_subjects')
            .select('*')
            .eq('course_id', course.id);

          if (!subsError && subsData && subsData.length > 0) {
            // Get IDs
            const subjectIds = subsData.map((s: any) => s.id);

            // Try fetching secure modules via RPC first (strips URLs if not subscribed)
            let modsData = null;
            let modsError = null;
            try {
              const { data: rpcData, error: rpcError } = await supabase.rpc(
                'get_secure_course_modules',
                {
                  p_course_id: course.id,
                }
              );
              if (!rpcError && rpcData) {
                modsData = rpcData;
              } else {
                // Fallback to direct table if RPC doesn't exist
                const res = await supabase
                  .from('course_modules')
                  .select('*')
                  .in('subject_id', subjectIds);
                modsData = res.data;
                modsError = res.error;

                // Remove the client-side stripping here to avoid race condition.
                // We'll handle URL access based on the 'isSubscribed' state during render instead.
              }
            } catch (e) {
              // Fallback
              const res = await supabase
                .from('course_modules')
                .select('*')
                .in('subject_id', subjectIds);
              modsData = res.data;
              modsError = res.error;
            }

            // Fetch exams, assignments, and schedules
            const { data: examsData } = await supabase
              .from('exams')
              .select('*')
              .eq('course_id', course.id);

            const { data: assignmentsData } = await supabase
              .from('assignments')
              .select('*')
              .eq('course_id', course.id);

            const { data: schedulesData } = await supabase
              .from('schedules')
              .select('*')
              .eq('course_id', course.id)
              .eq('is_active', true);

            const { data: weeklyData } = await supabase
              .from('weekly_schedules')
              .select('*')
              .eq('course_id', course.id)
              .order('day_of_week', { ascending: true });

            if (weeklyData) {
              setWeeklySchedules(weeklyData);
            } else {
              setWeeklySchedules([]);
            }

            if (!modsError && modsData) {
              const mapped = subsData.map((s: any) => {
                // Regular modules
                const subjectModules = modsData
                  .filter((m: any) => m.subject_id === s.id)
                  .map((m: any) => {
                    let parsedItems = m.items;
                    if (typeof parsedItems === 'string') {
                      try {
                        parsedItems = JSON.parse(parsedItems);
                      } catch (e) {}
                    }
                    const moduleItems: any[] = Array.isArray(parsedItems)
                      ? parsedItems.map((i: any) => ({
                          title: i.title,
                          url: i.url,
                          icon:
                            i.icon === 'MonitorPlay' ? (
                              <MonitorPlay className="w-5 h-5 text-burgundy-500" />
                            ) : i.icon === 'FileText' ? (
                              <FileText className="w-5 h-5 text-red-500" />
                            ) : (
                              <ClipboardList className="w-5 h-5 text-amber-500" />
                            ),
                          isExam: false,
                          isVideo: i.icon === 'MonitorPlay',
                        }))
                      : [];

                    // Find exams for this module
                    const moduleExams = examsData?.filter((e: any) => e.module_id === m.id) || [];
                    moduleExams.forEach((exam: any) => {
                      moduleItems.push({
                        title: `امتحان: ${exam.title}`,
                        url: '#',
                        icon: <ClipboardList className="w-5 h-5 text-amber-500" />,
                        isExam: true,
                        examData: { ...exam, type: 'exam' },
                      });
                    });

                    // Find assignments for this module
                    const moduleAssignments =
                      assignmentsData?.filter((a: any) => a.module_id === m.id) || [];
                    moduleAssignments.forEach((assignment: any) => {
                      moduleItems.push({
                        title: `واجب: ${assignment.title}`,
                        url: assignment.file_url || '#',
                        icon: <FileText className="w-5 h-5 text-burgundy-500" />,
                        isExam: true,
                        examData: { ...assignment, type: 'homework' },
                      });
                    });

                    return {
                      title: m.title,
                      subtitle: m.subtitle,
                      icon: <LayoutGrid className="w-6 h-6 text-burgundy-500" />,
                      iconOpen: <LayoutGrid className="w-6 h-6 text-white" />,
                      content: m.content,
                      items: moduleItems,
                    };
                  });

                // Subject Schedules
                const subjectSchedules =
                  schedulesData?.filter((sch: any) => sch.subject_id === s.id) || [];
                if (subjectSchedules.length > 0) {
                  subjectModules.push({
                    title: 'الجداول ومواعيد الحصص',
                    subtitle: 'جداول المحاضرات والمراجعات',
                    icon: <Calendar className="w-6 h-6 text-burgundy-500" />,
                    iconOpen: <Calendar className="w-6 h-6 text-white" />,
                    content: 'تعرف على مواعيد الحصص والجداول المتاحة.',
                    items: subjectSchedules.map((sch: any) => ({
                      title: sch.title,
                      url: sch.file_url || '#',
                      icon: <FileText className="w-5 h-5 text-red-500" />,
                      isExam: false,
                    })),
                  });
                }

                return {
                  id: s.id,
                  name: s.name,
                  icon: iconMap[s.icon_name || 'FileText'] || iconMap.FileText,
                  modules: subjectModules,
                };
              });
              setDbSubjects(mapped);
            }
          }
          setIsLoadingContent(false);
        } catch (err) {
          
          setIsLoadingContent(false);
        }
      } else {
        setIsLoadingContent(false);
      }
    }
    fetchContent();
  }, [course, isSubscribed]);

  useEffect(() => {
    async function checkCertificate() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user && course?.id) {
        const { data } = await supabase
          .from('student_subscriptions')
          .select('certificate_enabled')
          .eq('student_id', session.user.id)
          .eq('course_id', course.id)
          .single();
        if (data?.certificate_enabled) {
          setCanIssueCertificate(true);
        }
      }
    }
    if (isSubscribed) {
      checkCertificate();
    }
  }, [isSubscribed, course?.id]);

  useEffect(() => {
    let total = 0;
    let completed = 0;

    dbSubjects.forEach((subject) => {
      subject.modules.forEach((module) => {
        if (module.items) {
          module.items.forEach((item) => {
            total++;
            if (
              item.isExam ||
              (item.title || '').includes('اختبار') ||
              (item.title || '').includes('امتحان') ||
              (item.title || '').includes('واجب')
            ) {
              const examId = item.examData?.id || item.id;
              if (examId && userAttempts[examId]) {
                completed++;
              }
            } else if (item.url && item.url !== '#') {
              if (viewedVideoUrls.has(item.url)) {
                completed++;
              }
            }
          });
        }
      });
    });

    setTotalItemsCount(total);
    setCompletedItemsCount(completed);
    const calculatedProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
    setCourseProgress(calculatedProgress);
  }, [dbSubjects, userAttempts, viewedVideoUrls, course?.id]);

  useEffect(() => {
    if (!isWalletLoading) {
      setIsSubscribed(hasSubscription(String(course?.id || '')));
    }
  }, [course?.id, hasSubscription, isWalletLoading]);

  const initiateSubscribe = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setShowSubscribeConfirm(true);
  };

  const handleSubscribe = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    if (!course) return;

    let priceNum = 0;
    if (course.price && typeof course.price === 'string' && course.price !== 'مجانًا') {
      const match = course.price.match(/\d+/);
      if (match) {
        priceNum = parseInt(match[0], 10);
      }
    }

    const res = await subscribeToCourse(String(course.id));
    setShowSubscribeConfirm(false);
    if (res.success) {
      setIsSubscribed(true);
      setSubscriptionError('');
    } else {
      setSubscriptionError(res.message);
    }
  };

  const renderContent = (content: string) => {
    if (!content) return null;
    if (content.includes('<iframe') || content.includes('<a ') || content.includes('<video')) {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: content }}
          className="prose dark:prose-invert max-w-none"
        />
      );
    }

    const urlRegex = /(https?:\/\/[^\s]+?[a-zA-Z0-9=\/])/g;
    if (urlRegex.test(content)) {
      const parts = content.split(urlRegex);
      return (
        <>
          {parts.map((part, i) => {
            if (part.match(urlRegex)) {
              const isVid =
                part.includes('youtube.com') ||
                part.includes('youtu.be') ||
                part.includes('vimeo.com') ||
                part.match(/\.(mp4|webm|ogg)$/i) ||
                part.includes('supabase.co');
              if (isVid) {
                return (
                  <a
                    key={i}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveVideo({ title: 'فيديو توضيحي', url: part });
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="text-burgundy-500 font-bold hover:underline inline-flex items-center gap-1 mx-1"
                  >
                    <PlayCircle className="w-4 h-4" />{' '}
                    {part.includes('supabase.co') ? 'تشغيل الفيديو' : 'عرض الفيديو'}
                  </a>
                );
              }
              return (
                <a
                  key={i}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-burgundy-500 hover:underline mx-1"
                  dir="ltr"
                >
                  {part}
                </a>
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </>
      );
    }
    return content;
  };

  useEffect(() => {
    if (!course && onNavigate) {
      onNavigate('home');
    }
  }, [course, onNavigate]);

  if (!course) return null;

  const subjects = dbSubjects;

  return (
    <div className="bg-slate-50 dark:bg-[#0b121c] min-h-screen pb-20 overflow-x-hidden">
      {activeVideo && !isStudioMode && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 md:p-10 backdrop-blur-sm">
          <button
            onClick={() => setActiveVideo(null)}
            className="absolute top-6 right-6 md:top-10 md:right-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors z-[110]"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="mb-6 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold">{activeVideo.title}</h2>
          </div>
          <div className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
            <CustomVideoPlayer url={activeVideo.url} onClose={() => setActiveVideo(null)} />
          </div>
        </div>
      )}

      {/* Hero Header */}
      {!isStudioMode && (
        <div className="bg-burgundy-500 relative pb-32 pt-16 rounded-bl-[4rem]">
          <div className="absolute inset-0 bg-burgundy-600/30 dark:bg-[#0b121c]/50 rounded-bl-[4rem]"></div>

          <div className="max-w-[1200px] mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 text-white">
                <h1 className="text-3xl font-bold mb-4">{course?.title || 'تفاصيل الكورس'}</h1>
                <p className="mb-4 text-burgundy-100">في هذا الكورس ستتعلم الكثير:</p>
                <ul className="space-y-2 mb-8">
                  {course?.features?.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      👨‍🏫 {feature}
                    </li>
                  )) || (
                    <li className="flex items-center gap-2">لا توجد تفاصيل إضافية لهذا الكورس.</li>
                  )}
                </ul>

                <div className="flex flex-wrap gap-4 text-xs md:text-sm font-medium">
                  {course?.createdAt && (
                    <div className="flex items-center gap-2 bg-[#d97757] text-white px-4 py-2 rounded-full shadow-sm">
                      <Calendar className="w-4 h-4" />
                      <span>
                        تاريخ إنشاء الكورس: {new Date(course.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  )}
                  {course?.endDate && (
                    <div className="flex items-center gap-2 bg-burgundy-600 text-white px-4 py-2 rounded-full shadow-sm">
                      <Calendar className="w-4 h-4" />
                      <span>
                        تاريخ انتهاء الكورس: {new Date(course.endDate).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  )}
                  {!course?.createdAt && !course?.endDate && (
                    <div className="flex items-center gap-2 bg-[#d97757] text-white px-4 py-2 rounded-full shadow-sm">
                      <Calendar className="w-4 h-4" />
                      <span>تاريخ إنشاء الكورس : قريباً</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center gap-2">
                  <span className="text-burgundy-100 font-medium">تقييم الكورس:</span>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-burgundy-100">
                    (4.9 من 5) - بناءً على آراء 124 طالب
                  </span>
                </div>

                {weeklySchedules && weeklySchedules.length > 0 && (
                  <div className="mt-8 flex justify-start">
                    <button
                      onClick={() => setShowScheduleModal(true)}
                      className="group relative flex items-center gap-3 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 text-amber-400 px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/40 transition-all hover:-translate-y-1 overflow-hidden border border-slate-700/50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/10 to-amber-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      <CalendarDays className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span className="text-white text-base">عرض الجدول الأسبوعي</span>
                      <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-amber-400 animate-pulse mt-3 mr-3 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></div>
                    </button>
                  </div>
                )}
              </div>

              {/* Sidebar space reservation */}
              <div className="w-full lg:w-[350px]"></div>
            </div>
          </div>
        </div>
      )}

      <div
        className={`mx-auto px-4 relative flex flex-col items-start pb-16 z-20 ${isStudioMode ? 'max-w-[1600px] xl:flex-row gap-6 mt-24' : 'max-w-[1200px] lg:flex-row gap-8'}`}
      >
        {isStudioMode && (
          <div className="flex-1 w-full xl:w-[800px] shrink-0 sticky top-24 bg-black rounded-2xl overflow-hidden shadow-2xl z-30">
            {activeVideo ? (
              <div className="w-full aspect-video relative">
                <CustomVideoPlayer url={activeVideo.url} onClose={() => setActiveVideo(null)} />
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center bg-slate-900 text-slate-400 font-bold flex-col gap-4">
                <MonitorPlay className="w-16 h-16 opacity-50" />
                <p>اختر درساً من القائمة لبدء المذاكرة</p>
              </div>
            )}
            {activeVideo && (
              <div className="p-6 bg-white dark:bg-[#151b23] border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                  {activeVideo.title}
                </h3>

                <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-burgundy-500" />
                    <h4 className="font-bold text-slate-800 dark:text-white text-lg">ملاحظاتي</h4>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                    }}
                    placeholder="اكتب ملاحظاتك هنا أثناء مشاهدة الدرس..."
                    className="w-full min-h-[120px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-burgundy-500 resize-y"
                  ></textarea>
                </div>

                <div className="mt-2 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Clock3 className="w-5 h-5 text-burgundy-500" />
                      <h4 className="font-bold text-slate-800 dark:text-white text-lg">
                        مؤقت التركيز (Pomodoro)
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold font-mono text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        {formatPomodoro(pomodoroTime)}
                      </span>
                      <button
                        onClick={() => {
                          if (!isPomodoroRunning && pomodoroTime === 0) setPomodoroTime(25 * 60);
                          setIsPomodoroRunning(!isPomodoroRunning);
                        }}
                        className={`px-4 py-2 rounded-xl font-bold text-sm ${isPomodoroRunning ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-burgundy-500 text-white hover:bg-burgundy-600'}`}
                      >
                        {isPomodoroRunning ? 'إيقاف مؤقت' : 'ابدأ التركيز'}
                      </button>
                      <button
                        onClick={() => {
                          setIsPomodoroRunning(false);
                          setPomodoroTime(25 * 60);
                        }}
                        className="px-3 py-2 rounded-xl font-bold text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                      >
                        إعادة
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div
          className={`flex-1 w-full space-y-6 ${isStudioMode ? 'xl:w-[450px] shrink-0 flex-none' : 'mt-8'}`}
        >

          {activeExam && (
            <ExamSystem 
              exam={activeExam} 
              onClose={() => setActiveExam(null)} 
              onComplete={(score, total) => {
                setUserAttempts((prev) => ({
                  ...prev,
                  [activeExam.id]: (prev[activeExam.id] || 0) + 1,
                }));
              }} 
            />
          )}
          {isLoadingContent || isWalletLoading ? (
            <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-8 mb-8 animate-pulse border border-slate-200 dark:border-slate-700/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div className="space-y-4">
                  <div className="h-8 w-48 bg-slate-300 dark:bg-slate-700 rounded-lg"></div>
                  <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700/50 rounded-lg"></div>
                </div>
                <div className="h-14 w-24 bg-slate-300 dark:bg-slate-700 rounded-xl"></div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-4 rounded-full"></div>
            </div>
          ) : isSubscribed ? (
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-[#1a1f2b] dark:from-[#151b23] dark:to-[#0f1319] rounded-3xl p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-slate-800/50 mb-8 transition-all duration-300 hover:shadow-[0_10px_50px_-10px_rgba(225,29,72,0.15)]">
              {/* Decorative backgrounds */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-burgundy-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                      <div className="p-2 bg-burgundy-500/10 rounded-lg">
                        <svg
                          className="w-6 h-6 text-burgundy-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                          />
                        </svg>
                      </div>
                      مسار إنجازك
                    </h3>
                    <p className="text-slate-400 text-sm font-medium">
                      لقد أتممت <span className="text-white font-bold">{completedItemsCount}</span>{' '}
                      من أصل <span className="text-white font-bold">{totalItemsCount}</span> درس
                      ومحتوى
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1 bg-black/20 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-sm">
                    <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-burgundy-400 to-red-400">
                      {courseProgress}
                    </span>
                    <span className="text-burgundy-400 font-bold text-lg">%</span>
                  </div>
                </div>

                <div
                  className="w-full bg-black/40 rounded-full h-4 mb-3 p-1 border border-white/5 backdrop-blur-sm shadow-inner"
                  dir="ltr"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-burgundy-600 via-burgundy-500 to-red-400 shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all duration-1000 ease-out float-right relative overflow-hidden"
                    style={{ width: `${courseProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent w-full"></div>
                    <div className="absolute top-0 bottom-0 left-0 right-0 overflow-hidden rounded-full">
                      <div className="w-full h-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {canIssueCertificate && (
                <button
                  onClick={async () => {
                    const {
                      data: { session },
                    } = await supabase.auth.getSession();

                    let studentName = 'طالب متميز';
                    let gender = 'm';

                    if (session?.user?.id) {
                      const { data: student } = await supabase
                        .from('students')
                        .select('first_name, last_name, gender')
                        .eq('id', session.user.id)
                        .single();

                      if (student) {
                        studentName =
                          `${student.first_name || ''} ${student.last_name || ''}`.trim() ||
                          studentName;
                        gender = student.gender || 'm';
                      } else if (session?.user?.user_metadata) {
                        const meta = session.user.user_metadata;
                        if (meta.first_name) {
                          studentName = `${meta.first_name} ${meta.last_name || ''}`.trim();
                        } else if (meta.full_name) {
                          studentName = meta.full_name;
                        }
                        if (meta.gender === 'f') {
                          gender = 'f';
                        }
                      }
                    }

                    setCertStudentName(studentName);
                    setCertGender(gender);
                    setShowCertModal(true);
                  }}
                  className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-500/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  معاينة واستلام الشهادة
                </button>
              )}
            </div>
          ) : null}
          <div className="bg-white dark:bg-[#151b23] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-[#202936] mb-6 flex items-center justify-between relative">
            <div className="absolute right-0 left-0 top-1/2 h-px bg-slate-200 dark:bg-slate-700 -z-10"></div>
            <div className="bg-white dark:bg-[#151b23] px-6 py-2 mx-auto relative z-10">
              <h2 className="text-2xl md:text-3xl font-black text-[#ee4e5f]">
                محتوى <span className="text-slate-800 dark:text-white">الكورس</span>
              </h2>
            </div>
            <button
              onClick={() => setIsStudioMode(!isStudioMode)}
              className="hidden md:block absolute left-4 z-10 px-4 py-2 bg-burgundy-50 dark:bg-burgundy-900/30 text-burgundy-600 dark:text-burgundy-400 rounded-lg text-sm font-bold border border-burgundy-100 dark:border-burgundy-800 transition-colors hover:bg-burgundy-100 dark:hover:bg-burgundy-900/50"
            >
              {isStudioMode ? 'العودة للواجهة التقليدية' : 'تجربة واجهة المذاكرة'}
            </button>
          </div>

          {/* Course Content Header */}
          <div className="bg-white dark:bg-[#151b23] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-[#202936] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white px-4">
                {selectedSubject ? (
                  <>
                    محتوى{' '}
                    <span className="text-red-500">
                      {subjects.find((s) => s.id === selectedSubject)?.name}
                    </span>
                  </>
                ) : (
                  <>
                    مواد <span className="text-red-500">الكورس</span>
                  </>
                )}
              </h2>
            </div>
            {selectedSubject && (
              <button
                onClick={() => {
                  setSelectedSubject(null);
                  setOpenModule(null);
                }}
                className="text-sm md:text-base text-slate-500 hover:text-burgundy-500 font-medium px-4 transition-colors"
              >
                الرجوع للمواد &larr;
              </button>
            )}
          </div>

          <div className="space-y-4">
            {isLoadingContent ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-slate-200 dark:bg-slate-800 h-24 rounded-2xl w-full"
                  ></div>
                ))}
              </div>
            ) : !selectedSubject ? (
              subjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {subjects.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => {
                        setSelectedSubject(subject.id);
                        setOpenModule(0);
                      }}
                      className="flex flex-col items-center justify-center gap-4 bg-white dark:bg-[#151b23] p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-[#202936] hover:border-burgundy-500 dark:hover:border-burgundy-500 hover:shadow-md transition-all group"
                    >
                      <div className="p-4 bg-burgundy-50 dark:bg-burgundy-900/20 text-burgundy-500 rounded-full group-hover:scale-110 transition-transform">
                        {subject.icon}
                      </div>
                      <span className="font-bold text-lg text-slate-800 dark:text-gray-200 group-hover:text-burgundy-600 dark:group-hover:text-burgundy-400 transition-colors">
                        {subject.name}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-slate-50 dark:bg-[#151b23] border border-slate-200 dark:border-slate-800 rounded-2xl w-full">
                  <p className="text-slate-500 dark:text-slate-400 font-medium pb-2">
                    لا توجد مواد مضافة لهذا الكورس بعد.
                  </p>
                </div>
              )
            ) : (
              <div className="space-y-4">
                {subjects
                  .find((s) => s.id === selectedSubject)
                  ?.modules.map((module, idx) => (
                    <div
                      key={idx}
                      className={`border rounded-xl overflow-hidden transition-all duration-300 ${openModule === idx ? 'border-burgundy-600 shadow-lg shadow-red-900/10' : 'border-slate-200 dark:border-slate-800'}`}
                    >
                      <button
                        onClick={() => setOpenModule(openModule === idx ? null : idx)}
                        className={`w-full flex items-center justify-between p-4 md:p-6 transition-all duration-300 ${
                          openModule === idx
                            ? 'bg-burgundy-600 text-white'
                            : 'bg-white dark:bg-[#151b23] hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-2 rounded-lg transition-colors ${openModule === idx ? 'bg-white/10' : 'bg-red-50 dark:bg-burgundy-600/10'}`}
                          >
                            {openModule === idx ? module.iconOpen : module.icon}
                          </div>
                          <div className="text-right transition-colors">
                            <h3
                              className={`font-bold text-lg md:text-xl ${openModule === idx ? 'text-white' : 'text-slate-800 dark:text-gray-200'}`}
                            >
                              {module.title}
                            </h3>
                            {module.subtitle && (
                              <p
                                className={`text-sm mt-1 ${openModule === idx ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}
                              >
                                {module.subtitle}
                              </p>
                            )}
                          </div>
                        </div>
                        {openModule === idx ? (
                          <ChevronDown className="w-6 h-6 text-white" />
                        ) : (
                          <ChevronUp className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                        )}
                      </button>

                      {openModule === idx && (
                        <div className="p-4 md:p-6 bg-slate-50 dark:bg-[#1f2937]/30 border-t border-slate-200 dark:border-slate-800 overflow-hidden">
                          {module.content && (
                            <div className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line mb-6 font-medium">
                              {renderContent(module.content)}
                            </div>
                          )}

                          {module.items && module.items.length > 0 && (
                            <div className="space-y-3">
                              {module.items.map((item: any, i: number) => {
                                let isLocked = false;
                                let showAttempts = false;

                                if (
                                  item.isExam ||
                                  (item.title || '').includes('اختبار') ||
                                  (item.title || '').includes('امتحان') ||
                                  (item.title || '').includes('واجب')
                                ) {
                                  const examId = item.examData?.id || item.id;
                                  if (examId) {
                                    const attempts = userAttempts[examId] || 0;
                                    const maxAttempts = item.examData?.max_attempts || 1;
                                    isLocked = attempts >= maxAttempts;
                                    showAttempts = true;
                                  }
                                }

                                const content = (
                                  <>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
                                      <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-3">
                                          {item.icon}
                                          <span
                                            className={`font-bold text-slate-700 dark:text-gray-200 transition-colors ${isLocked ? 'opacity-70' : 'group-hover:text-burgundy-500 dark:group-hover:text-burgundy-400'}`}
                                          >
                                            {item.title}
                                          </span>
                                        </div>
                                        {(item.examData?.start_time || item.examData?.end_time || item.examData?.deadline) && (
                                           <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-col gap-0.5 mr-8">
                                             {item.examData?.start_time && (
                                               <span>موعد البدء: {new Date(item.examData.start_time).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                             )}
                                             {item.examData?.end_time && (
                                               <span>موعد الانتهاء: {new Date(item.examData.end_time).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                             )}
                                             {item.examData?.deadline && (
                                               <span>آخر موعد للتسليم: {new Date(item.examData.deadline).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                             )}
                                           </div>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-4">
                                        {showAttempts && (
                                          <span
                                            className={`text-xs font-bold px-2 py-1 rounded-full ${isLocked ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-burgundy-50 text-burgundy-600 dark:bg-burgundy-900/30'}`}
                                          >
                                            {isLocked ? 'تم التسليم' : 'متاح للتجربة'}
                                          </span>
                                        )}
                                        <ChevronDown
                                          className={`w-5 h-5 transition-colors ${isLocked ? 'text-slate-200 dark:text-slate-700' : 'text-slate-400 group-hover:text-burgundy-500 dark:group-hover:text-burgundy-400'}`}
                                        />
                                      </div>
                                    </div>
                                  </>
                                );

                                if (!item.isExam && item.url && item.url !== '#') {
                                  return (
                                    <div
                                      key={i}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        if (!isSubscribed) {
                                          setShowSubscribeConfirm(true);
                                          return;
                                        }
                                        if (
                                          item.isVideo ||
                                          (item.url || '').includes('<iframe') ||
                                          (item.url || '').includes('iframe.mediadelivery.net') ||
                                          (item.url || '').includes('youtube') ||
                                          (item.url || '').includes('youtu.be') ||
                                          (item.url || '').includes('vimeo.com') ||
                                          (item.url || '').match(/\.(mp4|webm|ogg)$/i) ||
                                          (item.url || '').includes('supabase.co')
                                        ) {
                                          setActiveVideo(item);
                                          recordVideoView(item.title, item.url);
                                          window.scrollTo({ top: 300, behavior: 'smooth' });
                                        } else {
                                          window.open(item.url, '_blank');
                                        }
                                      }}
                                      className="flex items-center justify-between w-full text-left bg-white dark:bg-[#151b23] p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-burgundy-300 dark:hover:border-burgundy-800 transition-colors cursor-pointer group"
                                    >
                                      {content}
                                    </div>
                                  );
                                }

                                return (
                                  <div
                                    key={i}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (!isSubscribed) {
                                        setShowSubscribeConfirm(true);
                                        return;
                                      }
                                      if (isLocked) {
                                        toast.error('لقد استنفذت عدد المحاولات المسموح بها للاختبار.');
                                        return;
                                      }
                                      
                                      const examInfo = item.examData;
                                      if (examInfo) {
                                        const now = new Date();
                                        if (examInfo.start_time) {
                                          const startDate = new Date(examInfo.start_time);
                                          if (now < startDate) {
                                            toast.error(`لم يبدأ الامتحان بعد. موعد البدء: ${startDate.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}`);
                                            return;
                                          }
                                        }
                                        if (examInfo.end_time) {
                                          const endDate = new Date(examInfo.end_time);
                                          if (now > endDate) {
                                            toast.error('انتهى وقت هذا الامتحان');
                                            return;
                                          }
                                        }
                                        if (examInfo.deadline) {
                                          const deadlineDate = new Date(examInfo.deadline);
                                          if (now > deadlineDate) {
                                            toast.error('انتهى موعد تسليم هذا الواجب');
                                            return;
                                          }
                                        }
                                      }

                                      if (
                                        item.isExam ||
                                        (item.title || '').includes('اختبار') ||
                                        (item.title || '').includes('امتحان') ||
                                        (item.title || '').includes('واجب')
                                      ) {
                                        handleStartExam(item.examData || item);
                                      }
                                    }}
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-colors group ${isLocked ? 'bg-slate-50 dark:bg-[#0f141a] border-slate-200 dark:border-slate-800 opacity-75 cursor-not-allowed' : 'bg-white dark:bg-[#151b23] border-slate-200 dark:border-slate-800 hover:border-burgundy-300 dark:hover:border-burgundy-800 cursor-pointer'}`}
                                  >
                                    {content}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {!isSubscribed && module.items && module.items.length > 0 && (
                            <div className="text-center py-4 bg-burgundy-50 dark:bg-burgundy-900/20 rounded-lg text-burgundy-600 dark:text-burgundy-400 font-medium text-sm">
                              قم بالاشتراك في الكورس لعرض المحتوى
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        {!isStudioMode && (
          <div className="w-full lg:w-[350px] shrink-0 sticky top-24 -mt-8 lg:-mt-56">
            <div className="bg-white dark:bg-[#151b23] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#202936] overflow-hidden">
              <div className="relative p-3 pb-0">
                <img
                  src={
                    course?.image ||
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'
                  }
                  alt={course?.title || 'كورس'}
                  className="w-full h-56 object-cover rounded-2xl"
                />
                <div className="absolute top-6 right-6 lg:-bottom-4 lg:top-auto bg-burgundy-600 text-white px-6 py-2 rounded-full font-bold shadow-lg border-4 border-white dark:border-[#151b23] z-10 transition-transform hover:scale-105">
                  {course?.title || 'معلومات الكورس'}
                </div>
              </div>

              <div className="p-8 pt-10">
                <div className="flex justify-center mb-6">
                  <div className="bg-burgundy-50 dark:bg-burgundy-900/20 px-8 py-3 rounded-full inline-flex items-center gap-2 border border-burgundy-100 dark:border-burgundy-800">
                    <div className="text-3xl font-black text-burgundy-600 dark:text-burgundy-400">
                      {course?.price || 'مجانًا'}
                    </div>
                  </div>
                </div>

                {!isSubscribed ? (
                  <div className="space-y-3">
                    <button
                      onClick={initiateSubscribe}
                      className="w-full bg-gradient-to-r from-burgundy-600 to-burgundy-500 hover:from-burgundy-700 hover:to-burgundy-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-burgundy-500/30 transition-all duration-300 hover:scale-[1.02]"
                    >
                      اشترك الآن!
                    </button>
                    {subscriptionError && (
                      <div className="text-center text-sm font-bold text-red-500 mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                        {subscriptionError}
                        {subscriptionError.includes('المحفظة') && (
                          <button
                            onClick={() => onNavigate && onNavigate('profile')}
                            className="mt-2 block w-full text-center text-burgundy-600 dark:text-burgundy-400 underline decoration-burgundy-300 underline-offset-4"
                          >
                            اذهب للشحن
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full bg-green-500/10 text-green-600 dark:text-green-400 font-bold py-4 rounded-2xl text-center border border-green-500/20">
                    تم الاشتراك في الكورس بنجاح
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showSubscribeConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-burgundy-50 dark:bg-burgundy-900/20 text-burgundy-600 dark:text-burgundy-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-burgundy-100 dark:border-burgundy-800">
                <LayoutGrid className="w-8 h-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-2">
                تأكيد الاشتراك
              </h3>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-300">
                هل أنت متأكد من رغبتك في الاشتراك في
                <br />
                <span className="font-bold text-burgundy-600 dark:text-burgundy-400">
                  "{course?.title}"
                </span>
                ؟
              </p>
              <div className="mt-6 p-4 bg-slate-50 dark:bg-[#0f172a] rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    سعر الكورس:
                  </span>
                  <span className="font-bold text-lg text-slate-800 dark:text-white">
                    {course?.price || 'مجانًا'}
                  </span>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-800 mb-3 w-full"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    رصيد المحفظة الحالي:
                  </span>
                  <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                    {balance} ج.م
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowSubscribeConfirm(false)}
                className="flex-1 py-3.5 px-4 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSubscribe}
                className="flex-1 py-3.5 px-4 rounded-xl font-bold text-white bg-burgundy-600 hover:bg-burgundy-700 transition-colors shadow-lg shadow-burgundy-500/30"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#151b23]/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <CalendarDays className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                    الجدول الأسبوعي
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                    مواعيد المحاضرات والبث المباشر خلال الأسبوع
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-xl flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/30 dark:bg-slate-900/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {weeklySchedules.map((schedule, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-[#151b23] rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/60 hover:border-amber-400/50 dark:hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-400/10 to-transparent rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>

                    <div className="flex justify-between items-start mb-5">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black px-4 py-1.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 group-hover:bg-amber-50 group-hover:text-amber-700 dark:group-hover:bg-amber-900/20 dark:group-hover:text-amber-400 transition-colors">
                        {schedule.day_of_week}
                      </span>
                      {schedule.is_online && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg shadow-sm border border-emerald-100 dark:border-emerald-800/30">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          بث مباشر
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-3 leading-snug">
                      {schedule.title}
                    </h4>
                    {schedule.description && (
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-5 line-clamp-2 leading-relaxed">
                        {schedule.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-bold text-sm mt-auto pt-5 border-t border-slate-100 dark:border-slate-800/60">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                        <Clock3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="tracking-tight">{schedule.time_start}</span>
                      {schedule.time_end && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600 px-1">-</span>
                          <span className="tracking-tight">{schedule.time_end}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onNavigate={onNavigate}
      />
      <CertificatePreviewModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        studentName={certStudentName}
        gender={certGender}
        courseTitle={course?.title || ''}
      />
    </div>
  );
}
