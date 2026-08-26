import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useWallet() {
  const [balance, setBalance] = useState(0);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWallet = useCallback(async () => {
    setIsLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      setUserId(session.user.id);
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('wallet_balance')
        .eq('id', session.user.id)
        .single();
      if (studentError) {
        
      }
      if (studentData) {
        setBalance(studentData.wallet_balance || 0);
      }

      const { data: subs } = await supabase
        .from('student_subscriptions')
        .select('course_id')
        .eq('student_id', session.user.id);
      if (subs) {
        setSubscriptions(subs.map((s) => String(s.course_id)));
      }
    } else {
      setUserId(null);
      setBalance(0);
      setSubscriptions([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchWallet();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchWallet();
    });

    const handleWalletUpdate = () => {
      fetchWallet();
    };
    window.addEventListener('wallet_updated', handleWalletUpdate);

    return () => {
      authListener?.subscription.unsubscribe();
      window.removeEventListener('wallet_updated', handleWalletUpdate);
    };
  }, [fetchWallet]);

  const chargeWallet = async (code: string) => {
    if (!userId) return { success: false, message: 'يجب تسجيل الدخول أولاً' };

    try {
      const { data, error } = await supabase.rpc('redeem_charge_card', { p_code: code });

      if (error) {
        console.error('Wallet charge error:', error);
        return { success: false, message: `حدث خطأ: ${error.message}` };
      }

      if (data && typeof data === 'object') {
        if (data.success) {
          setBalance(data.balance);
          window.dispatchEvent(new CustomEvent('wallet_updated'));
        }
        return data;
      }

      // If data is null, it means the old database function is still running
      return { success: false, message: 'برجاء تحديث قواعد البيانات (SQL) كما هو مطلوب.' };
    } catch (err) {
      
      return { success: false, message: 'حدث خطأ غير متوقع' };
    }
  };

  const subscribeToCourse = async (courseId: string) => {
    if (!userId) return { success: false, message: 'يجب تسجيل الدخول أولاً' };
    if (subscriptions.includes(courseId)) {
      return { success: true, message: 'أنت مشترك بالفعل' };
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { success: false, message: 'يجب تسجيل الدخول' };

      const res = await fetch('/api/join-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ courseId })
      });

      const data = await res.json();

      if (data?.success) {
        await fetchWallet();
        setSubscriptions([...subscriptions, courseId]);
        window.dispatchEvent(new CustomEvent('wallet_updated'));
      }
      return data || { success: false, message: 'حدث خطأ غير متوقع' };
    } catch (err) {
      console.error('API join-course error:', err);
      return { success: false, message: 'حدث خطأ غير متوقع بالخادم' };
    }
  };

  const hasSubscription = useCallback(
    (courseId: string) => {
      return subscriptions.includes(courseId);
    },
    [subscriptions]
  );

  return { balance, subscriptions, chargeWallet, subscribeToCourse, hasSubscription, isLoading };
}
