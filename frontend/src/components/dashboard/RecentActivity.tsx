// src/components/dashboard/RecentActivity.tsx
// Recent activity list with animations

'use client';

import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { FileText, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Document } from '@/lib/api';

interface RecentActivityProps {
  documents: Document[];
  className?: string;
}

const statusConfig = {
  processed: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  processing: {
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  failed: {
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
};

export function RecentActivity({ documents, className }: RecentActivityProps) {
  if (documents.length === 0) {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-6', className)}>
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No recent documents</p>
          <p className="text-sm text-muted-foreground/70">
            Upload your first document to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-border bg-card p-6', className)}>
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {documents.slice(0, 5).map((doc, index) => {
          const status = statusConfig[doc.status as keyof typeof statusConfig] || statusConfig.processing;
          const StatusIcon = status.icon;

          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className={cn('p-2 rounded-lg', status.bgColor)}>
                <StatusIcon className={cn('w-4 h-4', status.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                </p>
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                {doc.status}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
