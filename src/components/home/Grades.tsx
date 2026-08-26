import { useLanguage } from '../../context/LanguageContext';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';

export default function Grades() {
  const { t } = useLanguage();
  const [semesters, setSemesters] = useState<any[]>([]);

  useEffect(() => {
    async function fetchSemesters() {
      if (
        import.meta.env.VITE_SUPABASE_URL &&
        !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
      ) {
        try {
          const { data, error } = await supabase
            .from('study_levels')
            .select('*')
            .order('created_at', { ascending: true });
          if (!error && data && data.length > 0) {
            const mapped = data.map((d) => ({
              title: d.name,
              image:
                d.image_url ||
                'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop',
              description: d.description,
              price: d.price,
            }));
            setSemesters(mapped);
          }
        } catch (err) {
          
        }
      }
    }
    fetchSemesters();
  }, []);

  return (
    <section className="px-4 py-16 bg-[#faf8f0] dark:bg-[#0b121c] flex flex-col items-center relative overflow-hidden">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="bg-white dark:bg-slate-800 px-10 py-4 rounded-full mb-8 shadow-sm border border-gray-100 dark:border-slate-700 relative z-10"
      >
        <h3 className="text-[#1e3a5f] dark:text-white font-black text-xl md:text-2xl tracking-tight">
          {t('studyLevels')}
        </h3>
      </motion.div>

      <div className="mb-12 flex flex-col items-center z-10 text-center max-w-2xl mx-auto">
        <div className="w-32 h-1.5 rounded-[100%] bg-[#1390d4] mb-6 opacity-80"></div>
        <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl font-medium leading-relaxed">
          هذه قائمة الصفوف الدراسية المتاحة في المنصة وسيتم إضافة صفوف دراسية جديدة قريباً.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10 w-full max-w-[900px] z-10 px-4">
        {semesters.map((sem, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="relative group cursor-pointer w-full mx-auto"
          >
            <div className="w-full aspect-[4/3] sm:aspect-[4/3.5] rounded-3xl overflow-hidden shadow-md">
              <img
                src={sem.image || null}
                alt={sem.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            <div className="mx-4 sm:mx-6 -mt-10 relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg flex flex-col items-center text-center transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
              <div className="w-8 h-1 bg-[#1390d4] rounded-full mb-4"></div>
              <h4 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-2">
                {sem.title}
              </h4>
              <p className="text-gray-400 dark:text-gray-500 text-sm md:text-base font-medium">
                {sem.description || `كل ما يخص ${sem.title}`}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
