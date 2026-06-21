import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

type Tone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

const toneStyles: Record<Tone, string> = {
  info: 'text-[#4B8BF5]',
  success: 'text-[#34D399]',
  warning: 'text-[#FBBF24]',
  danger: 'text-[#F87171]',
  neutral: 'text-white/40',
};

const iconBgStyles: Record<Tone, string> = {
  info: 'bg-[#4B8BF5]/10',
  success: 'bg-[#34D399]/10',
  warning: 'bg-[#FBBF24]/10',
  danger: 'bg-[#F87171]/10',
  neutral: 'bg-white/5',
};

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
  return (
    <div
      className={cn(
        'rounded-xl border border-white/8 bg-white/2 p-5 flex flex-col gap-3 shadow-lg hover:bg-white/4 transition-colors relative overflow-hidden',
        className
      )}
    >
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-white/50">{label}</span>
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
        <p className="text-3xl font-semibold tracking-tight tabular-nums text-white">
          {value}
        </p>
        {detail && (
          <p className="mt-1 text-xs text-white/40">{detail}</p>
        )}
      </div>

      {trend && (
        <p className={cn("text-[13px] font-medium mt-1 relative z-10", trend.direction === 'up' ? 'text-[#34D399]' : trend.direction === 'down' ? 'text-[#F87171]' : 'text-white/40')}>
          {trend.label}
        </p>
      )}
    </div>
  );
}
