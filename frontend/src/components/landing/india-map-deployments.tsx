'use client';

import { motion } from 'framer-motion';

const NODES = [
  { id: 'hq', label: 'Dhanbad (JH)', x: 388, y: 316, primary: true },
  { id: 'n1', label: 'Udaipur (RJ)', x: 120, y: 297, primary: false },
  { id: 'n2', label: 'Singrauli (MP)', x: 308, y: 307, primary: false },
  { id: 'n3', label: 'Nagpur (MH)', x: 232, y: 381, primary: false },
  { id: 'n4', label: 'Godavari (TS)', x: 242, y: 436, primary: false },
  { id: 'n5', label: 'Korba (CG)', x: 310, y: 352, primary: false },
];

const EDGES = [
  { from: 'hq', to: 'n2' },
  { from: 'hq', to: 'n5' },
  { from: 'n2', to: 'n3' },
  { from: 'n3', to: 'n4' },
  { from: 'n3', to: 'n1' },
  { from: 'hq', to: 'n1' },
];

export function IndiaMapDeployments() {
  return (
    <section className="py-24 sm:py-32 bg-[#05030A] border-t border-white/5 relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(148,122,252,0.08)_0%,transparent_50%)] pointer-events-none" />

      <div className="mx-auto max-w-[1200px] px-6 relative z-10 flex flex-col md:flex-row items-center gap-12 lg:gap-20">
        
        <div className="md:w-1/3 text-left">
          <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-purple-400 mb-4">
            National Scale
          </p>
          <h2 className="text-[clamp(2rem,3vw,2.5rem)] font-bold tracking-tight text-white mb-6 leading-[1.1]">
            Deploy across remote sites seamlessly
          </h2>
          <p className="text-white/50 text-lg mb-8 leading-relaxed">
            Mining operations are distributed, often in low-bandwidth zones. MiningNiti’s edge-sync architecture ensures that safety officers in Dhanbad and executives in Mumbai share the exact same intelligence graph in real time.
          </p>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-purple-400 shadow-[0_0_10px_#947AFC]" />
              <span className="text-sm font-mono text-white/70">Centralized Cloud Hub</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              <span className="text-sm font-mono text-white/70">Edge-synced Remote Sites</span>
            </div>
          </div>
        </div>

        {/* Real India Network Map */}
        <div className="md:w-2/3 w-full aspect-square bg-[#0A0A0A]/50 border border-white/10 rounded-3xl relative overflow-hidden flex items-center justify-center p-4 sm:p-8 backdrop-blur-md shadow-2xl">
          
          {/* Abstract Grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px]" />

          {/* Map Container */}
          <div className="relative w-full max-w-[500px]" style={{ aspectRatio: '612/696' }}>
            
            {/* Detailed India Map with State Borders */}
            <img 
              src="/india-states.svg" 
              alt="India Map with State Borders" 
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            {/* Glowing Network Nodes */}
            <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 612 696" preserveAspectRatio="xMidYMid meet">
              {/* Edges */}
              {EDGES.map((edge, i) => {
                const a = NODES.find(n => n.id === edge.from)!;
                const b = NODES.find(n => n.id === edge.to)!;
                
                // Draw a smooth curved path between nodes
                const midX = (a.x + b.x) / 2;
                const midY = (a.y + b.y) / 2 - 40; // offset for curve
                const pathData = `M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`;
                
                return (
                  <g key={i}>
                    {/* Static faded line */}
                    <path 
                      d={pathData} 
                      fill="none" 
                      stroke="rgba(255,255,255,0.05)" 
                      strokeWidth="2" 
                    />
                    {/* Glowing animated line */}
                    <motion.path 
                      d={pathData} 
                      fill="none" 
                      stroke={a.primary ? "rgba(148,122,252,0.4)" : "rgba(52,211,153,0.4)"}
                      strokeWidth="2"
                      strokeDasharray="8 12"
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: i * 0.2 }}
                    />
                    {/* Data particle travelling */}
                    <motion.circle
                      r="4"
                      fill={a.primary ? "#947AFC" : "#34d399"}
                      initial={{ offsetDistance: "0%" }}
                      animate={{ offsetDistance: "100%" }}
                      transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
                      style={{ offsetPath: `path('${pathData}')` }}
                    />
                  </g>
                );
              })}

              {/* Nodes */}
              {NODES.map((node, i) => (
                <g key={node.id}>
                  {/* Pulse ring */}
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r="8"
                    fill="none"
                    stroke={node.primary ? "#947AFC" : "#34d399"}
                    strokeWidth="1.5"
                    animate={{ r: [8, 24, 8], opacity: [0.8, 0, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                  />
                  
                  {/* Core dot */}
                  <circle 
                    cx={node.x} 
                    cy={node.y} 
                    r={node.primary ? "7" : "4"} 
                    fill={node.primary ? "#947AFC" : "#34d399"} 
                  />
                  
                  {/* Label */}
                  <motion.text
                    x={node.x}
                    y={node.y + 20}
                    textAnchor="middle"
                    fontSize="12"
                    fill="rgba(255,255,255,0.8)"
                    fontFamily="monospace"
                    initial={{ opacity: 0, y: 5 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1 + i * 0.1 }}
                  >
                    {node.label}
                  </motion.text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
