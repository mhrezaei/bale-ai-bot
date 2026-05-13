'use client';

import { motion } from 'motion/react';
import { Download, HardDrive, Shield, Sparkles } from 'lucide-react';

import { Contact } from '@/components/sections/Contact';
import { AICore } from '@/components/ui/AICore';
import Link from 'next/link';

const modelsList = [
  { name: 'Llama 3 (8B / 70B)', corp: 'Meta', params: '8B/70B', type: 'LLM' },
  { name: 'Mistral 8x22B', corp: 'Mistral AI', params: '141B', type: 'LLM (MoE)' },
  { name: 'Mixtral 8x7B', corp: 'Mistral AI', params: '47B', type: 'LLM (MoE)' },
  { name: 'Gemma 2 (9B / 27B)', corp: 'Google', params: '9B/27B', type: 'LLM' },
  { name: 'Phi-3 Mini / Medium', corp: 'Microsoft', params: '3.8B/14B', type: 'LLM' },
  { name: 'Qwen 2.5 (72B)', corp: 'Alibaba', params: '72B', type: 'LLM' },
  { name: 'Stable Diffusion 3 Medium', corp: 'Stability AI', params: '2B', type: 'Image Gen' },
  { name: 'SDXL 1.0', corp: 'Stability AI', params: '6.6B', type: 'Image Gen' },
  { name: 'Whisper v3', corp: 'OpenAI', params: '1.5B', type: 'Audio ASR' },
  { name: 'SeamlessM4T v2', corp: 'Meta', params: '2.3B', type: 'Audio/Text' },
  { name: 'LLaVA 1.5', corp: 'Haotian Liu', params: '13B', type: 'Multimodal' },
  { name: 'Qwen-VL-Chat', corp: 'Alibaba', params: '10B', type: 'Multimodal' },
  { name: 'DeepSeek Coder V2', corp: 'DeepSeek', params: '16B', type: 'Code LLM' },
  { name: 'CodeLlama 70B', corp: 'Meta', params: '70B', type: 'Code LLM' },
  { name: 'Yi-34B', corp: '01.AI', params: '34B', type: 'LLM' },
  { name: 'Zephyr-7B-Beta', corp: 'HuggingFace', params: '7B', type: 'Chat LLM' },
  { name: 'OpenChat 3.5', corp: 'OpenChat', params: '7B', type: 'Chat LLM' },
  { name: 'AuraFlow', corp: 'Fal AI', params: '3B', type: 'Image Gen' },
  { name: 'PlayHT/Voice', corp: 'PlayHT', params: '1B', type: 'Text To Speech' },
  { name: 'Parquet/Parler TTS', corp: 'HuggingFace', params: '---', type: 'Text To Speech' },
];

