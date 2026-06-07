import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

type Tone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

const toneStyles: Record<Tone, string> = {
  info: 'text-blue-500 dark:text-blue-400',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  danger: 'text-red-500 dark:text-red-400',
  neutral: 'text-muted-foreground',
};

const iconBgStyles: Record<Tone, string> = {
  info: 'bg-blue-500/10 dark:bg-blue-400/10',
  success: 'bg-emerald-500/10 dark:bg-emerald-400/10',
  warning: 'bg-amber-500/10 dark:bg-amber-400/10',
  danger: 'bg-red-500/10 dark:bg-red-400/10',
  neutral: 'bg-muted',
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
        'surface-elevated p-4 flex flex-col gap-3',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-overline">{label}</span>
        <div
          className={cn(
            'flex size-8 items-center justify-center rounded-md',
            iconBgStyles[tone]
          )}
        >
          <Icon className={cn('size-4', toneStyles[tone])} />
        </div>
      </div>

      <div>
        <p className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
          {value}
        </p>
        {detail && (
          <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
        )}
      </div>

      {trend && (
        <p className="text-xs text-muted-foreground/80">{trend.label}</p>
      )}
    </div>
  );
}
