import { Phone, Lock, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import { Page } from '../App';
import React, { useState } from 'react';
import medicalAuthUrl from '../assets/images/medical_auth_vertical_text_1781667535732.jpg';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import fpPromise from '@fingerprintjs/fingerprintjs';

const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'متصفح غير معروف';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Internet';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  else if (ua.includes('Trident')) browser = 'Internet Explorer';
  else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';

  let os = 'نظام غير معروف';
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'MacOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return { browser, os };
};

export default function Login({
  onNavigate,
  onAuth,
}: {
  onNavigate: (p: Page) => void;
  onAuth: (semester?: string) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLanguage();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fakeEmail = `${phone.trim()}@student-app.com`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: password,
      });

      if (error) throw error;

      let userSemester = undefined;
      // Try fetching student profile
      if (data?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('students')
          .select('academic_year, device_id')
          .eq('id', data.user.id)
          .single();

        // If profile doesn't exist in students table, log them out and throw error
        if (profileError || !profile) {
          await supabase.auth.signOut();
          toast.error('هذا الحساب غير موجود. يرجى التواصل مع الإدارة.');
          setLoading(false);
          return;
        }

        const studentDeviceId = profile.device_id || data.user.user_metadata?.device_id;

        // Use fingerprinting instead of local storage
        const fp = await fpPromise.load();
        const fpResult = await fp.get();
        let localDeviceId = fpResult.visitorId;

        if (studentDeviceId && studentDeviceId !== localDeviceId) {
          const deviceInfo = getDeviceInfo();
          await supabase.from('device_requests').insert([
            {
              student_id: data.user.id,
              new_device_id: localDeviceId,
              device_info: `${deviceInfo.os} - ${deviceInfo.browser}`,
              status: 'pending',
            },
          ]);
          await supabase.auth.signOut();
          toast.error(
            'تم إرسال طلب للمسؤول للموافقة على دخولك من هذا الجهاز. يرجى الانتظار والمحاولة لاحقاً.'
          );
          setLoading(false);
          return;
        }

        if (!studentDeviceId) {
          await supabase
            .from('students')
            .update({ device_id: localDeviceId })
            .eq('id', data.user.id);
          await supabase.auth.updateUser({
            data: { device_id: localDeviceId },
          });
        }

        const deviceInfo = getDeviceInfo();
        await supabase.from('login_logs').insert([
          {
            student_id: data.user.id,
            os: deviceInfo.os,
            browser: deviceInfo.browser,
            device_id: localDeviceId,
            status: 'ناجح',
          },
        ]);

        if (profile?.academic_year) {
          userSemester = profile.academic_year;
        }
      }

      toast.success('تم تسجيل الدخول بنجاح!');
      onAuth(userSemester);
    } catch (err: any) {
      toast.error(err.message || 'خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout imageTitle={t('login')} imageUrl={medicalAuthUrl}>
      <div className="mb-10 text-center md:text-right">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 flex items-center justify-center md:justify-start gap-3">
          <span>{t('loginHeader')}</span>
          <span className="text-2xl">👋</span>
        </h2>
        <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed max-w-sm">
          {t('loginDescLabel')}
        </p>
      </div>

      <form className="space-y-8 max-w-md" onSubmit={handleSubmit}>
        <div className="relative group">
          <Phone className="absolute right-0 top-3 w-5 h-5 text-burgundy-500 group-focus-within:text-burgundy-400 transition-colors" />
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('loginPhoneLabel')}
            className="w-full bg-transparent border-b border-gray-300 dark:border-slate-700 py-3 pr-8 pl-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-burgundy-500 dark:focus:border-burgundy-400 outline-none transition-colors"
          />
        </div>

        <div className="relative group">
          <Lock className="absolute right-0 top-3 w-5 h-5 text-burgundy-500 group-focus-within:text-burgundy-400 transition-colors" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('loginPasswordLabel')}
            className="w-full bg-transparent border-b border-gray-300 dark:border-slate-700 py-3 pr-8 pl-8 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-burgundy-500 dark:focus:border-burgundy-400 outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-0 top-3 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex justify-start mt-4">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toast(
                'لإعادة تعيين كلمة المرور، يرجى التواصل مع الدعم الفني على الواتساب: 01017967936',
                {
                  icon: '💬',
                  duration: 5000,
                }
              );
            }}
            className="text-sm text-burgundy-500 hover:text-burgundy-600 dark:text-burgundy-400 dark:hover:text-burgundy-300 font-medium transition-colors"
          >
            نسيت كلمة المرور؟
          </button>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full md:w-auto md:min-w-[200px] mx-auto block bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-yellow-400/20 mt-8 transition-all hover:-translate-y-0.5 disabled:opacity-50"
        >
          {loading ? '...' : t('login')}
        </button>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-8">
          {t('noAccountLabel')}{' '}
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="text-burgundy-400 hover:text-burgundy-300 hover:underline font-bold transition-colors"
          >
            {t('registerNowLink')}
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
