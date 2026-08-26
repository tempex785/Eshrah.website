import { User, Phone, Lock, Eye, EyeOff, MapPin, Mail } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import { Page } from '../App';
import React, { useState, useEffect } from 'react';
import medicalAuthUrl from '../assets/images/medical_auth_vertical_text_1781667535732.jpg';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { governorates, universities } from '../data/egypt';

export default function Register({
  onNavigate,
  onAuth,
}: {
  onNavigate: (p: Page) => void;
  onAuth: (semester: string) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [semester, setSemester] = useState('Semester 1');
  const [semestersList, setSemestersList] = useState<string[]>([
    'Semester 1',
    'Semester 2',
    'Semester 3',
    'Semester 4',
    'Semester 5',
  ]);
  const { t } = useLanguage();

  useEffect(() => {
    async function fetchSemesters() {
      if (
        import.meta.env.VITE_SUPABASE_URL &&
        !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
      ) {
        try {
          const { data, error } = await supabase
            .from('semesters')
            .select('*')
            .order('created_at', { ascending: true });
          if (data && data.length > 0) {
            const fetchedSemesters = data.map((d) => d.name);
            setSemestersList(fetchedSemesters);
            setSemester(fetchedSemesters[0]);
          }
        } catch (err) {
          
        }
      }
    }
    fetchSemesters();
  }, []);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    parentPhone: '',
    gender: '',
    governorate: '',
    collegeName: '',
    addressDetailed: '',
    howDidYouKnow: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('كلمة المرور غير متطابقة');
      return;
    }

    setLoading(true);

    try {
      // Check if phone already exists
      const { data: existingPhone } = await supabase
        .from('students')
        .select('id')
        .eq('phone', formData.phone.trim())
        .limit(1);

      if (existingPhone && existingPhone.length > 0) {
        toast.error('عذراً، رقم الطالب مستخدم بالفعل في حساب آخر.');
        setLoading(false);
        return;
      }

      // Check if parent phone already exists
      if (formData.parentPhone) {
        const { data: existingParentPhone } = await supabase
          .from('students')
          .select('id')
          .eq('parent_phone', formData.parentPhone.trim())
          .limit(1);

        if (existingParentPhone && existingParentPhone.length > 0) {
          toast.error('عذراً، رقم ولي الأمر مستخدم بالفعل في حساب آخر.');
          setLoading(false);
          return;
        }
      }

      // Check if email already exists
      if (formData.email) {
        const { data: existingEmail } = await supabase
          .from('students')
          .select('id')
          .eq('email', formData.email.trim())
          .limit(1);

        if (existingEmail && existingEmail.length > 0) {
          toast.error('عذراً، البريد الإلكتروني مستخدم بالفعل في حساب آخر.');
          setLoading(false);
          return;
        }
      }

      // Use phone-based fake email for auth to match Login behavior
      const fakeEmail = `${formData.phone.trim()}@student-app.com`;
      const { data, error } = await supabase.auth.signUp({
        email: fakeEmail,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            parent_phone: formData.parentPhone,
            gender: formData.gender,
            governorate: formData.governorate,
            college_name: formData.collegeName,
            academic_year: semester,
            address_detailed: formData.addressDetailed,
            how_did_you_know: formData.howDidYouKnow,
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error('عذراً، رقم الطالب (كمعرف تسجيل الدخول) مستخدم بالفعل.');
        }
        throw error;
      }

      if (data?.user) {
        // Insert custom user details is now handled securely by a Postgres Trigger on the server.
        // The trigger will automatically insert into 'students' table, preventing orphan users.

        toast.success('تم التسجيل بنجاح! الرجاء تسجيل الدخول.');
        await supabase.auth.signOut();
        onNavigate('login');
      }
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout imageTitle={t('createAccount')} imageUrl={medicalAuthUrl}>
      <div className="mb-10 text-center md:text-right">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 flex items-center justify-center md:justify-start gap-3">
          <span>{t('registerHeader')}</span>
          <span className="text-2xl">🎓</span>
        </h2>
        <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed max-w-md">
          {t('registerDescLabel')}
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative group">
            <User className="absolute right-0 top-3 w-5 h-5 text-burgundy-500 group-focus-within:text-burgundy-400 transition-colors" />
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder={t('firstName')}
              className="w-full bg-transparent border-b border-gray-300 dark:border-slate-700 py-3 pr-8 pl-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-burgundy-500 dark:focus:border-burgundy-400 outline-none transition-colors"
            />
          </div>
          <div className="relative group">
            <User className="absolute right-0 top-3 w-5 h-5 text-burgundy-500 group-focus-within:text-burgundy-400 transition-colors" />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder={t('lastName')}
              className="w-full bg-transparent border-b border-gray-300 dark:border-slate-700 py-3 pr-8 pl-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-burgundy-500 dark:focus:border-burgundy-400 outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative group md:col-span-2">
            <Mail className="absolute right-0 top-3 w-5 h-5 text-burgundy-500 group-focus-within:text-burgundy-400 transition-colors" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="البريد الإلكتروني"
              className="w-full bg-transparent border-b border-gray-300 dark:border-slate-700 py-3 pr-8 pl-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-burgundy-500 dark:focus:border-burgundy-400 outline-none transition-colors"
            />
          </div>
          <div className="relative group">
            <Phone className="absolute right-0 top-3 w-5 h-5 text-burgundy-500 group-focus-within:text-burgundy-400 transition-colors" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder={t('phoneLabel')}
              className="w-full bg-transparent border-b border-gray-300 dark:border-slate-700 py-3 pr-8 pl-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-burgundy-500 dark:focus:border-burgundy-400 outline-none transition-colors"
            />
          </div>
          <div className="relative group">
            <Phone className="absolute right-0 top-3 w-5 h-5 text-burgundy-500 group-focus-within:text-burgundy-400 transition-colors" />
            <input
              type="tel"
              name="parentPhone"
              value={formData.parentPhone}
              onChange={handleChange}
              required
              placeholder={t('parentPhone')}
              className="w-full bg-transparent border-b border-gray-300 dark:border-slate-700 py-3 pr-8 pl-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-burgundy-500 dark:focus:border-burgundy-400 outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-6">
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="w-full bg-transparent border-b border-gray-300 dark:border-slate-700 py-3 text-slate-900 dark:text-white focus:border-burgundy-500 dark:focus:border-burgundy-400 outline-none transition-colors cursor-pointer appearance-none [&>option]:bg-white dark:[&>option]:bg-slate-800"
          >
            <option value="" disabled>
              {t('gender')}
            </option>
            <option value="m">{t('male')}</option>
            <option value="f">{t('female')}</option>
          </select>

          <div className="relative group">
            <input
              type="text"
              name="governorate"
              value={formData.governorate}
              onChange={handleChange}
              required
              list="governorates-list"
              placeholder={t('governorate')}
              className="w-full bg-transparent border-b border-gray-300 dark:border-slate-700 py-3 pr-4 pl-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-burgundy-500 dark:focus:border-burgundy-400 outline-none transition-colors"
            />
            <datalist id="governorates-list">
              {governorates.map((gov) => (
                <option key={gov} value={gov} />
              ))}
            </datalist>
          </div>

          <div className="relative group">
            <MapPin className="absolute right-0 top-3 w-5 h-5 text-burgundy-500 group-focus-within:text-burgundy-400 transition-colors" />
            <input
              type="text"
              name="collegeName"
              value={formData.collegeName}
              onChange={handleChange}
              required
              list="universities-list"
              placeholder={t('collegeName')}
              className="w-full bg-transparent border-b border-gray-300 dark:border-slate-700 py-3 pr-8 pl-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-burgundy-500 dark:focus:border-burgundy-400 outline-none transition-colors"
            />
            <datalist id="universities-list">
              {universities.map((uni) => (
                <option key={uni} value={uni} />
              ))}
            </datalist>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-slate-700 dark:text-slate-300 font-medium text-sm">
              {t('academicYear')}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {semestersList.map((sem) => (
                <div
                  key={sem}
                  onClick={() => setSemester(sem)}
                  className={`
                    cursor-pointer p-3 md:p-4 rounded-xl border text-center transition-all duration-200
                    ${
                      semester === sem
                        ? 'border-burgundy-500 bg-burgundy-50 dark:bg-burgundy-500/10 text-burgundy-700 dark:text-burgundy-300 ring-2 ring-burgundy-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-burgundy-300 dark:hover:border-burgundy-600 bg-white dark:bg-[#151c28] text-slate-600 dark:text-slate-400'
                    }
                  `}
                >
                  <span className="font-medium text-sm md:text-base">{sem}</span>
                </div>
              ))}
            </div>
            {/* hidden input for form validation */}
            <input type="text" required value={semester} onChange={() => {}} className="hidden" />
          </div>

          <div className="relative group">
            <MapPin className="absolute right-0 top-3 w-5 h-5 text-burgundy-500 group-focus-within:text-burgundy-400 transition-colors" />
            <input
              type="text"
              name="addressDetailed"
              value={formData.addressDetailed}
              onChange={handleChange}
              required
              placeholder={t('addressDetailed')}
              className="w-full bg-transparent border-b border-gray-300 dark:border-slate-700 py-3 pr-8 pl-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-burgundy-500 dark:focus:border-burgundy-400 outline-none transition-colors"
            />
          </div>

          <select
            name="howDidYouKnow"
            value={formData.howDidYouKnow}
            onChange={handleChange}
            required
            className="w-full bg-transparent border-b border-gray-300 dark:border-slate-700 py-3 text-slate-900 dark:text-white focus:border-burgundy-500 dark:focus:border-burgundy-400 outline-none transition-colors cursor-pointer appearance-none [&>option]:bg-white dark:[&>option]:bg-slate-800"
          >
            <option value="" disabled>
              {t('howDidYouKnowGhaith')}
            </option>
            <option value="fb">{t('facebook')}</option>
            <option value="friend">{t('friends')}</option>
            <option value="other">{t('other')}</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative group">
            <Lock className="absolute right-0 top-3 w-5 h-5 text-burgundy-500 group-focus-within:text-burgundy-400 transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder={t('passwordPlaceholder')}
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
          <div className="relative group">
            <Lock className="absolute right-0 top-3 w-5 h-5 text-burgundy-500 group-focus-within:text-burgundy-400 transition-colors" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder={t('passwordConfirm')}
              className="w-full bg-transparent border-b border-gray-300 dark:border-slate-700 py-3 pr-8 pl-8 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-burgundy-500 dark:focus:border-burgundy-400 outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute left-0 top-3 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full md:w-auto md:min-w-[200px] mx-auto block bg-burgundy-500 hover:bg-burgundy-400 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-burgundy-500/20 mt-10 transition-all hover:-translate-y-0.5 disabled:opacity-50"
        >
          {loading ? '...' : t('registerSubmit')}
        </button>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-8">
          {t('haveAccountLabel')}{' '}
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="text-yellow-400 hover:text-yellow-300 hover:underline font-bold transition-colors"
          >
            {t('loginLink')}
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
