import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-muted/50',
        'after:absolute after:inset-0',
        'after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent',
        'after:animate-shimmer',
        className
      )}
      {...props}
    />
  );
}

function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-border p-6 space-y-4', className)}>
      <Skeleton className="h-12 w-12 rounded-xl" />
      <Skeleton className="h-6 w-3/4" />
      <SkeletonText lines={2} />
    </div>
  );
}

function SkeletonAvatar({ className }: { className?: string }) {
  return <Skeleton className={cn('h-12 w-12 rounded-full', className)} />;
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar };
