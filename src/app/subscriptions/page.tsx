'use client';

import { motion } from 'motion/react';
import { Target, Zap, Server, Activity, ArrowLeft } from 'lucide-react';
import { Contact } from '@/components/sections/Contact';
import { AICore } from '@/components/ui/AICore';

const subscriptions = [
  { name: 'ChatGPT Plus', price: '۴,۵۰۰,۰۰۰', features: ['GPT-4 & GPT-4o', 'DALL·E 3 Image Gen', 'Advanced Data Analysis'] },
  { name: 'Claude Pro', price: '۴,۵۰۰,۰۰۰', features: ['Claude 3 Opus', 'Claude 3.5 Sonnet', '200K Context Window'] },
  { name: 'Midjourney Basic', price: '۲,۲۵۰,۰۰۰', features: ['Standard generation', 'Fast GPU time (limited)', 'Commercial Usage'] },
  { name: 'Midjourney Standard', price: '۷,۰۰۰,۰۰۰', features: ['15hr Fast GPU time', 'Unlimited Relax GPU', 'Commercial Usage'] },
  { name: 'Runway Gen-3 (Pro)', price: '۸,۵۰۰,۰۰۰', features: ['Gen-3 Alpha Access', 'Unlimited Video Gen', 'High-res Upscaling'] },
  { name: 'ElevenLabs (Starter)', price: '۱,۲۵۰,۰۰۰', features: ['30,000 characters/mo', 'Voice Cloning', 'Commercial License'] },
  { name: 'Pika.art Pro', price: '۷,۵۰۰,۰۰۰', features: ['Unlimited generations', 'Lip sync features', 'Commercial rights'] },
  { name: 'Adobe Firefly', price: '۲,۵۰۰,۰۰۰', features: ['Generative Credits', 'Text to Image', 'Generative Fill'] },
  { name: 'Suno AI (Pro)', price: '۲,۵۰۰,۰۰۰', features: ['500 songs / month', 'Commercial Terms', 'Priority processing'] },
  { name: 'Perplexity Pro', price: '۴,۵۰۰,۰۰۰', features: ['Unlimited Copilot uses', 'Upgraded AI models', 'API Access'] },
  { name: 'Leonardo.ai', price: '۲,۷۵۰,۰۰۰', features: ['8,500 tokens / month', 'Fast generation', 'Private generation'] },
  { name: 'Udio Music (Standard)', price: '۲,۵۰۰,۰۰۰', features: ['Professional Audio', 'High priority', 'Commercial rights'] },
];

export default function SubscriptionsPage() {
  return (
    <main className="min-h-screen py-24 bg-[#050508] relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-[radial-gradient(ellipse_at_top,#00f2ff15_0%,transparent_70%)] -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-20 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 mx-auto bg-gradient-to-br from-[#00f2ff]/20 to-[#bc00ff]/20 rounded-2xl flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_30px_rgba(0,242,255,0.2)]"
          >
            <Server className="w-8 h-8 text-[#00f2ff]" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight"
          >
            مرکز تخصصی محاسبات و زیرساخت <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] to-[#bc00ff]">اشتراک‌های ویژه دان‌یار</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white opacity-70 leading-relaxed max-w-3xl mx-auto mb-10"
          >
            تأمین اشتراک‌های ویژه پلتفرم‌های تراز اول جهان و میزبانی محلی سنگین‌ترین مدل‌های متن‌باز در شبکه پایدار ایران.
          </motion.p>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 scale-[1.2] opacity-[0.2]">
            <AICore />
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          {subscriptions.map((sub, index) => (
            <motion.div
              key={sub.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#0a0a0f] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#00f2ff]/50 hover:shadow-[0_0_30px_rgba(0,242,255,0.1)] transition-all duration-300 flex flex-col"
            >
              {/* Highlight line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:from-transparent group-hover:via-[#00f2ff] group-hover:to-transparent transition-all duration-500" />
              
              <div className="mb-6">
                <div className="text-[10px] uppercase tracking-widest text-[#00f2ff] mb-2 font-mono flex items-center justify-between">
                  <span>LIVE_UPDATE // 2026</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-wide">{sub.name}</h3>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-3xl font-black">{sub.price}</span>
                </div>
                <div className="text-sm text-white/40 mt-1">Toman / Monthly</div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {sub.features.map((feature, i) => (
                  <li key={i} className="flex gap-2 text-sm text-white/60 items-start">
                    <Target className="w-4 h-4 text-[#bc00ff] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a href="#contact" className="w-full flex justify-center items-center py-3 bg-white/5 hover:bg-[#00f2ff] hover:text-[#0a0a0f] text-white border border-white/10 hover:border-[#00f2ff] rounded-xl font-bold transition-all mt-auto shadow-[0_0_0_0_rgba(0,242,255,0)] hover:shadow-[0_0_20px_rgba(0,242,255,0.4)]">
                تهیه اشتراک
              </a>
            </motion.div>
          ))}
        </div>

        {/* Enterprise Up-sell */}
        <div className="max-w-4xl mx-auto mt-20 mb-32 bg-[#050508] border border-[#bc00ff]/20 rounded-[24px] p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#bc00ff]/10 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00f2ff]/10 blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-right">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">نیاز به اکانت سازمانی یا API اختصاصی دارید؟</h3>
              <p className="text-white/60">شرکت‌ها و تیم‌های توسعه‌دهنده می‌توانند از سرویس اختصاصی API پلتفرم دان‌یار به همراه پشتیبانی ۲۴/۷ و پرداخت ریالی فاکتور رسمی استفاده کنند.</p>
            </div>
            <a href="#contact" className="shrink-0 flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/20 hover:bg-white/10 hover:border-[#bc00ff]/50 rounded-xl transition-all text-white font-bold">
              تماس با بخش فروش
              <ArrowLeft className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
      <Contact />
    </main>
  );
}
