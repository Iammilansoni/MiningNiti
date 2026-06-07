'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, FileSearch, Sparkles, ShieldCheck, Server, Cloud, HardDrive, FileText, Code2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const nodes = [
  {
    id: 'ingest',
    title: 'Data Ingestion',
    description: 'Connect to internal drives, ERPs, and document stores.',
    icon: Database,
    log: [
      '[INFO] Connecting to smb://mining-corp/archives...',
      '[PROCESS] Indexing directory tree...',
      '[SUCCESS] Indexed 4,291 new documents'
    ]
  },
  {
    id: 'parse',
    title: 'Semantic Parsing',
    description: 'Extract text, tables, and geological data accurately.',
    icon: FileSearch,
    log: [
      '[PROCESS] Running OCR on Q3_Audit_Scan.pdf',
      '[EXTRACT] Parsing spatial tabular layout...',
      '[EXTRACT] Found 14 tables, 3 anomalies'
    ]
  },
  {
    id: 'reason',
    title: 'AI Reasoning Layer',
    description: 'Apply compliance logic and operational context.',
    icon: Sparkles,
    log: [
      '[QUERY] Checking ventilation compliance (Sect 4)',
      '[REASONING] DGMS 2024 requires 2x/day checks',
      '[FINDING] Missing signatures on Oct 14'
    ]
  },
  {
    id: 'act',
    title: 'Operational Output',
    description: 'Generate reports, trigger alerts, answer queries.',
    icon: ShieldCheck,
    log: [
      '[ACTION] Generating compliance summary...',
      '[API] Sending payload to external webhook...',
      '[ALERT] Triggered High Priority Alert to Safety Officer'
    ]
  }
];

const AUTO_CYCLE_DURATION = 7000; // 7 seconds per node

