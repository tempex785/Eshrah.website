import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function CountdownTimer() {
  const [isVisible, setIsVisible] = useState(true);
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [title, setTitle] = useState('تمت رحلة الثانوية العامة');

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('countdown_settings')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .single();

        if (data && !error) {
          if (data.target_date) setTargetDate(new Date(data.target_date));
          if (data.title) setTitle(data.title);
        }
      } catch (err) {
        
      }
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!isVisible) return null;

  return (
    <div
      className="w-full bg-[#151b23] relative z-40 flex items-start sm:items-center justify-between px-3 sm:px-4 py-2 sm:py-3 shadow-lg"
      dir="rtl"
    >
      {/* Close Button on the left in RTL */}
      <button
        onClick={() => setIsVisible(false)}
        className="bg-[#1e293b] hover:bg-slate-700 p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-white transition-colors flex-shrink-0 mt-1 sm:mt-0"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-1.5 sm:gap-4 md:gap-6 overflow-hidden pl-2 sm:pl-0">
        {/* Title */}
        <div className="flex items-center gap-1 sm:gap-2 order-2 md:order-1 flex-shrink-0">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-pulse ml-1"></div>
          <span className="text-white font-bold text-[11px] sm:text-sm md:text-base whitespace-nowrap">
            {title}
          </span>
          <span className="text-emerald-400 text-sm sm:text-lg">✅</span>
        </div>

        {/* Countdown Blocks */}
        <div
          className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-row-reverse order-1 md:order-2"
          dir="ltr"
        >
          {/* Days (يوم) - Red Box */}
          <div className="flex flex-col items-center justify-center bg-[#f43f5e] rounded-lg sm:rounded-xl px-1.5 sm:px-2 py-1 min-w-[36px] sm:min-w-[50px] md:min-w-[60px] shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <span className="text-white font-black text-sm sm:text-lg md:text-xl leading-none">
              {timeLeft.days}
            </span>
            <span className="text-white/90 text-[8px] sm:text-[10px] md:text-xs font-bold mt-0.5">
              يوم
            </span>
          </div>

          <span className="text-slate-600 font-bold text-xs sm:text-base">:</span>

          {/* Hours (س) */}
          <div className="flex items-center justify-center border border-[#334155] bg-[#1e293b]/80 rounded-lg sm:rounded-xl px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 min-w-[36px] sm:min-w-[50px] md:min-w-[60px] gap-0.5 sm:gap-1 md:gap-1.5">
            <span className="text-white font-bold text-sm sm:text-base md:text-lg leading-none">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-slate-400 text-[8px] sm:text-[10px] md:text-xs font-bold">س</span>
          </div>

          <span className="text-slate-600 font-bold text-xs sm:text-base">:</span>

          {/* Minutes (د) */}
          <div className="flex items-center justify-center border border-[#334155] bg-[#1e293b]/80 rounded-lg sm:rounded-xl px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 min-w-[36px] sm:min-w-[50px] md:min-w-[60px] gap-0.5 sm:gap-1 md:gap-1.5">
            <span className="text-white font-bold text-sm sm:text-base md:text-lg leading-none">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-slate-400 text-[8px] sm:text-[10px] md:text-xs font-bold">د</span>
          </div>

          <span className="text-slate-600 font-bold text-xs sm:text-base">:</span>

          {/* Seconds (ث) */}
          <div className="flex items-center justify-center border border-[#334155] bg-[#1e293b]/80 rounded-lg sm:rounded-xl px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 min-w-[36px] sm:min-w-[50px] md:min-w-[60px] gap-0.5 sm:gap-1 md:gap-1.5">
            <span className="text-white font-bold text-sm sm:text-base md:text-lg leading-none">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-slate-400 text-[8px] sm:text-[10px] md:text-xs font-bold">ث</span>
          </div>
        </div>
      </div>

      {/* Empty div for flex balance on desktop */}
      <div className="w-[36px] hidden sm:block opacity-0 pointer-events-none"></div>
    </div>
  );
}
