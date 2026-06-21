'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocuments, deleteDocument } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import { SectionCard } from '@/components/product/section-card';
import { StatusBadge } from '@/components/product/status';
import {
  FileText, Search, Upload, Filter, MoreVertical,
  Download, Trash, Eye, RefreshCw, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UploadModal } from '@/components/documents/UploadModal';
import { toast } from 'sonner';

export default function DocumentsPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const pageSize = 15;

  // Debounce search input
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    clearTimeout((window as any).__searchTimer);
    (window as any).__searchTimer = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  }, []);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['documents', page, debouncedSearch],
    queryFn: () => getDocuments(getToken, {
      page,
      page_size: pageSize,
      search: debouncedSearch || undefined,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => deleteDocument(documentId, getToken),
    onSuccess: () => {
      toast.success('Document deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete document');
    },
  });

  const handleDelete = (documentId: string, fileName: string) => {
    if (confirm(`Delete "${fileName}"? This action cannot be undone.`)) {
      deleteMutation.mutate(documentId);
    }
  };

  const handleViewDetails = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  const docs = data?.documents || [];

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Document Registry</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Manage, upload, and track compliance documents.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button className="gap-2" onClick={() => setIsUploadOpen(true)}>
            <Upload className="w-4 h-4" /> Upload Document
          </Button>
        </div>
      </div>

      <UploadModal open={isUploadOpen} onOpenChange={setIsUploadOpen} />

      <SectionCard className="p-0 border border-border bg-card shadow-sm overflow-hidden z-10 relative">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between bg-muted/20">
          {/* ── Search (now wired!) ── */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search documents by name or category..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            />
          </div>

          {/* Stats row */}
          {data && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
              <span className="font-medium text-foreground">{data.total}</span> documents
              {data.stats?.avg_safety_score && (
                <span className="hidden md:flex items-center gap-1">
                  <span>Avg Safety:</span>
                  <span className="font-semibold text-emerald-500">{data.stats.avg_safety_score}/100</span>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold">Document Name</th>
                <th className="px-6 py-4 font-semibold hidden md:table-cell">Category</th>
                <th className="px-6 py-4 font-semibold hidden lg:table-cell">Safety Score</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold hidden sm:table-cell">Uploaded</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-3">
                      <div className="h-4 bg-muted/60 rounded animate-pulse w-full" />
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <AlertTriangle className="w-8 h-8 text-destructive/60" />
                      <p className="text-destructive font-medium">Failed to load documents.</p>
                      <Button variant="outline" size="sm" onClick={() => refetch()}>Try Again</Button>
                    </div>
                  </td>
                </tr>
              ) : docs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <FileText className="w-8 h-8 opacity-40" />
                      <p className="font-medium">
                        {debouncedSearch ? `No documents matching "${debouncedSearch}"` : 'No documents yet. Upload one to get started.'}
                      </p>
                      {!debouncedSearch && (
                        <Button size="sm" onClick={() => setIsUploadOpen(true)}>
                          <Upload className="w-4 h-4 mr-2" /> Upload Document
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                docs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    onClick={() => handleViewDetails(doc.id)}
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <FileText className="size-4 text-primary shrink-0" />
                        <span className="truncate max-w-[200px] md:max-w-xs">{doc.title || doc.file_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell capitalize">
                      {doc.category?.replace('_', ' ') || '—'}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      {doc.safety_score != null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${doc.safety_score >= 70 ? 'bg-emerald-500' : doc.safety_score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${doc.safety_score}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold tabular-nums">{doc.safety_score}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {doc.status === 'completed' && <StatusBadge label="Verified" tone="success" />}
                      {doc.status === 'processing' && <StatusBadge label="Processing" tone="info" pulse />}
                      {doc.status === 'failed' && <StatusBadge label="Failed" tone="danger" />}
                      {doc.status === 'pending' && <StatusBadge label="Pending" tone="neutral" />}
                      {doc.status === 'analyzing' && <StatusBadge label="Analyzing" tone="warning" pulse />}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                      {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                          <DropdownMenuLabel className="text-foreground">Document Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem
                            className="text-foreground focus:bg-accent cursor-pointer"
                            onClick={() => handleViewDetails(doc.id)}
                          >
                            <Eye className="w-4 h-4 mr-2 text-muted-foreground" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-foreground focus:bg-accent cursor-pointer"
                            onClick={() => window.open(doc.file_url, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-2 text-muted-foreground" /> Download File
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                            onClick={() => handleDelete(doc.id, doc.file_name)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-muted/10">
          <span className="text-sm text-muted-foreground">
            {data ? `Showing ${docs.length} of ${data.total} document${data.total !== 1 ? 's' : ''}` : 'Loading...'}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 text-sm text-muted-foreground">Page {page}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={docs.length < pageSize}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
