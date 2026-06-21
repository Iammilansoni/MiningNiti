'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  BarChart2,
  Settings,
  Search,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

// ─── Mini Dashboard Mockup ────────────────────────────────────────────────────

const kpis = [
  {
    label: 'TOTAL DOCUMENTS',
    value: '1,247',
    icon: FileText,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-400/10',
    borderColor: 'border-purple-400/20',
  },
  {
    label: 'PROCESSED',
    value: '1,198',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-400/10',
    borderColor: 'border-emerald-400/20',
  },
  {
    label: 'AVG SAFETY SCORE',
    value: '84.3',
    icon: ShieldCheck,
    iconColor: 'text-sky-400',
    iconBg: 'bg-sky-400/10',
    borderColor: 'border-sky-400/20',
  },
  {
    label: 'VIOLATIONS',
    value: '3',
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-400/10',
    borderColor: 'border-amber-400/20',
  },
];

const recentDocs = [
  {
    name: 'Ventilation_Audit_Shaft_B.pdf',
    status: 'Completed',
    statusColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  },
  {
    name: 'DGMS_Permit_Renewal_2025.docx',
    status: 'Processing',
    statusColor: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  },
  {
    name: 'Incident_Report_Q2_2025.pdf',
    status: 'Analyzing',
    statusColor: 'bg-purple-400/15 text-purple-400 border-purple-400/20',
  },
];

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: FileText, label: 'Documents', active: false },
  { icon: MessageSquare, label: 'Chat', active: false },
  { icon: BarChart2, label: 'Analytics', active: false },
  { icon: Settings, label: 'Settings', active: false },
];

function DashboardMockup() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-[#080808] shadow-[0_40px_120px_rgba(0,0,0,0.8)] select-none">
      {/* Window chrome bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.07] bg-[#0A0A0A]">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-red-500/70" />
          <div className="size-2.5 rounded-full bg-amber-400/70" />
          <div className="size-2.5 rounded-full bg-emerald-400/70" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-3 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-[10px] font-mono text-white/30">
            app.miningniti.com/dashboard
          </div>
        </div>
      </div>

      {/* App shell */}
      <div className="flex h-[360px] sm:h-[420px]">

        {/* Sidebar */}
        <div className="w-[160px] shrink-0 border-r border-white/6 bg-[#050505] flex flex-col py-4">
          {/* Brand */}
          <div className="flex items-center gap-2 px-4 mb-6">
            <div className="size-6 rounded-md bg-purple-400 flex items-center justify-center text-[10px] font-bold text-white">M</div>
            <span className="text-[12px] font-semibold text-white">MiningNiti</span>
          </div>

          {/* Nav items */}
          <nav className="flex flex-col gap-0.5 px-2">
            {navItems.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                  item.active
                    ? 'bg-purple-400/15 text-purple-400'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <item.icon className="size-3.5 shrink-0" />
                {item.label}
              </div>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/6">
            <div>
              <div className="text-[13px] font-semibold text-white">Welcome back, Rajesh</div>
              <div className="text-[10px] text-white/40">Here's your document intelligence overview</div>
            </div>
            <div className="flex items-center gap-1.5 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5">
              <Search className="size-3 text-white/30" />
              <span className="text-[10px] text-white/30">Search documents...</span>
            </div>
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-4 gap-2.5 px-5 py-4 border-b border-white/6">
            {kpis.map((kpi) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className={`bg-white/[0.03] border rounded-xl p-3 ${kpi.borderColor}`}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <div className={`size-5 rounded-md ${kpi.iconBg} flex items-center justify-center`}>
                    <kpi.icon className={`size-3 ${kpi.iconColor}`} />
                  </div>
                  <span className="text-[8px] font-mono font-semibold text-white/30 tracking-wider leading-none">{kpi.label}</span>
                </div>
                <div className="text-[18px] font-bold text-white leading-none">{kpi.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Recent documents table */}
          <div className="px-5 py-3 flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-white/80">Recent Documents</span>
              <span className="text-[10px] text-purple-400 cursor-pointer hover:text-[#a88ffc]">View all</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {recentDocs.map((doc, i) => (
                <motion.div
                  key={doc.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.35 }}
                  className="flex items-center justify-between px-3 py-2 bg-white/[0.025] border border-white/[0.05] rounded-lg group hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="size-3 text-white/25 shrink-0" />
                    <span className="text-[10px] text-white/60 truncate">{doc.name}</span>
                  </div>
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ml-2 ${doc.statusColor}`}>
                    {doc.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function PlatformSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      id="platform"
      className="py-24 sm:py-32 bg-[#05030A] border-t border-white/5 relative overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(148,122,252,0.08),transparent_65%)] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[radial-gradient(ellipse_at_bottom,rgba(148,122,252,0.06),transparent_70%)] pointer-events-none" />

      <div className="mx-auto max-w-[1200px] px-6 relative z-10">

        {/* ── Section header ── */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[11px] font-mono tracking-[0.2em] uppercase text-purple-400 mb-4"
          >
            The Platform
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-white mb-4"
          >
            Everything You Need,{' '}
            <span className="text-purple-400">In One Place.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-white/50 leading-relaxed"
          >
            A single command center for your documents, compliance monitoring,
            AI chat, and operational analytics.
          </motion.p>
        </div>

        {/* ── Dashboard mockup ── */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Glow behind the mockup */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-purple-400/20 via-transparent to-transparent blur-sm pointer-events-none" />
          <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top,rgba(148,122,252,0.12),transparent_60%)] pointer-events-none" />

          <DashboardMockup />
        </motion.div>

        {/* ── Bottom CTA strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-20 text-center"
        >
          <h3 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold text-white tracking-tight mb-4 leading-tight">
            Transform How Your Team Works<br className="hidden sm:block" /> With Mining Documents.
          </h3>
          <p className="text-white/50 text-[16px] max-w-lg mx-auto mb-10 leading-relaxed">
            Join mining operations already using MiningNiti to stay compliant,
            safe, and audit-ready.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-purple-400 text-[15px] font-semibold text-white shadow-[0_0_30px_rgba(148,122,252,0.35)] hover:bg-[#a88ffc] hover:shadow-[0_0_40px_rgba(148,122,252,0.5)] transition-all duration-300 hover:-translate-y-0.5"
            >
              Request Access <ArrowRight className="size-4" />
            </Link>
            <Link
              href="mailto:hello@miningniti.com"
              className="inline-flex items-center h-12 px-8 rounded-full border border-white/15 bg-white/4 text-[15px] font-medium text-white hover:bg-white/[0.08] hover:border-white/25 transition-all duration-200"
            >
              Contact Sales
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              { icon: Clock, text: '48-hour deployment' },
              { icon: ShieldCheck, text: '99.2% accuracy' },
              { icon: CheckCircle2, text: 'On-premise available' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-white/40 text-[13px]">
                <item.icon className="size-4 text-purple-400" />
                {item.text}
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
