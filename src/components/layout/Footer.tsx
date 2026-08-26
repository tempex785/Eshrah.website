import eshrahLogo from '../../assets/images/1000120013-removebg-preview.png';
import madeByLogo from '../../assets/images/1000120216-removebg-preview.png';
import { motion } from 'motion/react';
import { Facebook, Instagram, Youtube, Send, Music2, HelpCircle } from 'lucide-react';
import { Page } from '../../App';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

type Props = {
  onNavigate?: (page: Page) => void;
};

export default function Footer({ onNavigate }: Props) {
  const [socialLinks, setSocialLinks] = useState({
    facebook: '#',
    instagram: '#',
    youtube: '#',
    tiktok: '#',
    telegram: '#',
  });

  useEffect(() => {
    async function fetchSocialLinks() {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .in('key', [
            'facebook_url',
            'instagram_url',
            'youtube_url',
            'tiktok_url',
            'telegram_url',
          ]);
        if (!error && data) {
          const links = { ...socialLinks };
          data.forEach((item) => {
            if (item.key === 'facebook_url') links.facebook = item.value;
            if (item.key === 'instagram_url') links.instagram = item.value;
            if (item.key === 'youtube_url') links.youtube = item.value;
            if (item.key === 'tiktok_url') links.tiktok = item.value;
            if (item.key === 'telegram_url') links.telegram = item.value;
          });
          setSocialLinks(links);
        }
      } catch (err) {
        
      }
    }
    fetchSocialLinks();
  }, []);

  return (
    <footer className="bg-[#40687a] dark:bg-[#080d14] text-white pt-16 pb-6 px-4 flex flex-col items-center text-center mt-auto w-full z-10 transition-colors duration-500">
      <div className="flex flex-col items-center mb-8">
        <div className="flex flex-row items-center gap-3 mb-4">
          <div 
            className="w-24 h-12 md:w-32 md:h-16 bg-white group-hover:scale-105 transition-transform duration-500"
            style={{ WebkitMaskImage: `url(${eshrahLogo})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: `url(${eshrahLogo})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }}
            title="إشرح طب"
          />
          <span className="font-black text-4xl md:text-5xl tracking-tight text-white drop-shadow-md font-hero">
            إشرحــ طب
          </span>
        </div>
        <p className="text-white font-bold text-xl drop-shadow-md mt-2">الطب بقى أسهل</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-10 mt-2">
        <button
          onClick={() => onNavigate && onNavigate('faq')}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all font-bold text-lg"
        >
          <HelpCircle className="w-5 h-5" />
          <span>مركز المساعدة والأسئلة الشائعة</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 mb-10 mt-4">
        <span className="font-bold text-lg md:text-xl">تابعنا علي مواقع التواصل :</span>
        <div className="flex gap-4">
          {socialLinks.facebook && socialLinks.facebook !== '#' && (
            <motion.a
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-xl bg-[#3b5998] flex items-center justify-center hover:-translate-y-1 transition-transform shadow-md"
            >
              <Facebook className="w-6 h-6 text-white" fill="currentColor" stroke="none" />
            </motion.a>
          )}
          {socialLinks.instagram && socialLinks.instagram !== '#' && (
            <motion.a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-500 via-burgundy-500 to-burgundy-500 flex items-center justify-center hover:-translate-y-1 transition-transform shadow-md"
            >
              <Instagram className="w-6 h-6 text-white" />
            </motion.a>
          )}
          {socialLinks.youtube && socialLinks.youtube !== '#' && (
            <motion.a
              href={socialLinks.youtube}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-xl bg-[#ff0000] flex items-center justify-center hover:-translate-y-1 transition-transform shadow-md"
            >
              <Youtube className="w-6 h-6 text-white" />
            </motion.a>
          )}
          {socialLinks.tiktok && socialLinks.tiktok !== '#' && (
            <motion.a
              href={socialLinks.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-xl bg-black flex items-center justify-center hover:-translate-y-1 transition-transform shadow-md"
            >
              <Music2 className="w-6 h-6 text-white" />
            </motion.a>
          )}
          {socialLinks.telegram && socialLinks.telegram !== '#' && (
            <motion.a
              href={socialLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-xl bg-[#0088cc] flex items-center justify-center hover:-translate-y-1 transition-transform shadow-md"
            >
              <Send className="w-6 h-6 text-white" fill="currentColor" />
            </motion.a>
          )}
        </div>
      </div>

      <div className="w-full max-w-3xl border-t-2 border-burgundy-300/20 dark:border-slate-800 pt-8">
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-bold text-burgundy-100 dark:text-slate-300">
            أكاديمية إشرحــ طب
          </p>
          <img 
            src={madeByLogo} 
            alt="صنع بواسطة" 
            className="w-24 sm:w-32 h-auto object-contain mt-4 drop-shadow-sm hover:scale-105 transition-transform duration-300"
          />
          <div className="flex items-center gap-2 mt-2 text-sm font-medium text-burgundy-200 dark:text-slate-400">
            <span>صنع بكل حب بواسطة</span>
            <motion.a
              href="https://www.facebook.com/Sh3ark/"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-950/40 dark:bg-slate-800/80 border border-burgundy-400/30 dark:border-slate-700 rounded-lg hover:bg-burgundy-900/50 dark:hover:bg-slate-800 hover:border-burgundy-400/50 transition-all duration-300 text-white font-bold tracking-wide shadow-sm hover:shadow-burgundy-900/20"
            >
              محمد صبحي
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
}
