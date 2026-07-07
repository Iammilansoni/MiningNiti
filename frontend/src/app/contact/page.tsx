import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0B]">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-24 text-center px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(148,122,252,0.1)_0%,transparent_60%)] pointer-events-none" />
        <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-bold tracking-tight text-white mb-6 leading-none">Get in Touch</h1>
        <p className="text-lg text-white/50 max-w-xl mx-auto mb-8">
          MiningNiti is a Smart India Hackathon 2023 winning project, recognized by Coal India Limited &amp; CMPDI. Built as a proof of concept for AI-driven document intelligence in the mining industry.
        </p>
        <a href="https://github.com/Iammilansoni/MiningNiti" target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-[15px] font-semibold text-black hover:bg-purple-400 hover:text-white transition-all">
          View on GitHub
        </a>
      </main>
      <Footer />
    </div>
  );
}
