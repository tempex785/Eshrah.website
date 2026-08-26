import { motion, AnimatePresence } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { toPng, toBlob } from 'html-to-image';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import { CourseData } from '../../App';

interface CertificatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  gender: string;
  courseTitle: string;
}

export default function CertificatePreviewModal({
  isOpen,
  onClose,
  studentName,
  gender,
  courseTitle,
}: CertificatePreviewModalProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsReady(true), 300); // Wait for animation
    } else {
      setIsReady(false);
    }
  }, [isOpen]);

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    try {
      setIsDownloading(true);
      // Ensure element is visible
      const imgData = await toPng(certificateRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
      });
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificate_${courseTitle.replace(/\s+/g, '_')}.pdf`);
      toast.success('تم تحميل الشهادة بنجاح');
    } catch (error) {
      
      toast.error('حدث خطأ أثناء تحميل الشهادة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!certificateRef.current) return;
    try {
      setIsSharing(true);
      const blob = await toBlob(certificateRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
      });

      if (!blob) {
        toast.error('حدث خطأ أثناء تحضير الشهادة.');
        setIsSharing(false);
        return;
      }

      const fileName = `Certificate_${courseTitle.replace(/\s+/g, '_')}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'شهادة إتمام دورة',
            text: `لقد أتممت بنجاح دورة ${courseTitle} على منصة إشرح طب!`,
            files: [file],
          });
          toast.success('تمت المشاركة بنجاح');
        } catch (error: any) {
          if (error.name !== 'AbortError') {
            
            toast.error('حدث خطأ أثناء المشاركة.');
          }
        }
      } else {
        // Fallback: download as PNG
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('تم تحميل الصورة بنجاح (المشاركة المباشرة غير مدعومة في متصفحك)');
      }
      setIsSharing(false);
    } catch (error) {
      
      toast.error('حدث خطأ أثناء التحضير للمشاركة. يرجى المحاولة مرة أخرى.');
      setIsSharing(false);
    }
  };

  const titlePrefix = gender === 'f' ? 'الطبيبة' : 'الطبيب';
  const verbPrefix = gender === 'f' ? 'أتمت' : 'أتم';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">معاينة الشهادة</h2>
              <button
                onClick={onClose}
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center bg-slate-200 dark:bg-slate-900/50">
              {/* Preview Container - Scaled down for view */}
              <div
                className="relative bg-white shadow-xl flex items-center justify-center"
                style={{
                  width: '100%',
                  aspectRatio: '1.414 / 1', // A4 Landscape ratio
                  maxWidth: '900px',
                  maxHeight: 'calc(90vh - 150px)',
                  overflow: 'hidden',
                }}
              >
                {/* Wrapper that handles scaling */}
                <div
                  className="bg-white absolute top-0 left-0 origin-top-left"
                  style={{
                    width: '1123px', // A4 at 96dpi
                    height: '794px',
                    transform: `scale(var(--cert-scale, 1))`,
                  }}
                  ref={(el) => {
                    if (el && el.parentElement) {
                      const parent = el.parentElement;
                      const scaleX = parent.clientWidth / 1123;
                      const scaleY = parent.clientHeight / 794;
                      const scale = Math.min(scaleX, scaleY);
                      el.style.setProperty('--cert-scale', scale.toString());

                      const ro = new ResizeObserver(() => {
                        const newScaleX = parent.clientWidth / 1123;
                        const newScaleY = parent.clientHeight / 794;
                        const newScale = Math.min(newScaleX, newScaleY);
                        el.style.setProperty('--cert-scale', newScale.toString());
                      });
                      ro.observe(parent);
                    }
                  }}
                >
                  {/* The actual certificate - NO CSS Transform applied directly so html2canvas renders perfectly */}
                  <div
                    ref={certificateRef}
                    style={{
                      width: '1123px', // A4 at 96dpi
                      height: '794px',
                      padding: '24px',
                      boxSizing: 'border-box',
                      fontFamily: '"Cairo", sans-serif',
                      color: '#0f172a',
                      direction: 'rtl',
                      backgroundColor: '#fff',
                    }}
                  >
                    <div
                      style={{
                        border: '8px solid #0f172a',
                        borderRadius: '24px',
                        width: '100%',
                        height: '100%',
                        boxSizing: 'border-box',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '50px 80px 40px 80px',
                        backgroundColor: '#fff',
                      }}
                    >
                      <div style={{ marginBottom: '20px' }}>
                        <div
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px dashed #0f172a',
                            padding: '4px',
                          }}
                        >
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              backgroundColor: '#8e1f2c',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 900,
                              fontSize: '16px',
                              textAlign: 'center',
                              lineHeight: 1.1,
                            }}
                          >
                            إشرح
                            <br />
                            طب
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          letterSpacing: '2px',
                          color: '#64748b',
                          textTransform: 'uppercase',
                          marginBottom: '20px',
                        }}
                      >
                        شهادة إتمام دورة
                      </div>

                      <div
                        style={{
                          fontSize: '50px',
                          fontWeight: 900,
                          color: '#0f172a',
                          marginBottom: '30px',
                          textAlign: 'center',
                          lineHeight: 1.2,
                          maxWidth: '90%',
                        }}
                      >
                        {courseTitle}
                      </div>

                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          letterSpacing: '2px',
                          color: '#64748b',
                          textTransform: 'uppercase',
                          marginBottom: '16px',
                        }}
                      >
                        تم الإصدار إلى
                      </div>

                      <div
                        style={{
                          fontSize: '40px',
                          fontWeight: 800,
                          color: '#0f172a',
                          marginBottom: '20px',
                        }}
                      >
                        {studentName}
                      </div>

                      <div
                        style={{
                          fontSize: '16px',
                          color: '#475569',
                          lineHeight: 1.6,
                          textAlign: 'center',
                          maxWidth: '700px',
                          marginBottom: 'auto',
                          fontWeight: 600,
                        }}
                      >
                        تشهد إدارة المنصة بأن {titlePrefix} المذكور أعلاه قد {verbPrefix} بنجاح كافة
                        المقررات والمتطلبات الأساسية لاجتياز الدورة التدريبية.
                      </div>

                      <div
                        style={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-end',
                          marginTop: '30px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                          }}
                        >
                          <div
                            style={{
                              fontFamily: '"Brush Script MT", cursive, sans-serif',
                              fontSize: '48px',
                              color: '#0f172a',
                              marginBottom: '5px',
                              transform: 'rotate(-3deg)',
                            }}
                          >
                            Eshrah Teb
                          </div>
                          <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
                            إدارة منصة إشرح طب
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '22px',
                            fontWeight: 900,
                            color: '#0f172a',
                          }}
                        >
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              backgroundColor: '#0f172a',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                            }}
                          >
                            <div
                              style={{
                                width: '16px',
                                height: '16px',
                                backgroundColor: 'white',
                                borderRadius: '4px',
                              }}
                            ></div>
                          </div>
                          إشرح طب
                        </div>

                        <div
                          style={{
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                          }}
                        >
                          {isReady && (
                            <div
                              style={{
                                marginBottom: '12px',
                                border: '2px solid #fff',
                                outline: '2px solid #0f172a',
                                background: '#fff',
                                padding: '4px',
                                width: '64px',
                                height: '64px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <div
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  backgroundColor: '#8e1f2c',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontWeight: 900,
                                  fontSize: '14px',
                                  textAlign: 'center',
                                  lineHeight: 1.1,
                                }}
                              >
                                إشرح
                                <br />
                                طب
                              </div>
                            </div>
                          )}
                          <div
                            style={{
                              fontSize: '13px',
                              color: '#64748b',
                              fontWeight: 600,
                              direction: 'ltr',
                            }}
                          >
                            Issued:{' '}
                            {new Date().toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            • ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex justify-end gap-3 flex-wrap">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                إغلاق
              </button>
              <button
                onClick={handleShare}
                disabled={isSharing || isDownloading}
                className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-70 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-slate-900/20"
              >
                {isSharing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    جاري التحضير...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    مشاركة الشهادة
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading || isSharing}
                className="bg-burgundy-500 hover:bg-burgundy-600 disabled:opacity-70 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-burgundy-500/20"
              >
                {isDownloading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    جاري التنزيل...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    تحميل الشهادة (PDF)
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
