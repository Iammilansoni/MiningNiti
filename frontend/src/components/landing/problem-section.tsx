'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { AlertTriangle, Clock, FileX, Search, Users, TrendingDown } from 'lucide-react';

const problems = [
  {
    icon: FileX,
    title: 'Documents live in silos',
    description: 'Permits, safety logs, bore reports — scattered across servers, email threads, and filing cabinets with no way to cross-reference.',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  {
    icon: Clock,
    title: 'Audit prep takes weeks',
    description: 'Safety officers spend 3–4 weeks manually compiling compliance records for every regulatory inspection.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Search,
    title: 'Critical info stays buried',
    description: 'A regulation buried on page 147 of a 300-page manual gets missed. The cost is a failed audit, or worse — an incident.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Users,
    title: 'Institutional knowledge walks out',
    description: "When senior engineers retire, decades of operational insight goes with them. There's no system to capture or query it.",
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: AlertTriangle,
    title: 'Compliance gaps go undetected',
    description: 'Without continuous monitoring, violations surface only during inspections — creating legal exposure and operational shutdowns.',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  {
    icon: TrendingDown,
    title: 'Decisions lag behind data',
    description: 'Operational decisions are made on gut feel or outdated reports, not real-time intelligence from the operational record.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
];

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 sm:py-32 bg-[#05030A] relative overflow-hidden border-t border-white/5">
      
      {/* Ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.05),transparent_70%)] pointer-events-none" />

      <div className="mx-auto max-w-[1200px] px-6 relative z-10">
        
        <div className="max-w-2xl mb-20">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-[11px] font-mono tracking-[0.2em] uppercase text-red-400 mb-4"
          >
            The Problem
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-white leading-[1.1] mb-6"
          >
            Mining operations are drowning in unstructured data
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-white/50 leading-relaxed"
          >
            The mining industry generates millions of documents annually. Almost none of it is queryable, connected, or actionable.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((problem, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.07 }}
              className="group p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:-translate-y-2 hover:border-white/30 hover:bg-white/[0.06] hover:shadow-[0_10px_40px_-10px_rgba(255,255,255,0.05)] transition-all duration-500 ease-out cursor-default relative"
            >
              <div className={`size-10 rounded-xl flex items-center justify-center mb-4 ${problem.bg}`}>
                <problem.icon className={`size-5 ${problem.color}`} />
              </div>
              <h3 className="text-white font-semibold mb-2 text-[15px]">{problem.title}</h3>
              <p className="text-sm text-white/45 leading-relaxed">{problem.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
