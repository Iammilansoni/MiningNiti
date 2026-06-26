import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

type Tone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

const toneStyles: Record<Tone, string> = {
  info: 'text-blue-400',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  danger: 'text-rose-400',
  neutral: 'text-foreground/40',
};

const iconBgStyles: Record<Tone, string> = {
  info: 'bg-blue-500/10',
  success: 'bg-emerald-500/10',
  warning: 'bg-amber-500/10',
  danger: 'bg-rose-500/10',
  neutral: 'bg-foreground/5',
};

const hoverGlowStyles: Record<Tone, string> = {
  info: 'group-hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)] group-hover:border-blue-500/30',
  success: 'group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)] group-hover:border-emerald-500/30',
  warning: 'group-hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.15)] group-hover:border-amber-500/30',
  danger: 'group-hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.15)] group-hover:border-rose-500/30',
  neutral: 'group-hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.05)] group-hover:border-white/20',
};

// Animated Number Component
function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  detail?: string;
  icon: LucideIcon;
  tone?: Tone;
  trend?: { label: string; direction?: 'up' | 'down' | 'flat' };
  className?: string;
}

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'neutral',
  trend,
  className,
}: MetricCardProps) {
  
  // Extract number if it's a number to animate it
  const isNumber = typeof value === 'number';
  // Attempt to parse string values like "100%" to animate just the number part
  const stringMatch = typeof value === 'string' ? value.match(/^([\d,]+)(.*)$/) : null;
  const numValue = isNumber ? value : stringMatch ? parseInt(stringMatch[1].replace(/,/g, ''), 10) : NaN;
  const suffix = stringMatch ? stringMatch[2] : '';

  return (
    <div
      className={cn(
        'group rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-5 flex flex-col gap-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-500 relative overflow-hidden',
        hoverGlowStyles[tone],
        'hover:-translate-y-1',
        className
      )}
    >
      {/* Subtle radial background glow for depth */}
      <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-0 group-hover:opacity-40 transition-opacity duration-700", iconBgStyles[tone])} />

      <div className="flex items-center justify-between relative z-10">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-foreground/50">{label}</span>
        <div
          className={cn(
            'flex size-8 items-center justify-center rounded-lg',
            iconBgStyles[tone]
          )}
        >
          <Icon className={cn('size-4', toneStyles[tone])} />
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-3xl font-semibold tracking-tight tabular-nums text-foreground flex items-center">
          {!isNaN(numValue) ? <AnimatedNumber value={numValue} /> : value}
          {suffix}
        </p>
        {detail && (
          <p className="mt-1 text-xs text-white/40">{detail}</p>
        )}
      </div>

      {trend && (
        <p className={cn("text-[13px] font-medium mt-1 relative z-10", trend.direction === 'up' ? 'text-emerald-400' : trend.direction === 'down' ? 'text-rose-400' : 'text-foreground/40')}>
          {trend.label}
        </p>
      )}
    </div>
  );
}
