import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Shield, Target, Cpu, Users } from 'lucide-react';

export default function AboutPage() {
  const values = [
    // Claims here must be checkable against the repo. This list previously
    // promised VPC/on-premise model deployment, a mining-pre-trained model and
    // terabyte-scale ingestion — none of which exist. The stack calls hosted
    // model APIs, uses off-the-shelf models steered by retrieval, and runs on
    // free-tier infrastructure. Do not reinstate a capability without the code.
    { icon: Shield, title: 'Answers You Can Check', desc: 'Every claim carries the document and page it came from, and the model is instructed to refuse rather than answer past its retrieved context. A near-miss is reported as a near-miss.' },
    { icon: Target, title: 'Domain Precision', desc: 'No model is fine-tuned on mining data. Precision comes from retrieval: hybrid vector and keyword search over your own documents, narrowed by a cross-encoder reranker before the model ever sees a passage.' },
    { icon: Cpu, title: 'Built for Awkward Documents', desc: 'Mining documentation is mostly tables and scans. Extraction is layout-aware, tables survive as tables, and pages that return no text fall back to OCR.' },
    { icon: Users, title: 'Augment, Not Replace', desc: 'We capture the institutional knowledge of retiring senior engineers and make it instantly accessible to the next generation.' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0B]">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 pt-32 pb-24">
        
        {/* Header */}
        <section className="relative px-6 py-20 text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[radial-gradient(circle,rgba(148,122,252,0.1)_0%,transparent_60%)] pointer-events-none" />
          <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-purple-400 mb-6 relative z-10">Our Mission</p>
          <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold tracking-tight text-white mb-6 leading-[1.05] relative z-10 max-w-4xl mx-auto">
            Bringing structure to the industrial world's dark data.
          </h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto relative z-10 leading-relaxed">
            Mining operations sit on decades of unstructured intelligence — paper logs, PDFs, scattered reports. We exist to turn that dead archive into a live, queryable brain.
          </p>
        </section>

        {/* The Story */}
        <section className="py-20 border-t border-white/8 bg-white/2">
          <div className="max-w-[1000px] mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div>
              {/*
                This section previously opened with a specific incident — "$1.2M
                in fines and a 4-day site shutdown" — that was invented, and
                closed by claiming "military-grade data residency" and a parsing
                engine "specifically trained" on industrial documents. None of
                that was true. The real history is more interesting than the
                fiction was, so it is what this section says now.
              */}
              <h2 className="text-3xl font-bold text-white mb-6">Two builds, four years apart.</h2>
              <div className="space-y-4 text-[15px] text-white/60 leading-relaxed">
                <p>
                  Mining documentation is mostly tables and scans. Standard text
                  extraction flattens a ventilation table into a run of numbers
                  that reads like prose — not merely lossy, but confidently
                  wrong once it has been embedded, retrieved and cited. General
                  assistants make it worse by inventing regulatory citations
                  that look exactly like real ones.
                </p>
                <p>
                  The first version was built for Smart India Hackathon 2023
                  against the Ministry of Coal problem statement, by a team, and
                  won at the national level. CMPDI officials who judged the
                  finals opened discussions about deploying it at scale. Those
                  talks did not proceed.
                </p>
                <p>
                  This platform is a separate, ground-up rebuild started in June
                  2025 and developed solo since — hybrid retrieval over your own
                  documents, five specialized agents, and a rule the system is
                  held to: every claim carries the document and page it came
                  from, and an answer that is not in the retrieved context is
                  refused rather than guessed.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-tr from-purple-400/20 to-transparent rounded-3xl blur-2xl" />
              <div className="relative bg-[#0A0A0B] border border-white/8 rounded-3xl p-8 h-full flex flex-col justify-center shadow-2xl">
                {/*
                  Every number here must be reproducible from the repository.
                  This grid previously read 10M+ documents indexed, 99.8% parse
                  accuracy, 0 data leaks and 14 regulatory zones — none of which
                  were measured or measurable. Do not add a figure without a
                  source in the code.
                */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-4xl font-bold text-white mb-2">5</div>
                    <div className="text-[11px] font-semibold tracking-wider uppercase text-purple-400">Specialized AI Agents</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white mb-2">1.00</div>
                    <div className="text-[11px] font-semibold tracking-wider uppercase text-purple-400">Hit Rate@5, Golden Set</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white mb-2">215</div>
                    <div className="text-[11px] font-semibold tracking-wider uppercase text-purple-400">Backend Unit Tests</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white mb-2">36</div>
                    <div className="text-[11px] font-semibold tracking-wider uppercase text-purple-400">REST API Endpoints</div>
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
              <div key={i} className="bg-white/2 border border-white/8 p-8 rounded-2xl hover:bg-white/4 transition-colors shadow-lg">
                <div className="size-10 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center mb-6">
                  <v.icon className="size-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{v.title}</h3>
                <p className="text-[15px] text-white/50 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Source */}
        <section className="pb-24 px-6 max-w-[1000px] mx-auto">
          <div className="glass-panel-premium rounded-3xl py-10 px-8 border-white/5 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Read the source</h2>
            <p className="text-[15px] text-white/50 max-w-2xl mx-auto leading-relaxed mb-6">
              MiningNiti is open source and MIT licensed. The repository documents
              the architecture, the retrieval evaluation results, and a candid list
              of what is not finished yet.
            </p>
            <a
              href="https://github.com/Iammilansoni/MiningNiti"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              github.com/Iammilansoni/MiningNiti
            </a>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
