// src/components/reactbits/GlitchText.tsx
// Glitch text effect

'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlitchTextProps {
  children: string;
  className?: string;
}

export function GlitchText({ children, className }: GlitchTextProps) {
  return (
    <motion.span
      className={cn('relative inline-block', className)}
      whileHover="glitch"
    >
      {/* Main text */}
      <span className="relative z-10">{children}</span>
      
      {/* Glitch layers */}
      <motion.span
        className="absolute inset-0 text-cyan-500 opacity-0"
        variants={{
          glitch: {
            opacity: [0, 0.8, 0],
            x: [0, -2, 2, 0],
            transition: {
              duration: 0.2,
              repeat: 3,
            },
          },
        }}
        aria-hidden
      >
        {children}
      </motion.span>
      <motion.span
        className="absolute inset-0 text-red-500 opacity-0"
        variants={{
          glitch: {
            opacity: [0, 0.8, 0],
            x: [0, 2, -2, 0],
            transition: {
              duration: 0.2,
              repeat: 3,
              delay: 0.05,
            },
          },
        }}
        aria-hidden
      >
        {children}
      </motion.span>
    </motion.span>
  );
}
