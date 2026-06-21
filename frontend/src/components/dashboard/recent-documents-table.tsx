'use client';

import { SectionCard } from '@/components/product/section-card';
import { StatusBadge } from '@/components/product/status';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getDocuments } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export function RecentDocumentsTable() {
  const { getToken } = useAuth();
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['recent-documents'],
    queryFn: () => getDocuments(getToken, { page_size: 5 }),
  });

  const recentDocs = data?.documents || [];

  return (
    <SectionCard className="flex flex-col h-full bg-card shadow-sm border border-border">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">Recent Documents</h2>
        <Button variant="ghost" size="sm" asChild className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-accent">
          <Link href="/dashboard/documents">
            View All <ArrowRight className="ml-1 size-3" />
          </Link>
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-muted-foreground">
            <tr>
              <th className="h-9 px-4 text-left font-medium">Document</th>
              <th className="h-9 px-4 text-left font-medium hidden sm:table-cell">Category</th>
              <th className="h-9 px-4 text-left font-medium">Status</th>
              <th className="h-9 px-4 text-right font-medium hidden md:table-cell">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="p-4"><Skeleton className="h-5 w-48" /></td>
                  <td className="p-4 hidden sm:table-cell"><Skeleton className="h-5 w-24" /></td>
                  <td className="p-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                  <td className="p-4 hidden md:table-cell"><Skeleton className="h-5 w-24 ml-auto" /></td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-destructive font-medium">Failed to load recent documents. Please try again.</td>
              </tr>
            ) : recentDocs.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-muted-foreground">No recent documents found.</td>
              </tr>
            ) : (
              recentDocs.map((doc) => (
                <tr key={doc.id} className="border-b border-border hover:bg-muted/20 transition-colors last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="size-4 text-primary shrink-0" />
                      <span className="font-medium truncate text-foreground/90">{doc.title || doc.file_name}</span>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell text-muted-foreground">
                    {doc.category || 'Uncategorized'}
                  </td>
                  <td className="p-4">
                    {doc.status === 'completed' && <StatusBadge label="Verified" tone="success" />}
                    {doc.status === 'processing' && <StatusBadge label="Processing" tone="info" pulse />}
                    {doc.status === 'failed' && <StatusBadge label="Failed" tone="danger" />}
                    {doc.status === 'pending' && <StatusBadge label="Pending" tone="neutral" />}
                    {doc.status === 'analyzing' && <StatusBadge label="Analyzing" tone="warning" pulse />}
                  </td>
                  <td className="p-4 hidden md:table-cell text-right text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
