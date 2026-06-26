'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('miningniti-ab-dismissed');
    if (!dismissed) {
      // Delay entrance to mimic Gladia's ab-rise animation
      const timer = setTimeout(() => setIsVisible(true), 900);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsVisible(false);
    localStorage.setItem('miningniti-ab-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 48, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "fixed bottom-6 left-1/2 z-[9000] flex w-[min(calc(100vw-48px),1160px)] items-center overflow-hidden rounded-2xl p-4 sm:px-7 sm:py-[18px]",
            "border border-black/10 shadow-[0_16px_48px_rgba(0,0,0,0.16),_0_4px_16px_rgba(0,0,0,0.09),_0_1px_0_rgba(255,255,255,0.6)_inset]"
          )}
          style={{
            background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='ab-n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23ab-n)' opacity='.09'/%3E%3C/svg%3E"), linear-gradient(135deg, #FAF7F2 0%, color-mix(in srgb, var(--color-purple-400) 6%, #FAFAFA) 100%)`,
            backgroundSize: '200px 200px, 100% 100%'
          }}
        >
          {/* Subtle tape/sticker detail on the left corner */}
          <div 
            className="absolute -top-1 left-9 h-4 w-[58px] rounded-[1px] bg-[#E8DCC4] opacity-60 pointer-events-none"
            style={{ transform: 'rotate(-1.6deg)' }}
          />

          <div className="flex w-full items-center">
            {/* Badge */}
            <div className="shrink-0 whitespace-nowrap rounded bg-[#0C0C0C] px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-white uppercase">
              New Release
            </div>

            <div className="mx-4 sm:mx-6 h-8 w-px shrink-0 bg-black/10 hidden sm:block" />

            {/* Content */}
            <div className="flex min-w-0 flex-1 flex-col gap-1 ml-4 sm:ml-0">
              <h3 className="m-0 truncate whitespace-nowrap font-decorative text-xl sm:text-2xl font-bold leading-[1.1] text-[#0C0C0C]">
                <span 
                  className="px-1 text-[#252525]"
                  style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' viewBox=\'0 0 100 100\' preserveAspectRatio=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,80 Q50,60 100,80 L100,100 L0,100 Z\' fill=\'rgba(148,122,252,0.3)\'/%3E%3C/svg%3E")',
                    backgroundSize: '100% 40%',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center 85%',
                  }}
                >
                  MiningNiti OS 2.0
                </span>
                {' '}is live
              </h3>
              <p className="m-0 truncate whitespace-nowrap text-xs text-[#7c7873] hidden md:block">
                Automated compliance auditing against DGMS 2024 standards.
              </p>
            </div>

            {/* CTA */}
            <div className="ml-4 sm:ml-6 flex shrink-0 items-center justify-center relative pr-8 sm:pr-10">
              <Link 
                href="/announcement"
                className="relative z-10 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[rgba(148,122,252,0.32)] bg-[color-mix(in_srgb,var(--color-purple-400)_11%,#FAF7F2)] px-4 py-2 text-[13px] font-medium text-primary no-underline transition-colors hover:border-[rgba(148,122,252,0.55)] hover:bg-[color-mix(in_srgb,var(--color-purple-400)_20%,#FAF7F2)]"
              >
                Read Announcement
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="shrink-0">
                  <path d="M1 5.5H10M10 5.5L5.5 1M10 5.5L5.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              
              {/* Close Button */}
              <button 
                onClick={handleDismiss}
                className="absolute right-0 top-1/2 flex size-6 sm:size-[26px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-[#FAF7F2]/80 p-0 text-[#7c7873] transition-colors hover:border-black/20 hover:bg-[#FAF7F2] hover:text-[#4d463b] z-20"
                aria-label="Close announcement"
              >
                <X className="size-2.5 sm:size-3" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
