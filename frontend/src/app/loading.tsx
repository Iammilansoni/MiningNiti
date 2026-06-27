'use client';

import { MiningNitiMark } from '@/components/product/brand';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05030A] overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-1/4 w-[50rem] h-[50rem] bg-purple-500/8 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-[40rem] h-[40rem] bg-blue-500/5 rounded-full blur-[100px] animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-violet-500/5 rounded-full blur-[80px] animate-pulse [animation-delay:2s]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_30%,transparent_100%)]" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo with glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full animate-pulse" />
          <div className="relative">
            <MiningNitiMark className="size-16" />
          </div>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 via-violet-400 to-purple-500 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" />
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-white/60 tracking-wide">
            Initializing MiningNiti
          </p>
          <p className="text-xs text-white/25 font-mono">
            Loading intelligence layer...
          </p>
        </div>
      </div>

      {/* Corner accents */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l border-t border-white/5" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r border-b border-white/5" />

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
