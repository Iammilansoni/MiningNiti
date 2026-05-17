import { Mountain } from 'lucide-react';
import { ShinyText } from '@/components/reactbits';

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="relative">
        {/* Outer glow rings */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 animate-ping opacity-75" />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/40 to-teal-600/40 animate-pulse blur-xl" />
        
        {/* Core logo container */}
        <div className="relative bg-card border border-border p-5 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg relative overflow-hidden">
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <Mountain className="w-7 h-7 text-white" />
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <h2 className="font-bold text-lg tracking-tight">
              <span className="text-foreground">Mining</span>
              <span className="text-emerald-500">Niti</span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                    style={{
                      animation: `pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                      animationDelay: `${i * 0.15}s`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
