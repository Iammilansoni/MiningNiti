'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  decimals?: number;
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 2,
  className,
  decimals = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [hasAnimated, setHasAnimated] = useState(false);

  const spring = useSpring(0, {
    damping: 30,
    stiffness: 100,
    duration: duration * 1000,
  });

  const display = useTransform(spring, (latest) =>
    decimals > 0 ? latest.toFixed(decimals) : Math.floor(latest).toString()
  );

  useEffect(() => {
    if (isInView && !hasAnimated) {
      spring.set(value);
      setHasAnimated(true);
    }
  }, [isInView, value, spring, hasAnimated]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, suffix, prefix, icon, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex flex-col items-center justify-center p-6 rounded-2xl',
        'bg-card/50 backdrop-blur-sm border border-border',
        'hover:border-primary/30 hover:shadow-glow-sm transition-all duration-300',
        className
      )}
    >
      {icon && (
        <div className="mb-3 text-primary">{icon}</div>
      )}
      <div className="text-3xl md:text-4xl font-display font-bold text-foreground">
        <AnimatedCounter value={value} suffix={suffix} prefix={prefix} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
}
