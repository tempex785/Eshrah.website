import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AlertBannerProps {
  userSemester?: string;
  isLoggedIn: boolean;
}

export default function AlertBanner({ userSemester, isLoggedIn }: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        let query = supabase
          .from('alerts')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!isLoggedIn) {
          query = query.in('academic_year', ['عام', 'الكل', 'لغير المسجلين']);
        } else {
          if (userSemester) {
            query = query.in('academic_year', [userSemester, 'عام', 'الكل']);
          } else {
            query = query.in('academic_year', ['عام', 'الكل']);
          }
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          setAlerts(data);
          setIsVisible(true);
        } else {
          setAlerts([]);
        }
      } catch (err) {
        
      }
    }
    fetchAlerts();
  }, [userSemester, isLoggedIn]);

  if (!isVisible || alerts.length === 0) return null;

  return (
    <div
      className="w-full bg-[#151c28] border-b border-red-500/30 shadow-lg relative z-20 flex items-center h-14 overflow-hidden"
      dir="rtl"
    >
      {/* Close Button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute left-4 z-30 bg-[#1e293b] hover:bg-slate-700 p-1.5 rounded-md text-gray-400 hover:text-white transition-colors"
        title="إغلاق"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Marquee Content */}
      <div className="flex w-full overflow-hidden whitespace-nowrap pl-16">
        <div className="flex animate-marquee min-w-full shrink-0 items-center justify-around gap-12 px-8">
          {alerts.map((alert, idx) => (
            <div key={`alert-1-${idx}`} className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span className="text-white font-bold text-base md:text-lg">{alert.title}:</span>
              <span className="text-gray-300 text-sm md:text-base">{alert.message}</span>
            </div>
          ))}
        </div>
        <div
          className="flex animate-marquee min-w-full shrink-0 items-center justify-around gap-12 px-8"
          aria-hidden="true"
        >
          {alerts.map((alert, idx) => (
            <div key={`alert-2-${idx}`} className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span className="text-white font-bold text-base md:text-lg">{alert.title}:</span>
              <span className="text-gray-300 text-sm md:text-base">{alert.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
