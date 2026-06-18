'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from './Navbar';
import { AnnouncementBanner } from './AnnouncementBanner';
import { IntelligenceGraph } from './IntelligenceGraph';
import { DeepFluidBackground } from './DeepFluidBackground';
import { ArrowRight } from 'lucide-react';

/*
  HeroSection — MiningNiti Landing Page
  
  Design philosophy: Restrained confidence.
  Inspired by Anthropic × Palantir × Linear.
  
  Layout:
    Navbar → Eyebrow → Headline → Subheadline → CTAs → Visual → Trust bar
  
  One accent color (#947AFC). Typography does 80% of the work.
  The IntelligenceGraph SVG is the single visual centerpiece.
*/

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const, delay },
  },
});

const TRUST_LOGOS = ['CMPDI', 'Ministry of Coal', 'Coal India', 'NTPC', 'Rio Tinto', 'BHP', 'Anglo American'];

export function HeroSection() {
  return (
    <section className="relative min-h-screen w-full flex flex-col bg-[#0A0A0B] overflow-hidden">

      {/* ── Background: Deep Fluid Mesh ── */}
      <DeepFluidBackground />

      <Navbar />

      {/* ── Hero Content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start pt-24 sm:pt-32 px-6 w-full max-w-[1200px] mx-auto">

        {/* Eyebrow — Trust / Credibility */}
        <motion.div
          variants={fadeUp(0.05)}
          initial="hidden"
          animate="visible"
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-1.5">
            <span className="inline-block size-1.5 rounded-full bg-[#947AFC] animate-pulse" />
            <span className="text-[12px] font-medium text-white/40 tracking-wide">
              SIH 2023 National Winner
            </span>
            <span className="text-white/15 text-[10px]">•</span>
            <span className="text-[12px] font-medium text-white/40 tracking-wide">
              Ministry of Coal
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp(0.15)}
          initial="hidden"
          animate="visible"
          className="text-center text-white font-semibold leading-[1.08] tracking-[-0.03em] mb-4 max-w-[800px]"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
        >
          The Intelligence Platform{' '}
          <br className="hidden sm:block" />
          for Modern Mining.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp(0.25)}
          initial="hidden"
          animate="visible"
          className="text-center text-white/45 text-[16px] sm:text-[18px] leading-[1.6] max-w-[580px] mb-8 font-normal"
        >
          Parse permits, audit safety procedures, and query regulatory documents — powered by agentic AI with real-time citations.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp(0.35)}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-center gap-3 mb-12 sm:mb-16"
        >
          <Link
            href="/sign-up"
            className="group inline-flex items-center justify-center h-12 px-7 rounded-full bg-white text-[#0A0A0B] text-[15px] font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:-translate-y-px"
          >
            Request Access
          </Link>
          <Link
            href="#architecture"
            className="group inline-flex items-center gap-2 h-12 px-7 rounded-full border border-white/[0.08] text-[15px] font-medium text-white/60 hover:text-white/90 hover:border-white/15 hover:bg-white/[0.03] transition-all duration-300"
          >
            Watch Demo
            <ArrowRight className="size-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all duration-300" />
          </Link>
        </motion.div>

        {/* ── Intelligence Graph — The Visual Centerpiece ── */}
        <div className="w-full mb-12 sm:mb-16 -mt-4">
          <IntelligenceGraph />
        </div>

      </div>

      {/* ── Bottom gradient fade into next section ── */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#05030A] to-transparent pointer-events-none z-20" />

      {/* ── Announcement Banner ── */}
      <AnnouncementBanner />
    </section>
  );
}
