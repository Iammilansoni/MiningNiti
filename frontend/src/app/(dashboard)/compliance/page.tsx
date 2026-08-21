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
import { ConfirmDeleteDialog } from '@/components/product/confirm-delete-dialog';
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
import { PageHeader } from '@/components/product/page-header';

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

  // Native confirm() replaced with the styled, focus-trapped AlertDialog.
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);

  const handleDelete = (auditId: string, title: string) => {
    setPendingDelete({ id: auditId, title });
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
      <PageHeader
        title="Compliance Audits"
        description="Cross-reference operational documents against regulatory requirements"
        actions={
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
        }
      />

      {/* Audit List */}
      <SectionCard>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : audits.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <div className="relative mb-5">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
                <ShieldCheck className="size-6 text-primary" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              No compliance audits yet
            </h3>
            <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              An audit cross-references an operational document against a
              regulatory one and returns a per-clause matrix of pass, fail and
              not-addressed.
            </p>
            {/* The empty state says what is needed to proceed. Without a
                regulatory document there is nothing to audit against, so
                pointing at the upload is more useful than a disabled button. */}
            <Button
              className="mt-6"
              onClick={() => setIsCreateOpen(true)}
              disabled={regDocs.length === 0}
            >
              <Plus className="mr-2 size-4" />
              Run your first audit
            </Button>
            {regDocs.length === 0 && (
              <p className="mt-3 text-xs text-muted-foreground/70">
                Upload a document categorised as regulatory to enable this.
              </p>
            )}
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

      <ConfirmDeleteDialog
        target={pendingDelete?.title ?? null}
        onOpenChange={(open) => { if (!open) setPendingDelete(null); }}
        onConfirm={() => {
          if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
          setPendingDelete(null);
        }}
        title={pendingDelete ? `Delete audit "${pendingDelete.title}"?` : undefined}
      />
    </div>
  );
}
