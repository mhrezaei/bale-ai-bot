'use client';

import { motion } from 'motion/react';
import { Briefcase, ShieldCheck, Rocket, RefreshCcw } from 'lucide-react';

const reasons = [
  {
    title: 'نگاه محصول‌محور، نه صرفاً تکنیکال',
    description: 'ما هوش مصنوعی را برای حل مشکلات واقعی بیزینس شما پیاده می‌کنیم، نه صرفاً برای نمایش تکنولوژی. تمرکز ما بر روی ROI و خلق ارزش است.',
    icon: Briefcase
  },
  {
    title: 'معماری مقیاس‌پذیر و امن',
    description: 'زیرساخت‌های پیاده‌سازی شده توسط ما کاملاً مقیاس‌پذیر، ایزوله و منطبق بر استانداردهای امنیت داده هستند تا خیالتان از بابت دیتای سازمانی راحت باشد.',
    icon: ShieldCheck
  },
  {
    title: 'توسعه چابک (Agile)',
    description: 'ارائه نسخه MVP در سریع‌ترین زمان ممکن برای تست ارزش در بازار و سپس توسعه فازبندی شده بر اساس بازخوردهای واقعی کاربران.',
    icon: Rocket
  },
  {
    title: 'پشتیبانی و مانیتورینگ مستمر',
    description: 'الگوریتم‌های هوش مصنوعی نیاز به نگهداری و آموزش مجدد دارند؛ ما در تمام این مسیر با مانیتورینگ دقیق و به‌روزرسانی مدل‌ها کنار شما هستیم.',
    icon: RefreshCcw
  }
];

export function WhyUs() {
  return (
    <section id="why-us" className="py-24 relative bg-[#0a0a0f] overflow-hidden">
      {/* Decorative lines */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/3"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
              چرا <span className="text-[#00f2ff]">دان‌یار</span> انتخاب درستی است؟
            </h2>
            <p className="text-white opacity-70 text-[18px] mb-8 leading-[1.6]">
              انتخاب یک شریک تکنولوژی در پیاده‌سازی هوش مصنوعی، مهم‌ترین تصمیم شماست. ما با ترکیبی از تخصص، تجربه و تعهد، ریسک پروژه‌های شما را به حداقل می‌رسانیم.
            </p>
            <div className="hidden lg:block relative w-full h-64 bg-white/5 rounded-[16px] border border-white/10 overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/ai-abstract/800/600')] bg-cover bg-center opacity-40 mix-blend-luminosity" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
            </div>
          </motion.div>

          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-[15px]">
            {reasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/[0.03] border border-white/[0.08] p-[20px] rounded-[16px] backdrop-blur-[10px] group transition-all hover:bg-white/5"
                >
                  <div className="w-[32px] h-[32px] bg-gradient-to-br from-[#bc00ff] to-[#00f2ff] text-white rounded-[8px] flex items-center justify-center mb-[12px] opacity-80 group-hover:opacity-100 transition-opacity">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-[16px] font-bold text-[#00f2ff] m-0 mb-[8px]">{reason.title}</h3>
                  <p className="text-[12px] opacity-60 text-white leading-[1.4] m-0">{reason.description}</p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}