export default function ModelsPage() {
  return (
    <main className="min-h-screen py-24 bg-[#050508] relative overflow-hidden">
      
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,#bc00ff15_0%,transparent_60%)] -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-4xl mx-auto mb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#bc00ff]/30 bg-[#bc00ff]/10 mb-6"
          >
            <Sparkles className="w-4 h-4 text-[#bc00ff]" />
            <span className="text-[14px] text-[#bc00ff] font-medium tracking-wide">هاست اختصاصی داخل ایران (اینترانت)</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-5xl font-extrabold text-white mb-6 leading-tight"
          >
            دانلود مستقیم مجهزترین <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#bc00ff] to-[#00f2ff]">مدل‌های متن‌باز هوش مصنوعی</span>
          </motion.h1>

          <p className="text-lg text-white opacity-70 leading-relaxed max-w-2xl mx-auto mb-8">
            ما در دان‌یار مخزنی از جدیدترین وزن‌های (Weights) مدل‌های زبانی، پردازش تصویر و صوت برای شما فراهم کرده‌ایم تا بدون دغدغه تحریم و سرعت نت، مستقیماً دانلود کنید.
          </p>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 scale-[1.5] opacity-[0.15]">
            <AICore />
          </div>
        </div>

        {/* Feature row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
          {[
            { icon: Download, title: 'دانلود پرسرعت از ایران', desc: 'سرورهای میزبانی شده در شبکه ملی اطلاعات' },
            { icon: Shield, title: 'فایل‌های تایید شده', desc: 'تضمین اصالت فایل‌ها (Hash Verified)' },
            { icon: HardDrive, title: 'فرمت‌های متنوع', desc: 'GGUF, Safetensors, و Pth آماده اجرا' },
          ].map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (i*0.1) }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 mx-auto bg-gradient-to-b from-[#00f2ff]/20 to-transparent border border-[#00f2ff]/20 rounded-xl flex items-center justify-center mb-4">
                 <f.icon className="w-6 h-6 text-[#00f2ff]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-white/50">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* The List */}
        <div className="max-w-5xl mx-auto overflow-x-auto pb-16">
          <motion.table 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-full text-left border-collapse" 
            dir="ltr"
          >
            <thead>
              <tr className="border-b border-white/10 text-white/50 text-sm font-medium">
                <th className="py-4 px-6 uppercase tracking-wider">Model Name</th>
                <th className="py-4 px-6 uppercase tracking-wider">Creator</th>
                <th className="py-4 px-6 uppercase tracking-wider">Type / Params</th>
                <th className="py-4 px-6 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {modelsList.map((model) => (
                <tr key={model.name} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 px-6 text-white font-medium">{model.name}</td>
                  <td className="py-4 px-6 text-white/60">{model.corp}</td>
                  <td className="py-4 px-6">
                    <span className="inline-block px-2.5 py-1 bg-white/5 text-[#bc00ff] text-[11px] rounded flex-inline items-center whitespace-nowrap">
                      {model.type} | {model.params}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right cursor-not-allowed">
                    <button className="px-4 py-2 bg-transparent border border-[#00f2ff]/50 text-[#00f2ff] hover:bg-[#00f2ff] hover:text-[#050508] shadow-[0_0_10px_rgba(0,242,255,0)] hover:shadow-[0_0_15px_rgba(0,242,255,0.4)] rounded-lg text-sm font-bold transition-all inline-flex items-center gap-2 cursor-pointer">
                      دانلود
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </motion.table>
        </div>

        {/* Fair Usage Policy & Premium Upsell */}
        <div className="max-w-5xl mx-auto mb-20 bg-gradient-to-r from-[#0a0a0f] to-[#1a1a24] border border-[#00f2ff]/20 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f2ff]/10 blur-[50px] mix-blend-screen" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#00f2ff]" />
                ارتقا به پلن پریمیوم شبکه دان‌یار
              </h3>
              <p className="text-white/70 leading-relaxed mb-4">
                برای رعایت مصرف منصفانه (Fair Usage)، سرعت دانلود در پلن رایگان به <strong>۵ مگابیت بر ثانیه</strong> محدود شده است و امکان دانلود موازی وجود ندارد. با تهیه یکی از اشتراک‌های شبکه دان‌یار، می‌توانید بدون محدودیت سرعت (بیش از ۱۰۰ مگابیت) و به صورت همزمان فایل‌های حجیم هوش مصنوعی را دانلود کنید.
              </p>
              <ul className="text-white/60 text-sm space-y-2 mb-6">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#bc00ff]"></span> دانلود با حداکثر سرعت پورت (10Gbps Backend)</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#bc00ff]"></span> پشتیبانی از Resume و دانلود همزمان (IDM)</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#bc00ff]"></span> دسترسی زودهنگام به مدل‌های جدید (Early Access)</li>
              </ul>
            </div>

            <div className="shrink-0 w-full md:w-auto text-center md:text-right">
              <Link 
                href="/subscriptions"
                className="inline-flex justify-center items-center px-[32px] py-[16px] bg-[#00f2ff] text-[#050508] border-none shadow-[0_0_20px_rgba(0,242,255,0.4)] rounded-[12px] text-[16px] font-bold transition-all hover:opacity-90 hover:scale-105"
              >
                تهیه اشتراک پریمیوم دان‌یار
              </Link>
            </div>
          </div>
        </div>

      </div>
      <Contact />
    </main>
  );
}
