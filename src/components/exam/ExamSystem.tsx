import toast from "react-hot-toast";
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, CheckCircle2, Clock, AlertCircle, Flag, ArrowRight, ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface ExamSystemProps {
  exam: any;
  onClose: () => void;
  onComplete: (score: number, total: number) => void;
}

export default function ExamSystem({ exam, onClose, onComplete }: ExamSystemProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [examScore, setExamScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [correctAnswers, setCorrectAnswers] = useState<Record<string, string>>({});
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  
  useEffect(() => {
    async function loadExam() {
      setIsLoading(true);
      setTimeLeft((exam.duration_minutes || 60) * 60);
      
      const { data: qData } = await supabase
        .from('questions')
        .select('*')
        .eq(exam.type === 'exam' ? 'exam_id' : 'assignment_id', exam.id)
        .order('id', { ascending: true });
        
      if (qData) {
        setQuestions(qData);
        const qIds = qData.map((q) => q.id);
        if (qIds.length > 0) {
          const { data: oData } = await supabase
            .from('exam_options_public')
            .select('id, question_id, option_text, order_index')
            .in('question_id', qIds)
            .order('order_index', { ascending: true });
          if (oData) setOptions(oData);
        }
      }
      setIsLoading(false);
    }
    loadExam();
  }, [exam]);

  useEffect(() => {
    let timer: any;
    if (!isLoading && !examFinished && timeLeft > 0 && !showSummary) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && !isLoading && !examFinished) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [isLoading, examFinished, timeLeft, showSummary]);

  
  const handleLoadReview = async () => {
    setIsReviewLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const res = await fetch('/api/get-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ examId: exam.id, isHomework: exam.type === 'homework' })
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Non-JSON response from server:', text);
        toast.error('يبدو أن الخادم لم يتم تحديثه بالكامل بعد (تحديث الصفحة قد يحل المشكلة).');
        setIsReviewLoading(false);
        return;
      }
      
      if (data.success && data.correctOptions) {
        setCorrectAnswers(data.correctOptions);
        setIsReviewMode(true);
        setCurrentIdx(0);
      } else {
        toast.error(data.message || 'رسالة الخطأ: ' + JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
      toast.error('عذراً، حدث خطأ أثناء الاتصال بالخادم: ' + String(err.message || err) + ' | ' + window.location.pathname);
    }
    setIsReviewLoading(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const answers = questions.map((q, idx) => ({
      question_id: q.id,
      selected_option_id: selectedAnswers[idx] || null,
    }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('يجب تسجيل الدخول');
        setIsSubmitting(false);
        return;
      }
      
      const res = await fetch('/api/submit-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          examId: exam.id,
          isHomework: exam.type === 'homework',
          answers: answers
        })
      });
      
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Non-JSON response from server for submit-exam:', text);
        toast.error('يبدو أن الخادم قيد التحديث (يرجى تحديث الصفحة والمحاولة).');
        setIsSubmitting(false);
        return;
      }

      if (data && data.success) {
        setExamScore(data.score);
        setExamFinished(true);
        onComplete(data.score, exam.total_marks || 100);
      } else {
        toast.error(data.message || 'حدث خطأ أثناء تسليم الامتحان');
      }
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ غير متوقع أثناء تسليم الامتحان');
    }
    
    setIsSubmitting(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 mb-12">
        <Loader2 className="w-16 h-16 animate-spin text-burgundy-500 mb-6" />
        <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300">جاري تجهيز {exam.type === 'homework' ? 'الواجب' : 'الامتحان'}...</h3>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 mb-12">
        <AlertCircle className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-slate-500">لا توجد أسئلة مضافة حتى الآن.</h3>
        <button onClick={onClose} className="mt-8 px-6 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-bold">عودة</button>
      </div>
    );
  }

  if (examFinished && !isReviewMode) {
    const percentage = Math.round((examScore / (exam.total_marks || 100)) * 100);
    const isPassed = percentage >= 50;
    
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden mb-12 p-10 md:p-16 text-center relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-burgundy-400 to-burgundy-600"></div>
        
        {isPassed ? (
          <div className="w-32 h-32 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
        ) : (
          <div className="w-32 h-32 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
        )}
        
        <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-4">
          {isPassed ? 'أداء ممتاز! 🎉' : 'حاول مرة أخرى 💪'}
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-10">
          لقد حصلت على <span className={`font-bold text-2xl ${isPassed ? 'text-green-500' : 'text-red-500'}`}>{examScore}</span> من {exam.total_marks || 100}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={handleLoadReview} disabled={isReviewLoading} className="px-10 py-4 bg-white dark:bg-slate-800 border-2 border-burgundy-500 text-burgundy-600 dark:text-burgundy-400 hover:bg-burgundy-50 dark:hover:bg-slate-700 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {isReviewLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
            مراجعة الإجابات
          </button>
          <button onClick={onClose} className="px-10 py-4 bg-burgundy-500 hover:bg-burgundy-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-burgundy-500/30 hover:-translate-y-1">
            العودة للمنهج
          </button>
        </div>
      </div>
    );
  }

  if (showSummary) {
    const answeredCount = Object.keys(selectedAnswers).length;
    const unAnsweredCount = questions.length - answeredCount;
    const flaggedCount = Object.values(flagged).filter(Boolean).length;
    
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden mb-12 p-8 md:p-12">
        <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8 text-center">مراجعة قبل التسليم النهائي</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl text-center border border-slate-100 dark:border-slate-700/50">
            <span className="block text-4xl font-black text-slate-800 dark:text-white mb-2">{questions.length}</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">الأسئلة</span>
          </div>
          <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-2xl text-center border border-green-100 dark:border-green-900/30">
            <span className="block text-4xl font-black text-green-600 dark:text-green-400 mb-2">{answeredCount}</span>
            <span className="text-green-700 dark:text-green-500 font-medium">مجاب</span>
          </div>
          <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl text-center border border-red-100 dark:border-red-900/30">
            <span className="block text-4xl font-black text-red-600 dark:text-red-400 mb-2">{unAnsweredCount}</span>
            <span className="text-red-700 dark:text-red-500 font-medium">لم يتم الإجابة</span>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl text-center border border-amber-100 dark:border-amber-900/30">
            <span className="block text-4xl font-black text-amber-600 dark:text-amber-400 mb-2">{flaggedCount}</span>
            <span className="text-amber-700 dark:text-amber-500 font-medium">للمراجعة</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-4">
          <button
            onClick={() => setShowSummary(false)}
            className="px-8 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all"
          >
            العودة للامتحان
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-10 py-4 bg-burgundy-500 hover:bg-burgundy-600 text-white font-bold rounded-xl flex justify-center items-center gap-3 transition-all shadow-lg hover:shadow-burgundy-500/30 disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
            {isSubmitting ? 'جاري التسليم...' : 'تأكيد التسليم'}
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentIdx];
  const qOptions = options.filter(o => o.question_id === q?.id);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative mb-12 flex flex-col lg:flex-row min-h-[700px]">
      
      {/* Sidebar - Navigation */}
      <div className="lg:w-1/4 bg-white dark:bg-slate-800 border-b lg:border-b-0 lg:border-l border-slate-200 dark:border-slate-700 p-6 flex flex-col">
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-burgundy-500" />
            {exam.type === 'homework' ? 'الواجب' : 'الامتحان'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{exam.title}</p>
        </div>
        
        {!isReviewMode && (<div className="relative flex flex-col items-center justify-center p-6 rounded-2xl mb-8 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-700"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              />
              <path
                className={`transition-all duration-1000 ${timeLeft < 300 ? 'text-red-500' : 'text-burgundy-500'}`}
                strokeDasharray={`${Math.max(0, (timeLeft / (exam.duration_minutes || 60) * 60) * 100)}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Clock className={`w-5 h-5 mb-1 ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
              <span className={`text-xl font-mono font-black tracking-wider ${timeLeft < 300 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>{formatTime(timeLeft)}</span>
            </div>
          </div>
          <span className="text-sm font-bold text-slate-500">الوقت المتبقي</span>
        </div>)}

        <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4 text-sm">خريطة الأسئلة</h4>
        <div className="grid grid-cols-5 gap-2 mb-6 flex-1 content-start" style={{ direction: 'ltr' }}>
          {questions.map((_, i) => {
            const isAnswered = !!selectedAnswers[i];
            const isCurrent = currentIdx === i;
            const isFlagged = !!flagged[i];
            
            return (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all relative
                  ${isCurrent ? 'ring-2 ring-burgundy-500 ring-offset-2 dark:ring-offset-slate-800 scale-110 z-10' : 'hover:scale-105'}
                  ${
                    isReviewMode
                      ? selectedAnswers[i] === correctAnswers[questions[i]?.id]
                        ? 'bg-green-500 text-white border-green-600'
                        : selectedAnswers[i]
                          ? 'bg-red-500 text-white border-red-600'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      : isAnswered 
                        ? 'bg-burgundy-500 text-white shadow-md shadow-burgundy-500/20' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }
                `}
              >
                {i + 1}
                {isFlagged && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 border-2 border-white dark:border-slate-800 rounded-full shadow-sm"></div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
           {isReviewMode ? (
             <button
               onClick={onClose}
               className="w-full py-4 bg-burgundy-500 text-white font-bold rounded-xl hover:bg-burgundy-600 transition-colors flex justify-center items-center gap-2"
             >
               <ArrowRight className="w-5 h-5" />
               خروج من المراجعة
             </button>
           ) : (
             <button
               onClick={() => setShowSummary(true)}
               className="w-full py-4 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors flex justify-center items-center gap-2"
             >
               <CheckCircle2 className="w-5 h-5" />
               إنهاء وتسليم
             </button>
           )}
        </div>
      </div>

      {/* Main Question Area */}
      <div className="lg:w-3/4 p-8 md:p-12 flex flex-col bg-white dark:bg-slate-900">
        {isReviewMode && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            أنت الآن في وضع مراجعة الإجابات. الإجابة الصحيحة باللون الأخضر وإجابتك الخاطئة باللون الأحمر.
          </div>
        )}
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
          <span className="bg-burgundy-50 dark:bg-burgundy-900/30 text-burgundy-700 dark:text-burgundy-400 px-5 py-2 rounded-full text-sm font-black tracking-wide border border-burgundy-100 dark:border-burgundy-800/50">
            سؤال {currentIdx + 1} من {questions.length}
          </span>
          <button
            onClick={() => setFlagged(prev => ({ ...prev, [currentIdx]: !prev[currentIdx] }))}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all border ${flagged[currentIdx] ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
          >
            <Flag className={`w-4 h-4 ${flagged[currentIdx] ? 'fill-current' : ''}`} />
            {flagged[currentIdx] ? 'محدد للمراجعة' : 'وضع علامة'}
          </button>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white leading-relaxed mb-10">
            {q?.question_text || q?.text}
          </h2>

          {q?.image_url && (
            <div className="mb-10 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-2 shadow-inner">
              <img
                src={q.image_url}
                alt="Question Reference"
                className="w-full max-h-[400px] object-contain rounded-xl mix-blend-multiply dark:mix-blend-normal"
              />
            </div>
          )}

          <div className="space-y-4">
            {qOptions.map((opt: any) => {
              const isSelected = selectedAnswers[currentIdx] === opt.id;
              return (
                <label
                  key={opt.id}
                  className={`flex items-center p-6 rounded-2xl border-2 transition-all duration-300 group
                    ${!isReviewMode ? 'cursor-pointer' : ''}
                    ${
                      isReviewMode
                        ? opt.id === correctAnswers[q.id]
                          ? 'border-green-500 bg-green-50/50 dark:bg-green-900/20'
                          : isSelected
                            ? 'border-red-500 bg-red-50/50 dark:bg-red-900/20'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 opacity-60'
                        : isSelected 
                          ? 'border-burgundy-500 bg-burgundy-50/50 dark:bg-burgundy-900/20 shadow-md shadow-burgundy-500/10 scale-[1.01]' 
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ml-5 transition-colors
                    ${
                      isReviewMode
                        ? opt.id === correctAnswers[q.id]
                          ? 'border-green-500 bg-green-500'
                          : isSelected
                            ? 'border-red-500 bg-red-500'
                            : 'border-slate-300 dark:border-slate-600'
                        : isSelected ? 'border-burgundy-500 bg-burgundy-500' : 'border-slate-300 dark:border-slate-600 group-hover:border-slate-400 dark:group-hover:border-slate-500'
                    }`}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white scale-in"></div>}
                  </div>
                  <input
                    type="radio"
                    name={`q-${currentIdx}`}
                    checked={isSelected}
                    onChange={() => !isReviewMode && setSelectedAnswers(prev => ({ ...prev, [currentIdx]: opt.id }))}
                    disabled={isReviewMode}
                    className="hidden"
                  />
                  <span className={`text-xl font-medium ${
                      isReviewMode
                        ? opt.id === correctAnswers[q.id]
                          ? 'text-green-700 dark:text-green-300'
                          : isSelected
                            ? 'text-red-700 dark:text-red-300'
                            : 'text-slate-600 dark:text-slate-400'
                        : isSelected ? 'text-burgundy-700 dark:text-burgundy-300' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                    {opt.option_text || opt.text}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <button
            onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-5 h-5" />
            السابق
          </button>
          
          {currentIdx === questions.length - 1 ? (
            isReviewMode ? (
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-8 py-3 bg-burgundy-500 hover:bg-burgundy-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-burgundy-500/25 hover:-translate-y-0.5"
              >
                إنهاء المراجعة
                <CheckCircle2 className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setShowSummary(true)}
                className="flex items-center gap-2 px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5"
              >
                مراجعة وتسليم
                <CheckCircle2 className="w-5 h-5" />
              </button>
            )
          ) : (
            <button
              onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))}
              className="flex items-center gap-2 px-8 py-3 bg-burgundy-500 hover:bg-burgundy-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-burgundy-500/25 hover:-translate-y-0.5"
            >
              التالي
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
