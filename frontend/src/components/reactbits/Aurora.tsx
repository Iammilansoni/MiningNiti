// src/components/reactbits/Aurora.tsx
// Aurora background effect

'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AuroraProps {
  className?: string;
  children?: React.ReactNode;
}

export function Aurora({ className, children }: AuroraProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Aurora gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -inset-[100%] opacity-50"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            ease: 'linear',
            repeat: Infinity,
          }}
        >
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-radial from-cyan-500/40 via-transparent to-transparent blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-gradient-radial from-blue-500/30 via-transparent to-transparent blur-3xl" />
          <div className="absolute bottom-1/4 left-1/2 w-[400px] h-[400px] bg-gradient-radial from-purple-500/30 via-transparent to-transparent blur-3xl" />
        </motion.div>
        
        <motion.div
          className="absolute -inset-[100%] opacity-30"
          animate={{
            rotate: [360, 0],
          }}
          transition={{
            duration: 25,
            ease: 'linear',
            repeat: Infinity,
          }}
        >
          <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] bg-gradient-radial from-teal-500/40 via-transparent to-transparent blur-3xl" />
          <div className="absolute bottom-1/3 left-1/3 w-[600px] h-[600px] bg-gradient-radial from-indigo-500/30 via-transparent to-transparent blur-3xl" />
        </motion.div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
