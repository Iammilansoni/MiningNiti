'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { HardHat, FileCheck, Building2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const useCases = [
  {
    id: 'safety',
    icon: HardHat,
    label: 'Safety Teams',
    title: 'Never miss a safety violation again',
    description: 'MiningNiti continuously monitors your safety logs, shift reports, and equipment inspection records against DGMS regulations. The moment a gap appears, your safety officer is notified — before the inspector arrives.',
    query: 'Were all ventilation checks completed on Shaft B in October?',
    answer: `Found 31 records for October.\n⚠ Missing: Oct 14 (Morning shift) — No signatures from Safety Officer.\n✓ All other 30 days complete.\n\nSources: Shaft_B_Safety_Log_Oct.pdf (Pages 12–43)`,
    stat: { value: '92%', label: 'reduction in audit prep time' },
    color: '#F59E0B',
  },
  {
    id: 'compliance',
    icon: FileCheck,
    label: 'Compliance Officers',
    title: 'Audit-ready in 48 hours, not 4 weeks',
    description: 'Connect your permit archives, ERP data, and regulatory correspondence. MiningNiti builds a compliance knowledge graph that answers auditor questions with precise, citation-backed responses in seconds.',
    query: 'List all active environmental permits and their expiry dates.',
    answer: `Found 8 active environmental permits:\n\n1. Water Discharge Permit WD-2024-11 — Expires Jun 2026\n2. Air Quality Permit AQ-2023-07 — Expires Dec 2025\n3. Mining Lease ML-0041 — Expires Mar 2027\n\nSee Permits/Environmental/ for full docs.`,
    stat: { value: '48hrs', label: 'average audit preparation time' },
    color: '#947AFC',
  },
  {
    id: 'operations',
    icon: Building2,
    label: 'Operations Managers',
    title: 'Decades of operational insight, instantly queryable',
    description: 'Surface patterns from 10+ years of bore logs, maintenance records, and incident reports. What used to require calling a retired engineer is now a query away.',
    query: 'What were the common failure modes for Drill Rig #7 between 2019–2022?',
    answer: `Analyzed 847 maintenance records for Rig #7.\n\nTop failure modes:\n1. Hydraulic seal failure — 34 incidents (avg every 41 days)\n2. Drill bit wear — 28 incidents\n3. Motor overheating — 19 incidents\n\nPeak failure months: June–August (heat stress).`,
    stat: { value: '10yrs', label: 'of operational history queryable' },
    color: '#34D399',
  },
];

export function UseCasesSection() {
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const activeCase = useCases[active];

  return (
    <section ref={ref} className="py-24 sm:py-32 bg-[#05030A] border-t border-white/5 relative overflow-hidden">
      
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-[radial-gradient(ellipse_at_bottom,rgba(148,122,252,0.07),transparent_70%)] pointer-events-none" />

      <div className="mx-auto max-w-[1200px] px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-[11px] font-mono tracking-[0.2em] uppercase text-purple-400 mb-4"
          >
            Built for your team
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-white"
          >
            Every team. One intelligence layer.
          </motion.h2>
        </div>

        {/* Tab Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center gap-2 mb-12 flex-wrap"
        >
          {useCases.map((uc, i) => (
            <button
              key={uc.id}
              onClick={() => setActive(i)}
              suppressHydrationWarning
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300',
                active === i
                  ? 'bg-white text-black shadow-lg scale-105'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              )}
            >
              <uc.icon className="size-4" />
              {uc.label}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="grid lg:grid-cols-2 gap-10 items-center max-w-5xl mx-auto"
          >
            {/* Left: Story */}
            <div>
              <div className="text-4xl font-bold text-white mb-4 leading-tight">
                {activeCase.title}
              </div>
              <p className="text-white/60 text-[16px] leading-relaxed mb-8">
                {activeCase.description}
              </p>
              <div className="flex items-start gap-4 p-6 bg-white/4 rounded-2xl border border-white/10">
                <div className="text-[clamp(2rem,3vw,2.5rem)] font-bold leading-none" style={{ color: activeCase.color }}>
                  {activeCase.stat.value}
                </div>
                <div className="text-sm text-white/50 pt-1">{activeCase.stat.label}</div>
              </div>
            </div>

            {/* Right: Live Query Demo */}
            <div className="bg-[#0A0A0A] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              {/* Query input */}
              <div className="border-b border-white/10 p-5 flex items-start gap-3">
                <div className="size-7 rounded-full bg-purple-400/20 border border-[#947AFC]/30 flex items-center justify-center shrink-0 mt-0.5">
                  <ChevronRight className="size-3 text-purple-400" />
                </div>
                <p className="text-sm text-white/80 font-medium leading-relaxed">
                  {activeCase.query}
                </p>
              </div>

              {/* Answer */}
              <div className="p-5 font-mono text-xs text-white/60 leading-[2] whitespace-pre-wrap bg-[#060606]">
                {activeCase.answer.split('\n').map((line, i) => (
                  <motion.div
                    key={`${active}-${i}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                    className={cn(
                      'block',
                      line.startsWith('⚠') && 'text-amber-400',
                      line.startsWith('✓') && 'text-emerald-400',
                      line.startsWith('Sources:') && 'text-purple-400',
                      line.startsWith('See') && 'text-purple-400',
                    )}
                  >
                    {line || '\u00A0'}
                  </motion.div>
                ))}
                {/* Blinking cursor */}
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-1.5 h-3.5 bg-purple-400 ml-1 align-middle"
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
