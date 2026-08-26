import { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';
import { Page, CourseData } from '../../App';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';
import AuthPromptModal from '../ui/AuthPromptModal';
import CourseSlider from './CourseSlider';

type Props = {
  onNavigate: (page: Page, course?: CourseData) => void;
  isLoggedIn: boolean;
  userSemester: string;
};

export default function Courses({ onNavigate, isLoggedIn, userSemester }: Props) {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [freeCourses, setFreeCourses] = useState<CourseData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>(isLoggedIn ? (userSemester || 'Semester 1') : 'Semester 1');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userSubscriptions, setUserSubscriptions] = useState<Set<string>>(new Set());

  const [semestersList, setSemestersList] = useState<string[]>(['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6']);

  useEffect(() => {
    async function fetchSemesters() {
      try {
        const { data } = await supabase
          .from('semesters')
          .select('*')
          .order('order_index', { ascending: true });
        if (data && data.length > 0) {
          setSemestersList(data.map((d) => d.name));
        }
      } catch (err) {}
    }
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      setSelectedSemester(userSemester || 'Semester 1');
    }
  }, [isLoggedIn, userSemester]);

  useEffect(() => {
    let isMounted = true;
    async function fetchCourses() {
      try {
        const [
          { data: payData, error: payError },
          { data: freeData, error: freeError }
        ] = await Promise.all([
          supabase
            .from('paycourses')
            .select('*')
            .eq('semester', selectedSemester)
            .order('created_at', { ascending: false }),
          supabase
            .from('freecourses')
            .select('*')
            .eq('semester', selectedSemester)
            .order('created_at', { ascending: false })
        ]);

        if (!isMounted) return;

        if (payError) throw payError;
        if (freeError) throw freeError;

        let combinedData = [...(payData || []), ...(freeData || [])];
        const data = combinedData.map(d => ({...d, image: d.image_url, createdAt: d.created_at, price: d.price ? String(d.price) : undefined}));

        let filtered = (data || []) as CourseData[];
        if (searchQuery) {
          filtered = filtered.filter(
            (c) =>
              c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              // @ts-ignore
              (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }

        setCourses(filtered.filter((c) => Number(c.price || 0) > 0));
        setFreeCourses(filtered.filter((c) => !c.price || String(c.price) === "0"));
      } catch (err) {
        
      }
    }
    fetchCourses();
    return () => {
      isMounted = false;
    };
  }, [searchQuery, selectedSemester]);

  useEffect(() => {
    async function fetchSubscriptions() {
      if (!isLoggedIn) {
        setUserSubscriptions(new Set());
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        const { data, error } = await supabase
          .from('student_subscriptions')
          .select('course_id')
          .eq('student_id', session.user.id);
        if (error) throw error;
        setUserSubscriptions(new Set(data.map((s) => s.course_id)));
      } catch (err) {
        
      }
    }
    fetchSubscriptions();
  }, [isLoggedIn]);

  const hasSubscription = (courseId: string) => userSubscriptions.has(courseId);

  return (
    <section className="px-4 py-20 bg-slate-50 dark:bg-[#0b121c] relative flex flex-col gap-16">
      {/* Search Bar */}
      <div className="max-w-xl mx-auto w-full px-4 mb-4">
        <input
          type="text"
          placeholder="ابحث عن كورس معين..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-6 text-slate-800 dark:text-white placeholder-slate-400 focus:border-burgundy-500 dark:focus:border-burgundy-500 focus:outline-none shadow-sm transition-colors text-center font-bold"
        />
      </div>

      {/* Semester Selector */}
      {!isLoggedIn && (
        <div className="max-w-4xl mx-auto w-full mb-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-burgundy-50 dark:bg-burgundy-900/40 p-3 rounded-2xl flex items-center justify-center gap-3 mb-4 shadow-sm border border-burgundy-200 dark:border-burgundy-800">
              <GraduationCap className="w-7 h-7 text-burgundy-600 dark:text-burgundy-400" />
              <h2 className="text-2xl font-black text-burgundy-900 dark:text-burgundy-300 tracking-tight">
                {t('chooseAcademicYear')}
              </h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-center max-w-md font-medium">
              {t('coursesCustomized')}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {semestersList.map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 text-lg ${
                  selectedSemester === sem
                    ? 'bg-gradient-to-r from-burgundy-500 to-burgundy-600 text-white shadow-xl shadow-burgundy-500/30 scale-105 border-transparent'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-burgundy-50 dark:hover:bg-slate-700 shadow-sm hover:shadow-md'
                }`}
              >
                {sem}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-16 px-4">
        {/* Premium Courses */}
        <div>
          <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between mb-8 gap-4 px-4">
            <div className="text-right">
              <h3 className="text-3xl md:text-5xl font-black text-[#0b121c] dark:text-white tracking-tight mb-2">
                الكورسات <span className="text-burgundy-500">المقترحة</span>
              </h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-base md:text-lg mt-3 max-w-2xl">
                ريحنا دماغك وجمعنا لك كورسات على مزاجك، مختارة بحب وعناية كأننا بنعمل شوبينج لأحسن شوية كورسات تساعدك وتنميك! ✨
              </p>
            </div>
            <button className="bg-burgundy-500 hover:bg-burgundy-600 text-white font-bold py-2 px-6 rounded-xl transition-colors shrink-0">
              الكل
            </button>
          </div>

          {courses.length === 0 && (
            <div className="text-center p-8 bg-white dark:bg-slate-800/30 rounded-3xl max-w-md mx-auto shadow-sm border border-slate-100 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 font-medium pb-2 text-lg">
                {t('noCoursesAvailable')}
              </p>
            </div>
          )}

          {courses.length > 0 && (
            <CourseSlider
              courses={courses}
              isFree={false}
              onNavigate={onNavigate}
              isLoggedIn={isLoggedIn}
              setShowAuthModal={setShowAuthModal}
              hasSubscription={hasSubscription}
              t={t}
            />
          )}
        </div>

        {/* Free Courses */}
        <div>
          <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between mb-8 gap-4 px-4">
            <div className="text-right">
              <h3 className="text-3xl md:text-5xl font-black text-[#0b121c] dark:text-white tracking-tight mb-2">
                الكورسات <span className="text-emerald-500">المجانية</span>
              </h3>
            </div>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-xl transition-colors shrink-0">
              الكل
            </button>
          </div>

          {freeCourses.length === 0 && (
            <div className="text-center p-8 bg-white dark:bg-slate-800/30 rounded-3xl max-w-md mx-auto shadow-sm border border-slate-100 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 font-medium pb-2 text-lg">
                {t('noCoursesAvailable')}
              </p>
            </div>
          )}

          {freeCourses.length > 0 && (
            <CourseSlider
              courses={freeCourses}
              isFree={true}
              onNavigate={onNavigate}
              isLoggedIn={isLoggedIn}
              setShowAuthModal={setShowAuthModal}
              hasSubscription={hasSubscription}
              t={t}
            />
          )}
        </div>
      </div>

      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onNavigate={onNavigate}
      />
    </section>
  );
}
