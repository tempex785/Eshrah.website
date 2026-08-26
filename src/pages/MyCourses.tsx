import { BookOpen, FolderOpen } from 'lucide-react';
import { CourseData, Page } from '../App';
import { useLanguage } from '../context/LanguageContext';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useWallet } from '../hooks/useWallet';

interface MyCoursesProps {
  onNavigate: (page: Page, course?: CourseData) => void;
  userSemester: string;
}

export default function MyCourses({ onNavigate, userSemester }: MyCoursesProps) {
  const { t } = useLanguage();
  const { subscriptions } = useWallet();
  const [subscribedCourses, setSubscribedCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMyCourses() {
      if (subscriptions.length === 0) {
        setSubscribedCourses([]);
        setIsLoading(false);
        return;
      }

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

        const mappedCourses = await Promise.all(
          combinedData.map(async (d) => {
            let progress = 0;
            try {
              const { data: sessionData } = await supabase.auth.getSession();
              if (sessionData?.session?.user) {
                const userId = sessionData.session.user.id;
                const { data: subjects } = await supabase
                  .from('course_subjects')
                  .select('id')
                  .eq('course_id', d.id);
                if (subjects && subjects.length > 0) {
                  const subjectIds = subjects.map((s: any) => s.id);
                  const { data: modules } = await supabase
                    .from('course_modules')
                    .select('items')
                    .in('subject_id', subjectIds);

                  if (modules && modules.length > 0) {
                    let videoUrls: string[] = [];
                    modules.forEach((m: any) => {
                      if (m.items) {
                        try {
                          const items = typeof m.items === 'string' ? JSON.parse(m.items) : m.items;
                          if (Array.isArray(items)) {
                            items.forEach((i: any) => {
                              if ((i.icon === 'MonitorPlay' || i.isVideo) && i.url) {
                                videoUrls.push(i.url);
                              }
                            });
                          }
                        } catch (e) {}
                      }
                    });

                    if (videoUrls.length > 0) {
                      const { data: views } = await supabase
                        .from('video_views')
                        .select('id, video_id')
                        .eq('student_id', userId)
                        .in('video_id', videoUrls);

                      const viewsCount = views ? views.length : 0;
                      progress = Math.round((viewsCount / videoUrls.length) * 100);
                    }
                  }
                }
              }
            } catch (e) {
              
            }

            return {
              id: d.id,
              image:
                d.image_url ||
                'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop',
              title: d.title,
              progress: Math.min(100, progress),
              price: d.price || 'مجانًا',
              features: d.features || [],
            };
          })
        );
        setSubscribedCourses(mappedCourses);
      } catch (err) {
        
      } finally {
        setIsLoading(false);
      }
    }

    fetchMyCourses();
  }, [subscriptions]);

  return (
    <section className="px-4 py-16 max-w-6xl mx-auto w-full">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="bg-burgundy-50 dark:bg-burgundy-900/30 px-8 py-3 rounded-full mb-6 shadow-sm border border-burgundy-200 dark:border-burgundy-800">
          <h1 className="text-burgundy-800 dark:text-burgundy-300 font-bold text-2xl flex items-center gap-3">
            <BookOpen className="w-6 h-6" />
            {t('myCourses')}
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{t('myCoursesSubtitle')}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-burgundy-200 border-t-burgundy-600 rounded-full animate-spin"></div>
        </div>
      ) : subscribedCourses.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {subscribedCourses.map((course, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all"
            >
              <img
                src={course.image || null}
                alt={course.title}
                className="w-full h-56 object-cover transform transition-transform duration-700 group-hover:scale-105"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 dark:text-white">{course.title}</h3>
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500 dark:text-gray-400">{t('completionRate')}</span>
                    <span className="font-bold text-burgundy-500">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-burgundy-500 h-2 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('course-details', course)}
                  className="w-full py-3 bg-burgundy-50 dark:bg-burgundy-900/20 text-burgundy-600 dark:text-burgundy-400 font-bold rounded-xl hover:bg-burgundy-50 dark:hover:bg-burgundy-900/40 transition-colors"
                >
                  {t('continueLearning')}
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-100 dark:border-slate-700">
            <FolderOpen className="w-10 h-10 opacity-50" />
          </div>
          <h3 className="text-xl font-bold mb-2">لا توجد كورسات حالياً</h3>
          <p className="text-sm font-medium">قم بالاشتراك في الكورسات من خلال الصفحة الرئيسية.</p>
          <button
            onClick={() => onNavigate('home')}
            className="mt-6 px-6 py-2 bg-burgundy-600 text-white rounded-xl font-bold shadow-sm"
          >
            تصفح الكورسات
          </button>
        </div>
      )}
    </section>
  );
}
