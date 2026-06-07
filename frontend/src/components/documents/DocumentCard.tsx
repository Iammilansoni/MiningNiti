import { SectionCard } from '@/components/product/section-card';
import { StatusBadge, StatusTone } from '@/components/product/status';
import { CategoryChip, DocumentCategory } from '@/components/documents/CategoryChips';
import { FileText, MoreVertical, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentCardProps {
  id: string;
  title: string;
  category: DocumentCategory;
  status: 'verified' | 'pending' | 'flagged';
  date: string;
  size: string;
  onClick?: () => void;
}

const statusMap: Record<string, { label: string; tone: StatusTone }> = {
  verified: { label: 'Verified', tone: 'success' },
  pending: { label: 'Processing', tone: 'info' },
  flagged: { label: 'Flagged', tone: 'warning' },
};

export function DocumentCard({
  title,
  category,
  status,
  date,
  size,
  onClick,
}: DocumentCardProps) {
  const statusConfig = statusMap[status];

  return (
    <SectionCard className="surface-elevated-interactive group cursor-pointer" onClick={onClick}>
      <div className="flex flex-col h-full p-4 gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted border border-border group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate" title={title}>
                {title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span className="truncate">{size}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {date}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              // Menu action
            }}
          >
            <MoreVertical className="size-4" />
          </Button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
          <CategoryChip category={category} />
          <StatusBadge
            label={statusConfig.label}
            tone={statusConfig.tone}
            pulse={status === 'pending'}
          />
        </div>
      </div>
    </SectionCard>
  );
}
