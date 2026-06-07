'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AnnouncementBanner() {
  const [count, setCount] = useState(14842);

  // Simulate live ingestion of pages
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => prev + Math.floor(Math.random() * 5) + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative z-50 flex w-full items-center justify-center border-b border-white/5 bg-black/60 px-4 py-2 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 font-mono text-[11px] sm:text-xs">
        <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
          </span>
          <span className="font-bold uppercase tracking-wider text-[10px]">OreIQ Live Telemetry</span>
        </div>
        
        <span className="hidden sm:inline-block text-white/20">|</span>
        
        <div className="flex items-center gap-2 text-white/80">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span>
            Indexing mining compliance logs: <span className="font-bold text-amber-400 tabular-nums">{count.toLocaleString()}</span> pages processed today.
          </span>
        </div>

        <Link 
          href="/dashboard" 
          className="group flex items-center gap-1 font-semibold text-primary hover:text-primary/80 transition-colors ml-2"
        >
          View System Status 
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
