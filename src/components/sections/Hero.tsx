'use client';

import { motion } from 'motion/react';
import { ArrowLeft, Brain } from 'lucide-react';
import { AICore } from '@/components/ui/AICore';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      {/* Background glow specific to the new theme */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[radial-gradient(circle,#bc00ff22_0%,transparent_70%)] -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-center h-full">
        
        {/* Left Content */}
        <div className="flex flex-col justify-center text-right lg:text-right z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm uppercase tracking-[2px] text-[#00f2ff] font-bold mb-4"
          >
            آینده کسب‌وکار شما، امروز
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[40px] md:text-5xl lg:text-6xl font-extrabold leading-[1.2] mb-6 bg-gradient-to-l from-white to-[#999] bg-clip-text text-transparent max-w-2xl"
          >
            هوش مصنوعی در خدمت مقیاس‌پذیری و نوآوری سازمان شما
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[18px] leading-[1.6] opacity-70 mb-10 max-w-[550px] text-white"
          >
            ما در دان‌یار (DonYar) راهکارهای اختصاصی هوش مصنوعی را برای چالش‌های واقعی کسب‌وکار شما طراحی و پیاده‌سازی می‌کنیم. از آنالیز داده تا اتوماسیون هوشمند، ما شریک تکنولوژی شما هستیم.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-[15px]"
          >
            <a
              href="#contact"
              className="inline-flex justify-center items-center px-[28px] py-[14px] bg-[#00f2ff] text-[#050508] border-none shadow-[0_0_20px_rgba(0,242,255,0.3)] rounded-[8px] text-[16px] font-semibold transition-all hover:opacity-90"
            >
              درخواست مشاوره رایگان
            </a>
            <a
              href="#solutions"
              className="inline-flex justify-center items-center px-[28px] py-[14px] bg-white/5 text-white border border-white/20 rounded-[8px] text-[16px] font-semibold transition-all hover:bg-white/10"
            >
              مشاهده راهکارها
            </a>
          </motion.div>

          {/* Mini Stats (from design) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex gap-10 mt-12"
          >
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">۹۰٪+</span>
              <span className="text-[11px] text-[#00f2ff] uppercase tracking-[1px]">دقت مدل‌ها</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">۲۴/۷</span>
              <span className="text-[11px] text-[#00f2ff] uppercase tracking-[1px]">پشتیبانی هوشمند</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">۴۰٪</span>
              <span className="text-[11px] text-[#00f2ff] uppercase tracking-[1px]">کاهش هزینه‌ها</span>
            </div>
          </motion.div>
        </div>

        {/* Right Visual Area (AI Core) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative flex items-center justify-center lg:justify-end min-h-[400px]"
        >
          <AICore />
        </motion.div>
        
      </div>
    </section>
  );
}

