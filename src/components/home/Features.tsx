import {
  Brain,
  Target,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Shield,
  Zap,
  Sparkles,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';

interface AppFeature {
  id: string;
  title: string;
  description: string;
  icon_name?: string;
}

const getIcon = (name?: string) => {
  switch (name?.toLowerCase()) {
    case 'brain':
      return <Brain className="w-8 h-8" />;
    case 'target':
      return <Target className="w-8 h-8" />;
    case 'clock':
      return <Clock className="w-8 h-8" />;
    case 'star':
      return <Star className="w-8 h-8" />;
    case 'shield':
      return <Shield className="w-8 h-8" />;
    case 'zap':
      return <Zap className="w-8 h-8" />;
    case 'sparkles':
      return <Sparkles className="w-8 h-8" />;
    default:
      return <CheckCircle className="w-8 h-8" />;
  }
};

export default function Features() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [features, setFeatures] = useState<AppFeature[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    async function fetchFeatures() {
      try {
        const { data, error } = await supabase
          .from('features')
          .select('*')
          .order('created_at', { ascending: true });
        if (!error && data && data.length > 0) {
          setFeatures(data);
        }
      } catch (err) {
        
      }
    }
    fetchFeatures();
  }, []);

  useEffect(() => {
    if (features.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [features.length]);

  if (features.length === 0) return null;

  return (
    <section className="px-4 py-20 bg-gradient-to-b from-white to-burgundy-50/50 dark:from-[#0b121c] dark:to-[#0f172a] flex flex-col items-center text-center">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="bg-white dark:bg-slate-800 px-10 py-3 rounded-full mb-16 shadow-sm border border-burgundy-100 dark:border-slate-700 flex items-center gap-2 relative"
      >
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gray-300 dark:bg-slate-600"></div>
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 rotate-45 w-0.5 h-8 origin-bottom bg-gray-300 dark:bg-slate-600"></div>
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 -rotate-45 w-0.5 h-8 origin-bottom bg-gray-300 dark:bg-slate-600"></div>
        <h3 className="text-slate-800 dark:text-white font-bold text-lg md:text-xl">
          {t('featuresTitle1')} {t('featuresTitle2')}
        </h3>
      </motion.div>

      <div className="relative w-full max-w-[420px] px-10 md:px-14 flex items-center justify-center">
        <button
          onClick={() => setActiveIndex((prev) => (prev - 1 + features.length) % features.length)}
          className="absolute right-0 md:right-2 z-10 p-2 bg-white dark:bg-slate-800 shadow-md rounded-full text-slate-500 hover:text-burgundy-500 transition-colors"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        <div className="w-full bg-white dark:bg-slate-800 rounded-[2rem] p-6 md:p-8 shadow-xl relative border-t-4 border-burgundy-400 transition-all duration-300 min-h-[220px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center w-full"
            >
              <motion.div
                key={'icon-' + activeIndex}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-700 text-burgundy-500 p-5 rounded-2xl shadow-lg border border-burgundy-50 dark:border-slate-600 transition-all"
              >
                {getIcon(features[activeIndex].icon_name)}
              </motion.div>

              <h4 className="text-xl font-bold text-slate-800 dark:text-white mt-4 mb-4">
                {features[activeIndex].title}
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed font-medium">
                {features[activeIndex].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={() => setActiveIndex((prev) => (prev + 1) % features.length)}
          className="absolute left-0 md:left-2 z-10 p-2 bg-white dark:bg-slate-800 shadow-md rounded-full text-slate-500 hover:text-burgundy-500 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-12">
        {features.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`w-6 h-1.5 rounded-full transition-colors ${
              activeIndex === idx
                ? 'bg-slate-800 dark:bg-burgundy-500'
                : 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
