'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-[#050508]/80 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6 border-b border-white/10'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-[28px] font-black tracking-[2px] bg-gradient-to-tr from-[#00f2ff] to-[#bc00ff] bg-clip-text text-transparent group-hover:drop-shadow-[0_0_15px_rgba(0,242,255,0.5)] transition-all">
                DonYar
              </span>
              <div className="flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-md px-2 py-0.5 mt-1 shadow-[0_0_10px_rgba(188,0,255,0.2)]">
                <Sparkles className="w-3 h-3 text-[#bc00ff] mr-1" />
                <span className="text-[10px] font-extrabold text-white tracking-widest uppercase">AI</span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center gap-[25px] text-[14px] font-medium">
              {[
                { href: '/bale-bot', label: 'بات هوشمند بله' },
                { href: '/enterprise', label: 'هوش مصنوعی سازمانی' },
                { href: '/models', label: 'مدل‌های متن‌باز' },
                { href: '/subscriptions', label: 'اشتراک پلتفرم‌ها' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors relative py-2 ${
                    pathname === link.href ? 'text-[#00f2ff]' : 'text-white/80 hover:text-[#00f2ff]'
                  }`}
                >
                  {link.label}
                  {pathname === link.href && (
                    <motion.div 
                      layoutId="nav-pill"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00f2ff] to-transparent"
                    />
                  )}
                </Link>
              ))}
              <Link href="/about" className="text-white/80 hover:text-[#00f2ff] transition-colors py-2">درباره ما</Link>
              <a href="#contact" className="text-white/80 hover:text-[#00f2ff] transition-colors py-2">تماس با ما</a>
            </nav>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-white/80 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#050508]/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col h-full right-0 left-0 absolute inset-0">
              <div className="p-4 flex justify-between items-center border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-[28px] font-black tracking-[2px] bg-gradient-to-r from-[#bc00ff] to-[#00f2ff] bg-clip-text text-transparent">DonYar</span>
                  <div className="flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-md px-2 py-0.5 mt-1">
                    <span className="text-[10px] font-extrabold text-white tracking-widest uppercase">AI</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-white/50 hover:text-white bg-white/5 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 flex flex-col justify-center items-center gap-8 p-6 text-xl bg-[#050508]">
                <Link href="/bale-bot" onClick={() => setIsMobileMenuOpen(false)} className={`transition-colors ${pathname === '/bale-bot' ? 'text-[#00f2ff] font-bold' : 'text-white/80 hover:text-[#00f2ff]'}`}>بات هوشمند بله</Link>
                <Link href="/enterprise" onClick={() => setIsMobileMenuOpen(false)} className={`transition-colors ${pathname === '/enterprise' ? 'text-[#00f2ff] font-bold' : 'text-white/80 hover:text-[#00f2ff]'}`}>هوش مصنوعی سازمانی</Link>
                <Link href="/models" onClick={() => setIsMobileMenuOpen(false)} className={`transition-colors ${pathname === '/models' ? 'text-[#00f2ff] font-bold' : 'text-white/80 hover:text-[#00f2ff]'}`}>مدل‌های متنوع متن‌باز</Link>
                <Link href="/subscriptions" onClick={() => setIsMobileMenuOpen(false)} className={`transition-colors ${pathname === '/subscriptions' ? 'text-[#00f2ff] font-bold' : 'text-white/80 hover:text-[#00f2ff]'}`}>اشتراک ویژه پلتفرم‌ها</Link>
                <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-white/80 hover:text-[#00f2ff]">درباره ما</Link>
                <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="text-white/80 hover:text-[#00f2ff]">تماس با ما</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
