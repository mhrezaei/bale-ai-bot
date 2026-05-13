'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { Bot, Building2, Download, Zap } from 'lucide-react';
import { Contact } from '@/components/sections/Contact';
import { AICore } from '@/components/ui/AICore';

import { Features } from '@/components/sections/Features';
import { Stats } from '@/components/sections/Stats';
import { WhyUs } from '@/components/sections/WhyUs';

const services = [
  {
    title: 'بات هوش مصنوعی بله',
    description: 'دسترسی نامحدود به پیشرفته‌ترین مدل‌های هوش مصنوعی جهان در پیام‌رسان بله؛ بدون محدودیت اینترنت، گفتگوی متنی، صوتی و تولید تصویر.',
    icon: Bot,
    href: '/bale-bot',
    color: 'from-[#00f2ff] to-[#00b8ff]',
    btn: 'شروع در بله'
  },
  {
    title: 'ارائه راهکارهای سازمانی',
    description: 'پیاده‌سازی هوشمندترین معماری‌های پردازش داده و اتوماسیون سازمانی مبتنی بر AI، بهینه‌سازی شده برای فرآیندها و نیازهای منحصربه‌فرد شما.',
    icon: Building2,
    href: '/enterprise',
    color: 'from-[#bc00ff] to-[#7f00ff]',
    btn: 'آشنایی با خدمات سازمانی'
  },
  {
    title: 'دانلود مستقیم مدل‌های متن‌باز',
    description: 'مخزن بزرگی از جدیدترین مدل‌های پردازشی دنیا (Llama, Mistral, SD) قابل دانلود با لینک مستقیم از سرورهای اختصاصی شبکه ملی.',
    icon: Download,
    href: '/models',
    color: 'from-[#ff0055] to-[#ff0099]',
    btn: 'ورود به مخزن مدل‌ها'
  },
  {
    title: 'اشتراک حساب پلتفرم‌های جهانی',
    description: 'دسترسی سریع، ارزان و بدون دغدغه به اکانت‌های پریمیوم سرویس‌های مطرح دنیا نظیر ChatGPT Plus, Midjourney, Claude و Runway.',
    icon: Zap,
    href: '/subscriptions',
    color: 'from-[#00ff88] to-[#00cc66]',
    btn: 'خرید اشتراک'
  }
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden pt-20">
      
      {/* Hero Home */}
      <section className="relative min-h-[60vh] flex items-center py-20 overflow-hidden">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80%] h-[80%] bg-[radial-gradient(ellipse_at_top,#bc00ff33_0%,transparent_60%)] -z-10 pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 text-[14px] text-[#00f2ff] font-medium tracking-wide"
          >
            اکوسیستم جامع خدمات تکنولوژی دان‌یار
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-white via-gray-200 to-gray-500 mb-6 leading-tight max-w-4xl mx-auto"
          >
            دستیار هوشمند شما در دنیای تکنولوژی
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white opacity-70 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            پلتفرم جامع دان‌یار، مرجعی برای دسترسی یکپارچه به به‌روزترین محصولات و راهکارهای هوش مصنوعی جهت استفاده فردی، تیمی و سازمانی است.
          </motion.p>
          
          <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -z-10 scale-[1.5] opacity-20">
            <AICore />
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.href}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative bg-[#0a0a0f] border border-white/10 p-8 md:p-10 rounded-[24px] overflow-hidden hover:border-white/20 transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                >
                  <div className={`absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-br ${service.color} opacity-5 blur-[80px] group-hover:opacity-10 transition-opacity duration-500 pointer-events-none rounded-full transform translate-x-1/2 -translate-y-1/2`} />
                  
                  <div className={`w-[60px] h-[60px] rounded-[16px] flex items-center justify-center mb-8 bg-gradient-to-br ${service.color} bg-opacity-10 shadow-lg relative`}>
                    <div className="absolute inset-0 bg-black/40 rounded-[16px]" />
                    <Icon className="w-8 h-8 text-white relative z-10" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
                  <p className="text-[15px] leading-[1.8] text-white opacity-60 mb-8 min-h-[80px]">
                    {service.description}
                  </p>
                  
                  <Link 
                    href={service.href}
                    className="inline-flex items-center gap-2 text-[15px] font-bold text-white transition-all hover:gap-3 group-hover:text-[#00f2ff]"
                  >
                    {service.btn}
                    <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <Features />
      <Stats />
      <WhyUs />

      <Contact />
    </main>
  );
}
