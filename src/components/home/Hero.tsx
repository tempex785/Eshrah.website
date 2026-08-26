import heroImage from '../../assets/images/1000022045-removebg-preview.png';
import { Page } from '../../App';
import { motion } from 'motion/react';

interface HeroProps {
  onNavigate: (page: Page) => void;
  isLoggedIn: boolean;
}

export default function Hero({ onNavigate, isLoggedIn }: HeroProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, type: 'spring' as const, bounce: 0.4 },
    },
  };

  return (
    <section className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto mt-4">
      <div className="bg-[#900B39] rounded-[2rem] md:rounded-[3rem] overflow-hidden relative shadow-2xl flex flex-col lg:flex-row items-center justify-between px-6 sm:px-10 lg:px-16 pt-16 lg:pt-0 min-h-[600px]">
        {/* Right Column (Text Content - RTL) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full lg:w-[55%] xl:w-[60%] text-white z-20 py-8 lg:py-20 relative flex flex-col items-center lg:items-start text-center lg:text-start order-2 lg:order-1"
        >
          <motion.h2
            variants={itemVariants}
            className="text-[#ff4b6e] text-3xl md:text-4xl lg:text-5xl font-normal mb-6 drop-shadow-sm font-hero"
          >
            د / محمد صبحي
          </motion.h2>

          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5rem] leading-[1.3] sm:leading-[1.3] lg:leading-[1.3] mb-8 text-white drop-shadow-md font-hero font-normal"
          >
            مستقبلك في إيدك... هتتفوق في المواد الطبية
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl font-medium mb-10 max-w-lg leading-relaxed text-white/95 font-sans"
          >
            خطة منظمة، شرح مبسط، ومتابعة مستمرة لحد ما توصل لأعلى الدرجات في كليتك.
          </motion.p>

          <motion.div variants={itemVariants} className="w-full sm:w-auto relative z-30">
            {isLoggedIn ? (
              <button
                onClick={() => onNavigate('my-courses')}
                className="bg-white text-[#900B39] px-12 py-4 rounded-2xl font-black text-xl hover:scale-105 transition-transform w-full sm:w-auto shadow-xl"
              >
                دوراتي
              </button>
            ) : (
              <button
                onClick={() => onNavigate('register')}
                className="bg-white text-[#900B39] px-12 py-4 rounded-2xl font-black text-xl hover:scale-105 transition-transform w-full sm:w-auto shadow-xl"
              >
                انشئ حسابك الآن
              </button>
            )}
          </motion.div>
        </motion.div>

        {/* Left Column (Image & Info - RTL) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="w-full lg:w-1/2 lg:absolute lg:left-0 lg:bottom-0 lg:h-full relative flex flex-col items-center justify-end self-end order-1 lg:order-2 mt-8 lg:mt-0 lg:pointer-events-none"
        >
          {/* Doctor Image */}
          <div className="relative w-full flex justify-center lg:justify-start items-end z-10 lg:h-full lg:pl-16">
            <img
              src={heroImage}
              alt="دكتور محمد صبحي"
              className="w-full max-w-[650px] lg:max-w-none lg:w-auto h-auto lg:h-[125%] xl:h-[155%] object-contain object-bottom lg:object-left-bottom mix-blend-normal transform lg:translate-x-16 xl:translate-x-28 [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)]"
            />
          </div>

          {/* Info Text Overlay */}
          <div className="lg:absolute lg:bottom-12 lg:left-12 lg:w-[420px] xl:w-[480px] text-white text-center lg:text-right z-20 bg-gradient-to-t from-[#900B39] via-[#900B39]/90 to-transparent lg:bg-none pt-20 pb-6 px-4 lg:px-0 -mt-24 lg:mt-0 relative lg:pointer-events-auto">
            <div className="lg:bg-[#640828]/60 lg:backdrop-blur-md lg:p-6 lg:rounded-3xl lg:border lg:border-white/10 lg:shadow-2xl">
              <h3 className="text-2xl md:text-3xl font-black mb-3 text-white">مين د/ محمد صبحي؟</h3>
              <p className="font-bold text-lg md:text-xl text-[#ff4b6e] mb-2">
                شرح بسيط.. ومضمون توصل بيه لأعلى الدرجات
              </p>
              <p className="text-sm md:text-base text-white/95 leading-relaxed max-w-md mx-auto lg:mx-0">
                أنا محمد صبحي، محاضر مواد طبية بقالي سنين بساعد طلبة كتير يحققوا التميز ويفهموا
                موادهم صح. على المنصة هتلاقي كل اللي محتاجه: شرح، مراجعة، ومتابعة خطوة بخطوة.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
