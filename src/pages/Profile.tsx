import toast from "react-hot-toast";
import React, { useState, useEffect } from 'react';
import fpPromise from '@fingerprintjs/fingerprintjs';
import { Award, CheckCircle2, XCircle, LayoutList, 
  User,
  Phone,
  Mail,
  Star,
  FileText,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  ShieldCheck,
  BookOpen,
  Key,
  LogIn,
  Eye,
  Video,
  MapPin,
  History,
  ArrowLeft,
  Copy,
  Check,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import { useWallet } from '../hooks/useWallet';

const CircularProgress = ({
  percentage,
  color,
  title,
  subtitle1,
  subtitle2,
  subtitleColor,
}: any) => (
  <div className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex-1 md:flex-none min-w-[200px]">
    <div className="relative w-28 h-28">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-100 dark:text-slate-700"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${2 * Math.PI * 45}`}
          strokeDashoffset={`${2 * Math.PI * 45 * (1 - Math.min(100, Math.max(0, percentage)) / 100)}`}
          className="transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-slate-800 dark:text-white">
        <span dir="ltr">{percentage}%</span>
      </div>
    </div>
    <div className="flex flex-col items-center gap-2 w-full">
      <h3 className="text-slate-700 dark:text-slate-200 font-bold text-base text-center">
        {title}
      </h3>
      {subtitle1 && subtitle2 && (
        <div className="flex items-center justify-center gap-2 w-full mt-1">
          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${subtitleColor}`}>
            {subtitle1}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600`}
          >
            {subtitle2}
          </span>
        </div>
      )}
    </div>
  </div>
);

const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'متصفح غير معروف';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Internet';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  else if (ua.includes('Trident')) browser = 'Internet Explorer';
  else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';

  let os = 'نظام غير معروف';
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'MacOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return { browser, os };
};

interface ProfileProps {
  onNavigate?: (page: any, data?: any) => void;
}

