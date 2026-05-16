import type {Metadata} from 'next';
import { Vazirmatn } from 'next/font/google';
import { Toaster } from 'sonner';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import './globals.css';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  variable: '--font-vazirmatn',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'دان‌یار (DanYar) | پلتفرم جامع هوش مصنوعی',
  description: 'دستیار هوشمند شما در دنیای تکنولوژی. ارائه راهکارهای سازمانی، بات هوشمند بله، اشتراک پلتفرم‌های جهانی و مدل‌های متن‌باز.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} dark`} suppressHydrationWarning>
      <body className="font-sans bg-[#050508] text-slate-50 antialiased selection:bg-cyan-500/30" suppressHydrationWarning>
        <Navbar />
        {children}
        <Footer />
        <Toaster position="top-center" theme="dark" dir="rtl" />
      </body>
    </html>
  );
}
