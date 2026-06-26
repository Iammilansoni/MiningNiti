import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CitationProps extends React.HTMLAttributes<HTMLSpanElement> {
  fileName: string;
  pageNumbers?: number[];
  documentId?: string;
}

export function Citation({
  fileName,
  pageNumbers = [],
  documentId,
  className,
  ...props
}: CitationProps) {
  const formatPages = (pages: number[]) => {
    if (!pages || pages.length === 0) return '';
    if (pages.length === 1) return `p.${pages[0]}`;

    const sorted = [...pages].sort((a, b) => a - b);
    let contiguous = true;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] !== sorted[i - 1] + 1) {
        contiguous = false;
        break;
      }
    }

    if (contiguous && sorted.length > 1) {
      return `pp.${sorted[0]}-${sorted[sorted.length - 1]}`;
    }

    return `pp.${sorted.join(', ')}`;
  };

  const pageStr = formatPages(pageNumbers);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150",
        "bg-primary/10 text-primary border border-primary/15",
        "hover:bg-primary/20 hover:border-primary/30 hover:shadow-sm",
        "active:scale-[0.97]",
        className
      )}
      title={`Source: ${fileName}${pageNumbers.length ? ` (Pages: ${pageNumbers.join(', ')})` : ''}`}
      onClick={(e) => {
        if (props.onClick) {
          props.onClick(e as any);
        }
      }}
      {...props}
    >
      <FileText className="w-3 h-3 opacity-70" />
      <span className="max-w-[140px] truncate">{fileName.replace(/\.pdf$/i, '')}</span>
      {pageStr && <span className="opacity-60 text-[10px]">{pageStr}</span>}
      <ExternalLink className="w-2.5 h-2.5 opacity-40" />
    </span>
  );
}
