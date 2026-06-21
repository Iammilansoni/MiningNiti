import { cn } from '@/lib/utils';

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function SectionCard({ children, className, onClick }: SectionCardProps) {
  return (
    <div 
      className={cn('rounded-xl border border-white/8 bg-white/2 shadow-lg relative overflow-hidden', className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
