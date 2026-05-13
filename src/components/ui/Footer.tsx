import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#050508] border-t border-white/10 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-center md:text-right hidden opacity-0"></div>
        <div className="flex flex-col justify-center items-center text-[12px] opacity-50 text-white">
          <div className="mb-4 md:mb-0">© 2026 دان‌یار (DonYar). کلیه حقوق محفوظ است.</div>
        </div>
      </div>
    </footer>
  );
}

