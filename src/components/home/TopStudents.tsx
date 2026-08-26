import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';

interface TopStudent {
  id: string;
  name: string;
  address: string;
  emoji: string;
  points: number;
}

export default function TopStudents() {
  const { t } = useLanguage();
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopStudents = async () => {
      try {
        const { data, error } = await supabase
          .from('top_students')
          .select('*')
          .order('points', { ascending: false })
          .limit(3);

        if (error) {
          
        } else {
          setTopStudents(data || []);
        }
      } catch (err) {
        
      } finally {
        setLoading(false);
      }
    };

    fetchTopStudents();
  }, []);

  const firstPlace = topStudents[0];
  const secondPlace = topStudents[1];
  const thirdPlace = topStudents[2];

  return (
    <section className="px-4 py-24 bg-gradient-to-b from-burgundy-50/50 to-white dark:from-[#0b121c] dark:to-[#0f172a] flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-burgundy-100/20 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-yellow-200/20 rounded-full blur-[100px] -z-10"></div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="bg-white dark:bg-slate-800 px-10 py-4 rounded-full mb-12 shadow-sm border border-slate-100 dark:border-slate-700 relative"
      >
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-300 dark:bg-slate-600"></div>
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 rotate-45 w-0.5 h-8 origin-bottom bg-slate-300 dark:bg-slate-600"></div>
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 -rotate-45 w-0.5 h-8 origin-bottom bg-slate-300 dark:bg-slate-600"></div>
        <h3 className="text-slate-800 dark:text-white font-black text-xl md:text-2xl tracking-tight">
          {t('topStudentsBadge')}
        </h3>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-burgundy-500 to-burgundy-500 mb-4 tracking-tight pb-2">
          {t('topStudentsHeader1')}
        </h2>
        <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-burgundy-400 to-burgundy-600 mb-6 drop-shadow-sm pb-2">
          {t('topStudentsHeader2')}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl max-w-lg mx-auto font-medium leading-relaxed px-4">
          {t('topStudentsDesc')}
        </p>
      </motion.div>

      {!loading && topStudents.length > 0 && (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
          }}
          className="flex items-end justify-center gap-2 sm:gap-6 md:gap-10 max-w-4xl w-full mx-auto h-72 md:h-96 mt-8 px-2 md:px-6 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent dark:from-slate-900/50 rounded-3xl blur-xl -z-10"></div>
          {/* Second Place */}
          {secondPlace && (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
              }}
              className="w-1/3 flex flex-col items-center pb-2 md:pb-4 group relative"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 flex items-center justify-center text-4xl sm:text-5xl md:text-6xl rounded-full border-[4px] md:border-[6px] border-slate-200 dark:border-slate-600 mb-3 md:mb-4 overflow-hidden bg-white dark:bg-slate-800 shadow-xl relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2">
                {secondPlace.emoji || '🥈'}
              </div>
              <span className="text-xs sm:text-sm md:text-lg font-black text-slate-700 dark:text-slate-300 mb-3 md:mb-4 text-center leading-tight break-words max-w-[140px] h-10 sm:h-auto flex items-center justify-center px-1">
                {secondPlace.name}
              </span>
              <div className="w-full max-w-[100px] md:max-w-[160px] bg-gradient-to-b from-slate-300 to-slate-200 dark:from-slate-700 dark:to-slate-900 h-28 sm:h-36 md:h-44 rounded-t-[2rem] flex justify-center pt-4 md:pt-6 shadow-2xl relative border-t-8 border-slate-400 dark:border-slate-500 transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(148,163,184,0.4)] overflow-hidden">
                <div className="absolute inset-0 bg-white/20 dark:bg-black/10 rounded-t-3xl"></div>
                <span className="text-slate-500 dark:text-slate-400 font-black text-2xl md:text-4xl drop-shadow-md z-10">
                  2
                </span>
              </div>
            </motion.div>
          )}

          {/* First Place */}
          {firstPlace && (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 50, scale: 0.9 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: 'spring', stiffness: 100 },
                },
              }}
              className="w-1/3 flex flex-col items-center group z-20"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 flex-shrink-0 flex items-center justify-center text-5xl sm:text-6xl md:text-7xl rounded-full border-[6px] md:border-[8px] border-yellow-400 dark:border-yellow-500 mb-3 md:mb-4 overflow-hidden bg-white dark:bg-slate-800 shadow-[0_0_30px_rgba(250,204,21,0.4)] relative z-10 -top-4 sm:-top-6 md:-top-10 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-4">
                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200/50 to-transparent"></div>
                <span className="relative z-10">{firstPlace.emoji || '🏆'}</span>
              </div>
              <span className="text-sm sm:text-base md:text-xl font-black text-slate-900 dark:text-white mb-3 md:mb-4 relative -top-2 sm:-top-4 md:-top-6 text-center leading-tight break-words max-w-[160px] h-10 sm:h-auto flex items-center justify-center px-1">
                {firstPlace.name}
              </span>
              <div className="w-full max-w-[120px] md:max-w-[180px] bg-gradient-to-b from-yellow-400 to-yellow-200 dark:from-yellow-600 dark:to-yellow-900 h-40 sm:h-48 md:h-60 rounded-t-[2rem] flex justify-center pt-4 md:pt-6 shadow-2xl relative border-t-8 border-yellow-300 dark:border-yellow-500 transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(250,204,21,0.6)] overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-yellow-100/80 to-transparent rounded-t-[2rem]"></div>
                <span className="text-yellow-800 dark:text-yellow-200 font-black text-4xl md:text-6xl drop-shadow-md z-10">
                  1
                </span>
              </div>
            </motion.div>
          )}

          {/* Third Place */}
          {thirdPlace && (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
              }}
              className="w-1/3 flex flex-col items-center pb-6 md:pb-8 group"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex-shrink-0 flex items-center justify-center text-3xl sm:text-4xl md:text-5xl rounded-full border-[4px] md:border-[6px] border-orange-300 dark:border-orange-700 mb-3 md:mb-4 overflow-hidden bg-white dark:bg-slate-800 shadow-xl relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2">
                {thirdPlace.emoji || '🥉'}
              </div>
              <span className="text-xs sm:text-sm md:text-lg font-black text-slate-700 dark:text-slate-300 mb-3 md:mb-4 text-center leading-tight break-words max-w-[140px] h-10 sm:h-auto flex items-center justify-center px-1">
                {thirdPlace.name}
              </span>
              <div className="w-full max-w-[100px] md:max-w-[160px] bg-gradient-to-b from-orange-300 to-orange-200 dark:from-orange-800 dark:to-orange-950 h-20 sm:h-24 md:h-32 rounded-t-[2rem] flex justify-center pt-3 md:pt-5 shadow-2xl relative border-t-8 border-orange-400 dark:border-orange-600 transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(251,146,60,0.4)] overflow-hidden">
                <div className="absolute inset-0 bg-white/20 dark:bg-black/10 rounded-t-3xl"></div>
                <span className="text-orange-700 dark:text-orange-300 font-black text-2xl md:text-4xl drop-shadow-md z-10">
                  3
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </section>
  );
}
