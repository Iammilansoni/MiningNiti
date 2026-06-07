'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  CheckCircle2,
  FileStack,
  Bell,
  Crosshair,
  ShieldCheck,
} from 'lucide-react';

// ─── Compliance Engine floating card ─────────────────────────────────────────

function ComplianceCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="absolute bottom-6 right-6 left-6 sm:left-auto sm:w-[300px] bg-[#0E0C1A]/80 backdrop-blur-xl border border-[#947AFC]/20 rounded-2xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="size-9 rounded-xl bg-[#947AFC]/15 border border-[#947AFC]/25 flex items-center justify-center shrink-0">
          <ShieldCheck className="size-4 text-[#947AFC]" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-white leading-tight">Compliance Engine</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="relative flex size-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-1.5 bg-emerald-400" />
            </span>
            <span className="text-[11px] text-white/40">Live monitoring · Shaft B</span>
          </div>
        </div>
      </div>

      {/* Score */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-white/40">Readiness score</span>
          <span className="text-[13px] font-bold text-[#947AFC]">87 / 100</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '87%' }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-[#947AFC] to-[#c4a0f0]"
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/[0.07]">
        <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
        <span className="text-[11px] text-white/50">All ventilation checks verified</span>
      </div>
    </motion.div>
  );
}

// ─── Metrics ─────────────────────────────────────────────────────────────────

const metrics = [
  { icon: FileStack, value: '4.2M+', label: 'Documents Processed', iconColor: 'text-[#947AFC]', iconBg: 'bg-[#947AFC]/10' },
  { icon: Bell,      value: '12K+',  label: 'Compliance Alerts',   iconColor: 'text-amber-400',  iconBg: 'bg-amber-400/10' },
  { icon: Crosshair, value: '99.2%', label: 'Accuracy Rate',       iconColor: 'text-emerald-400', iconBg: 'bg-emerald-400/10' },
];

const bullets = [
  'Instant gap detection across every shift report',
  'Audit-ready compliance evidence in 48 hours',
  'Air-gapped, on-premise deployment options',
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function SplitHeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      ref={ref}
      className="relative bg-[#05030A] border-t border-white/5 overflow-hidden"
      style={{ minHeight: 'clamp(560px, 80vh, 780px)' }}
    >
      <div className="grid lg:grid-cols-2 min-h-[inherit]">

        {/* ── LEFT: Content panel ───────────────────────────────────────── */}
        <div className="relative flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-16 lg:py-20 bg-[#05030A] z-10">
          {/* Ambient glow */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_0%_0%,rgba(148,122,252,0.12),transparent_60%)] pointer-events-none" />

          {/* Logo mark */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2.5 mb-10"
          >
            <div className="size-8 rounded-lg bg-[#947AFC] flex items-center justify-center text-[13px] font-bold text-white shadow-[0_0_20px_rgba(148,122,252,0.5)]">
              M
            </div>
            <span className="text-[16px] font-semibold text-white tracking-tight">MiningNiti</span>
          </motion.div>

          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 w-fit px-3.5 py-1.5 rounded-full bg-[#947AFC]/10 border border-[#947AFC]/25 mb-6"
          >
            <span className="relative flex size-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#947AFC] opacity-75" />
              <span className="relative inline-flex rounded-full size-1.5 bg-[#947AFC]" />
            </span>
            <span className="text-[12px] font-medium text-white/70">
              Enterprise onboarding · <span className="text-white font-semibold">4,291</span> documents indexed
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(2.25rem,4vw,3.5rem)] font-bold text-white leading-[1.07] tracking-[-0.03em] mb-5"
          >
            The Intelligence Layer for Mining Operations
          </motion.h1>

          {/* Sub-copy */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-[16px] text-white/55 leading-[1.7] mb-7 max-w-[480px]"
          >
            Turn fragmented safety logs, compliance records, and inspection
            reports into a single queryable source of truth — built for the
            field and the boardroom.
          </motion.p>

          {/* Bullets */}
          <motion.ul
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col gap-3 mb-9"
          >
            {bullets.map((b, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle2 className="size-4 text-[#947AFC] shrink-0" />
                <span className="text-[14px] text-white/70">{b}</span>
              </li>
            ))}
          </motion.ul>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap items-center gap-4 mb-12"
          >
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 h-11 px-7 rounded-full bg-[#947AFC] text-[14px] font-semibold text-white shadow-[0_0_24px_rgba(148,122,252,0.4)] hover:bg-[#a88ffc] hover:shadow-[0_0_36px_rgba(148,122,252,0.55)] transition-all duration-300 hover:-translate-y-0.5"
            >
              Get started <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="#platform"
              className="text-[14px] font-medium text-white/60 hover:text-white transition-colors duration-200"
            >
              Explore platform
            </Link>
          </motion.div>

          {/* Metrics row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-3 gap-3"
          >
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.65 + i * 0.08 }}
                className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 hover:border-white/15 transition-colors"
              >
                <div className={`size-8 rounded-xl ${m.iconBg} flex items-center justify-center mb-3`}>
                  <m.icon className={`size-4 ${m.iconColor}`} />
                </div>
                <div className="text-[22px] font-bold text-white leading-none mb-1">{m.value}</div>
                <div className="text-[11px] text-white/40 leading-tight">{m.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT: Mine photo panel ───────────────────────────────────── */}
        <div className="relative hidden lg:block overflow-hidden">
          {/* Dark overlay gradient from left */}
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#05030A] via-[#05030A]/20 to-transparent pointer-events-none" />
          {/* Dark overlay from bottom */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#05030A]/80 via-transparent to-[#05030A]/30 pointer-events-none" />
          {/* Subtle purple tint overlay */}
          <div className="absolute inset-0 z-10 bg-[#1a0a3a]/30 mix-blend-color pointer-events-none" />

          {/* Mine landscape photo */}
          <Image
            src="/mine-landscape.png"
            alt="Open-pit coal mine — aerial view"
            fill
            className="object-cover object-center"
            priority
          />

          {/* Floating compliance card */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            <ComplianceCard />
          </div>
        </div>

      </div>

      {/* Bottom border fade */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
