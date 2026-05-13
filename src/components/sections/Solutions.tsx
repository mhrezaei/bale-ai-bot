'use client';

import { motion } from 'motion/react';
import { 
  Megaphone, 
  Database, 
  LineChart, 
  Bot
} from 'lucide-react';

const solutions = [
  {
    title: 'بازاریابی هوشمند',
    en: 'AI-Driven Marketing',
    icon: Megaphone,
    description: 'شخصی‌سازی کمپین‌ها و تولید محتوای داینامیک در لحظه برای جذب حداکثری مخاطب.',
  },
  {
    title: 'آنالیز کلان‌داده',
    en: 'Big Data Analytics',
    icon: Database,
    description: 'استخراج الگوهای پنهان برای تصمیم‌گیری استراتژیک از میان حجم انبوهی از داده‌های خام.',
  },
  {
    title: 'رفتارسنجی',
    en: 'Predictive Behavior',
    icon: LineChart,
    description: 'پیش‌بینی ریزش مشتریان و تحلیل احساسات کاربران با دقت بالای ۹۰ درصد.',
  },
  {
    title: 'ایجنت‌های سازمانی',
    en: 'Enterprise Agents',
    icon: Bot,
    description: 'اتوماسیون فرآیندهای پیچیده و یکپارچگی پیشرفته با سیستم‌های نرم‌افزاری و ERP سازمان.',
  }
];

export function Solutions() {
  return (
    <section id="solutions" className="py-24 relative bg-[#050508]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            راهکارهای هوش مصنوعی <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#bc00ff] to-[#00f2ff]">IAI</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[15px]">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/[0.03] border border-white/[0.08] p-[20px] rounded-[16px] backdrop-blur-[10px]"
              >
                <div className="w-[32px] h-[32px] bg-gradient-to-br from-[#00f2ff] to-[#bc00ff] rounded-[8px] mb-[12px] flex items-center justify-center text-white">
                  <Icon className="w-4 h-4" />
                </div>
                
                <h3 className="text-[16px] font-bold text-[#00f2ff] m-0 mb-[8px]">
                  {solution.title}
                </h3>
                
                <p className="text-[12px] opacity-60 m-0 leading-[1.4] text-white">
                  {solution.description}
                </p>
                
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