export default function Profile({ onNavigate }: ProfileProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const { t } = useLanguage();
  const [userData, setUserData] = useState<any>(null);
  const { balance, chargeWallet, subscriptions } = useWallet();
  const [chargeCode, setChargeCode] = useState('');
  const [chargeMessage, setChargeMessage] = useState({ text: '', isError: false });
  const [subscribedCourses, setSubscribedCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);

  // Real data states
  const [videoViews, setVideoViews] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [studentPlans, setStudentPlans] = useState<any[]>([]);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [homeworkResults, setHomeworkResults] = useState<any[]>([]);
  const [chargeRequests, setChargeRequests] = useState<any[]>([]);
  const [manualPhone, setManualPhone] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [isManualSubmitting, setIsManualSubmitting] = useState(false);
  const [manualMessage, setManualMessage] = useState({ text: '', isError: false });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [localDeviceId, setLocalDeviceId] = useState<string | null>(null);

  const navigateToCourse = (course: any) => {
    if (onNavigate) {
      onNavigate('course-details', course);
    }
  };

  useEffect(() => {
    const fetchDeviceId = async () => {
      const fp = await fpPromise.load();
      const fpResult = await fp.get();
      setLocalDeviceId(fpResult.visitorId);
    };
    fetchDeviceId();
    async function fetchTabDetails() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const studentId = session.user.id;

      if (activeTab === 'charge') {
        const { data } = await supabase
          .from('charge_requests')
          .select('*')
          .eq('student_id', studentId)
          .order('created_at', { ascending: false });
        if (data) setChargeRequests(data);
      } else if (activeTab === 'security') {
        const { data } = await supabase
          .from('login_logs')
          .select('*')
          .eq('student_id', studentId)
          .order('created_at', { ascending: false });
        if (data) setLoginLogs(data);
      } else if (activeTab === 'views') {
        setIsLoadingStats(true);
        const { data } = await supabase
          .from('video_views')
          .select('*')
          .eq('student_id', studentId)
          .order('last_viewed_at', { ascending: false });
        if (data) setVideoViews(data);
        setIsLoadingStats(false);
      } else if (activeTab === 'invoices') {
        setIsLoadingStats(true);
        const { data } = await supabase
          .from('charge_cards')
          .select('*')
          .eq('used_by', studentId)
          .order('used_at', { ascending: false });
        if (data) setInvoices(data);
        setIsLoadingStats(false);
      } else if (activeTab === 'subscriptions') {
         setIsLoadingStats(true);
         const { data } = await supabase.from('student_plans').select('*').eq('student_id', studentId).order('expires_at', { ascending: false });
         if (data) setStudentPlans(data);
         setIsLoadingStats(false);
      } else if (activeTab === 'exam-results') {
        setIsLoadingStats(true);
        const { data } = await supabase
          .from('exam_attempts')
          .select('*, exams(*)')
          .eq('user_id', studentId)
          .not('exam_id', 'is', null)
          .order('started_at', { ascending: false });
        if (data) setExamResults(data);
        setIsLoadingStats(false);
      } else if (activeTab === 'homework-results') {
        setIsLoadingStats(true);
        const { data } = await supabase
          .from('exam_attempts')
          .select('*, assignments(*)')
          .eq('user_id', studentId)
          .not('assignment_id', 'is', null)
          .order('started_at', { ascending: false });
        if (data) setHomeworkResults(data);
        setIsLoadingStats(false);
      }
    }

    fetchTabDetails();
  }, [activeTab]);

  useEffect(() => {
    async function fetchMyCourses() {
      if (subscriptions.length === 0) {
        setSubscribedCourses([]);
        setIsLoadingCourses(false);
        return;
      }

      setIsLoadingCourses(true);
      try {
        const { data: payCoursesData, error: payError } = await supabase
          .from('paycourses')
          .select('*')
          .in('id', subscriptions);

        const { data: freeCoursesData, error: freeError } = await supabase
          .from('freecourses')
          .select('*')
          .in('id', subscriptions);

        let combinedData: any[] = [];
        if (payCoursesData && !payError) combinedData = [...combinedData, ...payCoursesData];
        if (freeCoursesData && !freeError) combinedData = [...combinedData, ...freeCoursesData];

        const mappedCourses = combinedData.map((d) => {
          return {
            id: d.id,
            image:
              d.image_url ||
              'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop',
            title: d.title,
            progress: 0, // Progress needs to be fetched from DB in the future
          };
        });
        setSubscribedCourses(mappedCourses);
      } catch (err) {
        
      } finally {
        setIsLoadingCourses(false);
      }
    }

    if (activeTab === 'my-courses' || activeTab === 'subscriptions') {
      fetchMyCourses();
    }
  }, [activeTab, subscriptions]);

  const handleChargeWallet = async () => {
    const code = chargeCode.trim();
    if (!code) {
      setChargeMessage({ text: 'يرجى إدخال كود الشحن', isError: true });
      return;
    }

    if (!/^\d{16}$/.test(code)) {
      setChargeMessage({ text: 'كود الشحن يجب أن يتكون من 16 رقم فقط', isError: true });
      return;
    }

    const oldBalance = balance;
    const result = await chargeWallet(code);
    if (result.success) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
           const newBalance = result.balance !== undefined ? result.balance : balance;
           const amountCharged = Math.max(newBalance - oldBalance, 0);
           if (amountCharged > 0) {
             await supabase.from('charge_requests').insert({
               student_id: session.user.id,
               amount: amountCharged,
               sender_phone: 'كارت شحن',
               status: 'approved'
             });
             const { data: requests } = await supabase
               .from('charge_requests')
               .select('*')
               .eq('student_id', session.user.id)
               .order('created_at', { ascending: false });
             if (requests) setChargeRequests(requests);
           }
        }
      } catch(e) {
         
      }
      setChargeMessage({ text: result.message, isError: false });
      setChargeCode('');
    } else {
      setChargeMessage({ text: result.message, isError: true });
    }
  };

  const [stats, setStats] = useState({
    examsFinished: 0,
    totalExams: 0,
    averageResult: 0,
    totalOpens: 0,
    videosWatched: 0,
    totalVideoViews: 0,
    totalLectureTime: 0,
    totalVideosInPlatform: 0,
  });

  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number>(0);

  useEffect(() => {
    async function fetchTop() {
      try {
        const { data, error } = await supabase
          .from('top_students')
          .select('*')
          .order('rank', { ascending: true });
        if (!error && data) {
          setTopStudents(data);
        }
      } catch (err) {}
    }
    fetchTop();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserData({
          email: session.user.email,
          phone: session.user.phone,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
        });

        supabase
          .from('students')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUserData((prev: any) => ({
                ...prev,
                name: data.first_name
                  ? `${data.first_name} ${data.last_name || ''}`.trim()
                  : data.full_name || prev.name,
                email: data.email || prev.email,
                phone: data.phone || prev.phone,
                parentPhone: data.parent_phone,
                academicYear: data.academic_year,
                collegeName: data.college_name,
                governorate: data.governorate,
                addressDetails: data.address_detailed,
              }));
            }
          });

        // Fetch user statistics — بس للكورسات اللي الطالب مشترك فيها + الكورسات المجانية
        Promise.all([
          supabase.from('student_subscriptions').select('course_id').eq('student_id', session.user.id),
          supabase.from('freecourses').select('id')
        ]).then(([subsRes, freeRes]) => {
          const allowedCourseIds = [
            ...(subsRes.data?.map(s => s.course_id) || []),
            ...(freeRes.data?.map(f => f.id) || [])
          ];

          const examsQuery = allowedCourseIds.length > 0
            ? supabase.from('exams').select('id, total_marks').in('course_id', allowedCourseIds)
            : Promise.resolve({ data: [] });

          examsQuery.then(({ data: examsData }) => {
          const totalExamsCount = examsData?.length || 0;
          
          const assignmentsQuery = allowedCourseIds.length > 0
            ? supabase.from('assignments').select('id, total_marks').in('course_id', allowedCourseIds)
            : Promise.resolve({ data: [] });

          assignmentsQuery.then(({ data: hwData }) => {
            const totalAssessments = totalExamsCount + (hwData?.length || 0);
            
            supabase.from('exam_attempts')
              .select('status, score, exam_id, assignment_id')
              .eq('user_id', session.user.id)
              .then(({ data: attempts }) => {
                if (attempts) {
                  const completed = attempts.filter(a => a.status === 'completed');
                  const totalOpens = attempts.length;
                  const examsFinished = completed.length;
                  
                  let totalPercent = 0;
                  let validCount = 0;
                  
                  completed.forEach(c => {
                    let max = 100;
                    if (c.exam_id) {
                      max = examsData?.find(e => e.id === c.exam_id)?.total_marks || 100;
                    } else if (c.assignment_id) {
                      max = hwData?.find(h => h.id === c.assignment_id)?.total_marks || 100;
                    }
                    if (max > 0) {
                      totalPercent += ((c.score || 0) / max) * 100;
                      validCount++;
                    }
                  });
                  
                  supabase.from('video_views').select('views_count').eq('student_id', session.user.id).then(({ data: views }) => {
                    const videosWatched = views?.length || 0;
                    const totalVideoViews = views?.reduce((sum, v) => sum + (v.views_count || 1), 0) || 0;
                    // مفيش مدة حقيقية مسجلة لكل مشاهدة، فبنقدّر تقريبيًا 20 دقيقة لكل فيديو اتشاف
                    const totalLectureTime = videosWatched * 20;

                    // عدد الفيديوهات بس في الكورسات اللي الطالب مشترك فيها، مش المنصة كلها
                    supabase.rpc('get_student_video_count').then(({ data: totalVideosCount }) => {
                      const totalVideosInPlatform = totalVideosCount || 0;
                      
                      setStats({
                        examsFinished,
                        totalExams: totalAssessments,
                        averageResult: validCount > 0 ? Math.round(totalPercent / validCount) : 0,
                        totalOpens,
                        videosWatched,
                        totalVideoViews,
                        totalLectureTime,
                        totalVideosInPlatform
                      });
                    });
                  });
                }
              });
          });
        });
        });
      }
    });
  }, []);

  const sidebarLinks = [
    { id: 'profile', label: t('userProfile') },
    { id: 'wallet', label: 'المحفظة' },
    { id: 'my-courses', label: t('myCourses') },
    { id: 'leaderboard', label: 'لوحة الشرف (الأوائل)' },
    { id: 'security', label: t('securityAndLogins') },
    { id: 'views', label: t('viewsDetails') },
    { id: 'exam-results', label: t('examResults') },
    { id: 'homework-results', label: t('homeworkResults') },
  ];

  const handleManualChargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAmount || !manualPhone) {
      setManualMessage({ text: 'يرجى إدخال المبلغ ورقم التحويل', isError: true });
      return;
    }
    setIsManualSubmitting(true);
    setManualMessage({ text: '', isError: false });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('يجب تسجيل الدخول أولاً');

      const { error } = await supabase.from('charge_requests').insert({
        student_id: session.user.id,
        amount: parseFloat(manualAmount),
        sender_phone: manualPhone,
        status: 'pending'
      });

      if (error) throw error;
      
      setManualMessage({ text: 'تم إرسال طلب الشحن بنجاح! سيتم مراجعته قريباً.', isError: false });
      setManualAmount('');
      setManualPhone('');
      
      const { data: requests } = await supabase
        .from('charge_requests')
        .select('*')
        .eq('student_id', session.user.id)
        .order('created_at', { ascending: false });
      if (requests) setChargeRequests(requests);
      
    } catch (err: any) {
      setManualMessage({ text: err.message || 'حدث خطأ أثناء إرسال الطلب', isError: true });
    } finally {
      setIsManualSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-slate-900 font-sans pb-20 transition-colors">
      {/* Top Banner Gradient */}
      <div className="h-44 md:h-64 w-full bg-gradient-to-r from-burgundy-600 via-burgundy-500 to-burgundy-400 opacity-90 rounded-b-[40px] md:rounded-b-[80px] absolute top-0 left-0"></div>

      <div className="relative pt-8 md:pt-12 max-w-6xl mx-auto px-4 z-10">
        {/* Main Profile Container */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row transition-colors">
          {/* Top Mobile Heading / Desktop hidden */}
          <div className="md:hidden flex justify-center -mt-5 mb-4 relative z-20">
            <div className="bg-burgundy-500 text-white dark:bg-burgundy-600 px-8 py-2 rounded-full font-bold flex items-center gap-2 shadow-md hover:scale-105 transition-transform">
              <User className="w-5 h-5" />
              <span>
                {sidebarLinks.find((link) => link.id === activeTab)?.label || 'ملف المستخدم'}
              </span>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 md:border-l border-slate-200 dark:border-slate-700 order-1 pt-4 pb-4 md:py-8 md:rounded-r-2xl rounded-t-2xl md:rounded-tl-none border-b md:border-b-0 transition-colors">
            <div className="flex flex-col px-4 gap-1">
              {sidebarLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => link.id === 'wallet' ? (onNavigate && onNavigate('wallet')) : setActiveTab(link.id)}
                  className={`text-right px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                    activeTab === link.id
                      ? 'bg-burgundy-500 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6 md:p-10 order-2">
            {/* Desktop Heading */}
            <div className="hidden md:flex justify-center -mt-16 mb-10 relative z-20">
              <div className="bg-burgundy-500 dark:bg-burgundy-600 text-white px-8 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
                <User className="w-5 h-5" />
                <span>
                  {sidebarLinks.find((link) => link.id === activeTab)?.label || 'ملف المستخدم'}
                </span>
              </div>
            </div>

            {/* Content Switcher */}
            {activeTab === 'profile' ? (
              <div className="space-y-12">
                {/* User Info Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-slate-100 dark:border-slate-700 pb-8 transition-colors">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-colors">
                    <User className="w-12 h-12 md:w-16 md:h-16 text-slate-400 dark:text-slate-500" />
                  </div>

                  <div className="flex-1 text-center md:text-right md:mt-2">
                    <div className="flex flex-col md:flex-row items-center md:items-center gap-3 mb-4">
                      <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                        {userData?.name || 'جاري التحميل...'}
                      </h2>
                      <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {stats.examsFinished > 20
                          ? 'طالب خبير'
                          : stats.examsFinished > 10
                            ? 'طالب متقدم'
                            : stats.examsFinished > 5
                              ? 'طالب متوسط'
                              : 'طالب مبتدئ'}
                      </span>
                    </div>
                    <div className="flex flex-col items-center md:items-start gap-4 text-slate-600 dark:text-slate-400 text-sm md:text-base font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-burgundy-50 dark:bg-burgundy-500/10 flex items-center justify-center">
                          <Phone className="w-4 h-4 text-burgundy-500" />
                        </div>
                        <span dir="ltr">{userData?.phone || 'غير مسجل'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                          <Mail className="w-4 h-4 text-amber-500" />
                        </div>
                        <span dir="ltr">{userData?.email || 'غير مسجل'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Settings & Info */}
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-burgundy-50 dark:bg-burgundy-500/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-burgundy-500" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                      بيانات الحساب
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                        السنة الدراسية
                      </span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {userData?.academicYear || 'غير محدد'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                        المدرسة/الكلية
                      </span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {userData?.collegeName || 'غير محدد'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                        المحافظة
                      </span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {userData?.governorate || 'غير محدد'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                        رقم ولي الأمر
                      </span>
                      <span
                        className="text-sm font-bold text-slate-800 dark:text-slate-200"
                        dir="ltr"
                      >
                        {userData?.parentPhone || 'غير محدد'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                        العنوان التفصيلي
                      </span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {userData?.addressDetails || 'غير محدد'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Courses Statistics */}
                <div className="space-y-8">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-burgundy-50 dark:bg-burgundy-500/10 flex items-center justify-center">
                      <Star className="w-5 h-5 text-burgundy-500" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                      {t('courseStats')}
                    </h2>
                  </div>

                  <div className="flex flex-wrap justify-center gap-6">
                    <CircularProgress
                      percentage={
                        stats.totalVideosInPlatform > 0
                          ? Math.round((stats.videosWatched / stats.totalVideosInPlatform) * 100)
                          : 0
                      }
                      color="#f43f5e"
                      title={t('videosWatched')}
                      subtitle1={`${stats.videosWatched} ${t('videoCount')}`}
                      subtitle2={`${t('from')} ${stats.totalVideosInPlatform}`}
                      subtitleColor="bg-burgundy-500"
                    />
                    <CircularProgress
                      percentage={
                        stats.totalExams > 0
                          ? Math.round((stats.examsFinished / stats.totalExams) * 100)
                          : 0
                      }
                      color="#0ea5e9"
                      title={t('examsFinished')}
                      subtitle1={`${stats.examsFinished} ${t('examCount')}`}
                      subtitle2={`${t('from')} ${stats.totalExams}`}
                      subtitleColor="bg-burgundy-500"
                    />
                    <CircularProgress
                      percentage={stats.averageResult}
                      color="#d946ef"
                      title={t('averageResults')}
                      subtitle1={`${stats.averageResult}%`}
                      subtitle2="المتوسط"
                      subtitleColor="bg-burgundy-500"
                    />
                  </div>
                </div>

                {/* Platform Statistics */}
                <div className="space-y-8">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                      <Star className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                      {t('platformStats')}
                    </h2>
                  </div>

                  <div className="flex flex-col gap-4 max-w-xl mx-auto bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 transition-colors">
                      <span className="text-slate-700 dark:text-slate-300 font-bold">
                        {t('totalLectureTime')}
                      </span>
                      <div className="px-4 py-1.5 bg-burgundy-50 dark:bg-burgundy-500/10 border border-burgundy-200 dark:border-burgundy-500/20 rounded-full text-burgundy-600 dark:text-burgundy-400 text-sm font-bold">
                        {stats.totalLectureTime} {t('minuteCount')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 transition-colors">
                      <span className="text-slate-700 dark:text-slate-300 font-bold">
                        {t('totalVideoViews')}
                      </span>
                      <div className="px-4 py-1.5 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-full text-yellow-600 dark:text-yellow-400 text-sm font-bold">
                        {stats.totalVideoViews} {t('timeCount')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 transition-colors">
                      <span className="text-slate-700 dark:text-slate-300 font-bold">
                        {t('totalExamOpens')}
                      </span>
                      <div className="px-4 py-1.5 bg-burgundy-50 dark:bg-burgundy-500/10 border border-burgundy-200 dark:border-burgundy-500/20 rounded-full text-burgundy-600 dark:text-burgundy-400 text-sm font-bold">
                        {stats.totalOpens} {t('timeCount')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 transition-colors">
                      <span className="text-slate-700 dark:text-slate-300 font-bold">
                        {t('totalExamCompletes')}
                      </span>
                      <div className="px-4 py-1.5 bg-burgundy-50 dark:bg-burgundy-500/10 border border-burgundy-200 dark:border-burgundy-500/20 rounded-full text-burgundy-600 dark:text-burgundy-400 text-sm font-bold">
                        {stats.examsFinished} {t('timeCount')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'subscriptions' ? (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-full bg-burgundy-50 dark:bg-burgundy-500/10 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-burgundy-500" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                    الاشتراكات والباقات
                  </h2>
                </div>

                {isLoadingStats || isLoadingCourses ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="w-10 h-10 border-4 border-burgundy-200 border-t-burgundy-600 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    {subscribedCourses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {subscribedCourses.map((course, idx) => (
                          <div
                            key={idx}
                            className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all"
                          >
                            <img
                              src={course.image || null}
                              alt={course.title}
                              className="w-full h-40 object-cover"
                            />
                            <div className="p-5">
                              <h3 className="text-lg font-bold mb-3 dark:text-white">
                                {course.title}
                              </h3>
                              <div className="mb-4">
                                <div className="flex justify-between text-xs mb-2">
                                  <span className="text-slate-500 dark:text-slate-400">
                                    نسبة الانجاز
                                  </span>
                                  <span className="font-bold text-burgundy-500">
                                    {course.progress}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                                  <div
                                    className="bg-burgundy-500 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${course.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                              <button
                                onClick={() => navigateToCourse(course)}
                                className="w-full py-2.5 bg-burgundy-50 dark:bg-burgundy-500/10 text-burgundy-600 dark:text-burgundy-400 rounded-xl font-bold hover:bg-burgundy-100 dark:hover:bg-burgundy-500/20 transition-colors flex items-center justify-center gap-2"
                              >
                                <span>الذهاب للكورس</span>
                                <ArrowLeft className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <p className="text-slate-500 text-sm">لا توجد اشتراكات مفعلة حالياً.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : activeTab === 'charge' ? (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex flex-col items-center justify-center gap-3 mb-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-2">
                    <CreditCard className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                    المحفظة والشحن
                  </h2>
                  <div className="bg-slate-100 dark:bg-slate-800 px-6 py-3 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">
                      الرصيد الحالي:
                    </span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {balance} ج.م
                    </span>
                  </div>
                </div>

                <div className="max-w-xl mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                  <div className="mb-8">
                    <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">
                      أدخل كود الشحن الموجود في الكارت الخاص بك لشحن رصيدك وتفعيل الاشتراكات.
                    </p>

                    <div className="relative max-w-md mx-auto">
                      <input
                        type="text"
                        value={chargeCode}
                        onChange={(e) => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let val = e.target.value;
  for (let i = 0; i < 10; i++) {
    val = val.replaceAll(arabicNumbers[i], i.toString());
  }
  setChargeCode(val.replace(/\D/g, ''));
}}
                        placeholder="أدخل كود الشحن المكون من 16 رقم"
                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-4 px-6 text-center text-lg font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none transition-colors"
                        dir="ltr"
                      />
                    </div>
                    {chargeMessage.text && (
                      <div
                        className={`mt-4 font-bold text-sm ${chargeMessage.isError ? 'text-red-500' : 'text-emerald-500'}`}
                      >
                        {chargeMessage.text}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleChargeWallet}
                    className="w-full max-w-md mx-auto py-4 rounded-xl font-bold transition-all bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
                  >
                    شحن الرصيد الآن
                  </button>
                </div>
              </div>
            ) : activeTab === 'charge-manual' ? (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex flex-col items-center justify-center gap-3 mb-8">
                  <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-2">
                    <Phone className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                    طلب شحن رصيد (تحويل يدوي)
                  </h2>
                  <p className="text-slate-500 text-center max-w-lg">
                    قم بتحويل المبلغ المطلوب إلى رقم فودافون كاش، ثم أدخل بيانات التحويل هنا.
                  </p>
                </div>

                <div className="max-w-xl mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 border border-blue-100 dark:border-blue-800">
                    <p className="text-blue-800 dark:text-blue-300 text-sm font-bold text-center">
                      رقم فودافون كاش للتحويل: <span className="text-lg font-black font-mono mx-2">01017967936</span>
                    </p>
                  </div>

                  <form onSubmit={handleManualChargeSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        رقم الموبايل الذي قمت بالتحويل منه
                      </label>
                      <input
                        type="text"
                        value={manualPhone}
                        onChange={(e) => setManualPhone(e.target.value)}
                        placeholder="مثال: 01012345678"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-white focus:border-blue-500 focus:outline-none text-right dir-ltr"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        المبلغ المحول (ج.م)
                      </label>
                      <input
                        type="number"
                        value={manualAmount}
                        onChange={(e) => setManualAmount(e.target.value)}
                        placeholder="مثال: 150"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-white focus:border-blue-500 focus:outline-none text-right"
                      />
                    </div>
                    {manualMessage.text && (
                      <div className={`p-4 rounded-xl text-sm font-bold ${manualMessage.isError ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {manualMessage.text}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={isManualSubmitting}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-70"
                    >
                      {isManualSubmitting ? <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span> : 'تأكيد طلب الشحن'}
                    </button>
                  </form>
                </div>

                <div className="max-w-3xl mx-auto mt-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                      طلبات الشحن الخاصة بك
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="p-4 font-bold">المبلغ</th>
                          <th className="p-4 font-bold">الحالة</th>
                          <th className="p-4 font-bold">رقم المحفظة</th>
                          <th className="p-4 font-bold">كود الشحن</th>
                          <th className="p-4 font-bold">التاريخ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {chargeRequests.length > 0 ? (
                          chargeRequests.map((req, i) => (
                            <tr
                              key={i}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                              <td className="p-4">
                                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                                  <span className="text-lg">{req.amount}</span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    ج.م
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                                    req.status === 'approved'
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                      : req.status === 'rejected'
                                        ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                                  }`}
                                >
                                  {req.status === 'approved' && (
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  )}
                                  {req.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                                  {req.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                                  {req.status === 'approved'
                                    ? 'تمت الموافقة'
                                    : req.status === 'rejected'
                                      ? 'مرفوض'
                                      : 'قيد المراجعة'}
                                </span>
                              </td>
                              <td className="p-4">
                                <span
                                  className="font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-sm border border-slate-200 dark:border-slate-700"
                                  dir="ltr"
                                >
                                  {req.sender_phone}
                                </span>
                              </td>
                              <td className="p-4">
                                {req.charge_code ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 px-3 py-1.5 rounded-lg text-sm md:text-base tracking-[0.15em] dir-ltr inline-block select-all">
                                      {req.charge_code.match(/.{1,4}/g)?.join('-') ||
                                        req.charge_code}
                                    </span>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(req.charge_code);
                                        toast.success('تم نسخ كود الشحن!');
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-md transition-colors"
                                      title="نسخ الكود"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-sm italic pr-2">
                                    بانتظار الموافقة...
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-slate-500 dark:text-slate-400 whitespace-nowrap text-sm">
                                {new Date(req.created_at).toLocaleDateString('ar-EG', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-500">
                              لا توجد طلبات شحن حالياً
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            ) : activeTab === 'leaderboard' ? (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex flex-col items-center justify-center gap-3 mb-8">
                  <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-2">
                    <Star className="w-8 h-8 text-amber-500" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                    لوحة الشرف للأوائل
                  </h2>
                  <p className="text-slate-500 text-center max-w-lg">
                    الطلاب الأكثر تفوقاً وإنجازاً في المنصة. اجتهد لتكون منهم!
                  </p>
                </div>

                <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                  {topStudents.map((student, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0 ${student.name === userData?.name ? 'bg-burgundy-50 dark:bg-burgundy-900/20' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${student.rank === 1 ? 'bg-amber-400 text-white' : student.rank === 2 ? 'bg-slate-300 text-slate-700' : student.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
                        >
                          {student.rank}
                        </div>
                        <span
                          className={`font-bold ${student.name === userData?.name ? 'text-burgundy-600 dark:text-burgundy-400' : 'text-slate-800 dark:text-white'}`}
                        >
                          {student.name} {student.name === userData?.name && '(أنت)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 dark:bg-amber-500/10 px-3 py-1 rounded-full text-sm">
                        {student.points || 1000 - student.rank * 10} نقطة
                      </div>
                    </div>
                  ))}

                  {/* Append current user if they are not in the top students list */}
                  {!topStudents.some((s) => s.name === userData?.name) && (
                    <div className="flex items-center justify-between p-4 border-t-2 border-slate-200 dark:border-slate-600 bg-burgundy-50 dark:bg-burgundy-900/20">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                          -
                        </div>
                        <span className="font-bold text-burgundy-600 dark:text-burgundy-400">
                          {userData?.name || 'أنت'} (أنت)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 dark:bg-amber-500/10 px-3 py-1 rounded-full text-sm">
                        {stats.examsFinished * 10} نقطة
                      </div>
                    </div>
                  )}

                  {topStudents.length === 0 && (
                    <div className="p-8 text-center text-slate-500">جاري تحميل القائمة...</div>
                  )}
                </div>
              </div>
            ) : activeTab === 'my-courses' ? (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex flex-col items-center justify-center gap-3 mb-8">
                  <div className="w-16 h-16 rounded-full bg-burgundy-50 dark:bg-burgundy-500/10 flex items-center justify-center mb-2">
                    <BookOpen className="w-8 h-8 text-burgundy-500" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                    كورساتي
                  </h2>
                  <p className="text-slate-500 text-center max-w-lg">
                    الكورسات التي قمت بالاشتراك بها ومتابعة تقدمك فيها.
                  </p>
                </div>

                {isLoadingCourses ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="w-10 h-10 border-4 border-burgundy-200 border-t-burgundy-600 rounded-full animate-spin"></div>
                  </div>
                ) : subscribedCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {subscribedCourses.map((course, idx) => (
                      <div
                        key={idx}
                        className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all"
                      >
                        <img
                          src={course.image || null}
                          alt={course.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-5">
                          <h3 className="text-lg font-bold mb-3 dark:text-white">{course.title}</h3>
                          <div className="mb-4">
                            <div className="flex justify-between text-xs mb-2">
                              <span className="text-slate-500 dark:text-slate-400">
                                نسبة الانجاز
                              </span>
                              <span className="font-bold text-burgundy-500">
                                {course.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                              <div
                                className="bg-burgundy-500 h-1.5 rounded-full"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          <button
                            onClick={() => navigateToCourse(course)}
                            className="w-full py-2 bg-burgundy-50 dark:bg-burgundy-900/20 text-burgundy-600 dark:text-burgundy-400 font-bold rounded-xl text-sm hover:bg-burgundy-100 dark:hover:bg-burgundy-900/40 transition-colors"
                          >
                            متابعة التعلم
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 max-w-3xl mx-auto">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
                      لا توجد كورسات مشتركة
                    </h3>
                    <p className="text-slate-500 text-sm">
                      لم تقم بالاشتراك في أي كورسات حتى الآن.
                    </p>
                  </div>
                )}
              </div>
            ) : activeTab === 'security' ? (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex flex-col items-center justify-center gap-3 mb-8">
                  <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-2">
                    <Key className="w-8 h-8 text-rose-500" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                    الأمان وتاريخ تسجيل الدخول
                  </h2>
                </div>

                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1">
                        تغيير كلمة المرور
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        ينصح بتغيير كلمة المرور بشكل دوري للحفاظ على أمان حسابك.
                      </p>
                    </div>
                    <button className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-xl transition-colors shrink-0">
                      تحديث كلمة المرور
                    </button>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
                      <History className="w-5 h-5 text-slate-500" />
                      <h3 className="font-bold text-slate-800 dark:text-white">سجل تسجيل الدخول</h3>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {loginLogs.length > 0 ? (
                        loginLogs.map((log, i) => (
                          <div
                            key={i}
                            className="p-4 sm:p-6 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                <LogIn className="w-4 h-4 text-slate-500" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                  {log.os || 'نظام غير معروف'} - {log.browser || 'متصفح غير معروف'}
                                  {log.device_id === localDeviceId && (
                                    <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                                      الحالي
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" />{' '}
                                  {new Date(log.created_at).toLocaleString('ar-EG')}
                                </div>
                              </div>
                            </div>
                            <div
                              className={`text-xs font-bold px-3 py-1 rounded-full ${log.device_id === localDeviceId ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}
                            >
                              {log.status}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                          لا يوجد سجل تسجيل دخول
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'views' ? (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex flex-col items-center justify-center gap-3 mb-8">
                  <div className="w-16 h-16 rounded-full bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center mb-2">
                    <Eye className="w-8 h-8 text-cyan-500" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                    تفاصيل المشاهدات
                  </h2>
                  <p className="text-slate-500 text-center max-w-lg">
                    تتبع عدد المشاهدات والوقت المقضي في مشاهدة كل محاضرة.
                  </p>
                </div>

                <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="p-4 font-bold">المحاضرة</th>
                          <th className="p-4 font-bold">عدد المشاهدات</th>
                          <th className="p-4 font-bold">تاريخ آخر مشاهدة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {isLoadingStats ? (
                          <tr>
                            <td colSpan={3} className="p-8 text-center">
                              <div className="w-6 h-6 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto"></div>
                            </td>
                          </tr>
                        ) : videoViews.length > 0 ? (
                          videoViews.map((row, i) => (
                            <tr
                              key={i}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                              <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                                {row.video_title}
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
                                  {row.views_count}
                                </span>
                              </td>
                              <td className="p-4 text-slate-500 dark:text-slate-400">
                                {new Date(row.last_viewed_at).toLocaleDateString('ar-EG')}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="p-8 text-center text-slate-500">
                              لا توجد مشاهدات مسجلة
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : activeTab === 'invoices' ? (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex flex-col items-center justify-center gap-3 mb-8">
                  <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mb-2">
                    <FileText className="w-8 h-8 text-purple-500" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                    عمليات شحن المحفظة
                  </h2>
                </div>

                <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="p-4 font-bold">رقم العملية</th>
                          <th className="p-4 font-bold">كود الشحن</th>
                          <th className="p-4 font-bold">المبلغ</th>
                          <th className="p-4 font-bold">تاريخ الشحن</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {isLoadingStats ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center">
                              <div className="w-6 h-6 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                            </td>
                          </tr>
                        ) : invoices.length > 0 ? (
                          invoices.map((invoice, i) => (
                            <tr
                              key={i}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                              <td className="p-4 font-mono text-slate-500">
                                {invoice.id?.substring(0, 8)}
                              </td>
                              <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                                {invoice.code}
                              </td>
                              <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                                {invoice.amount} ج.م
                              </td>
                              <td className="p-4 text-slate-500 dark:text-slate-400">
                                {invoice.used_at
                                  ? new Date(invoice.used_at).toLocaleString('ar-EG')
                                  : '---'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-500">
                              لا توجد عمليات شحن حالياً
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : activeTab === 'exam-results' ? (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex flex-col items-center justify-center gap-3 mb-8">
                  <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-2">
                    <Award className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                    نتائج الامتحانات
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 max-w-lg text-center">
                    تابع تقدمك ومستواك في جميع الامتحانات التي قمت باجتيازها. يمكنك معرفة نقاط القوة والضعف من هنا.
                  </p>
                </div>

                <div className="max-w-4xl mx-auto space-y-4">
                  {isLoadingStats ? (
                    <div className="py-20 text-center">
                      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-slate-500">جاري تحميل النتائج...</p>
                    </div>
                  ) : examResults.length > 0 ? (
                    examResults.map((result, i) => {
                      const totalMarks = result.exams?.total_marks || 100;
                      const percentage = Math.round((result.score / totalMarks) * 100);
                      const isPassed = percentage >= 50;

                      return (
                        <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center gap-6 transition-all hover:shadow-md">
                          <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center border-2 ${isPassed ? 'bg-emerald-50 border-emerald-100 text-emerald-500 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 'bg-red-50 border-red-100 text-red-500 dark:bg-red-500/10 dark:border-red-500/20'}`}>
                            {isPassed ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                          </div>
                          
                          <div className="flex-1 w-full text-center md:text-right">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                              {result.exams?.title || 'امتحان محذوف'}
                            </h3>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500 dark:text-slate-400 mb-3">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(result.started_at).toLocaleDateString('ar-EG')}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${result.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                                {result.status === 'completed' ? 'مكتمل' : 'لم يكتمل'}
                              </span>
                            </div>
                            
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mb-2 overflow-hidden">
                              <div 
                                className={`h-2.5 rounded-full ${isPassed ? 'bg-emerald-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="shrink-0 text-center md:text-left min-w-[100px]">
                            <div className={`text-3xl font-black ${isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                              {percentage}%
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
                              {result.score} / {totalMarks}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <LayoutList className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">لا توجد نتائج امتحانات</h3>
                      <p className="text-slate-500">لم تقم باجتياز أي امتحانات حتى الآن.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === 'homework-results' ? (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex flex-col items-center justify-center gap-3 mb-8">
                  <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-2">
                    <FileText className="w-8 h-8 text-orange-500" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                    نتائج الواجبات
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 max-w-lg text-center">
                    قائمة الواجبات والتكليفات التي قمت بإتمامها. التزم بتسليم الواجبات بانتظام لتحقيق أقصى استفادة.
                  </p>
                </div>

                <div className="max-w-4xl mx-auto space-y-4">
                  {isLoadingStats ? (
                    <div className="py-20 text-center">
                      <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-slate-500">جاري تحميل النتائج...</p>
                    </div>
                  ) : homeworkResults.length > 0 ? (
                    homeworkResults.map((result, i) => {
                      const totalMarks = result.assignments?.total_marks || 100;
                      const percentage = Math.round((result.score / totalMarks) * 100);
                      const isPassed = percentage >= 50;

                      return (
                        <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center gap-6 transition-all hover:shadow-md">
                          <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center border-2 ${isPassed ? 'bg-orange-50 border-orange-100 text-orange-500 dark:bg-orange-500/10 dark:border-orange-500/20' : 'bg-red-50 border-red-100 text-red-500 dark:bg-red-500/10 dark:border-red-500/20'}`}>
                            {isPassed ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                          </div>
                          
                          <div className="flex-1 w-full text-center md:text-right">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                              {result.assignments?.title || 'واجب محذوف'}
                            </h3>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500 dark:text-slate-400 mb-3">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(result.started_at).toLocaleDateString('ar-EG')}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${result.status === 'completed' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                                {result.status === 'completed' ? 'تم التسليم' : 'مسودة'}
                              </span>
                            </div>
                            
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mb-2 overflow-hidden">
                              <div 
                                className={`h-2.5 rounded-full ${isPassed ? 'bg-orange-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="shrink-0 text-center md:text-left min-w-[100px]">
                            <div className={`text-3xl font-black ${isPassed ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'}`}>
                              {percentage}%
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
                              {result.score} / {totalMarks}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">لا توجد نتائج واجبات</h3>
                      <p className="text-slate-500">لم تقم بتسليم أي واجبات حتى الآن.</p>
                    </div>
                  )}
                </div>
              </div>

            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-100 dark:border-slate-700">
                  <FileText className="w-10 h-10 opacity-50" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t('statusSoon')}</h3>
                <p className="text-sm font-medium">{t('developingMsg')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
