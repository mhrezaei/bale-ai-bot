'use client';

import { motion } from 'motion/react';
import { Target, Users, Zap } from 'lucide-react';

export function About() {
  return (
    <section id="about" className="py-24 relative overflow-hidden bg-[#050508]">      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 leading-tight">
              برند دان‌یار؛ فراتر از ابزار، <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] to-[#bc00ff]">شریک استراتژیک شما</span>
            </h2>
            <div className="space-y-6 text-white text-[18px] opacity-70 leading-[1.6]">
              <p>
                پیاده‌سازی هوش مصنوعی تنها نصب چند نرم‌افزار نیست؛ بلکه تغییر در DNA کسب‌وکار است. ما تیمی از مهندسین و استراتژیست‌های داده هستیم که با درک عمیق از زیرساخت‌های فناوری و نیازهای بازار، هوش مصنوعی را از یک مفهوم انتزاعی به ابزاری برای خلق ارزش، کاهش هزینه‌ها و افزایش درآمد تبدیل می‌کنیم.
              </p>
              <p>
                هدف ما توانمندسازی سازمان شما برای تصمیم‌گیری‌های داده‌محور و پیشتازی در اقتصاد دیجیتال است. ما با ترکیب دانش فنی و بینش تجاری، راهکارهایی را ارائه می‌دهیم که مستقیماً بر شاخص‌های کلیدی عملکرد (KPI) شما تأثیر می‌گذارند.
              </p>
            </div>
            
            <div className="mt-10 flex gap-4">
              <div className="h-1 w-20 bg-[#00f2ff] rounded-full shadow-[0_0_10px_rgba(0,242,255,0.5)]" />
              <div className="h-1 w-10 bg-[#bc00ff] rounded-full shadow-[0_0_10px_rgba(188,0,255,0.5)]" />
              <div className="h-1 w-4 bg-white/20 rounded-full" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-[15px]"
          >
            <div className="space-y-[15px]">
              <div className="p-[20px] bg-white/[0.03] border border-white/[0.08] rounded-[16px] backdrop-blur-[10px]">
                <div className="w-[32px] h-[32px] bg-gradient-to-br from-[#00f2ff] to-[#00f2ff]/50 rounded-[8px] flex items-center justify-center mb-[12px] text-[#050508]">
                  <Target className="w-5 h-5" />
                </div>
                <div className="text-[24px] font-bold text-white mb-1">+۵۰</div>
                <div className="text-[12px] opacity-60 text-[#00f2ff] uppercase tracking-wider">پروژه سازمانی موفق</div>
              </div>
              <div className="p-[20px] bg-white/[0.03] border border-white/[0.08] rounded-[16px] backdrop-blur-[10px] transform sm:translate-x-4">
                <div className="w-[32px] h-[32px] bg-gradient-to-br from-[#bc00ff] to-[#bc00ff]/50 rounded-[8px] flex items-center justify-center mb-[12px] text-white">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-[24px] font-bold text-white mb-1">۲۰+</div>
                <div className="text-[12px] opacity-60 text-[#00f2ff] uppercase tracking-wider">متخصص هوش مصنوعی</div>
              </div>
            </div>
            
            <div className="space-y-[15px] sm:mt-12">
               <div className="p-[20px] bg-gradient-to-br from-[#00f2ff]/10 to-[#bc00ff]/10 border border-[#bc00ff]/30 rounded-[16px] backdrop-blur-[10px] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00f2ff]/20 to-[#bc00ff]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-[32px] h-[32px] bg-white rounded-[8px] flex items-center justify-center mb-[12px] text-[#050508]">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="text-[24px] font-bold text-white mb-1">3x</div>
                  <div className="text-[12px] opacity-60 text-[#00f2ff] uppercase tracking-wider">افزایش سرعت فرآیندها</div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
