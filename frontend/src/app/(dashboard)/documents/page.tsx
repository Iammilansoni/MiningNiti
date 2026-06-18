'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDocuments } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import { SectionCard } from '@/components/product/section-card';
import { StatusBadge } from '@/components/product/status';
import { FileText, Search, Upload, Filter, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DocumentsPage() {
  const { getToken } = useAuth();
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const { data, isLoading } = useQuery({
    queryKey: ['documents', page],
    queryFn: () => getDocuments(getToken, { page, page_size: pageSize }),
  });

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
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button className="gap-2">
            <Upload className="w-4 h-4" /> Upload Document
          </Button>
        </div>
      </div>

      <SectionCard className="p-0 border border-border bg-card shadow-sm overflow-hidden z-10 relative">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between bg-muted/20">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search documents by name or category..." 
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold">Document Name</th>
                <th className="px-6 py-4 font-semibold hidden md:table-cell">Category</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold hidden sm:table-cell">Uploaded Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Loading documents...
                  </td>
                </tr>
              ) : docs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No documents found.
                  </td>
                </tr>
              ) : (
                docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <FileText className="size-4 text-primary shrink-0" />
                        <span className="truncate max-w-[200px] md:max-w-xs">{doc.title || doc.file_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                      {doc.category || 'Uncategorized'}
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
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder if needed */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-muted/10">
          <span className="text-sm text-muted-foreground">
            Showing {docs.length} document{docs.length !== 1 ? 's' : ''}
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
