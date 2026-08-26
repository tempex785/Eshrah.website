import { AlertCircle } from 'lucide-react';
import { Page } from '../../App';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: Page) => void;
}

export default function AuthPromptModal({ isOpen, onClose, onNavigate }: AuthPromptModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#151b23] p-6 md:p-8 rounded-3xl shadow-xl max-w-sm w-full mx-auto animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
        <div className="w-14 h-14 bg-burgundy-50 dark:bg-burgundy-900/30 rounded-2xl flex items-center justify-center mb-6 mx-auto text-burgundy-500">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h3 className="text-xl md:text-2xl font-bold mb-3 text-slate-900 dark:text-white text-center">
          عليك التسجيل أولاً
        </h3>

        <p className="text-slate-600 dark:text-slate-400 mb-8 text-center text-sm md:text-base leading-relaxed">
          يرجى إنشاء حساب أو تسجيل الدخول لتتمكن من الاشتراك في الكورس والوصول لمحتوياته.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onClose();
              onNavigate && onNavigate('register');
            }}
            className="w-full bg-burgundy-500 hover:bg-burgundy-600 text-white font-bold py-3.5 rounded-xl text-center transition-colors shadow-md shadow-burgundy-500/20"
          >
            إنشاء حساب
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigate && onNavigate('login');
            }}
            className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-3.5 rounded-xl text-center transition-colors"
          >
            تسجيل الدخول
          </button>

          <button
            onClick={onClose}
            className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 font-medium py-2 rounded-xl text-center transition-colors mt-2 text-sm"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
