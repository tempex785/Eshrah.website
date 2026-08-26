import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CourseData } from '../../App';
import CourseCard from './CourseCard';

interface CourseSliderProps {
  courses: CourseData[];
  isFree: boolean;
  onNavigate: (page: any, course?: CourseData) => void;
  isLoggedIn: boolean;
  setShowAuthModal: (show: boolean) => void;
  hasSubscription: (courseId: string) => boolean;
  t: (key: string) => string;
}

export default function CourseSlider({
  courses,
  isFree,
  onNavigate,
  isLoggedIn,
  setShowAuthModal,
  hasSubscription,
  t,
}: CourseSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      // scrollLeft is negative in RTL
      const maxScroll = scrollWidth - clientWidth;
      const progress = Math.abs(scrollLeft) / maxScroll;
      setScrollProgress(progress || 0);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      // In RTL, scrollRight means moving left (more negative)
      // wait, in RTL, to see next item you scroll left (towards negative)
      const isRtl = document.documentElement.dir === 'rtl';
      let offset = direction === 'left' ? -scrollAmount : scrollAmount;
      if (isRtl) {
        offset = direction === 'right' ? -scrollAmount : scrollAmount;
      }
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      handleScroll(); // init
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, []);

  if (!courses || courses.length === 0) return null;

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      {/* Slider Container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6 pb-8 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {courses.map((course, idx) => (
          <div
            key={idx}
            className="snap-center shrink-0 w-[85vw] sm:w-[350px] md:w-[400px]"
          >
            <CourseCard
              course={course}
              isFree={isFree}
              onNavigate={onNavigate}
              isLoggedIn={isLoggedIn}
              setShowAuthModal={setShowAuthModal}
              hasSubscription={hasSubscription}
              t={t}
            />
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      {courses.length > 1 && (
        <div className="flex justify-center gap-2 mt-2">
          {courses.map((_, idx) => {
            // Rough approximation of active dot
            const isActive = Math.round(scrollProgress * (courses.length - 1)) === idx;
            return (
              <button
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? `w-8 ${isFree ? 'bg-emerald-500' : 'bg-burgundy-500'}`
                    : 'w-2 bg-gray-300 dark:bg-slate-700 hover:bg-gray-400 dark:hover:bg-slate-600'
                }`}
                onClick={() => {
                  if (scrollRef.current) {
                    const { scrollWidth, clientWidth } = scrollRef.current;
                    const maxScroll = scrollWidth - clientWidth;
                    const targetScroll = (idx / (courses.length - 1)) * maxScroll;
                    const isRtl = document.documentElement.dir === 'rtl';
                    scrollRef.current.scrollTo({
                      left: isRtl ? -targetScroll : targetScroll,
                      behavior: 'smooth',
                    });
                  }
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
