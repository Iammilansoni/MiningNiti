import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/sections/hero';
import { Features } from '@/components/sections/features';
import { TechStack } from '@/components/sections/tech-stack';
import { ChatbotDemo } from '@/components/sections/chatbot-demo';
import { ProductShowcase } from '@/components/sections/product-showcase';
import { FAQ } from '@/components/sections/faq';
import { CTA } from '@/components/sections/cta';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <TechStack />
        <ChatbotDemo />
        <ProductShowcase />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
