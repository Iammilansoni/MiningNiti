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
    <SectionCard className="flex flex-col h-full bg-white/[0.02] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/[0.08] rounded-2xl">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">Recent Documents</h2>
        <Button variant="ghost" size="sm" asChild className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-accent">
          <Link href="/documents">
            View All <ArrowRight className="ml-1 size-3" />
          </Link>
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.02] text-foreground/50 border-b border-white/[0.05]">
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
                <td colSpan={4} className="p-12">
                  <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 text-foreground/40">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-medium text-foreground tracking-tight">No documents yet</h3>
                    <p className="text-[13px] text-foreground/50 mt-1 max-w-[250px]">
                      Upload your first safety protocol or incident report to see it tracked here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              recentDocs.map((doc) => (
                <tr key={doc.id} className="group border-b border-white/[0.05] hover:bg-white/[0.03] transition-all duration-300 last:border-0 hover:shadow-[inset_4px_0_0_#3B82F6]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="size-4 text-primary shrink-0" />
                      <span className="font-medium truncate text-foreground/90">{doc.title || doc.file_name}</span>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell text-foreground/50">
                    {doc.category || 'Uncategorized'}
                  </td>
                  <td className="p-4">
                    {doc.status === 'completed' && <StatusBadge label="Verified" tone="success" />}
                    {doc.status === 'processing' && <StatusBadge label="Processing" tone="info" pulse />}
                    {doc.status === 'failed' && <StatusBadge label="Failed" tone="danger" />}
                    {doc.status === 'pending' && <StatusBadge label="Pending" tone="neutral" />}
                    {doc.status === 'analyzing' && <StatusBadge label="Analyzing" tone="warning" pulse />}
                  </td>
                  <td className="p-4 hidden md:table-cell text-right text-foreground/50 whitespace-nowrap">
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
