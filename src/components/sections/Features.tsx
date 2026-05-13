'use client';

import { motion } from 'motion/react';
import { Layers, Zap, Fingerprint, Globe } from 'lucide-react';

const features = [
  {
    title: 'پردازش فوق‌سریع و پایدار',
    description: 'زیرساخت‌های ما با بهره‌گیری از آخرین نسل سرورهای پردازشی، خروجی‌ها را در کسری از ثانیه و با پایداری ۹۹.۹٪ به شما تحویل می‌دهند.',
    icon: Zap,
    gradient: 'from-[#00f2ff] to-[#0088ff]',
  },
  {
    title: 'دسترس‌پذیری بدون مرز (آنتی‌تحریم)',
    description: 'تمامی سرویس‌های دان‌یار از داخل ایران بدون نیاز به ابزارهای تغییر آی‌پی و هیچ‌گونه محدودیت پهنای باندی در دسترس هستند.',
    icon: Globe,
    gradient: 'from-[#bc00ff] to-[#6a00ff]',
  },
  {
    title: 'امنیت و حفظ حریم خصوصی',
    description: 'داده‌های سازمانی و شخصی شما با پیشرفته‌ترین استانداردهای رمزنگاری محافظت می‌شوند و برای آموزش مدل‌های عمومی استفاده نخواهند شد.',
    icon: Fingerprint,
    gradient: 'from-[#00ff88] to-[#00cc00]',
  },
  {
    title: 'چند‌مدالته (Multi-modal)',
    description: 'پردازش همزمان متن، صدا، تصویر و کد. با دان‌یار می‌توانید یک دستیار همه‌کاره با توانایی درک عمیق هر نوع ورودی در اختیار داشته باشید.',
    icon: Layers,
    gradient: 'from-[#ff0055] to-[#ff00aa]',
  },
];

export function Features() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#0A0A0F]">
      <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-[#00f2ff] animate-pulse" />
              قابلیت‌ها و ویژگی‌های کلیدی
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-extrabold text-white leading-tight"
            >
              قدرت هوش مصنوعی، <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#bc00ff] to-[#00f2ff]">بدون محدودیت در دستان شما</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/60 max-w-lg md:text-right"
          >
            ما با تجمیع بهترین مدل‌های دنیا و بومی‌سازی زیرساخت، تجربه‌ای یکپارچه و امن از هوش مصنوعی برای کاربران ایرانی فراهم کرده‌ایم.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-[#050508] p-8 md:p-10 rounded-[32px] border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden"
              >
                <div className={`absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-bl ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-700 blur-[60px] rounded-full pointer-events-none`} />
                <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${feature.gradient} opacity-50 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700`} />
                
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 relative z-10 transition-transform duration-500 group-hover:-translate-y-2`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-20 rounded-2xl blur-md`} />
                  <div className="absolute inset-0 bg-[#0a0a0f] rounded-2xl border border-white/10" />
                  <Icon className="w-6 h-6 text-white relative z-10" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4 relative z-10">{feature.title}</h3>
                <p className="text-[15px] leading-[1.8] text-white/60 relative z-10">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
