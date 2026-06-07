import { cn } from '@/lib/utils';

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ children, className }: SectionCardProps) {
  return (
    <div className={cn('surface-elevated overflow-hidden', className)}>
      {children}
    </div>
  );
}
