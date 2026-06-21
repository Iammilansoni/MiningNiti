import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { ArrowRight, BarChart3, Clock, TrendingDown } from 'lucide-react';
import Link from 'next/link';

export default function CaseStudiesPage() {
  const studies = [
    {
      company: 'Subsidiary of Coal India Ltd',
      logo: 'CIL',
      title: 'Digitizing 40 Years of Paper Safety Logs',
      metric: '85%',
      metricLabel: 'Reduction in Audit Prep Time',
      desc: 'How a major regional coal operator used MiningNiti to ingest 120,000+ scanned pages of historical safety reports and make them instantly queryable for DGMS inspectors.',
      tags: ['OCR', 'DGMS Compliance', 'Legacy Data'],
      icon: Clock,
    },
    {
      company: 'Global Tier-1 Metal Operator',
      logo: 'T1',
      title: 'Proactive Expiry Detection for Permits',
      metric: '$2.4M',
      metricLabel: 'Prevented Compliance Fines',
      desc: 'By feeding their entire permit database into MiningNiti, this operator deployed an automated alert system that caught 14 expiring environmental clearances before regulatory deadlines.',
      tags: ['Alerts', 'Predictive', 'Legal'],
      icon: TrendingDown,
    },
    {
      company: 'National Mining Contractor',
      logo: 'NMC',
      title: 'Unified Geological Intelligence',
      metric: '3x',
      metricLabel: 'Faster Site Assessment',
      desc: 'Connecting unstructured bore logs, PDF site surveys, and daily shift reports into a single Knowledge Graph to accelerate decision-making for new excavation zones.',
      tags: ['Knowledge Graph', 'RAG', 'Operations'],
      icon: BarChart3,
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0B]">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        
        {/* Header */}
        <div className="text-center px-6 mb-20 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(circle,rgba(148,122,252,0.1)_0%,transparent_60%)] pointer-events-none" />
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-bold tracking-tight text-white mb-6 leading-none relative z-10">Customer Success</h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto relative z-10">
            See how the world's most rigorous mining operations use MiningNiti to automate compliance, reduce risk, and un-silo their data.
          </p>
        </div>

        {/* Grid */}
        <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studies.map((study, i) => (
            <div key={i} className="group bg-white/2 border border-white/8 rounded-3xl p-8 hover:bg-white/4 transition-all flex flex-col shadow-lg">
              <div className="flex items-center gap-3 mb-8">
                <div className="size-10 rounded-full bg-white/4 border border-white/8 flex items-center justify-center text-xs font-bold text-white/70">
                  {study.logo}
                </div>
                <span className="text-sm font-medium text-white/50">{study.company}</span>
              </div>
              
              <div className="mb-8">
                <div className="flex items-end gap-2 mb-2">
                  <div className="text-4xl font-bold text-purple-400">{study.metric}</div>
                  <study.icon className="size-6 text-purple-400 mb-1.5 opacity-50" />
                </div>
                <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">{study.metricLabel}</div>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 leading-snug">{study.title}</h3>
              <p className="text-[15px] text-white/50 leading-relaxed mb-8 flex-1">
                {study.desc}
              </p>

              <div className="mt-auto pt-6 border-t border-white/8">
                <div className="flex flex-wrap gap-2 mb-6">
                  {study.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded bg-white/4 border border-white/8 text-[11px] text-white/50">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-white group-hover:text-purple-400 transition-colors">
                  Read full study <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </main>
      <Footer />
    </div>
  );
}
