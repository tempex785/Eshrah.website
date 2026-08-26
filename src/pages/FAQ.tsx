import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Phone, HelpCircle, Wallet, Settings, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

interface CategoryGroup {
  category: string;
  icon: React.ReactNode;
  questions: { q: string; a: string }[];
}

const getCategoryIcon = (category: string) => {
  if (category.includes('محفظة') || category.includes('حساب'))
    return <Wallet className="w-5 h-5" />;
  if (category.includes('دروس') || category.includes('دورات'))
    return <BookOpen className="w-5 h-5" />;
  if (category.includes('تقني') || category.includes('مشاكل'))
    return <Settings className="w-5 h-5" />;
  return <HelpCircle className="w-5 h-5" />;
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          // Group by category
          const grouped = data.reduce((acc: any, curr: FAQItem) => {
            const cat = curr.category || 'عام';
            if (!acc[cat]) {
              acc[cat] = {
                category: cat,
                icon: getCategoryIcon(cat),
                questions: [],
              };
            }
            acc[cat].questions.push({ q: curr.question, a: curr.answer });
            return acc;
          }, {});

          setFaqs(Object.values(grouped));
        } else {
          setFaqs([
            {
              category: 'حسابي',
              icon: getCategoryIcon('حسابي'),
              questions: [
                { q: 'كيف يمكنني إنشاء حساب جديد؟', a: 'يمكنك إنشاء حساب جديد عن طريق النقر على زر "تسجيل جديد" في القائمة العلوية وتعبئة البيانات المطلوبة.' },
                { q: 'نسيت كلمة المرور، ماذا أفعل؟', a: 'يمكنك النقر على "نسيت كلمة المرور" في صفحة تسجيل الدخول واتباع الخطوات لاستعادتها.' }
              ]
            },
            {
              category: 'الدروس والدورات',
              icon: getCategoryIcon('الدروس والدورات'),
              questions: [
                { q: 'كيف يمكنني الاشتراك في دورة؟', a: 'بعد تسجيل الدخول، قم بزيارة صفحة الدورة التي ترغب بها وانقر على زر "اشترك الآن" واتبع تعليمات الدفع.' },
                { q: 'هل يمكنني مشاهدة الدروس مسجلة؟', a: 'نعم، جميع الدروس يتم تسجيلها وتكون متاحة لك لمشاهدتها في أي وقت من خلال قسم "دوراتي".' }
              ]
            }
          ]);
        }
      } catch (err) {
        
      } finally {
        setLoading(false);
      }
    }

    fetchFaqs();
  }, []);

  const toggleQuestion = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900 min-h-screen py-12 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <HelpCircle className="w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
            مركز المساعدة والأسئلة الشائعة
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            ابحث عن إجابات لاستفساراتك حول كيفية استخدام المنصة، شحن المحفظة، وحل المشكلات الشائعة.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center text-slate-500 py-12">لا توجد أسئلة شائعة متاحة حالياً.</div>
        ) : (
          <div className="space-y-8">
            {faqs.map((category, catIndex) => (
              <motion.div
                key={catIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: catIndex * 0.1 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-[2rem] p-6 md:p-8 shadow-xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-500 relative overflow-hidden group"
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                  <div className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-xl text-blue-600 dark:text-blue-400">
                    {category.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {category.category}
                  </h2>
                </div>

                <div className="space-y-4">
                  {category.questions.map((faq, qIndex) => {
                    const id = `${catIndex}-${qIndex}`;
                    const isOpen = openIndex === id;

                    return (
                      <div
                        key={qIndex}
                        className={`border rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md ${
                          isOpen
                            ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10'
                            : 'border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-slate-600'
                        }`}
                      >
                        <button
                          onClick={() => toggleQuestion(id)}
                          className="w-full flex items-center justify-between p-4 md:p-5 text-right focus:outline-none"
                        >
                          <span
                            className={`font-bold pr-2 ${isOpen ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}
                          >
                            {faq.q}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-slate-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'transform rotate-180 text-blue-600' : ''}`}
                          />
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 md:p-5 pt-0 text-slate-600 dark:text-slate-400 leading-relaxed pr-6 md:pr-7 border-t border-slate-100 dark:border-slate-700/50 mt-2 mx-4 pb-4 whitespace-pre-wrap">
                                {faq.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-600 rounded-3xl p-8 text-center text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

          <div className="relative z-10 space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold">لم تجد إجابة لسؤالك؟</h3>
            <p className="text-blue-100 max-w-lg mx-auto">
              فريق الدعم الفني متواجد دائماً لمساعدتك في حل أي مشكلة قد تواجهك أثناء استخدام المنصة.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  const chatBtn = document.querySelector(
                    'button[title="تواصل مع الدعم الفني"]'
                  ) as HTMLButtonElement;
                  if (chatBtn) chatBtn.click();
                }}
                className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform"
              >
                <Phone className="w-5 h-5" />
                <span>تواصل مع الدعم المباشر</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
