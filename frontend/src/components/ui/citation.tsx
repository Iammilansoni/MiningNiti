import React from 'react';
import { FileText } from 'lucide-react';
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
  // Format page numbers like "Pages 12-13" or "Page 5"
  const formatPages = (pages: number[]) => {
    if (!pages || pages.length === 0) return '';
    if (pages.length === 1) return `p. ${pages[0]}`;
    
    // Check if contiguous
    const sorted = [...pages].sort((a, b) => a - b);
    let contiguous = true;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] !== sorted[i - 1] + 1) {
        contiguous = false;
        break;
      }
    }
    
    if (contiguous && sorted.length > 1) {
      return `pp. ${sorted[0]}-${sorted[sorted.length - 1]}`;
    }
    
    return `pp. ${sorted.join(', ')}`;
  };

  const pageStr = formatPages(pageNumbers);

  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium cursor-pointer transition-colors",
        "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary-foreground border border-primary/20 hover:border-primary/40",
        "hover-lift shadow-sm",
        className
      )}
      title={`Source: ${fileName}${pageNumbers.length ? ` (Pages: ${pageNumbers.join(', ')})` : ''}`}
      onClick={() => {
        // Future: Trigger a viewer modal or side-panel with the specific document and page
        console.log(`View citation: ${fileName}`, pageNumbers);
      }}
      {...props}
    >
      <FileText className="w-3 h-3" />
      <span className="max-w-[120px] truncate">{fileName.replace(/\.pdf$/i, '')}</span>
      {pageStr && <span className="opacity-75">{pageStr}</span>}
    </span>
  );
}