export function PipelineDiagram() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeData = nodes[activeIndex];

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % nodes.length);
    }, AUTO_CYCLE_DURATION);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, activeIndex]);

  // --- Visualizer Components ---
  const IngestVisualizer = () => (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(148,122,252,0.1),transparent_70%)]" />
      {/* Central Core */}
      <div className="relative z-10 size-20 rounded-2xl bg-[#05030A] border border-[#947AFC]/30 shadow-[0_0_30px_rgba(148,122,252,0.2)] flex items-center justify-center">
        <Database className="size-8 text-[#947AFC]" />
      </div>
      {/* Floating Sources */}
      <motion.div animate={{ x: [50, 0], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute right-[60%] top-[20%]">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10"><Cloud className="size-5 text-white/40" /></div>
      </motion.div>
      <motion.div animate={{ x: [-50, 0], opacity: [0, 1, 0] }} transition={{ duration: 2.5, delay: 0.5, repeat: Infinity, ease: "linear" }} className="absolute left-[60%] bottom-[20%]">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10"><HardDrive className="size-5 text-white/40" /></div>
      </motion.div>
      <motion.div animate={{ y: [-50, 0], opacity: [0, 1, 0] }} transition={{ duration: 1.8, delay: 1, repeat: Infinity, ease: "linear" }} className="absolute top-[60%] right-[30%]">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10"><FileText className="size-5 text-white/40" /></div>
      </motion.div>
    </div>
  );

  const ParseVisualizer = () => (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="relative size-32 rounded-lg border border-white/20 bg-white/5 p-4 flex flex-col gap-3">
        <div className="h-2 w-3/4 bg-white/20 rounded" />
        <div className="h-2 w-full bg-white/10 rounded" />
        <div className="h-2 w-5/6 bg-white/10 rounded" />
        <div className="h-10 w-full border border-dashed border-white/20 rounded mt-2 flex items-center justify-center">
          <Code2 className="size-4 text-white/20" />
        </div>
        {/* Scanning Laser */}
        <motion.div 
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 3, ease: "linear", repeat: Infinity }}
          className="absolute left-0 right-0 h-4 bg-gradient-to-b from-transparent to-[#947AFC]/30 border-b border-[#947AFC] z-20"
        />
      </div>
      {/* Extracted Data flying out */}
      <motion.div animate={{ x: [0, 60], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} className="absolute right-[20%] text-[#947AFC] font-mono text-xs">
        {`{ "type": "table" }`}
      </motion.div>
      <motion.div animate={{ x: [0, -60], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 1.2 }} className="absolute left-[20%] text-[#947AFC] font-mono text-xs">
        {`{ "text": "Clause 4.1" }`}
      </motion.div>
    </div>
  );

  const ReasonVisualizer = () => (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(148,122,252,0.15),transparent_60%)]" />
      {/* Neural Nodes */}
      <div className="relative w-48 h-48">
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
          <line x1="50%" y1="50%" x2="20%" y2="20%" stroke="#947AFC" strokeWidth="2" />
          <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="#947AFC" strokeWidth="2" />
          <line x1="50%" y1="50%" x2="50%" y2="80%" stroke="#947AFC" strokeWidth="2" />
        </svg>
        {/* Center Node */}
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-12 bg-[#947AFC] rounded-full shadow-[0_0_30px_#947AFC]" />
        {/* Outer Nodes */}
        <div className="absolute top-[20%] left-[20%] -translate-x-1/2 -translate-y-1/2 size-6 bg-white/20 backdrop-blur-md rounded-full border border-white/30" />
        <div className="absolute top-[20%] right-[20%] translate-x-1/2 -translate-y-1/2 size-6 bg-white/20 backdrop-blur-md rounded-full border border-white/30" />
        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 translate-y-1/2 size-6 bg-white/20 backdrop-blur-md rounded-full border border-white/30" />
      </div>
    </div>
  );

  const ActVisualizer = () => (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden gap-4 perspective-1000">
      <motion.div 
        initial={{ opacity: 0, y: 20, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-[#0A0A0A] border border-red-500/30 rounded-xl p-4 shadow-[0_10px_40px_rgba(239,68,68,0.15)] flex gap-4 items-start"
      >
        <div className="p-2 rounded-lg bg-red-500/10"><AlertCircle className="size-5 text-red-500" /></div>
        <div>
          <div className="text-sm font-semibold text-white mb-1">Safety Violation Detected</div>
          <div className="text-xs text-white/50">Missing signatures on Shift Log #402. Triggering webhook...</div>
        </div>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, y: 20, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-64 bg-[#0A0A0A] border border-emerald-500/30 rounded-xl p-4 shadow-[0_10px_40px_rgba(16,185,129,0.1)] flex gap-4 items-center"
      >
        <div className="p-2 rounded-lg bg-emerald-500/10"><ShieldCheck className="size-5 text-emerald-500" /></div>
        <div className="text-sm font-semibold text-white">Dashboard Updated</div>
      </motion.div>
    </div>
  );

  const renderVisualizer = () => {
    switch (activeData.id) {
      case 'ingest': return <IngestVisualizer />;
      case 'parse': return <ParseVisualizer />;
      case 'reason': return <ReasonVisualizer />;
      case 'act': return <ActVisualizer />;
      default: return null;
    }
  };

  return (
    <section className="py-24 sm:py-32 relative bg-[#05030A] overflow-hidden border-t border-white/5" id="architecture">
      
      <div className="mx-auto max-w-[var(--landing-max-width)] px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#947AFC] mb-4">
            Platform Architecture
          </p>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight mb-4 text-white">Engineered for Industrial Data</h2>
          <p className="text-lg text-white/60">
            MiningNiti processes unstructured, legacy mining documents into a secure, queryable intelligence graph.
          </p>
        </div>

        <div 
          className="grid lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-16 items-center max-w-6xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          
          {/* Interactive Stepper (Left) */}
          <div className="relative flex flex-col">
            {/* Connecting Line */}
            <div className="absolute left-[27px] top-8 bottom-8 w-[2px] bg-white/5 -z-10" />
            
            {nodes.map((node, index) => {
              const isActive = activeIndex === index;
              return (
                <div key={node.id} className="relative flex group">
                  
                  {/* Step Node */}
                  <div className="mr-6 shrink-0 relative flex flex-col items-center">
                    <button
                      suppressHydrationWarning
                      onClick={() => {
                        setActiveIndex(index);
                        setIsPaused(true);
                      }}
                      className={cn(
                        "size-[54px] rounded-2xl flex items-center justify-center transition-all duration-500 border-2 relative bg-[#05030A]",
                        isActive 
                          ? "border-[#947AFC] shadow-[0_0_20px_rgba(148,122,252,0.4)]" 
                          : "border-white/10 group-hover:border-white/30"
                      )}
                    >
                      <node.icon className={cn("size-6 transition-colors", isActive ? "text-[#947AFC]" : "text-white/30")} />
                      
                      {/* Radial Progress Ring */}
                      {isActive && !isPaused && (
                         <svg className="absolute inset-[-4px] size-[62px] -rotate-90 pointer-events-none">
                            <motion.circle 
                              cx="31" cy="31" r="29" 
                              fill="none" 
                              stroke="rgba(148,122,252,0.5)" 
                              strokeWidth="2"
                              strokeDasharray="182"
                              initial={{ strokeDashoffset: 182 }}
                              animate={{ strokeDashoffset: 0 }}
                              transition={{ duration: AUTO_CYCLE_DURATION / 1000, ease: "linear" }}
                            />
                         </svg>
                      )}
                    </button>
                  </div>

                  {/* Text Content */}
                  <div className={cn(
                    "pb-12 pt-2 transition-all duration-500",
                    isActive ? "opacity-100" : "opacity-40 hover:opacity-70 cursor-pointer"
                  )}
                  onClick={() => {
                    setActiveIndex(index);
                    setIsPaused(true);
                  }}>
                    <h3 className={cn(
                      "text-xl font-bold mb-2 transition-colors",
                      isActive ? "text-white" : "text-white/60"
                    )}>
                      {node.title}
                    </h3>
                    <p className="text-[15px] text-white/50 leading-relaxed">
                      {node.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Premium Visualizer Card (Right) */}
          <div className="h-full flex flex-col justify-center">
            <div className="bg-[#0C0C0C] rounded-3xl border border-white/10 overflow-hidden flex flex-col h-[500px] shadow-2xl relative">
              
              {/* Top: Animated Visualization */}
              <div className="flex-1 relative overflow-hidden bg-[#05030A]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeData.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                  >
                    {renderVisualizer()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom: Glassmorphic Terminal */}
              <div className="h-[180px] shrink-0 bg-[#0A0A0A]/80 backdrop-blur-xl border-t border-white/10 p-6 flex flex-col relative z-20">
                <div className="flex items-center gap-2 mb-4 text-[10px] text-white/30 uppercase tracking-[0.15em] font-sans font-semibold">
                  <Server className="size-3" /> Real-time Processing Log
                </div>
                
                <div className="flex flex-col gap-1.5 font-mono text-xs flex-1 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={activeData.id + "-logs"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col gap-1.5"
                    >
                      {activeData.log.map((line, i) => (
                        <motion.div 
                          key={`${activeData.id}-log-${i}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.6 }} // Faster sequential processing delay
                          className="flex items-start text-white/50"
                        >
                          <span className="text-[#947AFC]/50 select-none w-4 shrink-0">&gt;</span>
                          <span className="whitespace-pre-wrap leading-[1.6]">
                            {line.includes('[SUCCESS]') || line.includes('[STATUS]') ? (
                               <span className="text-emerald-400">{line}</span>
                            ) : line.includes('[ALERT]') || line.includes('[FINDING]') ? (
                               <span className="text-amber-400">{line}</span>
                            ) : line.includes('[ERROR]') ? (
                               <span className="text-red-400">{line}</span>
                            ) : line.includes('[QUERY]') ? (
                               <span className="text-[#947AFC]">{line}</span>
                            ) : (
                               <span>{line}</span>
                            )}
                          </span>
                        </motion.div>
                      ))}
                      {/* Blinking cursor */}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: activeData.log.length * 0.6 }}
                        className="ml-4 w-2 h-3 bg-[#947AFC] mt-1"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
