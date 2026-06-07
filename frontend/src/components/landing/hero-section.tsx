'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { AnnouncementBanner } from './AnnouncementBanner';
import { Navbar } from './Navbar';
import { FileText, AlertCircle, TrendingUp, ArrowRight } from 'lucide-react';

export function HeroSection() {
  const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay },
    },
  });

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex flex-col"
      style={{ background: '#05030A' }}
    >
      {/* ── Deep purple radial core glow ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute left-1/2 -translate-x-1/2 top-0"
          style={{
            width: '900px',
            height: '700px',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(120,60,220,0.35) 0%, rgba(80,30,160,0.15) 45%, transparent 75%)',
          }}
        />
        {/* Secondary ambient blob — bottom */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-0"
          style={{
            width: '700px',
            height: '400px',
            background: 'radial-gradient(ellipse at 50% 100%, rgba(148,122,252,0.18) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ── Dot-grid overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.18]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148,122,252,0.5) 1px, transparent 0)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 100%)',
        }}
      />

      {/* ── Concentric ring arcs (dark variant) ── */}
      <div
        className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 pointer-events-none z-0"
        style={{ width: '160vw', height: '160vw', maxWidth: '2400px' }}
      >
        <div className="w-full h-full rounded-full border border-[#947AFC]/10" />
      </div>
      <div
        className="absolute bottom-[-12%] left-1/2 -translate-x-1/2 pointer-events-none z-0"
        style={{ width: '120vw', height: '120vw', maxWidth: '1800px' }}
      >
        <div className="w-full h-full rounded-full border border-[#947AFC]/[0.07]" />
      </div>
      <div
        className="absolute bottom-[-18%] left-1/2 -translate-x-1/2 pointer-events-none z-0"
        style={{ width: '90vw', height: '90vw', maxWidth: '1400px' }}
      >
        <div className="w-full h-full rounded-full border border-[#947AFC]/[0.05]" />
      </div>

      {/* ── Floating orbs ── */}
      <motion.div
        animate={{ y: [0, -18, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[22%] left-[8%] size-3 rounded-full bg-[#947AFC]/60 blur-[2px] pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 14, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute top-[35%] right-[10%] size-2 rounded-full bg-[#947AFC]/50 blur-[1px] pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, -10, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute top-[55%] left-[15%] size-1.5 rounded-full bg-purple-400/60 pointer-events-none"
      />

      {/* ── Right edge node ── */}
      <div className="absolute right-[5%] top-[45%] flex items-center gap-2 pointer-events-none z-10 opacity-30">
        <div className="size-1.5 rounded-full bg-[#947AFC]" />
        <span className="text-[9px] font-mono tracking-[0.15em] uppercase text-[#947AFC]/70">ENDPOINT</span>
      </div>

      <Navbar />

      {/* ── Live badge ── */}
      <motion.div
        variants={fadeUp(0.1)}
        initial="hidden"
        animate="visible"
        className="relative z-20 mt-[130px] sm:mt-[120px] flex justify-center"
      >
        <div className="inline-flex items-center gap-2.5 bg-[#947AFC]/10 backdrop-blur-sm border border-[#947AFC]/25 rounded-full px-4 py-2">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-emerald-400" />
          </span>
          <span className="text-[13px] font-medium text-white/60">
            Live&nbsp;<span className="font-bold text-white">4,291</span> documents indexed
          </span>
        </div>
      </motion.div>

      {/* ── Main copy ── */}
      <main className="relative z-20 mx-auto w-full max-w-[960px] px-6 mt-10 sm:mt-12 flex flex-col items-center text-center">
        <motion.h1
          variants={fadeUp(0.2)}
          initial="hidden"
          animate="visible"
          className="font-bold text-white leading-[1.06] tracking-[-0.04em] mb-6"
          style={{ fontSize: 'clamp(3rem, 7.5vw, 5.75rem)' }}
        >
          The Intelligence Layer{' '}
          <br className="hidden sm:block" />
          <span
            style={{
              backgroundImage: 'linear-gradient(135deg, #C4A0F0 0%, #947AFC 40%, #7B4FD4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            for Mining Operations
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp(0.35)}
          initial="hidden"
          animate="visible"
          className="text-[17px] sm:text-[19px] text-white/45 leading-[1.65] max-w-[600px] mb-10 font-[450]"
        >
          MiningNiti is the end-to-end document intelligence infrastructure to parse
          permits, audit safety procedures, and query regulatory documents — with
          real-time citations.
        </motion.p>

        {/* ── CTAs ── */}
        <motion.div
          variants={fadeUp(0.5)}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-8"
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-[#947AFC] text-[15px] font-semibold text-white shadow-[0_0_30px_rgba(148,122,252,0.5)] hover:bg-[#a88ffc] hover:shadow-[0_0_45px_rgba(148,122,252,0.65)] transition-all duration-300 hover:-translate-y-0.5"
            >
              Get started <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#architecture"
              className="inline-flex items-center h-12 px-8 rounded-full border border-white/15 bg-white/[0.04] text-[15px] font-medium text-white/80 hover:bg-white/[0.08] hover:border-white/25 transition-all duration-200"
            >
              Explore platform
            </Link>
          </div>

          {/* Scroll cue */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/20">Scroll</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-px h-6 bg-gradient-to-b from-[#947AFC]/40 to-transparent"
            />
          </div>
        </motion.div>
      </main>

      {/* ── Floating metric cards ── */}
      <div className="relative z-20 mt-auto pb-[120px] pt-16 mx-auto w-full max-w-4xl px-6 hidden md:flex items-end justify-between">
        {[
          { icon: FileText,    label: 'Documents Processed', value: '4.2M+', iconColor: 'text-[#947AFC]',  bg: 'bg-[#947AFC]/10'  },
          { icon: AlertCircle, label: 'Compliance Alerts',   value: '12K+',  iconColor: 'text-amber-400',   bg: 'bg-amber-400/10'  },
          { icon: TrendingUp,  label: 'Accuracy Rate',       value: '99.2%', iconColor: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0C0C0C]/80 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3 hover:border-[#947AFC]/30 transition-colors"
          >
            <div className={`size-9 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
              <stat.icon className={`size-4 ${stat.iconColor}`} />
            </div>
            <div>
              <div className="text-[11px] text-white/35 font-medium">{stat.label}</div>
              <div className="text-[22px] font-bold text-white leading-tight">{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Announcement Banner ── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex justify-center pb-6 px-4">
        <AnnouncementBanner />
      </div>
    </div>
  );
}
