'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

// ─── Single animated word ─────────────────────────────────────────────────────

function Word({
  children,
  progress,
  range,
  isPremium
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  isPremium?: boolean;
}) {
  const opacity = useTransform(progress, range, [0.1, 1]);
  const filter = useTransform(progress, range, ['blur(8px)', 'blur(0px)']);
  const y = useTransform(progress, range, ['8px', '0px']);
  
  const premiumColor = useTransform(progress, range, ['rgba(167, 139, 250, 0.2)', 'rgba(196, 181, 253, 1)']);
  const normalColor = useTransform(progress, range, ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 1)']);
  const color = isPremium ? premiumColor : normalColor;

  const premiumShadow = useTransform(progress, range, ['0px 0px 0px rgba(167, 139, 250, 0)', '0px 0px 30px rgba(167, 139, 250, 0.4)']);
  const normalShadow = useTransform(progress, range, ['0px 0px 0px rgba(255,255,255,0)', '0px 0px 20px rgba(255,255,255,0.1)']);
  const textShadow = isPremium ? premiumShadow : normalShadow;

  return (
    <motion.span 
      style={{ opacity, filter, y, color, textShadow }} 
      className={`inline-block mr-[0.25em] mb-[0.1em] ${isPremium ? 'font-serif italic font-light tracking-normal' : 'font-sans font-bold tracking-[-0.04em]'}`}
    >
      {children}
    </motion.span>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

const WORDS_DATA = [
  { text: "MiningNiti", premium: false },
  { text: "turns", premium: false },
  { text: "decades", premium: false },
  { text: "of", premium: false },
  { text: "fragmented", premium: false },
  { text: "safety", premium: false },
  { text: "logs,", premium: false },
  { text: "compliance", premium: false },
  { text: "records,", premium: false },
  { text: "and", premium: false },
  { text: "unstructured", premium: false },
  { text: "archives", premium: false },
  { text: "into", premium: false },
  { text: "a", premium: false },
  { text: "single,", premium: false },
  { text: "instantly", premium: false },
  { text: "queryable", premium: false },
  { text: "source", premium: true },
  { text: "of", premium: true },
  { text: "truth.", premium: true },
  { text: "Welcome", premium: false },
  { text: "to", premium: false },
  { text: "the", premium: false },
  { text: "new", premium: false },
  { text: "standard", premium: false },
  { text: "for", premium: false },
  { text: "mining", premium: true },
  { text: "intelligence.", premium: true },
];

export function ScrollTextSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const RANGE_START = 0.3;
  const RANGE_END = 0.7;
  const rangePerWord = (RANGE_END - RANGE_START) / WORDS_DATA.length;

  return (
    <section
      ref={containerRef}
      className="relative bg-[#05030A] selection:bg-primary/30"
      style={{ minHeight: '180vh' }}
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        
        {/* Deep premium background elements */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,#000_20%,transparent_100%)]" />
        </div>
        
        {/* Animated Orbs */}
        <motion.div 
          className="absolute top-1/4 -left-1/4 md:left-1/4 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-[100px] pointer-events-none"
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 -right-1/4 md:right-1/4 w-[40rem] h-[40rem] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"
          animate={{ x: [0, -50, 0], y: [0, -60, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 mx-auto w-full max-w-[1100px] px-6 text-center flex flex-col items-center justify-center">
          
          {/* Subtle Top Badge */}
          <motion.div 
            className="flex items-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/50" />
            <span className="uppercase tracking-[0.3em] text-[0.65rem] font-bold text-primary/80">
              The Intelligence Layer
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary/50" />
          </motion.div>

          {/* Highlighted paragraph */}
          <p
            className="flex flex-wrap justify-center items-center"
            style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)', lineHeight: 1.15 }}
          >
            {WORDS_DATA.map((wordObj, i) => {
              const start = RANGE_START + i * rangePerWord;
              const end = start + rangePerWord * 1.8;
              return (
                <Word
                  key={i}
                  progress={scrollYProgress}
                  range={[Math.min(start, 0.99), Math.min(end, 1)]}
                  isPremium={wordObj.premium}
                >
                  {wordObj.text}
                </Word>
              );
            })}
          </p>
        </div>
      </div>
    </section>
  );
}

