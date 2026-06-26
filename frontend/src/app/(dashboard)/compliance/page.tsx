'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocuments, getComplianceAudits, createComplianceAudit, deleteComplianceAudit } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import { SectionCard } from '@/components/product/section-card';
import { StatusBadge } from '@/components/product/status';
import {
  ShieldCheck, Plus, Trash2, Eye, FileCheck, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function CompliancePage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [auditTitle, setAuditTitle] = useState('');
  const [selectedRegDoc, setSelectedRegDoc] = useState('');
  const [selectedOpDocs, setSelectedOpDocs] = useState<string[]>([]);
  const pageSize = 20;

  const { data: auditData, isLoading } = useQuery({
    queryKey: ['complianceAudits', page],
    queryFn: () => getComplianceAudits(getToken, { page, page_size: pageSize }),
  });

  const { data: docData } = useQuery({
    queryKey: ['documents-for-audit'],
    queryFn: () => getDocuments(getToken, { page: 1, page_size: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: { title: string; regulation_doc_id: string; operational_doc_ids: string[] }) =>
      createComplianceAudit(data, getToken),
    onSuccess: () => {
      toast.success('Compliance audit started');
      setIsCreateOpen(false);
      setAuditTitle('');
      setSelectedRegDoc('');
      setSelectedOpDocs([]);
      queryClient.invalidateQueries({ queryKey: ['complianceAudits'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create audit');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (auditId: string) => deleteComplianceAudit(auditId, getToken),
    onSuccess: () => {
      toast.success('Audit deleted');
      queryClient.invalidateQueries({ queryKey: ['complianceAudits'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete audit');
    },
  });

  const handleCreate = () => {
    if (!auditTitle.trim() || !selectedRegDoc || selectedOpDocs.length === 0) {
      toast.error('Fill in all fields and select at least one operational document');
      return;
    }
    createMutation.mutate({
      title: auditTitle,
      regulation_doc_id: selectedRegDoc,
      operational_doc_ids: selectedOpDocs,
    });
  };

  const handleDelete = (auditId: string, title: string) => {
    if (confirm(`Delete audit "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate(auditId);
    }
  };

  const toggleOpDoc = (docId: string) => {
    setSelectedOpDocs((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const allDocs = docData?.documents || [];
  const regDocs = allDocs.filter((d) => d.category === 'regulatory');
  const opDocs = allDocs.filter((d) => d.category !== 'regulatory' && d.status === 'completed');
  const audits = auditData?.audits || [];
  const total = auditData?.total || 0;

  const statusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success' as const;
      case 'running': return 'info' as const;
      case 'pending': return 'warning' as const;
      case 'failed': return 'danger' as const;
      default: return 'neutral' as const;
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance Audits</h1>
          <p className="text-muted-foreground mt-1">
            Cross-reference operational documents against regulatory requirements
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              New Audit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Compliance Audit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="audit-title">Audit Title</Label>
                <Input
                  id="audit-title"
                  placeholder="e.g., Q1 2026 MSHA Compliance Review"
                  value={auditTitle}
                  onChange={(e) => setAuditTitle(e.target.value)}
                />
              </div>
              <div>
                <Label>Regulation Document</Label>
                <Select value={selectedRegDoc} onValueChange={setSelectedRegDoc}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a regulatory document" />
                  </SelectTrigger>
                  <SelectContent>
                    {regDocs.length === 0 && (
                      <SelectItem value="__none" disabled>
                        No regulatory documents found. Upload one first.
                      </SelectItem>
                    )}
                    {regDocs.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Operational Documents to Audit ({selectedOpDocs.length} selected)</Label>
                <div className="border rounded-md max-h-48 overflow-y-auto mt-1">
                  {opDocs.length === 0 && (
                    <p className="p-3 text-sm text-muted-foreground">
                      No processed operational documents found.
                    </p>
                  )}
                  {opDocs.map((doc) => (
                    <label
                      key={doc.id}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 cursor-pointer border-b last:border-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedOpDocs.includes(doc.id)}
                        onChange={() => toggleOpDoc(doc.id)}
                        className="rounded"
                      />
                      <span className="text-sm truncate">{doc.title}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? 'Starting Audit...' : 'Run Audit'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Audit List */}
      <SectionCard>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : audits.length === 0 ? (
          <div className="text-center py-12">
            <ShieldCheck className="mx-auto size-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold">No compliance audits yet</h3>
            <p className="text-muted-foreground mt-1">
              Upload regulatory documents and run your first compliance audit.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {audits.map((audit) => (
              <div
                key={audit.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
                    <FileCheck className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium truncate">{audit.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <StatusBadge tone={statusVariant(audit.status)} label={audit.status} />
                      {audit.overall_score != null && (
                        <span className="font-medium">
                          Score: {audit.overall_score}%
                        </span>
                      )}
                      {audit.total_clauses != null && (
                        <span>
                          {audit.compliant_count ?? 0}/{audit.total_clauses} compliant
                        </span>
                      )}
                      {audit.created_at && (
                        <span>
                          {formatDistanceToNow(new Date(audit.created_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/compliance/${audit.id}`)}
                  >
                    <Eye className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(audit.id, audit.title)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
