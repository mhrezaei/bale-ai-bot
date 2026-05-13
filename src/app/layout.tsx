import type {Metadata} from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css'; // Global styles

const vazirmatn = Vazirmatn({
  subsets: ['latin', 'arabic'],
  variable: '--font-vazirmatn',
});

export const metadata: Metadata = {
  title: 'AI Subscription Page',
  description: 'Connection detail & usage',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={vazirmatn.variable} dir="ltr">
      <body className="font-sans antialiased bg-gray-50 text-gray-900" suppressHydrationWarning>{children}</body>
    </html>
  );
}
