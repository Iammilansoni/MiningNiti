import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/footer';

export default function CareersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0B]">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-24 text-center px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(148,122,252,0.1)_0%,transparent_60%)] pointer-events-none" />
        <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-bold tracking-tight text-white mb-6 leading-none">Join the Team</h1>
        <p className="text-lg text-white/50 max-w-xl mx-auto">
          Help us solve the hardest data problems in the industrial world. Careers page is coming soon.
        </p>
      </main>
      <Footer />
    </div>
  );
}
