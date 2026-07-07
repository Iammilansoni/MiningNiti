'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from './Navbar';
import { ArrowRight } from 'lucide-react';
import ColorBends from '@/components/ui/ColorBends';

/*
  HeroSection — MiningNiti Landing Page
  
  Design philosophy: Restrained confidence.
  Inspired by Anthropic × Palantir × Linear.
  
  Layout:
    Navbar → Eyebrow → Headline → Subheadline → CTAs → Visual → Trust bar
  
  One accent color (#947AFC). Typography does 80% of the work.
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

      {/* ── Background: ColorBends WebGL ── */}
      <div className="absolute inset-0 z-0" style={{ width: '100%', height: '100%' }}>
        <ColorBends
          colors={["#947afc", "#3d1a8f", "#1a0a4a", "#0a0510"]}
          rotation={110}
          speed={0.15}
          scale={1.2}
          frequency={0.9}
          warpStrength={1.2}
          mouseInfluence={0.8}
          noise={0.08}
          parallax={0.4}
          iterations={2}
          intensity={0.9}
          bandWidth={5}
          transparent={false}
          className=""
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* ── Film Grain overlay ── */}
      <div
        className="absolute inset-0 z-[1] opacity-[0.04] mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px'
        }}
      />

      {/* ── Deep Vignette ── */}
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,transparent_0%,#0A0A0B_80%)] opacity-70 pointer-events-none" />

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
          <div className="inline-flex items-center gap-2 rounded-full border border-white/6 bg-white/2 px-4 py-1.5">
            <span className="inline-block size-1.5 rounded-full bg-purple-400 animate-pulse" />
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
            className="group inline-flex items-center gap-2 h-12 px-7 rounded-full border border-white/8 text-[15px] font-medium text-white/60 hover:text-white/90 hover:border-white/15 hover:bg-white/3 transition-all duration-300"
          >
            Watch Demo
            <ArrowRight className="size-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all duration-300" />
          </Link>
        </motion.div>

      </div>

      {/* ── Bottom gradient fade into next section ── */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#05030A] to-transparent pointer-events-none z-20" />
    </section>
  );
}
