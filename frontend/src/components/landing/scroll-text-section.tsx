'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

// ─── Single animated word ─────────────────────────────────────────────────────

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const color = useTransform(
    progress,
    range,
    ['rgba(255,255,255,0.08)', 'rgba(255,255,255,1)']
  );

  // Optional: add a tiny bit of blur to un-highlighted words for depth
  const filter = useTransform(
    progress,
    range,
    ['blur(2px)', 'blur(0px)']
  );

  return (
    <motion.span style={{ color, filter }} className="inline-block mr-[0.25em] mb-[0.1em]">
      {children}
    </motion.span>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

const PARAGRAPH = "MiningNiti turns decades of fragmented safety logs, compliance records, and unstructured archives into a single, instantly queryable source of truth. Welcome to the new standard for mining intelligence.";

export function ScrollTextSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'], // starts when top enters, ends when bottom leaves
  });

  const words = PARAGRAPH.split(' ');
  // Core scroll range for the text reveal (middle 40% of the scroll)
  const RANGE_START = 0.3;
  const RANGE_END = 0.7;
  const rangePerWord = (RANGE_END - RANGE_START) / words.length;

  return (
    <section
      ref={containerRef}
      className="relative bg-[#05030A]"
      style={{ minHeight: '180vh' }}
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        
        {/* Very subtle center glow behind text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(148,122,252,0.04),transparent_50%)] pointer-events-none" />

        <div className="relative z-10 mx-auto w-full max-w-[900px] px-6 text-center flex flex-col items-center justify-center">
          
          {/* Highlighted paragraph */}
          <p
            className="font-bold leading-[1.3] tracking-[-0.03em] flex flex-wrap justify-center"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3.5rem)' }}
          >
            {words.map((word, i) => {
              const start = RANGE_START + i * rangePerWord;
              const end = start + rangePerWord * 1.8; // overlap for smooth cascade
              return (
                <Word
                  key={i}
                  progress={scrollYProgress}
                  range={[Math.min(start, 0.99), Math.min(end, 1)]}
                >
                  {word}
                </Word>
              );
            })}
          </p>
        </div>

      </div>
    </section>
  );
}

