'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Smartphone, MessagesSquare, Mic, ImageIcon, Zap, Bot, Copy, Check } from 'lucide-react';
import Image from 'next/image';

import { Contact } from '@/components/sections/Contact';
import { AICore } from '@/components/ui/AICore';

export default function BaleBotPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('@danyar_bot');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen pt-32 pb-24 bg-[#050508] relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[40%] h-[60%] bg-[radial-gradient(circle,#00f2ff15_0%,transparent_60%)] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-[radial-gradient(circle,#bc00ff15_0%,transparent_60%)] -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-1"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[14px] text-green-400 font-medium tracking-wide">پایدار و بدون نیاز به اینترنت بین‌الملل</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              بات هوش مصنوعی <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] to-[#bc00ff]">دان‌یار روی پیام‌رسان بله</span>
            </h1>

            <p className="text-lg text-white opacity-70 leading-relaxed mb-8 max-w-xl">
              اولین دستیار هوشمند، جامع و بدون فیلتر در بله. با ارسال متن، عکس و یا ویس، پاسخ‌های هوشمندانه دریافت کنید. دان‌یار با قابلیت‌های فراوان خود، امکان دسترسی به پیشرفته‌ترین مدل‌های هوش مصنوعی (نظیر GPT-4o و Midjourney) را در گوشی شما فراهم کرده است.
            </p>

            {/* Pricing Hint */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10 max-w-xl backdrop-blur-md">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#bc00ff]/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#bc00ff]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">پرداخت به میزان مصرف (Pay-as-you-go)</h3>
                  <p className="text-white/60 text-sm">بر اساس تعداد توکن‌های ورودی و خروجی مدل‌ها کسر می‌شود. کیف پول خود را شارژ کنید و فقط به اندازه استفاده بپردازید.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <a 
                href="https://ble.ir/danyar_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#00f2ff] to-blue-600 hover:opacity-90 text-[#050508] font-bold text-lg px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(0,242,255,0.3)] transition-all"
              >
                <Smartphone className="w-6 h-6" />
                شروع چت در بله
              </a>
              <a 
                href="https://ble.ir/danyar_ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-bold text-lg px-8 py-4 rounded-xl backdrop-blur-md transition-all"
              >
                کانال اطلاع‌رسانی
              </a>
            </div>
            
            <div className="mt-8 flex items-center gap-3">
              <span className="text-white/60 text-sm font-medium">آی‌دی بات در بله:</span>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#00f2ff]/40 transition-all text-[#00f2ff] font-medium group cursor-pointer"
              >
                <span dir="ltr">@danyar_bot</span>
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />}
              </button>
            </div>

          </motion.div>

          {/* Features Illustration / Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-2 lg:order-2 relative"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 hover:border-[#00f2ff]/50 hover:shadow-[0_0_30px_rgba(0,242,255,0.15)] transition-all rounded-[20px] p-6 backdrop-blur-sm sm:mt-12 cursor-default group">
                  <MessagesSquare className="w-8 h-8 text-[#00f2ff] mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-white mb-2">چت متنی فوق‌پیشرفته</h3>
                  <p className="text-sm text-white/50 leading-relaxed">مکالمه با به‌روزترین معماری‌های LLM جهان برای حل مسائل پیچیده، برنامه‌نویسی و تولید محتوا.</p>
                </div>
                <div className="bg-white/5 border border-white/10 hover:border-[#bc00ff]/50 hover:shadow-[0_0_30px_rgba(188,0,255,0.15)] transition-all rounded-[20px] p-6 backdrop-blur-sm cursor-default group">
                  <ImageIcon className="w-8 h-8 text-[#bc00ff] mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-white mb-2">تولید و تحلیل تصویر</h3>
                  <p className="text-sm text-white/50 leading-relaxed">ساخت عکس‌های خیره‌کننده با Midjourney، یا ارسال عکس به دان‌یار برای استخراج داده و توضیح محتوا.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 hover:border-[#00ff88]/50 hover:shadow-[0_0_30px_rgba(0,255,136,0.15)] transition-all rounded-[20px] p-6 backdrop-blur-sm cursor-default group">
                  <Mic className="w-8 h-8 text-[#00ff88] mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-white mb-2">درک فایل صوتی (Voice)</h3>
                  <p className="text-sm text-white/50 leading-relaxed">ویس‌های طولانی خود را برای دان‌یار فوروارد کنید تا در کسری از ثانیه تایپ و خلاصه‌سازی کند.</p>
                </div>
                <div className="bg-white/5 border border-[#00f2ff]/30 hover:border-[#00f2ff] shadow-[0_0_20px_rgba(0,242,255,0.1)] hover:shadow-[0_0_40px_rgba(0,242,255,0.2)] transition-all rounded-[20px] p-6 backdrop-blur-sm relative overflow-hidden cursor-default group/card">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00f2ff]/10 to-[#bc00ff]/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 border border-white/20 group-hover/card:border-white/50 transition-colors">
                    <span className="text-xs font-bold text-white">100K+</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">بدون قطعی و تحریم</h3>
                  <p className="text-sm text-white/50 leading-relaxed">میزبانی شده در شبکه بومی؛ همواره متصل، پایدار و با کمترین تاخیر (Latency) ممکن.</p>
                </div>
              </div>
            </div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-tr from-[#00f2ff] to-[#bc00ff] opacity-[0.03] blur-[50px] rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 scale-150 opacity-30">
               <AICore />
            </div>
          </motion.div>

        </div>
      </div>

      {/* Memory Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-32 relative">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-[#00f2ff]/5 blur-[100px] -z-10" />
        <div className="bg-gradient-to-l from-white/[0.02] to-transparent border-r-2 border-[#00f2ff] rounded-2xl p-8 md:p-12 lg:flex lg:items-center lg:gap-16">
          <div className="lg:w-1/2 mb-8 lg:mb-0">
             <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
                  دان‌یار <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] to-[#bc00ff]">حافظه دارد</span>
                </h2>
                <p className="text-lg text-white/70 leading-relaxed">
                  برخلاف اکثر بات‌های تلگرامی و پیام‌رسان‌ها، دان‌یار زمینه‌ی مکالمات شما را به خاطر می‌سپارد. می‌توانید ساعت‌ها در مورد یک موضوع خاص با او گفتگو کنید، او جزئیات قبلی، فایل‌هایی که فرستاده‌اید و کدهایی که نوشته‌اید را یادش می‌ماند و یک مکالمه متصل و پیوسته را برای شما رقم می‌زند.
                </p>
             </motion.div>
          </div>
          <div className="lg:w-1/2">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-[#050508] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f2ff]/20 blur-[50px]" />
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 shrink-0 flex items-center justify-center">U</div>
                  <div className="bg-white/10 border border-white/5 rounded-2xl rounded-tr-sm p-4 text-white/80 text-sm">متن این مقاله که بهت دادم رو یادت هست؟</div>
                </div>
                <div className="flex gap-4 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00f2ff] to-[#bc00ff] shrink-0 flex items-center justify-center p-1.5"><Bot className="text-white w-full h-full" /></div>
                  <div className="bg-[#00f2ff]/10 border border-[#00f2ff]/20 rounded-2xl rounded-tl-sm p-4 text-white/90 text-sm text-right">بله، کاملاً یادم هست! مقاله درباره تاثیر هوش مصنوعی در معماری ابری بود که در ۵ صفحه برای من ارسال کردید. چطور می‌تونم کمک کنم؟</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Up to date models Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-32 relative">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0a0a0f] p-8 md:p-16 text-center">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#00f2ff] opacity-10 blur-[100px]" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#bc00ff] opacity-10 blur-[100px]" />

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
              متصل به پایگاه داده جهانی <br className="hidden md:block"/> و آخرین تکنولوژی‌های AI
            </h2>
            <p className="text-lg text-white/70 leading-relaxed max-w-3xl mx-auto mb-12">
              دان‌یار به طور پیوسته به‌روزرسانی می‌شود. شما همیشه دسترسی مستقیمی به آخرین نسخه‌های ChatGPT, Claude و سایر مدل‌ها خواهید داشت. همچنین قابلیت جستجو در وب به شما اجازه می‌دهد تا اطلاعات لحظه‌ای (مانند قیمت ارز، اخبار روز و ...) را از طریق هوش مصنوعی دریافت کنید.
            </p>
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {['GPT-4o', 'Claude 3.5 Sonnet', 'Midjourney v6', 'Web Search Enabled'].map((item) => (
                <div key={item} className="px-6 py-3 bg-white/5 border border-white/10 rounded-full font-bold text-white/90 shadow-lg hover:border-[#00f2ff]/50 hover:bg-[#00f2ff]/10 hover:text-[#00f2ff] transition-all cursor-default">
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Contact />
    </main>
  );
}
