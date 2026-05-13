import { Navbar } from '@/components/ui/Navbar';
import { About } from '@/components/sections/About';
import { WhyUs } from '@/components/sections/WhyUs';
import { Contact } from '@/components/sections/Contact';

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden pt-20">
      <About />
      <WhyUs />
      <Contact />
    </main>
  );
}
