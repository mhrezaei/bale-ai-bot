'use client';

import { motion } from 'motion/react';
import { Search, Compass, GitMerge, TrendingUp } from 'lucide-react';

const steps = [
  {
    number: '۰۱',
    title: 'شناخت و امکان‌سنجی',
    en: 'Discovery',
    description: 'بررسی فرآیندهای فعلی، کیفیت داده‌ها و گلوگاه‌های کسب‌وکار برای یافتن بهترین نقاط اثرگذاری هوش مصنوعی.',
    icon: Search
  },
  {
    number: '۰۲',
    title: 'طراحی معماری و استراتژی',
    en: 'Architecture & Strategy',
    description: 'انتخاب مدل‌های مناسب و طراحی زیرساخت امن و مقیاس‌پذیر.',
    icon: Compass
  },
  {
    number: '۰۳',
    title: 'توسعه و استقرار',
    en: 'Development & Deployment',
    description: 'پیاده‌سازی راهکار، آموزش مدل‌ها با داده‌های شما و ادغام با سیستم‌های فعلی (Integration).',
    icon: GitMerge
  },
  {
    number: '۰۴',
    title: 'بهینه‌سازی و مقیاس‌پذیری',
    en: 'Optimization',
    description: 'مانیتورینگ عملکرد الگوریتم‌ها و بهبود مداوم بر اساس دیتای جدید و بازخورد کاربران.',
    icon: TrendingUp
  }
];

export function Process() {
  return (
    <section id="process" className="py-24 bg-[#050508] relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-extrabold text-white mb-4"
          >
            مسیر تحول شما <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] to-[#bc00ff]">از کجا آغاز می‌شود؟</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white opacity-70 text-[18px]"
          >
            یک رویکرد ساختاریافته و شفاف برای تضمین موفقیت پروژه‌های هوش مصنوعی.
          </motion.p>
        </div>

        <div className="relative max-w-5xl mx-auto pl-4 md:pl-0">
          {/* Vertical line for mobile, horizontal for desktop */}
          <div className="absolute right-8 md:top-1/2 md:right-0 md:left-0 md:h-[1px] md:w-full w-[1px] h-full bg-white/20 md:-translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
            {steps.map((step, index) => {
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="relative flex flex-row md:flex-col items-center md:text-center text-right group"
                >
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#0a0a0f] border border-white/20 shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center relative z-10 group-hover:border-[#00f2ff] transition-all duration-300 ml-6 md:ml-0 md:mb-8">
                    <span className="text-xl font-bold bg-gradient-to-r from-[#00f2ff] to-[#bc00ff] bg-clip-text text-transparent opacity-80 group-hover:opacity-100 transition-opacity">{step.number}</span>
                  </div>
                  
                  <div className="bg-white/[0.03] border border-white/[0.08] p-[16px] rounded-[16px] backdrop-blur-[10px] flex-1 md:w-full">
                    <h3 className="text-[16px] font-bold text-[#00f2ff] mb-2">{step.title}</h3>
                    <div className="text-[10px] font-mono text-white/50 mb-3 uppercase tracking-widest">{step.en}</div>
                    <p className="text-white opacity-60 text-[12px] leading-[1.6]">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

