import eshrahLogo from '../../assets/images/1000120013-removebg-preview.png';
import { Activity, HeartPulse, Stethoscope } from 'lucide-react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  isFadingOut: boolean;
}

export default function SplashScreen({ isFadingOut }: SplashScreenProps) {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-[#0b121c] transition-opacity duration-700 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-burgundy-100 dark:bg-burgundy-900/20 blur-3xl" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-slate-100 dark:bg-slate-800/30 blur-3xl" 
        />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Logo Container with heartbeat animation */}
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative mb-12 flex flex-col items-center justify-center"
        >
          {/* Glow effect behind logo */}
          <div className="absolute inset-0 bg-burgundy-400/20 dark:bg-burgundy-500/20 blur-2xl rounded-full scale-150" />
          
          <div 
            className="w-48 h-48 sm:w-56 sm:h-56 bg-burgundy-600 dark:bg-burgundy-400 relative z-10"
            style={{ 
              WebkitMaskImage: `url(${eshrahLogo})`, 
              WebkitMaskSize: 'contain', 
              WebkitMaskRepeat: 'no-repeat', 
              WebkitMaskPosition: 'center', 
              maskImage: `url(${eshrahLogo})`, 
              maskSize: 'contain', 
              maskRepeat: 'no-repeat', 
              maskPosition: 'center' 
            }}
            title="إشرح طب"
          />
          <h1 className="font-hero text-5xl sm:text-6xl tracking-wide text-burgundy-600 dark:text-burgundy-400 mt-6 relative z-10">
            إشرحــ طب
          </h1>
        </motion.div>
        
        {/* Loading Indicator */}
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-6 text-burgundy-600 dark:text-burgundy-400">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Stethoscope className="w-6 h-6 opacity-80" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            >
              <Activity className="w-8 h-8" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <HeartPulse className="w-6 h-6 opacity-80" />
            </motion.div>
          </div>
          
          {/* Progress bar container */}
          <div className="w-56 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
            <motion.div 
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-burgundy-400 to-burgundy-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
            />
          </div>

          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-gray-500 dark:text-gray-400 font-medium tracking-wide text-sm"
          >
            بوابتك للتفوق الطبي...
          </motion.div>
        </div>
      </div>
    </div>
  );
}
