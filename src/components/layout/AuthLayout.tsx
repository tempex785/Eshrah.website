import React from 'react';

type Props = {
  children: React.ReactNode;
  imageTitle: string;
  imageUrl: string;
};

export default function AuthLayout({ children, imageTitle, imageUrl }: Props) {
  return (
    <div className="flex-1 flex flex-col md:flex-row w-full max-w-6xl mx-auto items-stretch bg-white dark:bg-[#0b121c] text-slate-900 dark:text-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800/50">
      {/* Form Side */}
      <div className="w-full md:w-1/2 p-6 md:p-12 lg:p-16 flex flex-col justify-center relative z-10 bg-white dark:bg-[#0b121c]">
        {children}
      </div>

      {/* Image Side */}
      <div className="w-full md:w-1/2 relative bg-[#0b121c] hidden md:flex flex-col items-center justify-center p-0 border-l border-gray-100 dark:border-slate-800">
        <div className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden">
          <img src={imageUrl} alt={imageTitle} className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}
