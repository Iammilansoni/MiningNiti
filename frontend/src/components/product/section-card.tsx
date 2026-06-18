import { cn } from '@/lib/utils';

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function SectionCard({ children, className, onClick }: SectionCardProps) {
  return (
    <div 
      className={cn('rounded-xl border border-white/[0.08] bg-white/[0.02] shadow-lg relative overflow-hidden', className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
