import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Solutions } from '@/components/sections/Solutions';
import { WhyUs } from '@/components/sections/WhyUs';
import { Process } from '@/components/sections/Process';
import { Contact } from '@/components/sections/Contact';

export default function EnterprisePage() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden">
      <Hero />
      <About />
      <Solutions />
      <WhyUs />
      <Process />
      <Contact />
    </main>
  );
}
