import { motion } from 'motion/react';
import React, { useRef, useEffect } from 'react';

// يمكنك استبدال هذا المسار بمسار الفيديو الخاص بك أو رفعه في مجلد assets
// import splashVideo from '../../assets/splash.mp4'; 

interface SplashScreenProps {
  onFinish?: () => void;
  isFadingOut: boolean;
}

export default function SplashScreen({ isFadingOut, onFinish }: SplashScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Video autoplay failed", error);
      });
    }
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-[#0b121c] transition-opacity duration-700 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          onEnded={() => {
            setTimeout(() => {
              if (onFinish) onFinish();
            }, 1000);
          }}
          muted
          playsInline
                    // src={splashVideo} // استخدم هذا السطر عند استيراد فيديو محلي
          src="/splash.mp4" // الفيديو الخاص بك
        />
        
        {/* طبقة شفافة فوق الفيديو لإضافة لمسة جمالية أو إظهار نص */}
        <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          animate={{ opacity: [0, 1] }}
          transition={{ duration: 1 }}
        >
          <h1 className="font-hero text-5xl sm:text-6xl tracking-wide text-white mt-6 drop-shadow-lg">
            إشرحــ طب
          </h1>
        </motion.div>
        
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mt-4 text-white/90 font-medium tracking-wide text-lg drop-shadow-md"
        >
          جاري التحميل...
        </motion.div>
      </div>
    </div>
  );
}
