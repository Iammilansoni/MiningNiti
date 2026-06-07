import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
  icon?: LucideIcon;
  pulse?: boolean;
  className?: string;
}

const badgeToneStyles: Record<StatusTone, string> = {
  success: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 border-amber-500/20',
  danger: 'bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 border-blue-500/20',
  neutral: 'bg-muted text-muted-foreground border-border',
};

const dotToneStyles: Record<StatusTone, string> = {
  success: 'bg-emerald-500 dark:bg-emerald-400 text-emerald-500 dark:text-emerald-400',
  warning: 'bg-amber-500 dark:bg-amber-400 text-amber-500 dark:text-amber-400',
  danger: 'bg-red-500 dark:bg-red-400 text-red-500 dark:text-red-400',
  info: 'bg-blue-500 dark:bg-blue-400 text-blue-500 dark:text-blue-400',
  neutral: 'bg-muted-foreground text-muted-foreground',
};

export function StatusBadge({
  label,
  tone = 'neutral',
  icon: Icon,
  pulse = false,
  className,
}: StatusBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
        badgeToneStyles[tone],
        className
      )}
    >
      {pulse ? (
        <span className={cn('status-pulse', dotToneStyles[tone])} />
      ) : Icon ? (
        <Icon className="size-3.5" />
      ) : (
        <span className={cn('status-dot', dotToneStyles[tone])} />
      )}
      {label}
    </div>
  );
}

interface StatusDotProps {
  tone?: StatusTone;
  pulse?: boolean;
  className?: string;
}

export function StatusDot({ tone = 'neutral', pulse = false, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        pulse ? 'status-pulse' : 'status-dot',
        dotToneStyles[tone],
        className
      )}
    />
  );
}
