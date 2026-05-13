'use client';

import { motion } from 'motion/react';
import { Mail, Phone, Clock, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('درخواست شما ثبت شد', {
        description: 'کارشناسان ما به زودی با شما تماس خواهند گرفت.'
      });
      e.currentTarget.reset();
    }, 1500);
  };

  return (
    <section id="contact" className="py-24 bg-[#0a0a0f] border-t border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
              آماده‌اید تا سازمان خود را به <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] to-[#bc00ff]">هوش مصنوعی</span> مجهز کنید؟
            </h2>
            <p className="text-white opacity-70 text-[18px] mb-10 leading-[1.6]">
              برای دریافت جلسه مشاوره رایگان و بررسی پتانسیل‌های کسب‌وکار خود، فرم زیر را پر کنید یا مستقیماً با ما تماس بگیرید.
            </p>

            <div className="space-y-[15px]">
              <div className="flex items-center gap-4 bg-white/[0.03] p-[20px] rounded-[16px] border border-white/[0.08] backdrop-blur-[10px]">
                <div className="w-[40px] h-[40px] bg-gradient-to-br from-[#00f2ff]/20 to-[#00f2ff]/5 border border-[#00f2ff]/20 text-[#00f2ff] rounded-[8px] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[12px] text-white opacity-50 mb-1 tracking-wider uppercase">ایمیل</div>
                  <a href="mailto:info@icib.ir" className="text-white font-medium hover:text-[#00f2ff] transition-colors">
                    info@icib.ir
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/[0.03] p-[20px] rounded-[16px] border border-white/[0.08] backdrop-blur-[10px]">
                <div className="w-[40px] h-[40px] bg-gradient-to-br from-[#bc00ff]/20 to-[#bc00ff]/5 border border-[#bc00ff]/20 text-[#bc00ff] rounded-[8px] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[12px] text-white opacity-50 mb-1 tracking-wider uppercase">تلفن تماس</div>
                  <a href="tel:+982191077312" className="text-white font-medium hover:text-[#bc00ff] transition-colors" dir="ltr">
                    ۰۲۱-۹۱۰۷۷۳۱۲
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/[0.03] p-[20px] rounded-[16px] border border-white/[0.08] backdrop-blur-[10px]">
                <div className="w-[40px] h-[40px] bg-gradient-to-br from-white/20 to-white/5 border border-white/20 text-white rounded-[8px] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[12px] text-white opacity-50 mb-1 tracking-wider uppercase">ساعات پاسخگویی</div>
                  <div className="text-white font-medium">
                    شنبه تا چهارشنبه، ۹ صبح تا ۵ عصر
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#050508] p-[30px] rounded-[24px] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#bc00ff]/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
            
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[14px] text-white opacity-70 font-medium">نام و نام خانوادگی</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-[8px] px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] transition-all font-sans"
                      placeholder="علی محمدی"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[14px] text-white opacity-70 font-medium">نام سازمان / شرکت</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-[8px] px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] transition-all font-sans"
                      placeholder="شرکت فناوری..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[14px] text-white opacity-70 font-medium">شماره تماس (الزامی)</label>
                    <input 
                      type="tel" 
                      required 
                      dir="ltr"
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-[8px] px-4 py-3 text-left text-white placeholder-white/30 focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] transition-all font-sans"
                      placeholder="0912 345 6789"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[14px] text-white opacity-70 font-medium">ایمیل سازمانی</label>
                    <input 
                      type="email" 
                      dir="ltr"
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-[8px] px-4 py-3 text-left text-white placeholder-white/30 focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] transition-all font-sans"
                      placeholder="ali@company.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] text-white opacity-70 font-medium">شرح مختصری از نیاز یا چالش شما</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-[8px] px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] transition-all font-sans resize-none"
                    placeholder="به دنبال راهکاری برای اتوماسیون فرآیندهای فروش هستیم..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#00f2ff] text-[#050508] shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:opacity-90 font-bold py-[14px] rounded-[8px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-[#050508]/30 border-t-[#050508] rounded-full animate-spin" />
                  ) : (
                    <>
                      ثبت درخواست مشاوره
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

