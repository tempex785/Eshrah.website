import { useState, useEffect, useRef } from 'react';
import { PlayCircle, Video, FileText, CheckSquare, CalendarDays, Eye, Pin, Folder, UserPlus, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CourseData } from '../../App';

export default function CourseCard({
  course,
  isFree,
  onNavigate,
  isLoggedIn,
  setShowAuthModal,
  hasSubscription,
  t,
}: any) {
  const isSubscribed = !isFree && hasSubscription(course.id);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [stats, setStats] = useState({
    videos: 0,
    exams: 0,
    assignments: 0,
    files: 0,
    hours: 0,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    async function fetchStats() {
      if (!course?.id || !isInView) return;
      try {
        const [{ count: examsCount }, { count: assignmentsCount }, { data: subjects }] =
          await Promise.all([
            supabase
              .from('exams')
              .select('*', { count: 'exact', head: true })
              .eq('course_id', course.id),
            supabase
              .from('assignments')
              .select('*', { count: 'exact', head: true })
              .eq('course_id', course.id),
            supabase.from('course_subjects').select('id').eq('course_id', course.id),
          ]);

        let videoCount = 0;
        let fileCount = 0;
        let totalMinutes = 0;
        let manualExamsCount = 0;

        if (subjects && subjects.length > 0) {
          const { data: modules } = await supabase.rpc('get_secure_course_modules', {
            p_course_id: String(course.id),
          });
          if (modules) {
            modules.forEach((m: any) => {
              let items = m.items || [];
              if (typeof items === 'string') {
                try {
                  items = JSON.parse(items);
                } catch (e) {
                  items = [];
                }
              }
              (items || []).forEach((item: any) => {
                if (item.icon === 'PlaySquare') {
                  videoCount++;
                  totalMinutes += Number(item.duration_minutes) || 0;
                } else if (item.icon === 'FileText') {
                  fileCount++;
                } else if (
                  item.isExam ||
                  (item.title || '').includes('اختبار') ||
                  (item.title || '').includes('امتحان') ||
                  (item.title || '').includes('واجب')
                ) {
                  manualExamsCount++;
                }
              });
            });
          }
        }

        setStats({
          videos: videoCount || 0,
          exams: (examsCount || 0) + manualExamsCount,
          assignments: assignmentsCount || 0,
          files: fileCount || 0,
          hours: totalMinutes ? Math.round((totalMinutes / 60) * 10) / 10 : 0,
        });
      } catch (err) {
        
      }
    }
    fetchStats();
  }, [course?.id, isInView]);
  const badgeText = isFree ? 'كورس مجاني' : 'كورس جديد';
  const badgeColor = isFree ? 'bg-emerald-500' : 'bg-yellow-500';
  const headerColor = isFree ? 'bg-emerald-500' : 'bg-[#e5b32f]';
  const priceLabel = course.price ? parseInt(course.price) : isFree ? '0' : '250';

  return (
    <div ref={cardRef} className="bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-lg border border-gray-100 dark:border-slate-700 flex flex-col relative w-full transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl">
      {/* Image & Top Ribbon */}
      <div className="relative">
        <div className="w-full aspect-[4/3]">
          <img src={course.image || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop'} className="w-full h-full object-cover" alt={course.title} />
        </div>
        <div
          className={`absolute top-0 right-0 ${badgeColor} text-white font-bold px-8 py-1.5 transform rotate-45 translate-x-8 translate-y-5 shadow-md`}
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
        >
          {badgeText}
        </div>

        {/* Pill: Subject & Semester - positioned perfectly at the bottom of the image */}
        <div
          className={`absolute -bottom-4 left-1/2 -translate-x-1/2 ${headerColor} text-slate-900 font-bold px-6 py-1.5 rounded-xl z-10 w-max shadow-md text-sm`}
        >
          {course.semester}
        </div>
      </div>

      <div className="pt-10 px-4 sm:px-6 pb-6 flex flex-col items-center flex-1">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white text-center mb-2">
          {course.title}
        </h3>

        <div
          className={`${badgeColor} text-white text-[11px] font-bold px-3 py-1 rounded flex items-center gap-1 mb-4`}
        >
          <Pin className="w-3 h-3" /> {badgeText}
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6 line-clamp-2 min-h-[40px]">
          {course.description ||
            'أفضل الكورسات المتاحة حاليا على منصة إشرح طب لتعزيز مسيرتك الأكاديمية'}
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6 flex-1">
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl py-2.5 px-3 flex items-center justify-between">
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
              {stats.videos} محاضرة
            </span>
            <Video className="w-4 h-4 text-[#1390d4]" />
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl py-2.5 px-3 flex items-center justify-between">
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
              {stats.exams} امتحان
            </span>
            <FileText className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl py-2.5 px-3 flex items-center justify-between">
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
              {stats.assignments} واجب
            </span>
            <CheckSquare className="w-4 h-4 text-purple-500" />
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl py-2.5 px-3 flex items-center justify-between">
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
              {stats.files} ملف
            </span>
            <Folder className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl py-2.5 px-3 flex items-center justify-center col-span-2 gap-2">
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
              {stats.hours} ساعة
            </span>
            <CalendarDays className="w-4 h-4 text-red-500" />
          </div>
        </div>

        {/* Price section */}
        <div className="w-full bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-4 flex flex-col items-center relative mb-6 border border-slate-100 dark:border-slate-700 overflow-hidden shrink-0 mt-auto">
          <div
            className="absolute top-0 right-0 bg-[#1390d4] text-white text-xs font-bold w-16 h-16 flex items-start justify-end p-1.5"
            style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
          >
            <span className="transform rotate-45 translate-x-1 -translate-y-2">السعر</span>
          </div>

          <div className="flex items-end gap-1 mb-2">
            <span className="text-3xl font-black text-slate-800 dark:text-white">{priceLabel}</span>
            <span className="text-red-500 font-bold mb-1">جنيه</span>
          </div>
          <div className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-4 py-1.5 rounded w-full text-center">
            السعر النهائي شامل الضرائب
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full shrink-0 mb-5">
          <button
            onClick={() => {
              if (isLoggedIn) onNavigate('course-details', { ...course, isFree });
              else setShowAuthModal(true);
            }}
            className="flex-1 bg-white dark:bg-slate-800 border-2 border-[#1390d4] text-[#1390d4] hover:bg-blue-50 dark:hover:bg-slate-700 font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors text-sm"
          >
            <Eye className="w-4 h-4" /> عرض المحتوى
          </button>
          {!isSubscribed && !isFree ? (
            <button
              onClick={() => {
                if (isLoggedIn) onNavigate('course-details', course);
                else setShowAuthModal(true);
              }}
              className="flex-1 bg-[#ef4444] hover:bg-red-600 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors text-sm"
            >
              <UserPlus className="w-4 h-4" /> اشترك الان
            </button>
          ) : (
            <button className="flex-1 bg-emerald-500 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-sm cursor-default">
              <CheckCircle2 className="w-4 h-4" /> مشترك
            </button>
          )}
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-medium w-full justify-center shrink-0">
          <CalendarDays className="w-3.5 h-3.5 text-yellow-500" />
          تاريخ الكورس : {formatDate(course.createdAt || course.end_date)}
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return 'الجمعة ٢٧ مارس ٢٠٢٦ - ١٢:٢١ ص';
  try {
    const d = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };
    return new Intl.DateTimeFormat('ar-EG', options).format(d);
  } catch (e) {
    return 'الجمعة ٢٧ مارس ٢٠٢٦ - ١٢:٢١ ص';
  }
}
