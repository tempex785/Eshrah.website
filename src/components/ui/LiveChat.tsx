import React, { useState, useRef, useEffect } from 'react';
import { X, Send, User, Headset, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'support';
  created_at: string;
  student_id?: string;
  isLocal?: boolean;
};

export default function LiveChat({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [checkedSession, setCheckedSession] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        fetchMessages(session.user.id);
      } else {
        setUserId(null);
      }
      setCheckedSession(true);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUserId(session.user.id);
        fetchMessages(session.user.id);
      } else {
        setUserId(null);
        setMessages([]);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchMessages = async (uid: string) => {
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('student_id', uid)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data as Message[]);
    }
  };

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`support_user_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `student_id=eq.${userId}`
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.find(m => String(m.id) === String(payload.new.id))) return prev;

            const isLocalDuplicate = prev.find(m => m.isLocal && m.text === payload.new.text && m.sender === payload.new.sender);
            if (isLocalDuplicate) {
              return prev.map(m => m === isLocalDuplicate ? { ...(payload.new as Message), isLocal: false } : m);
            }

            return [...prev, payload.new as Message];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !userId) return;

    const userText = message.trim();
    setMessage('');

    const localMsg: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      created_at: new Date().toISOString(),
      isLocal: true
    };

    setMessages(prev => [...prev, localMsg]);

    const { error } = await supabase.from('support_messages').insert([{
      student_id: userId,
      sender: 'user',
      text: userText,
    }]);

    if (error) {
      
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-[350px] max-w-[calc(100vw-48px)] h-[500px] max-h-[60vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-200 dark:border-slate-800 overflow-hidden"
            dir="rtl"
          >
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between shadow-md relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Headset className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">الدعم الفني</h3>
                  <p className="text-blue-100 text-xs">نحن هنا لمساعدتك</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            {!checkedSession ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                جاري التحميل...
              </div>
            ) : !userId ? (
              // لازم تسجيل دخول عشان تتواصل مع الدعم — مفيش دعم لزوار غير مسجلين حاليًا
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center bg-slate-50 dark:bg-slate-900/50">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <LogIn className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white mb-1">سجّل دخولك أولاً</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    للتواصل مع فريق الدعم الفني، يرجى تسجيل الدخول لحسابك أولاً.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
                  {messages.length === 0 && (
                    <p className="text-center text-sm text-slate-400 mt-8">
                      ابدأ محادثتك مع فريق الدعم الفني
                    </p>
                  )}
                  {messages.map((msg, index) => (
                    <motion.div
                      initial={msg.isLocal ? { opacity: 0, y: 10 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id || index}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-sm'}`}>
                          {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Headset className="w-4 h-4" />}
                        </div>
                        <div
                          className={`p-3 rounded-2xl shadow-sm ${
                            msg.sender === 'user'
                              ? 'bg-blue-600 text-white rounded-br-sm'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                          <span className={`text-[10px] mt-1 block ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-2 relative">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="اكتب رسالتك هنا..."
                      className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white outline-none pr-12 transition-all disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!message.trim()}
                      className="absolute right-1 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full disabled:opacity-50 disabled:bg-slate-400 hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <Send className="w-4 h-4 -mr-1 rtl:rotate-180" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <motion.a
            href="https://wa.me/201017967936"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-24 right-6 z-40 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#128C7E] hover:scale-110 transition-all duration-300"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            title="تواصل معنا عبر واتساب"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
          </motion.a>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 transition-all duration-300"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        title="تواصل مع الدعم الفني"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Headset className="w-8 h-8" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white dark:border-slate-900"></span>
          </span>
        )}
      </motion.button>
    </>
  );
}
