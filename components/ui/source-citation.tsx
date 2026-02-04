'use client';

import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Source {
  file: string;
  page: number;
}

interface SourceCitationProps {
  sources: Source[];
  className?: string;
}

export function SourceCitation({ sources, className }: SourceCitationProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className={cn('mt-4 pt-3 border-t border-border', className)}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
        Sources
      </p>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, index) => (
          <div
            key={`${source.file}-${source.page}-${index}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-xs text-foreground hover:bg-primary/10 transition-colors"
          >
            <FileText className="h-3 w-3 text-primary" />
            <span className="font-medium">{source.file}</span>
            <span className="text-muted-foreground">– page {source.page}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SourceCitation;
