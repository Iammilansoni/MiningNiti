// src/components/dashboard/StatCard.tsx
// Animated stat card with number animation

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  iconClassName,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animate the number
  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const stepDuration = duration / steps;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm',
        'transition-shadow hover:shadow-md',
        className
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-transparent via-transparent to-primary/5 pointer-events-none" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <motion.span
              className="text-3xl font-bold tracking-tight"
              key={displayValue}
            >
              {displayValue.toLocaleString()}
            </motion.span>
            {trend && (
              <span
                className={cn(
                  'text-xs font-medium px-1.5 py-0.5 rounded-full',
                  trend.isPositive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>

        <div
          className={cn(
            'p-3 rounded-xl bg-linear-to-br from-cyan-500/10 to-blue-500/10',
            iconClassName
          )}
        >
          <Icon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
        </div>
      </div>
    </motion.div>
  );
}
