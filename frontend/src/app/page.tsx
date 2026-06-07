import { HeroSection } from '@/components/landing/hero-section';
import { ScrollTextSection } from '@/components/landing/scroll-text-section';
import { ProblemSection } from '@/components/landing/problem-section';
import { PipelineDiagram } from '@/components/landing/pipeline-diagram';
import { UseCasesSection } from '@/components/landing/use-cases-section';
import { FeatureGrid } from '@/components/landing/feature-grid';
import { IntegrationGrid } from '@/components/landing/integration-grid';
import { PlatformSection } from '@/components/landing/platform-section';
import { StatsBand } from '@/components/landing/stats-band';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { FaqSection } from '@/components/landing/faq-section';
import { TrustSection } from '@/components/landing/trust-section';
import { MagicInputDemo } from '@/components/landing/magic-input-demo';
import { RoiCalculator } from '@/components/landing/roi-calculator';
import { IndiaMapDeployments } from '@/components/landing/india-map-deployments';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#05030A]">
      {/* 1. THE HOOK: Hero & Social Proof */}
      <HeroSection />
      
      <section className="relative z-20 bg-[#05030A] py-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-[radial-gradient(ellipse_at_top,rgba(148,122,252,0.06),transparent_70%)] pointer-events-none z-0" />
        <div className="mx-auto max-w-[1200px] px-6 text-center relative z-10">
          <p className="text-[12px] font-medium tracking-[0.15em] uppercase text-white/40 mb-8">
            Trusted by compliance teams across the mining sector
          </p>
          <div 
            className="flex flex-col gap-6"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0, #000 10%, #000 90%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0, #000 10%, #000 90%, transparent 100%)'
            }}
          >
            <div className="flex w-max animate-[scrollLogos_35s_linear_infinite]">
              {[1, 2].map((set) => (
                <div key={set} className="flex items-center gap-20 px-10">
                  {['CMPDI', 'Ministry of Coal', 'Coal India', 'NTPC', 'Rio Tinto', 'BHP', 'Anglo American'].map(name => (
                    <span key={name} className="text-xl font-bold tracking-tight text-white/30 whitespace-nowrap">{name}</span>
                  ))}
                </div>
              ))}
            </div>
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

      {/* 7. THE INTERFACE: Dashboard mockup */}
      <PlatformSection />

      {/* 8. THE ENGINE: How it works (Architecture) */}
      <PipelineDiagram />

      {/* 9. THE ECOSYSTEM: Integrations */}
      <IntegrationGrid />

      {/* 10. THE SCALE: National deployments map */}
      <IndiaMapDeployments />

      {/* 11. THE ROI: Stats and personalized calculator */}
      <StatsBand />
      <RoiCalculator />

      {/* 12. THE VALIDATION: Social proof from peers */}
      <TestimonialsSection />

      {/* 13. THE OBJECTION HANDLING: Security & FAQs */}
      <TrustSection />
      <FaqSection />

      {/* 14. THE CLOSE: Final CTA */}
      <section className="py-32 bg-[#05030A] relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(148,122,252,0.12),transparent_70%)]" />
        <div className="mx-auto max-w-[1200px] px-6 relative z-10 text-center">
          <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#947AFC] mb-6">Get started</p>
          <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-bold tracking-tight mb-6 text-white leading-[1.05]" style={{ letterSpacing: '-0.03em' }}>
            Transform how your team<br />works with mining documents.
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto mb-12">
            Deploy MiningNiti and turn your unstructured document archives into a secure, queryable intelligence graph your entire team can rely on.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/sign-up" className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-[15px] font-semibold text-black transition-all hover:bg-[#947AFC] hover:text-white hover:shadow-[0_0_30px_rgba(148,122,252,0.4)] hover:-translate-y-0.5">
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
