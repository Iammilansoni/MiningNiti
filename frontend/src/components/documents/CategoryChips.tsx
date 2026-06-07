import { cn } from '@/lib/utils';
import { ShieldCheck, Target, Droplets, HardHat, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type DocumentCategory = 'Safety' | 'Compliance' | 'Geological' | 'Maintenance' | 'Other';

const categoryConfig: Record<DocumentCategory, { icon: LucideIcon; style: string }> = {
  Safety: { icon: HardHat, style: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  Compliance: { icon: ShieldCheck, style: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  Geological: { icon: Target, style: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  Maintenance: { icon: Droplets, style: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
  Other: { icon: FileText, style: 'text-muted-foreground bg-muted border-border' },
};

interface CategoryChipProps {
  category: DocumentCategory;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
  interactive?: boolean;
}

export function CategoryChip({
  category,
  className,
  onClick,
  isActive = false,
  interactive = false,
}: CategoryChipProps) {
  const config = categoryConfig[category] || categoryConfig.Other;
  const Icon = config.icon;

  const baseClasses = cn(
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border transition-colors',
    isActive ? config.style : 'border-transparent text-muted-foreground bg-muted hover:bg-muted/80 hover:text-foreground',
    interactive && 'cursor-pointer',
    className
  );

  return (
    <div className={baseClasses} onClick={interactive ? onClick : undefined}>
      <Icon className="size-3.5" />
      {category}
    </div>
  );
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  className,
}: {
  categories: DocumentCategory[];
  selectedCategory: DocumentCategory | null;
  onSelectCategory: (category: DocumentCategory | null) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <div
        className={cn(
          'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border cursor-pointer transition-colors',
          selectedCategory === null
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80 hover:text-foreground'
        )}
        onClick={() => onSelectCategory(null)}
      >
        All
      </div>
      {categories.map((category) => (
        <CategoryChip
          key={category}
          category={category}
          isActive={selectedCategory === category}
          interactive
          onClick={() => onSelectCategory(category)}
        />
      ))}
    </div>
  );
}
