import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Actions rendered on the trailing edge — buttons, dialog triggers. */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * The page title block, shared across the dashboard sections.
 *
 * Each page previously rolled its own: the same markup repeated five times
 * with the weight drifting between `font-bold` and `font-semibold` and the
 * gap between title and description set differently on every page. Small
 * inconsistencies like that are individually invisible and collectively read
 * as carelessness, so the block lives in one place.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.03em] text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
