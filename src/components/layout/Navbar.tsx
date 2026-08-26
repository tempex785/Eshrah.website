import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import eshrahLogo from '../../assets/images/1000120013-removebg-preview.png';
import { Menu, LogIn, UserPlus, Sun, Moon, X, Home, LogOut, User, BookOpen, Atom, Dna, ShieldCheck, Bell, Search, Wallet } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Page } from '../../App';
import { useLanguage } from '../../context/LanguageContext';
import { useWallet } from '../../hooks/useWallet';

type Props = {
  currentPage: Page;
  onNavigate: (page: Page, data?: any) => void;
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
};

export default function Navbar({ currentPage, onNavigate, isDark, setIsDark, isLoggedIn, onLogout }: Props) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, t } = useLanguage();
  const { balance } = useWallet();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (isLoggedIn && import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      const fetchNotifs = async () => {
         const { data: { session } } = await supabase.auth.getSession();
         if (!session?.user?.id) return;
         const readNotifsStr = localStorage.getItem('app_read_notifications');
         const readNotifs = readNotifsStr ? JSON.parse(readNotifsStr) : [];

         const { data: msgs } = await supabase.from('support_messages').select('*').eq('student_id', session.user.id).eq('sender', 'support').order('created_at', { ascending: false }).limit(3);
         let notifs: any[] = [];
         if (msgs && msgs.length > 0) {
           notifs = msgs.map((m: any) => ({ id: m.id, title: 'رد من الدعم الفني', content: (m.content || "").substring(0, 40) + '...', date: new Date(m.created_at).toLocaleDateString('ar-EG'), read: readNotifs.includes(m.id), type: 'support' }));
         }
         
         const { data: subs } = await supabase.from('student_subscriptions').select('course_id').eq('student_id', session.user.id);
         if (subs && subs.length > 0) {
           const courseIds = subs.map((s: any) => s.course_id);
           
           // Fetch recent exams for these courses
           const { data: recentExams } = await supabase.from('exams').select('id, title, created_at, course_id, courses(title)').in('course_id', courseIds).order('created_at', { ascending: false }).limit(3);
           
           if (recentExams) {
             recentExams.forEach((e: any) => {
               notifs.push({ id: e.id, title: 'امتحان جديد متاح', content: `تمت إضافة امتحان جديد: ${e.title} في ${e.courses?.title || 'الكورس'}`, date: new Date(e.created_at).toLocaleDateString('ar-EG'), read: readNotifs.includes(e.id), type: 'exam' });
             });
           }
         }
         setNotifications(notifs);
      };
      fetchNotifs();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`sticky top-0 w-full z-50 px-3 sm:px-4 py-2 sm:py-3 min-h-[60px] sm:min-h-[70px] md:min-h-[85px] transition-all duration-300 shadow-sm ${isDark ? 'bg-[#0b121c] border-b border-slate-800 text-white' : 'bg-white border-b border-gray-100 text-slate-900'}`}>
        
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between w-full h-full">
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="flex flex-row items-center justify-center shrink-0 transition-transform duration-300 gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
              <div 
                className="w-32 h-16 sm:w-40 sm:h-20 bg-burgundy-600 dark:bg-burgundy-400" 
                style={{ WebkitMaskImage: `url(${eshrahLogo})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: `url(${eshrahLogo})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }}
                title="إشرح طب"
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
            {!isLoggedIn ? (
              <>
                {currentPage !== 'login' && (
                  <button 
                    onClick={() => onNavigate('login')}
                    className={`flex items-center gap-2 text-sm font-bold transition-all px-4 py-2 rounded-xl ${isDark ? 'text-white border border-slate-700 hover:bg-slate-800' : 'text-burgundy-500 border border-burgundy-500 hover:bg-burgundy-500/5'}`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{t('login')}</span>
                  </button>
                )}
                {currentPage !== 'register' && (
                   <button 
                      onClick={() => onNavigate('register')}
                     className={`flex bg-burgundy-500 hover:bg-burgundy-600 text-white px-4 py-2 rounded-xl items-center gap-2 text-sm font-bold transition-all shadow-md hover:shadow-lg`}
                   >
                     <UserPlus className="w-4 h-4" />
                     <span>{t('register')}</span>
                   </button>
                )}
              </>
            ) : (
              <>
                <button 
                  onClick={() => onNavigate('profile')}
                  className={`flex bg-gradient-to-r from-burgundy-100 to-burgundy-100 hover:from-burgundy-200 hover:to-burgundy-200 text-burgundy-500 dark:from-burgundy-900/40 dark:to-burgundy-900/40 dark:text-burgundy-300 dark:hover:from-burgundy-900/60 dark:hover:to-burgundy-900/60 px-4 py-2 rounded-xl items-center gap-2 text-sm font-bold transition-all shadow-sm`}
                >
                  <User className="w-4 h-4" />
                  <span>{t('profile')}</span>
                </button>
                
                <button 
                  onClick={() => onLogout && onLogout()}
                  className={`flex items-center gap-2 text-sm font-bold transition-all px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
            {isLoggedIn && (
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-1.5 sm:p-2 rounded-xl transition-colors relative ${isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full border-2 border-white dark:border-[#0b121c]"></span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className={`absolute top-full -left-4 sm:left-0 mt-2 w-72 sm:w-80 rounded-2xl shadow-xl border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 ${isDark ? 'bg-[#151b23] border-slate-800' : 'bg-white border-slate-100'}`}>
                    <div className={`p-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'} flex items-center justify-between`}>
                      <h3 className="font-bold">الإشعارات</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs font-bold px-2 py-1 bg-burgundy-50 text-burgundy-600 dark:bg-burgundy-900/30 dark:text-burgundy-400 rounded-full">
                          {unreadCount} جديد
                        </span>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(n => (
                          <div key={n.id} className={`p-4 border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${!n.read ? (isDark ? 'bg-slate-800/30' : 'bg-slate-50') : ''}`} onClick={() => {
                            setNotifications(notifications.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
                            const readNotifsStr = localStorage.getItem('app_read_notifications');
                            const readNotifs = readNotifsStr ? JSON.parse(readNotifsStr) : [];
                            if (!readNotifs.includes(n.id)) {
                              localStorage.setItem('app_read_notifications', JSON.stringify([...readNotifs, n.id]));
                            }
                            if (n.type === 'course_unlocked' && n.link) {
                              onNavigate('course' as any, { id: n.link.split('/').pop() } as any);
                            }
                          }}>
                             <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{n.title}</h4>
                             <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{n.content}</p>
                             <span className="text-xs text-slate-400 dark:text-slate-500 mt-2 block">{n.date}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-500">
                          لا توجد إشعارات جديدة
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {isLoggedIn && (
              <button 
                onClick={() => onNavigate('wallet')}
                className="flex items-center shrink-0 justify-center gap-1.5 px-3 h-8 sm:h-9 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-sm cursor-pointer"
                title="المحفظة"
              >
                <Wallet className="w-4 h-4 sm:w-4 sm:h-4 shrink-0" />
                <span className="font-black text-xs sm:text-sm leading-none mt-1" dir="ltr">{balance}</span>
              </button>
            )}
            <div className="flex items-center shrink-0 bg-slate-100/80 dark:bg-slate-800/80 rounded-full p-0.5 sm:p-1 cursor-pointer border border-slate-200/50 dark:border-slate-700/50 shadow-inner" onClick={() => setIsDark(!isDark)}>
              <div className={`p-1 sm:p-1.5 rounded-full transition-all duration-300 ${!isDark ? 'bg-white shadow-sm text-yellow-500 scale-110' : 'text-slate-400 scale-90'}`}><Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></div>
              <div className={`p-1 sm:p-1.5 rounded-full transition-all duration-300 ${isDark ? 'bg-slate-600 shadow-sm text-burgundy-300 scale-110' : 'text-slate-400 scale-90'}`}><Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex md:hidden items-center justify-between w-full h-full relative">
          
          {/* Right side (Start in RTL) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center shrink-0 bg-[#f9edb6] dark:bg-slate-800/80 rounded-full p-1 cursor-pointer border border-yellow-200/50 dark:border-slate-700/50 shadow-inner" onClick={() => setIsDark(!isDark)}>
              <div className={`p-1 rounded-full transition-all duration-300 ${!isDark ? 'bg-white shadow-sm text-yellow-500 scale-110' : 'text-slate-400 scale-90'}`}><Sun className="w-4 h-4" /></div>
              <div className={`p-1 rounded-full transition-all duration-300 ${isDark ? 'bg-slate-600 shadow-sm text-yellow-300 scale-110' : 'text-yellow-600/50 scale-90'}`}><Moon className="w-4 h-4" /></div>
            </div>
          </div>

          {/* Center */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div 
              className="w-32 h-16 bg-burgundy-600 dark:bg-burgundy-400" 
              style={{ WebkitMaskImage: `url(${eshrahLogo})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: `url(${eshrahLogo})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }}
              title="إشرح طب"
            />
          </div>

          {/* Left side (End in RTL) */}
          <div className="flex items-center">
            <button 
              className={`p-1.5 rounded-xl transition-colors ${isDark ? 'text-white hover:bg-slate-800' : 'text-burgundy-500 hover:bg-burgundy-50'}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-7 h-7 text-burgundy-500" />
              ) : (
                <Atom className="w-7 h-7 text-[#fbb33d]" />
              )}
            </button>
          </div>
          
        </div>
      </motion.nav>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-[60px] sm:top-[70px] md:hidden bg-slate-900/60 backdrop-blur-sm z-[100]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className={`fixed top-[60px] sm:top-[70px] left-0 w-full shadow-2xl flex flex-col ${isDark ? 'bg-[#0b121c] border-b border-slate-800' : 'bg-white border-b border-slate-100'} rounded-b-3xl overflow-hidden z-[110] md:hidden`}
            >
              <div className="p-4 flex flex-col gap-2 border-b border-slate-100 dark:border-slate-800">
               {!isLoggedIn ? (
                 <>
                   {currentPage !== 'login' && (
                     <button 
                       onClick={() => { onNavigate('login'); setIsMobileMenuOpen(false); }}
                         className={`flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl font-bold transition-all text-white bg-burgundy-600 hover:bg-burgundy-700 shadow-md`}
                       >
                         <span>{t('login')}</span>
                       </button>
                     )}
                     {currentPage !== 'register' && (
                        <button 
                          onClick={() => { onNavigate('register'); setIsMobileMenuOpen(false); }}
                          className={`flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl font-bold transition-all text-white bg-burgundy-600 hover:bg-burgundy-700 shadow-md`}
                        >
                          <span>{t('register')}</span>
                        </button>
                     )}
                   </>
                 ) : (
                    <button 
                      onClick={() => { onLogout && onLogout(); setIsMobileMenuOpen(false); }}
                      className={`flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl font-bold transition-all text-white bg-red-600 hover:bg-red-700 shadow-md`}
                    >
                      <LogOut className="w-5 h-5" />
                      <span>{t('logout')}</span>
                    </button>
                 )}
            </div>

            <div className="p-4 flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
                 <button 
                    onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-slate-100'} ${currentPage === 'home' ? (isDark ? 'bg-slate-800/50 text-burgundy-400' : 'bg-burgundy-50 text-burgundy-600') : ''}`}
                 >
                   <Home className="w-5 h-5" />
                   <span className="font-bold">{t('home')}</span>
                 </button>
                 <button 
                    onClick={() => { onNavigate('faq'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-slate-100'} ${currentPage === 'faq' ? (isDark ? 'bg-slate-800/50 text-burgundy-400' : 'bg-burgundy-50 text-burgundy-600') : ''}`}
                 >
                   <ShieldCheck className="w-5 h-5 text-burgundy-500" />
                   <span className="font-bold">المساعدة (FAQ)</span>
                 </button>
                 {isLoggedIn && (
                   <>
                    <button 
                       onClick={() => { onNavigate('profile'); setIsMobileMenuOpen(false); }}
                       className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-slate-100'} ${currentPage === 'profile' ? (isDark ? 'bg-slate-800/50 text-burgundy-400' : 'bg-burgundy-50 text-burgundy-600') : ''}`}
                    >
                      <User className="w-5 h-5 text-burgundy-500" />
                      <span className="font-bold">{t('profile')}</span>
                    </button>
                    <button 
                       onClick={() => { onNavigate('my-courses'); setIsMobileMenuOpen(false); }}
                       className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-slate-100'} ${currentPage === 'my-courses' ? (isDark ? 'bg-slate-800/50 text-burgundy-400' : 'bg-burgundy-50 text-burgundy-600') : ''}`}
                    >
                      <BookOpen className="w-5 h-5 text-burgundy-500" />
                      <span className="font-bold">{t('myCourses')}</span>
                    </button>
                   </>
                 )}
            </div>
            </motion.div>
          </>
        )}
        </AnimatePresence>
    </>
  );
}
