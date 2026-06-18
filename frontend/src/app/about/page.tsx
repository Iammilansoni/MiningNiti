import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Shield, Target, Cpu, Users } from 'lucide-react';

export default function AboutPage() {
  const values = [
    { icon: Shield, title: 'Absolute Data Sovereignty', desc: 'We build for environments where data leaks are catastrophic. Our models deploy entirely within your VPC or on-premise iron.' },
    { icon: Target, title: 'Domain Precision', desc: 'Generalist AI hallucinate. MiningNiti is pre-trained exclusively on geological, regulatory, and operational mining context.' },
    { icon: Cpu, title: 'Engineered for Scale', desc: 'Built to ingest terabytes of legacy paper scans, complex tables, and unstructured logs without buckling.' },
    { icon: Users, title: 'Augment, Not Replace', desc: 'We capture the institutional knowledge of retiring senior engineers and make it instantly accessible to the next generation.' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0B]">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        
        {/* Header */}
        <section className="relative px-6 py-20 text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[radial-gradient(circle,rgba(148,122,252,0.1)_0%,transparent_60%)] pointer-events-none" />
          <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#947AFC] mb-6 relative z-10">Our Mission</p>
          <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold tracking-tight text-white mb-6 leading-[1.05] relative z-10 max-w-4xl mx-auto">
            Bringing structure to the industrial world's dark data.
          </h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto relative z-10 leading-relaxed">
            Mining operations sit on decades of unstructured intelligence — paper logs, PDFs, scattered reports. We exist to turn that dead archive into a live, queryable brain.
          </p>
        </section>

        {/* The Story */}
        <section className="py-20 border-t border-white/[0.08] bg-white/[0.02]">
          <div className="max-w-[1000px] mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">The infrastructure gap in heavy industry.</h2>
              <div className="space-y-4 text-[15px] text-white/60 leading-relaxed">
                <p>
                  In 2023, a single missed signature on a ventilation audit cost a major operator $1.2M in fines and a 4-day site shutdown. The data existed, but it was buried in a scanned PDF in a SharePoint folder nobody checked.
                </p>
                <p>
                  While tech companies rushed to build AI for writing emails and generating images, industrial operators were left behind. Standard OCR failed on dusty carbon copies. Generalist LLMs hallucinated regulatory citations. Cloud-only SaaS was rejected by strict security teams.
                </p>
                <p>
                  MiningNiti was built to solve exactly this. We combine military-grade data residency with a parsing engine specifically trained for the formatting nightmares of legacy industrial documentation.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#947AFC]/20 to-transparent rounded-3xl blur-2xl" />
              <div className="relative bg-[#0A0A0B] border border-white/[0.08] rounded-3xl p-8 h-full flex flex-col justify-center shadow-2xl">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-4xl font-bold text-white mb-2">10M+</div>
                    <div className="text-[11px] font-semibold tracking-wider uppercase text-[#947AFC]">Documents Indexed</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white mb-2">99.8%</div>
                    <div className="text-[11px] font-semibold tracking-wider uppercase text-[#947AFC]">Parse Accuracy</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white mb-2">0</div>
                    <div className="text-[11px] font-semibold tracking-wider uppercase text-[#947AFC]">Data Leaks</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white mb-2">14</div>
                    <div className="text-[11px] font-semibold tracking-wider uppercase text-[#947AFC]">Regulatory Zones</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-24 px-6 max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Engineering Principles</h2>
            <p className="text-white/50">How we build the intelligence layer.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/[0.08] p-8 rounded-2xl hover:bg-white/[0.04] transition-colors shadow-lg">
                <div className="size-10 rounded-xl bg-[#947AFC]/10 border border-[#947AFC]/20 flex items-center justify-center mb-6">
                  <v.icon className="size-5 text-[#947AFC]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{v.title}</h3>
                <p className="text-[15px] text-white/50 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
