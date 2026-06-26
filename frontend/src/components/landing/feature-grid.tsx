'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Search, ShieldAlert, GitBranch, Zap, FileText, Clock } from 'lucide-react';

// --- Sub-components for each bento card's diagram ---

function SearchDiagram() {
  const results = [
    { title: 'DGMS Regulation 2024 – Section 4.2', page: 'p.14', match: 98 },
    { title: 'Shaft B Ventilation Safety SOP', page: 'p.3', match: 91 },
    { title: 'Annual Audit Report Q3 2023', page: 'p.47', match: 84 },
  ];
  return (
    <div className="w-full space-y-2 mt-2">
      {/* Query bar */}
      <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-lg px-3 py-2">
        <Search className="size-3 text-white/40 shrink-0" />
        <span className="text-xs text-white/60 font-mono">ventilation compliance shaft B october</span>
        <motion.span animate={{ opacity: [0,1,0] }} transition={{ duration: 0.8, repeat: Infinity }} className="ml-auto w-0.5 h-3 bg-purple-400 shrink-0" />
      </div>
      {/* Results */}
      <div className="space-y-1.5">
        {results.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 + 0.2 }}
            className="flex items-center gap-3 bg-white/4 border border-white/6 rounded-lg px-3 py-2 group hover:border-[#947AFC]/30 hover:bg-purple-400/5 transition-all cursor-pointer"
          >
            <FileText className="size-3 text-purple-400 shrink-0" />
            <span className="text-[11px] text-white/70 flex-1 truncate">{r.title}</span>
            <span className="text-[10px] font-mono text-white/30 shrink-0">{r.page}</span>
            <div className="w-8 h-1 rounded-full bg-white/10 overflow-hidden shrink-0">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${r.match}%` }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 + 0.4, duration: 0.6 }}
                className="h-full bg-purple-400 rounded-full"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ComplianceDiagram() {
  const checks = [
    { label: 'Ventilation Logs', status: 'pass' },
    { label: 'PPE Inspection Forms', status: 'pass' },
    { label: 'Emergency Drill Records', status: 'fail' },
    { label: 'Shift Supervisor Signatures', status: 'warn' },
    { label: 'Equipment Certifications', status: 'pass' },
  ];
  return (
    <div className="w-full mt-2 space-y-1.5">
      {checks.map((c, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 + 0.2 }}
          className="flex items-center gap-3"
        >
          <motion.div
            animate={c.status === 'fail' ? { scale: [1, 1.3, 1], opacity: [1, 0.6, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`size-2 rounded-full shrink-0 ${
              c.status === 'pass' ? 'bg-emerald-400' : c.status === 'warn' ? 'bg-amber-400' : 'bg-red-500'
            }`}
          />
          <span className="text-[11px] text-white/50 flex-1">{c.label}</span>
          <span className={`text-[10px] font-semibold ${
            c.status === 'pass' ? 'text-emerald-400' : c.status === 'warn' ? 'text-amber-400' : 'text-red-400'
          }`}>
            {c.status === 'pass' ? 'OK' : c.status === 'warn' ? 'REVIEW' : 'FAIL'}
          </span>
        </motion.div>
      ))}
      {/* Score Bar */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex justify-between text-[10px] mb-1.5">
          <span className="text-white/40">Compliance Score</span>
          <span className="text-white font-semibold">76 / 100</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '76%' }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

function KnowledgeGraphDiagram() {
  // All coordinates in a fixed 240x160 viewBox for correct proportions
  const nodes = [
    { id: 'mine',    x: 120, y: 80,  r: 10, label: 'Mine Site A', color: '#947AFC', glow: true },
    { id: 'sop',     x: 48,  y: 28,  r: 6,  label: 'Safety SOP',  color: '#60A5FA' },
    { id: 'dgms',    x: 192, y: 28,  r: 6,  label: 'DGMS Reg.',   color: '#34D399' },
    { id: 'drill',   x: 30,  y: 100, r: 6,  label: 'Drill Log',   color: '#F59E0B' },
    { id: 'audit',   x: 210, y: 100, r: 6,  label: 'Audit 2024',  color: '#F472B6' },
    { id: 'permit',  x: 120, y: 145, r: 6,  label: 'Permit WD-11',color: '#A78BFA' },
    { id: 'staff',   x: 68,  y: 138, r: 5,  label: 'Safety Off.',  color: '#FB923C' },
    { id: 'equip',   x: 172, y: 138, r: 5,  label: 'Equipment',   color: '#38BDF8' },
  ];

  const edges = [
    { from: 'mine', to: 'sop' },
    { from: 'mine', to: 'dgms' },
    { from: 'mine', to: 'drill' },
    { from: 'mine', to: 'audit' },
    { from: 'mine', to: 'permit' },
    { from: 'mine', to: 'staff' },
    { from: 'mine', to: 'equip' },
    { from: 'sop',  to: 'dgms' },
    { from: 'permit', to: 'staff' },
    { from: 'audit', to: 'equip' },
  ];

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  return (
    <div className="relative w-full mt-1" style={{ aspectRatio: '240/160' }}>
      <svg
        viewBox="0 0 240 160"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {nodes.map(n => (
            <radialGradient key={`grad-${n.id}`} id={`grad-${n.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={n.color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={n.color} stopOpacity="0.4" />
            </radialGradient>
          ))}
          {/* Moving particle along a path */}
          <filter id="glow-filter">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {edges.map((e, i) => {
          const a = nodeMap[e.from];
          const b = nodeMap[e.to];
          const pathId = `edge-${i}`;
          const d = `M${a.x},${a.y} L${b.x},${b.y}`;
          return (
            <g key={i}>
              {/* Static edge */}
              <motion.path
                id={pathId}
                d={d}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.8"
                strokeDasharray="2 3"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 + 0.3, duration: 0.5 }}
              />
              {/* Animated data particle travelling along edge */}
              <motion.circle
                r="1.5"
                fill={nodeMap[e.from].color}
                filter="url(#glow-filter)"
                opacity={0.85}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.85 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 1.0 }}
              >
                <animateMotion
                  dur={`${1.5 + (i % 3) * 0.4}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.35}s`}
                >
                  <mpath href={`#${pathId}`} />
                </animateMotion>
              </motion.circle>
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((n, i) => (
          <g key={n.id}>
            {/* Outer glow halo */}
            {n.glow && (
              <motion.circle
                cx={n.x} cy={n.y}
                r={n.r + 6}
                fill="none"
                stroke={n.color}
                strokeWidth="0.8"
                animate={{ opacity: [0.25, 0.08, 0.25], scale: [1, 1.3, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: `${n.x}px ${n.y}px` }}
              />
            )}
            {/* Node circle */}
            <motion.circle
              cx={n.x} cy={n.y} r={n.r}
              fill={`url(#grad-${n.id})`}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 + 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            />
            {/* Label */}
            <motion.text
              x={n.x}
              y={n.y + n.r + 6}
              textAnchor="middle"
              fontSize="5.5"
              fill="rgba(255,255,255,0.5)"
              fontFamily="monospace"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 + 0.5 }}
            >
              {n.label}
            </motion.text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function AlertsDiagram() {
  const alerts = [
    { level: 'CRITICAL', msg: 'Missing fire drill record — Shaft C', time: 'just now', color: 'border-red-500/40 bg-red-500/5', dot: 'bg-red-500' },
    { level: 'WARNING', msg: 'Permit WD-11 expires in 14 days', time: '2m ago', color: 'border-amber-500/40 bg-amber-500/5', dot: 'bg-amber-400' },
    { level: 'INFO', msg: 'Indexing complete — 128 new docs', time: '5m ago', color: 'border-[#947AFC]/30 bg-purple-400/5', dot: 'bg-purple-400' },
  ];
  return (
    <div className="w-full mt-2 space-y-2">
      {alerts.map((a, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.15 + 0.2 }}
          className={`flex items-start gap-3 border rounded-xl p-3 ${a.color}`}
        >
          <motion.div
            animate={i === 0 ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 1.2, repeat: Infinity }}
            className={`size-2 rounded-full mt-0.5 shrink-0 ${a.dot}`}
          />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-mono font-bold text-white/40 mb-0.5">{a.level}</div>
            <div className="text-xs text-white/70 leading-snug">{a.msg}</div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-white/30 shrink-0">
            <Clock className="size-2.5" />
            {a.time}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// --- Main Section ---

export function FeatureGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const features = [
    {
      icon: Search,
      label: 'Semantic Search',
      title: 'Find anything, instantly',
      description: 'Natural language queries across all your documents with relevance scoring and exact source citations.',
      diagram: <SearchDiagram />,
      span: 'md:col-span-2',
    },
    {
      icon: ShieldAlert,
      label: 'Compliance Engine',
      title: 'Continuous compliance monitoring',
      description: 'Automated checks against DGMS and other regulatory standards, running 24/7.',
      diagram: <ComplianceDiagram />,
      span: 'md:col-span-1',
    },
    {
      icon: GitBranch,
      label: 'Knowledge Graph',
      title: 'Entity intelligence graph',
      description: 'Automatically maps relationships between sites, people, regulations, and documents.',
      diagram: <KnowledgeGraphDiagram />,
      span: 'md:col-span-1',
    },
    {
      icon: Zap,
      label: 'Real-time Alerts',
      title: 'Proactive operational alerts',
      description: 'Catch permit expiries, missing signatures, and violations before they become incidents.',
      diagram: <AlertsDiagram />,
      span: 'md:col-span-2',
    },
  ];

  return (
    <section ref={ref} className="py-24 sm:py-32 bg-[#05030A] border-t border-white/5 relative overflow-hidden" id="features">
      
      <div className="absolute top-[30%] right-[-5%] w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(59,130,246,0.05)_0%,transparent_60%)] pointer-events-none" />

      <div className="mx-auto max-w-[1200px] px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[11px] font-mono tracking-[0.2em] uppercase text-purple-400 mb-4"
          >
            Platform Capabilities
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-white mb-4"
          >
            Operational Intelligence
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-white/50"
          >
            A suite of AI-native tools designed for the rigorous demands of mining compliance and operations.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15 + i * 0.1 }}
              className={`${f.span} glass-panel-premium p-8 flex flex-col group relative overflow-hidden hover:-translate-y-2 hover:shadow-[0_20px_50px_-10px_rgba(148,122,252,0.3)] transition-all duration-500 ease-out`}
            >
              {/* Subtle hover glow behind the card content */}
              <div className="absolute inset-0 bg-linear-to-br from-[var(--primary)]/0 to-[var(--primary)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Header */}
              <div className="relative z-10 flex items-center gap-4 mb-4">
                <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:bg-[var(--primary)]/20 transition-colors">
                  <f.icon className="size-5 text-[var(--primary)]" />
                </div>
                <span className="text-[12px] font-mono uppercase tracking-[0.15em] text-white/50">{f.label}</span>
              </div>
              <h3 className="relative z-10 text-xl font-bold text-white mb-2">{f.title}</h3>
              <p className="relative z-10 text-sm text-white/50 leading-relaxed mb-6">{f.description}</p>

              {/* Live Diagram */}
              <div className="relative z-10 mt-auto bg-black/40 rounded-2xl border border-white/5 p-5 overflow-hidden backdrop-blur-md">
                {f.diagram}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
