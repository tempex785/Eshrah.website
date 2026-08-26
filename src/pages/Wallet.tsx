import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Wallet as WalletIcon, 
  CreditCard, 
  History, 
  ArrowRight,
  Send,
  Phone,
  CheckCircle2,
  AlertCircle,
  Copy,
  Plus,
  ShieldCheck
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWallet } from '../hooks/useWallet';

interface WalletProps {
  onNavigate: (page: string) => void;
}

export default function Wallet({ onNavigate }: WalletProps) {
  const { balance, chargeWallet } = useWallet();
  const [activeTab, setActiveTab] = useState<'charge-code' | 'charge-manual' | 'history'>('charge-code');
  
  // Charge by code
  const [chargeCode, setChargeCode] = useState('');
  const [chargeMessage, setChargeMessage] = useState({ text: '', isError: false });
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);

  // Manual charge
  const [manualPhone, setManualPhone] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualMessage, setManualMessage] = useState({ text: '', isError: false });
  const [isManualSubmitting, setIsManualSubmitting] = useState(false);

  // History
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [activeTab]);

  const fetchTransactions = async () => {
    if (activeTab !== 'history') return;
    
    setIsLoadingHistory(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('transactions_log')
        .select('*')
        .eq('student_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleChargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeCode.trim()) {
      setChargeMessage({ text: 'يرجى إدخال كود الشحن', isError: true });
      return;
    }
    setIsSubmittingCode(true);
    setChargeMessage({ text: '', isError: false });

    try {
      const code = chargeCode.trim();
      if (!/^\d{16}$/.test(code)) {
        throw new Error('كود الشحن يجب أن يتكون من 16 رقماً');
      }
      const result = await chargeWallet(code);
      if (result.success) {
        setChargeMessage({ text: 'تم شحن المحفظة بنجاح', isError: false });
        setChargeCode('');
        if (activeTab === 'history') {
          fetchTransactions();
        }
      } else {
        throw new Error(result.message || 'خطأ في عملية الشحن');
      }
    } catch (err: any) {
      setChargeMessage({ text: err.message, isError: true });
    } finally {
      setIsSubmittingCode(false);
    }
  };

  const handleManualChargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAmount || !manualPhone) {
      setManualMessage({ text: 'يرجى إدخال المبلغ ورقم التحويل', isError: true });
      return;
    }
    setIsManualSubmitting(true);
    setManualMessage({ text: '', isError: false });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('يجب تسجيل الدخول أولاً');

      const { error } = await supabase.from('charge_requests').insert({
        student_id: session.user.id,
        amount: parseFloat(manualAmount),
        sender_phone: manualPhone,
        status: 'pending'
      });

      if (error) throw error;

      setManualMessage({ text: 'تم إرسال طلب الشحن بنجاح. سيتم مراجعة الطلب وإضافة الرصيد قريباً.', isError: false });
      setManualPhone('');
      setManualAmount('');
      fetchChargeHistory();
    } catch (err: any) {
      setManualMessage({ text: err.message || 'حدث خطأ أثناء إرسال الطلب', isError: true });
    } finally {
      setIsManualSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-bold">مكتمل</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-bold">مرفوض</span>;
      default:
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-xs font-bold">قيد المراجعة</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => onNavigate('home')}
          className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
            <WalletIcon className="w-6 h-6" />
          </div>
          محفظتي
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sidebar / Balance */}
        <div className="lg:col-span-1 space-y-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-8 -mb-8 blur-xl"></div>
            
            <div className="relative z-10">
              <p className="text-emerald-50 font-medium mb-1">الرصيد المتاح</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-black tracking-tight">{balance}</span>
                <span className="text-lg font-bold opacity-80">ج.م</span>
              </div>
              
              <div className="flex items-center justify-between text-sm border-t border-white/20 pt-4 mt-2">
                <span className="opacity-90">استخدم الرصيد لشراء الكورسات</span>
                <ShieldCheck className="w-5 h-5 opacity-80" />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
            <div className="p-2 flex flex-col gap-1">

              <button
                onClick={() => setActiveTab('charge-code')}
                className={`flex items-center gap-3 w-full p-4 rounded-xl text-right font-bold transition-all ${
                  activeTab === 'charge-code' 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Plus className="w-5 h-5 shrink-0" />
                شحن بكود كارت
              </button>

              <button
                onClick={() => setActiveTab('charge-manual')}
                className={`flex items-center gap-3 w-full p-4 rounded-xl text-right font-bold transition-all ${
                  activeTab === 'charge-manual' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Send className="w-5 h-5 shrink-0" />
                شحن يدوي (فودافون كاش)
              </button>
              
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-3 w-full p-4 rounded-xl text-right font-bold transition-all ${
                  activeTab === 'history' 
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <History className="w-5 h-5 shrink-0" />
                سجل العمليات
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6 md:p-8 min-h-[500px]">
            
            {activeTab === 'charge-code' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto py-4">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">شحن بكود كارت</h2>
                  <p className="text-slate-500">أدخل كود الشحن المكون من 16 رقماً لإضافة الرصيد فوراً.</p>
                </div>

                <form onSubmit={handleChargeSubmit} className="space-y-6">
                  <div>
                    <input
                      type="text"
                      value={chargeCode}
                      onChange={(e) => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let val = e.target.value;
  for (let i = 0; i < 10; i++) {
    val = val.replaceAll(arabicNumbers[i], i.toString());
  }
  setChargeCode(val.replace(/\D/g, ''));
}}
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      maxLength={16}
                      className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-4 px-4 text-center text-2xl tracking-widest font-mono text-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                  
                  {chargeMessage.text && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${
                      chargeMessage.isError 
                        ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-800/50' 
                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50'
                    }`}>
                      {chargeMessage.isError ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                      {chargeMessage.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingCode || chargeCode.length !== 16}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                  >
                    {isSubmittingCode ? 'جاري الشحن...' : 'شحن المحفظة'}
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === 'charge-manual' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto py-4">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">طلب شحن يدوي</h2>
                  <p className="text-slate-500 text-sm">قم بتحويل المبلغ إلى رقم فودافون كاش التالي، ثم سجل الطلب هنا.</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl p-4 mb-6 text-center">
                  <p className="text-blue-800 dark:text-blue-300 text-sm font-bold mb-2">رقم فودافون كاش للتحويل:</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl font-black font-mono tracking-wider text-slate-800 dark:text-white dir-ltr">01017967936</span>
                    <button 
                      onClick={() => navigator.clipboard.writeText('01017967936')}
                      className="p-2 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
                      title="نسخ الرقم"
                    >
                      <Copy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleManualChargeSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      رقم الموبايل الذي قمت بالتحويل منه
                    </label>
                    <input
                      type="text"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      placeholder="مثال: 01012345678"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-white focus:border-blue-500 focus:outline-none text-right dir-ltr"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      المبلغ المحول (ج.م)
                    </label>
                    <input
                      type="number"
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      placeholder="مثال: 200"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-white focus:border-blue-500 focus:outline-none text-right dir-ltr"
                      dir="ltr"
                    />
                  </div>
                  
                  {manualMessage.text && (
                    <div className={`p-4 rounded-xl flex items-start gap-3 text-sm font-bold ${
                      manualMessage.isError 
                        ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                    }`}>
                      {manualMessage.isError ? <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />}
                      <span className="leading-relaxed">{manualMessage.text}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isManualSubmitting || !manualPhone || !manualAmount}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
                  >
                    {isManualSubmitting ? 'جاري إرسال الطلب...' : 'تأكيد التحويل'}
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-2">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6">سجل عمليات الشحن</h2>
                
                {isLoadingHistory ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((tx, i) => {
                      const isCharge = tx.type === 'charge' || tx.type === 'refund';
                      const isPurchase = tx.type === 'purchase';
                      return (
                      <div key={i} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-colors hover:border-slate-300 dark:hover:border-slate-600">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                            isCharge ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            isPurchase ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            <WalletIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-bold text-lg ${isCharge ? 'text-emerald-600 dark:text-emerald-400' : isPurchase ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>
                                {isCharge ? '+' : isPurchase ? '-' : ''}{tx.amount} ج.م
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                isCharge ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                isPurchase ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              }`}>
                                {tx.type === 'charge' ? 'إيداع رصيد' : tx.type === 'purchase' ? 'اشتراك / خصم' : tx.type === 'refund' ? 'استرجاع' : 'أخرى'}
                              </span>
                            </div>
                            <div className="text-sm text-slate-500 flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 mt-1">
                              {tx.description && (
                                <span className="font-medium text-slate-700 dark:text-slate-300">{tx.description}</span>
                              )}
                              <span dir="ltr" className="text-slate-400 text-xs sm:text-sm">{new Date(tx.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <History className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">لا توجد عمليات سابقة</p>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">لم تقم بأي عمليات شحن أو اشتراك حتى الآن.</p>
                  </div>
                )}
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
