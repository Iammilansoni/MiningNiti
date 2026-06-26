'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getComplianceAuditDetail } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { SectionCard } from '@/components/product/section-card';
import { StatusBadge } from '@/components/product/status';
import {
  ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle,
  XCircle, ChevronDown, ChevronRight, FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function ComplianceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const auditId = params.id as string;

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const { data: audit, isLoading, isError } = useQuery({
    queryKey: ['complianceAuditDetail', auditId],
    queryFn: () => getComplianceAuditDetail(auditId, getToken),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      return data.status === 'pending' || data.status === 'running' ? 3000 : false;
    },
  });

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-8 animate-fade-in-up">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (isError || !audit) {
    return (
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-8 animate-fade-in-up">
        <div className="text-center py-12">
          <XCircle className="mx-auto size-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold">Audit not found</h3>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/compliance')}>
            Back to Audits
          </Button>
        </div>
      </div>
    );
  }

  const rows = audit.rows || [];
  const filteredRows = statusFilter === 'all'
    ? rows
    : rows.filter((r) => r.status === statusFilter);

  const progressPercent = audit.total_clauses
    ? Math.round((audit.processed_clauses / audit.total_clauses) * 100)
    : 0;

  const statusVariant = (s: string) => {
    switch (s) {
      case 'completed': return 'success' as const;
      case 'running': return 'info' as const;
      case 'pending': return 'warning' as const;
      case 'failed': return 'danger' as const;
      default: return 'neutral' as const;
    }
  };

  const clauseStatusIcon = (s: string) => {
    switch (s) {
      case 'compliant': return <CheckCircle2 className="size-4 text-green-500" />;
      case 'gap': return <AlertTriangle className="size-4 text-yellow-500" />;
      case 'missing': return <XCircle className="size-4 text-red-500" />;
      default: return null;
    }
  };

  const clauseStatusColor = (s: string) => {
    switch (s) {
      case 'compliant': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'gap': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'missing': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return '';
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-8 animate-fade-in-up">
      {/* Back + Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => router.push('/compliance')}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Audits
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{audit.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge tone={statusVariant(audit.status)} label={audit.status} />
              {audit.status === 'running' && audit.total_clauses && (
                <span className="text-sm text-muted-foreground">
                  {audit.processed_clauses}/{audit.total_clauses} clauses assessed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar for running audits */}
      {audit.status === 'running' && audit.total_clauses && (
        <SectionCard>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing clauses...</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </SectionCard>
      )}

      {/* Summary Cards */}
      {audit.status === 'completed' && audit.total_clauses && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SectionCard className="text-center py-6">
            <div className="text-3xl font-bold text-primary">
              {audit.overall_score ?? 0}%
            </div>
            <p className="text-sm text-muted-foreground mt-1">Overall Score</p>
          </SectionCard>
          <SectionCard className="text-center py-6">
            <div className="text-3xl font-bold text-green-500">
              {audit.compliant_count ?? 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Compliant</p>
          </SectionCard>
          <SectionCard className="text-center py-6">
            <div className="text-3xl font-bold text-yellow-500">
              {audit.gap_count ?? 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Gaps</p>
          </SectionCard>
          <SectionCard className="text-center py-6">
            <div className="text-3xl font-bold text-red-500">
              {audit.missing_count ?? 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Missing</p>
          </SectionCard>
        </div>
      )}

      {/* Error banner */}
      {audit.processing_error && (
        <SectionCard className="border-destructive/50 bg-destructive/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-destructive">Processing Error</h4>
              <p className="text-sm text-muted-foreground mt-1">{audit.processing_error}</p>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Filter tabs */}
      {rows.length > 0 && (
        <div className="flex items-center gap-2">
          {['all', 'compliant', 'gap', 'missing'].map((f) => (
            <Button
              key={f}
              variant={statusFilter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(f)}
            >
              {f === 'all' && `All (${rows.length})`}
              {f === 'compliant' && `Compliant (${audit.compliant_count ?? 0})`}
              {f === 'gap' && `Gaps (${audit.gap_count ?? 0})`}
              {f === 'missing' && `Missing (${audit.missing_count ?? 0})`}
            </Button>
          ))}
        </div>
      )}

      {/* Compliance Matrix */}
      <SectionCard>
        {rows.length === 0 && audit.status !== 'running' && audit.status !== 'pending' ? (
          <div className="text-center py-12">
            <ShieldCheck className="mx-auto size-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold">No clauses to display</h3>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin mx-auto size-8 border-2 border-primary border-t-transparent rounded-full mb-4" />
            <p className="text-muted-foreground">Waiting for results...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRows.map((row) => (
              <div key={row.clause_index} className="border rounded-lg overflow-hidden">
                {/* Row header */}
                <button
                  className="flex items-center justify-between w-full p-4 text-left hover:bg-muted/30 transition-colors"
                  onClick={() => toggleRow(row.clause_index)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {expandedRows.has(row.clause_index)
                      ? <ChevronDown className="size-4 shrink-0" />
                      : <ChevronRight className="size-4 shrink-0" />
                    }
                    {clauseStatusIcon(row.status)}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate max-w-[600px]">
                        {row.clause_text.slice(0, 120)}
                        {row.clause_text.length > 120 ? '...' : ''}
                      </p>
                      {row.section_title && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {row.section_title}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <Badge variant="outline" className={clauseStatusColor(row.status)}>
                      {row.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(row.confidence * 100)}%
                    </span>
                  </div>
                </button>

                {/* Expanded detail */}
                {expandedRows.has(row.clause_index) && (
                  <div className="px-4 pb-4 space-y-4 border-t bg-muted/10">
                    <div className="pt-4">
                      <h4 className="text-sm font-semibold mb-2">Full Clause</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {row.clause_text}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2">Assessment</h4>
                      <p className="text-sm">{row.assessment}</p>
                    </div>

                    {row.evidence_chunks && row.evidence_chunks.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">
                          Evidence ({row.evidence_chunks.length} sources)
                        </h4>
                        <div className="space-y-2">
                          {row.evidence_chunks.map((ev, i) => (
                            <div key={i} className="p-3 bg-background rounded border text-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <FileText className="size-3 text-muted-foreground" />
                                <span className="font-medium">{ev.document_title}</span>
                                {ev.page_numbers?.length > 0 && (
                                  <span className="text-muted-foreground">
                                    Pages {ev.page_numbers.join(', ')}
                                  </span>
                                )}
                                <span className="text-muted-foreground ml-auto">
                                  {Math.round(ev.relevance_score * 100)}% match
                                </span>
                              </div>
                              <p className="text-muted-foreground line-clamp-3">
                                {ev.chunk_text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {row.recommendations && row.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Recommendations</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {row.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
