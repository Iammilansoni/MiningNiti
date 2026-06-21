'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

/* ── Brand Mark — Pickaxe Head silhouette ── */
export function MiningNitiMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-8', className)}
      aria-hidden="true"
    >
      {/* Premium dark purple background */}
      <rect width="36" height="36" rx="8" fill="#0C0C0C" />
      <rect width="36" height="36" rx="8" fill="url(#purple-grad)" opacity="0.3" />

      <defs>
        <linearGradient id="purple-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#947AFC" />
          <stop offset="1" stopColor="#947AFC" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 
        Modern Geometric Pickaxe Head
        Built with sharp overlapping polygons for an engineered/AI look
      */}
      
      {/* Left Blade (Flat Adze) */}
      <path
        d="M 8 18 L 18 10 L 21 13 L 11 21 Z"
        fill="white"
        opacity="0.9"
      />
      
      {/* Right Blade (Sharp Pick) */}
      <path
        d="M 21 13 L 18 10 L 29 20 L 25 23 Z"
        fill="white"
        opacity="0.5"
      />

      {/* Center Socket / Join */}
      <path
        d="M 18 10 L 21 13 L 16 17 L 13 14 Z"
        fill="white"
      />

      {/* Subtle handle stump indicating the connection point */}
      <path
        d="M 15 16 L 19 12 L 23 23 L 19 25 Z"
        fill="#947AFC"
        opacity="0.8"
      />
    </svg>
  );
}

/* ── Brand Logo (Mark + Wordmark) ── */
export function MiningNitiLogo({
  href,
  className,
}: {
  href?: string;
  className?: string;
}) {
  const content = (
    <span className={cn('flex items-center gap-2.5', className)}>
      <MiningNitiMark />
      <span className="text-[15px] font-bold tracking-tight text-white leading-none">
        Mining<span className="text-purple-400">Niti</span>
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="focus-visible:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
