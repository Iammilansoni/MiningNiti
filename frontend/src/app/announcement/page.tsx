import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';


export default function AnnouncementPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#05030A]">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-24 px-6 text-center">
        <div className="max-w-3xl w-full mx-auto relative z-10">
          <div className="mb-8 inline-flex items-center justify-center rounded-full border border-[rgba(148,122,252,0.32)] bg-[color-mix(in_srgb,var(--color-purple-400)_11%,#FAF7F2)] px-4 py-1.5 text-sm font-medium text-purple-400">
            New Release
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            MiningNiti OS 2.0 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">is live</span>
          </h1>
          
          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
            Automated compliance auditing against DGMS 2024 standards. We are excited to announce our biggest update yet, bringing you state-of-the-art tools to streamline mining document intelligence and compliance.
          </p>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-3">DGMS 2024 Auditing</h3>
              <p className="text-white/60">Fully automated compliance checks against the latest regulatory standards, ensuring your operations remain safe and legal.</p>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-3">Enhanced AI Models</h3>
              <p className="text-white/60">Powered by the latest Gemini 2.0 architecture, delivering unprecedented accuracy in document understanding and extraction.</p>
            </div>
          </div>
          
          <div className="mt-16">
            <a href="/dashboard" className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-[15px] font-semibold text-black transition-all hover:bg-purple-400 hover:text-white hover:shadow-[0_0_30px_rgba(148,122,252,0.4)]">
              Go to Dashboard
            </a>
          </div>
        </div>
        
        {/* Background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none z-0" />
      </main>

      <Footer />
    </div>
  );
}
