'use client';

import { useState, useEffect } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';
import { Calculator, TrendingDown, Clock, ShieldCheck } from 'lucide-react';

function AnimatedNumber({ value, suffix = '', prefix = '' }: { value: number, suffix?: string, prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (v) => {
        setDisplayValue(Math.round(v));
      },
    });
    return controls.stop;
  }, [value]);

  return (
    <span>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

export function RoiCalculator() {
  const [sites, setSites] = useState(5);
  const [audits, setAudits] = useState(4); // audits per site per year

  // Assumptions
  // Without MiningNiti: ~120 hours prep per audit
  // With MiningNiti: ~48 hours prep per audit
  // Savings: 72 hours per audit
  const hoursSavedPerAudit = 72;
  const totalAudits = sites * audits;
  const totalHoursSaved = totalAudits * hoursSavedPerAudit;
  
  // Cost savings estimate (Assuming ₹1,500/hr for compliance officer time)
  const costSavings = totalHoursSaved * 1500;

  return (
    <section className="py-24 sm:py-32 bg-[#05030A] relative overflow-hidden border-t border-white/5">
      
      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.06),transparent_60%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_bottom_left,rgba(148,122,252,0.06),transparent_60%)] pointer-events-none" />

      <div className="mx-auto max-w-[1000px] px-6 relative z-10">
        
        <div className="text-center mb-16">
          <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#947AFC] mb-4">
            ROI Calculator
          </p>
          <h2 className="text-[clamp(2rem,3vw,2.5rem)] font-bold tracking-tight text-white mb-4">
            Calculate your operational savings
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            See how much time and capital your compliance teams can reclaim by automating document intelligence across your enterprise.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Controls Panel */}
          <div className="bg-[#0C0C0C] border border-white/10 rounded-3xl p-8 lg:p-10 shadow-2xl relative group hover:border-white/20 transition-all duration-500">
            <Calculator className="absolute top-8 right-8 size-8 text-white/5 group-hover:text-[#947AFC]/20 transition-colors duration-500" />
            
            <h3 className="text-xl font-semibold text-white mb-8">Your Scale</h3>

            {/* Slider 1 */}
            <div className="mb-10">
              <div className="flex justify-between items-end mb-4">
                <label className="text-sm font-medium text-white/70">Number of Active Sites</label>
                <div className="text-2xl font-bold text-white font-mono">{sites}</div>
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                value={sites} 
                onChange={(e) => setSites(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#947AFC] hover:accent-[#a892ff] transition-all"
              />
              <div className="flex justify-between mt-2 text-[10px] text-white/30 font-mono">
                <span>1</span>
                <span>50+</span>
              </div>
            </div>

            {/* Slider 2 */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-4">
                <label className="text-sm font-medium text-white/70">Compliance Audits <span className="text-white/40">(per site, per year)</span></label>
                <div className="text-2xl font-bold text-white font-mono">{audits}</div>
              </div>
              <input 
                type="range" 
                min="1" 
                max="12" 
                value={audits} 
                onChange={(e) => setAudits(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#947AFC] hover:accent-[#a892ff] transition-all"
              />
              <div className="flex justify-between mt-2 text-[10px] text-white/30 font-mono">
                <span>1</span>
                <span>12</span>
              </div>
            </div>

          </div>

          {/* Results Panel */}
          <div className="flex flex-col gap-4">
            
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-3xl p-8 relative overflow-hidden group hover:border-emerald-500/40 transition-colors duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px]" />
              <div className="flex items-center gap-3 mb-4">
                <Clock className="size-5 text-emerald-400" />
                <h4 className="text-emerald-400 font-medium">Estimated Hours Saved</h4>
              </div>
              <div className="text-[clamp(3rem,5vw,4.5rem)] font-bold text-white leading-none tracking-tight mb-2 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <AnimatedNumber value={totalHoursSaved} suffix=" hrs" />
              </div>
              <p className="text-sm text-emerald-400/60 font-mono uppercase tracking-widest">Per Year</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 group hover:bg-white/[0.05] transition-colors duration-500">
                <TrendingDown className="size-4 text-[#947AFC] mb-3" />
                <div className="text-2xl font-bold text-white mb-1">
                  <AnimatedNumber value={costSavings} prefix="₹" />
                </div>
                <p className="text-[11px] text-white/50 leading-snug">Cost reduction in manual prep</p>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 group hover:bg-white/[0.05] transition-colors duration-500">
                <ShieldCheck className="size-4 text-amber-400 mb-3" />
                <div className="text-2xl font-bold text-white mb-1">85%</div>
                <p className="text-[11px] text-white/50 leading-snug">Decrease in missed compliance gaps</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
