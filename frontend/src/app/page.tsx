import Link from 'next/link';
import ColorBends from '@/components/ui/ColorBends';
import { HeroSection } from '@/components/landing/hero-section';
import { ScrollTextSection } from '@/components/landing/scroll-text-section';
import { ProblemSection } from '@/components/landing/problem-section';
import { PipelineDiagram } from '@/components/landing/pipeline-diagram';
import { UseCasesSection } from '@/components/landing/use-cases-section';
import { FeatureGrid } from '@/components/landing/feature-grid';
import { IntegrationGrid } from '@/components/landing/integration-grid';
import { PlatformSection } from '@/components/landing/platform-section';
import { StatsBand } from '@/components/landing/stats-band';
import { FaqSection } from '@/components/landing/faq-section';
import { TrustSection } from '@/components/landing/trust-section';
import { MagicInputDemo } from '@/components/landing/magic-input-demo';
import { RoiCalculator } from '@/components/landing/roi-calculator';
import { Footer } from '@/components/landing/Footer';
import CurvedLoop from '@/components/ui/CurvedLoop';

export default function LandingPage() {
  return (
    <div id="main-content" tabIndex={-1} className="flex flex-col min-h-screen bg-[#05030A]">
      {/* 1. THE HOOK: Hero & Social Proof */}
      <HeroSection />
      
      {/*
        This band used to read "Trusted by compliance teams across the mining
        sector" over a marquee of CMPDI, Ministry of Coal, Coal India, NTPC,
        Rio Tinto, BHP and Anglo American — implying seven customers, none of
        which exist. Only the SIH 2023 recognition is real, so that is all this
        states now. Do not add an organisation here without a public source.

        The award is also scoped deliberately: it belongs to an earlier entry,
        not to this codebase (first commit June 2025). Claiming it for this
        platform invites "walk me through the code you wrote for it" and does
        not survive the question. Keep the successor framing.
      */}
      <section className="relative z-20 bg-[#0A0A0B] pb-20 border-b border-white/2 overflow-hidden -mt-16">
        <div className="mx-auto max-w-[1200px] px-6 text-center relative z-10">
          <p className="text-[11px] font-mono font-medium tracking-[0.2em] uppercase text-white/40 mb-10">
            Recognition
          </p>
          <div className="glass-panel-premium rounded-3xl py-10 px-8 border-white/5">
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-white/80 leading-snug">
              Smart India Hackathon 2023 — National Winner
            </p>
            <p className="mt-3 text-[15px] text-white/45 max-w-2xl mx-auto">
              Ministry of Coal problem statement, from a field of 44,000+ teams.
              Recognised at the national finals by Coal India Limited and CMPDI.
            </p>
            <p className="mt-4 text-[13px] text-white/30 max-w-2xl mx-auto">
              That winning entry was a team prototype. This platform is a
              separate, ground-up rebuild started in June 2025 and developed
              solo since —{' '}
              <Link href="/about" className="underline underline-offset-4 hover:text-white/50 transition-colors">
                the full history is here
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* 2. THE PAIN: Set up the problem */}
      <ProblemSection />

      {/* 3. THE MAGIC: Show the solution immediately (Aha! Moment) */}
      <MagicInputDemo />

      {/* 4. THE VISION: Transition statement */}
      <ScrollTextSection />

      {/* 5. THE PERSONAS: Who it helps */}
      <UseCasesSection />

      {/* 6. THE CAPABILITIES: Deep dive into features */}
      <FeatureGrid />

      {/* 6.5: ANIMATED SECTION DIVIDER */}
      <section className="relative overflow-hidden bg-[#05030A] border-t border-b border-white/[0.04] py-2">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)'
          }}
        />
        <CurvedLoop
          marqueeText="AI-Powered Mining ✦ Regulatory Compliance ✦ Real-Time Citations ✦ Safety Audits ✦ Document Intelligence ✦ Permit Analysis ✦"
          speed={1.5}
          curveAmount={180}
          direction="left"
          interactive={true}
          className="curved-loop-mining"
        />
      </section>

      {/* 7. THE INTERFACE: Dashboard mockup */}
      <PlatformSection />

      {/* 8. THE ENGINE: How it works (Architecture) */}
      <PipelineDiagram />

      {/* 9. THE ECOSYSTEM: Integrations */}
      <IntegrationGrid />

      {/* 10. THE PROOF: Measured project metrics + savings estimator */}
      <StatsBand />
      <RoiCalculator />

      {/*
        Removed: IndiaMapDeployments and TestimonialsSection.
        The map advertised an "edge-sync architecture" and live deployments at
        named Indian mining sites, neither of which exists. The testimonials
        were invented quotes attributed to named people at real companies
        (Coal India, CMPDI, Tata Steel, Vedanta and others). This project has
        real recognition — SIH 2023, Coal India and CMPDI — and fabricated
        endorsements sitting next to it only put that in doubt.
        Do not reinstate either without genuine sources.
      */}

      {/* 11. THE OBJECTION HANDLING: Security & FAQs */}
      <TrustSection />
      <FaqSection />

      {/* 14. THE CLOSE: Final CTA */}
      <section className="py-32 relative overflow-hidden border-t border-white/5" style={{ background: '#05030A' }}>
        <div className="absolute inset-0 z-0" style={{ width: '100%', height: '100%' }}>
          <ColorBends
            // @ts-ignore
            colors={["#947afc", "#411d9f", "#2b1068"]}
            rotation={90}
            speed={0.2}
            scale={1.5}
            frequency={1.2}
            warpStrength={1.5}
            mouseInfluence={1}
            noise={0.15}
            parallax={0.5}
            iterations={1}
            intensity={1.2}
            bandWidth={6}
            transparent={false}
            className=""
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        <div className="mx-auto max-w-[1200px] px-6 relative z-10 text-center">
          <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-purple-400 mb-6">Get started</p>
          <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-bold tracking-tight mb-6 text-white leading-[1.05]" style={{ letterSpacing: '-0.03em' }}>
            Transform how your team<br />works with mining documents.
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto mb-12">
            Deploy MiningNiti and turn your unstructured document archives into a secure, queryable intelligence graph your entire team can rely on.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/sign-up" className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-[15px] font-semibold text-black transition-all hover:bg-purple-400 hover:text-white hover:shadow-[0_0_30px_rgba(148,122,252,0.4)] hover:-translate-y-0.5">
              Request Access
            </a>
            <a href="mailto:hello@miningniti.com" className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 text-[15px] font-medium text-white transition-colors hover:bg-white/10">
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
