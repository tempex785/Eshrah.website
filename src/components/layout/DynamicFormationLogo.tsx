import { motion, Variants } from 'motion/react';

interface Props {
  text?: string;
}

const DynamicFormationLogo = ({ text = 'إشرح طب' }: Props) => {
  const letters = text.split('');

  // إعدادات حركة أكثر احترافية وأناقة (3D Flip & Fade)
  const letterVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      rotateX: -90,
      filter: 'blur(4px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 150,
      },
    },
    hover: {
      y: -4,
      scale: 1.05,
      textShadow: '0px 8px 16px rgba(144, 11, 57, 0.3)',
      transition: {
        type: 'spring',
        damping: 10,
        stiffness: 300,
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // ظهور متتابع أنيق
        delayChildren: 0.1,
      },
    },
    hover: {
      transition: {
        staggerChildren: 0.03, // تموج سريع عند تمرير الماوس
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="flex items-center cursor-pointer"
      style={{ direction: 'rtl', perspective: 1000 }} // إضافة البعد الثالث للتأثير
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          style={{ transformOrigin: 'bottom center' }}
          className="font-black text-2xl sm:text-3xl tracking-tight text-burgundy-600 dark:text-burgundy-400 inline-block transition-colors duration-300 hover:text-burgundy-500"
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default DynamicFormationLogo;
