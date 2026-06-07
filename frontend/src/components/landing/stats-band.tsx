'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
  { value: 4291, suffix: '+', label: 'Documents Indexed', description: 'Across mining companies in production' },
  { value: 99.2, suffix: '%', label: 'Extraction Accuracy', description: 'On complex scanned mining PDFs' },
  { value: 48, suffix: 'hrs', label: 'Audit Prep Time', description: 'Reduced from 3–4 weeks' },
  { value: 14, suffix: 'M+', label: 'Pages Processed', description: 'Of regulatory and operational data' },
];

function Counter({ value, suffix, duration = 2 }: { value: number; suffix: string; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const isFloat = !Number.isInteger(value);

  useEffect(() => {
    if (!isInView) return;
    const start = 0;
    const end = value;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(isFloat ? parseFloat((start + (end - start) * eased).toFixed(1)) : Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [isInView, value, duration, isFloat]);

  return (
    <span ref={ref}>
      {display}{suffix}
    </span>
  );
}

export function StatsBand() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="py-20 relative overflow-hidden border-t border-white/5" style={{
      background: 'linear-gradient(135deg, #0D0A1A 0%, #05030A 50%, #0A0510 100%)'
    }}>
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="mx-auto max-w-[1200px] px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="pt-8 lg:pt-0 lg:px-8 first:pt-0 first:lg:pl-0 last:lg:pr-0 text-center lg:text-left"
            >
              <div className="text-[clamp(2rem,4vw,3rem)] font-bold text-white leading-none mb-2 tabular-nums">
                <Counter value={stat.value} suffix={stat.suffix} duration={2} />
              </div>
              <div className="text-[15px] font-semibold text-white mb-1">{stat.label}</div>
              <div className="text-sm text-white/40">{stat.description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
