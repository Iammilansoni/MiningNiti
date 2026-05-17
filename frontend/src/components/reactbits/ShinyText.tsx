// src/components/reactbits/ShinyText.tsx
// Shiny animated text effect inspired by ReactBits

'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ShinyTextProps {
  children: React.ReactNode;
  className?: string;
  shimmerWidth?: number;
}

export function ShinyText({ children, className, shimmerWidth = 100 }: ShinyTextProps) {
  return (
    <motion.span
      className={cn(
        'relative inline-block bg-clip-text text-transparent',
        'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400',
        'bg-[length:200%_100%]',
        className
      )}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 3,
        ease: 'linear',
        repeat: Infinity,
      }}
    >
      {children}
    </motion.span>
  );
}
