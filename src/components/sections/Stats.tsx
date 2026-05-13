'use client';

import { motion } from 'motion/react';
import { Users, MessageSquareText, Cpu, Server } from 'lucide-react';

const stats = [
  { id: 1, name: 'مشتریان فعال', value: '+۵۰۰', icon: Users, color: 'text-[#00f2ff]' },
  { id: 2, name: 'پرسش‌های پاسخ داده شده', value: '+۷۶۱,۰۰۰', icon: MessageSquareText, color: 'text-[#bc00ff]' },
  { id: 3, name: 'توکن پردازش شده', value: '+۱۰M', icon: Cpu, color: 'text-[#ff0055]' },
  { id: 4, name: 'پایداری خدمات (آپتایم)', value: '٪۹۹.۹', icon: Server, color: 'text-[#00ff88]' },
];

export function Stats() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#050508]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,242,255,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold text-white mb-6"
          >
            دان‌یار در یک نگاه
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/60 max-w-2xl mx-auto"
          >
            اعداد و ارقامی که نشان‌دهنده اعتماد شما و تعهد ما به ارائه بهترین خدمات در حوزه هوش مصنوعی است.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/[0.02] border border-white/5 rounded-[24px] p-8 text-center hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 relative group overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full ${stat.color.replace('text-', 'bg-')}`} />
                <div className="w-16 h-16 mx-auto bg-white/[0.05] rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight" dir="ltr">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-white/60 font-medium">
                  {stat.name}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
