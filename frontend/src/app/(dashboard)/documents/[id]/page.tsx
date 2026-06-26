'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocument, getDocumentAnalysis, deleteDocument, reanalyzeDocument } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { formatDistanceToNow, format } from 'date-fns';
import { StatusBadge } from '@/components/product/status';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  ArrowLeft, Download, Trash, RefreshCw, MessageSquare,
  FileText, Shield, Tag, AlertTriangle, CheckCircle2,
  Clock, HardDrive, BarChart2, ChevronRight, Sparkles,
  AlertCircle, Target, Users, MapPin, Wrench, FlaskConical,
  CalendarDays, BookOpen, Info, XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { AskDocumentAI } from '@/components/documents/AskDocumentAI';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SafetyGauge({ score }: { score: number }) {
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  const angle = (score / 100) * 180;
  const rad = (angle * Math.PI) / 180;
  const x = 90 - 70 * Math.cos(rad);
  const y = 90 - 70 * Math.sin(rad);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 180 100" className="w-40 h-20">
        {/* Background arc */}
        <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" strokeLinecap="round" />
        {/* Value arc */}
        <path
          d={`M 20 90 A 70 70 0 0 1 ${x} ${y}`}
          fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease-out' }}
        />
        {/* Needle */}
        <line x1="90" y1="90" x2={x} y2={y} stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx="90" cy="90" r="4" fill={color} />
      </svg>
      <div className="text-center">
        <span className="text-3xl font-bold tabular-nums" style={{ color }}>{score}</span>
        <span className="text-muted-foreground text-sm">/100</span>
      </div>
      <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
        {score >= 70 ? 'Safe' : score >= 40 ? 'Moderate Risk' : 'High Risk'}
      </span>
    </div>
  );
}

function ComplianceBadge({ status }: { status: string | null | undefined }) {
  const config: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
    compliant: { icon: <CheckCircle2 className="w-4 h-4" />, label: 'Compliant', className: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
    warning: { icon: <AlertTriangle className="w-4 h-4" />, label: 'Warning', className: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
    violation: { icon: <XCircle className="w-4 h-4" />, label: 'Violation', className: 'text-red-600 bg-red-500/10 border-red-500/20' },
    pending: { icon: <Clock className="w-4 h-4" />, label: 'Pending Review', className: 'text-blue-600 bg-blue-500/10 border-blue-500/20' },
    not_applicable: { icon: <Info className="w-4 h-4" />, label: 'N/A', className: 'text-muted-foreground bg-muted border-border' },
  };
  const c = config[status ?? 'pending'] ?? config.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${c.className}`}>
      {c.icon}{c.label}
    </span>
  );
}

function EntityChip({ label }: { label: string }) {
  return (
    <span className="px-2.5 py-1 bg-primary/8 border border-primary/15 text-primary text-xs font-medium rounded-lg hover:bg-primary/15 transition-colors cursor-default">
      {label}
    </span>
  );
}

function HazardRow({ hazard, index }: { hazard: { type: string; severity: string; description: string }; index: number }) {
  const sev = hazard.severity?.toLowerCase();
  const conf: Record<string, string> = {
    high: 'text-red-600 bg-red-500/10 border-red-500/20',
    medium: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
    low: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
  };
  return (
    <div className="flex gap-4 p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0 mt-0.5">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-semibold text-foreground text-sm">{hazard.type}</span>
          <span className={`px-2 py-0.5 rounded-full border text-[10px] uppercase font-bold tracking-wider ${conf[sev] ?? conf.low}`}>
            {hazard.severity}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{hazard.description}</p>
      </div>
    </div>
  );
}

// ── Tab Components ────────────────────────────────────────────────────────────

function SummaryTab({ analysis, onReanalyze, isReanalyzing }: { analysis: any; onReanalyze?: () => void; isReanalyzing?: boolean }) {
  if (!analysis) return <EmptyAnalysis />;

  const summaryIsEmpty = !analysis.summary || analysis.summary === 'Summary not available.';
  const keyPointsEmpty = !analysis.key_points?.length;

  if (summaryIsEmpty && keyPointsEmpty) {
    return (
      <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/5 flex flex-col items-center text-center gap-4">
        <AlertCircle className="w-10 h-10 text-amber-500 opacity-70" />
        <div>
          <p className="font-semibold text-foreground">AI analysis incomplete</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            This document was processed when the AI service was temporarily unavailable (quota limit).
            Click <strong>Re-analyze</strong> to run the full analysis now.
          </p>
        </div>
        {onReanalyze && (
          <button
            onClick={onReanalyze}
            disabled={isReanalyzing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isReanalyzing ? 'animate-spin' : ''}`} />
            {isReanalyzing ? 'Re-analyzing...' : 'Re-analyze Document'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="p-5 rounded-xl border border-border bg-card">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Executive Summary
        </h3>
        <p className="text-foreground leading-relaxed text-[15px]">{analysis.summary}</p>
      </div>

      {/* Key Points */}
      {analysis.key_points?.length > 0 && (
        <div className="p-5 rounded-xl border border-border bg-card">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target className="w-4 h-4" /> Key Insights
          </h3>
          <ul className="space-y-2.5">
            {analysis.key_points.map((point: string, i: number) => (
              <li key={i} className="flex gap-3 items-start">
                <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SafetyTab({ analysis, onReanalyze, isReanalyzing }: { analysis: any; onReanalyze?: () => void; isReanalyzing?: boolean }) {
  if (!analysis) return <EmptyAnalysis />;
  const hazards = analysis.hazards_detected || [];
  const recommendations = analysis.safety_recommendations || [];

  // Show quota-error banner when safety score is missing (agent returned empty/failed)
  if (analysis.safety_score == null && hazards.length === 0 && recommendations.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/5 flex flex-col items-center text-center gap-4">
        <Shield className="w-10 h-10 text-amber-500 opacity-70" />
        <div>
          <p className="font-semibold text-foreground">Safety analysis incomplete</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            This document was processed when the AI service was temporarily unavailable (quota limit).
            Click <strong>Re-analyze</strong> to run the full safety scan now.
          </p>
        </div>
        {onReanalyze && (
          <button
            onClick={onReanalyze}
            disabled={isReanalyzing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isReanalyzing ? 'animate-spin' : ''}`} />
            {isReanalyzing ? 'Re-analyzing...' : 'Re-analyze Document'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score + Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-border bg-card flex flex-col items-center justify-center gap-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Safety Score</h3>
          {analysis.safety_score != null
            ? <SafetyGauge score={Math.round(analysis.safety_score)} />
            : <span className="text-muted-foreground text-sm">Score not available</span>
          }
        </div>
        <div className="p-5 rounded-xl border border-border bg-card flex flex-col justify-center gap-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Compliance Status</h3>
            <ComplianceBadge status={analysis.compliance_status} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Hazards Detected</h3>
            <span className={`text-2xl font-bold ${hazards.length > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {hazards.length}
            </span>
          </div>
        </div>
      </div>

      {/* Hazards */}
      {hazards.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Detected Hazards
          </h3>
          <div className="space-y-2">
            {hazards.map((h: any, i: number) => <HazardRow key={i} hazard={h} index={i} />)}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Safety Recommendations
          </h3>
          <ul className="space-y-2">
            {recommendations.map((rec: string, i: number) => (
              <li key={i} className="flex gap-3 items-start">
                <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function EntitiesTab({ analysis, onReanalyze, isReanalyzing }: { analysis: any; onReanalyze?: () => void; isReanalyzing?: boolean }) {
  if (!analysis) return <EmptyAnalysis />;
  const entities = analysis.entities || {};
  const entityGroups = [
    { key: 'equipment', label: 'Equipment', icon: Wrench, color: 'blue' },
    { key: 'chemicals', label: 'Chemicals', icon: FlaskConical, color: 'purple' },
    { key: 'locations', label: 'Locations', icon: MapPin, color: 'green' },
    { key: 'personnel', label: 'Personnel', icon: Users, color: 'orange' },
    { key: 'dates', label: 'Dates', icon: CalendarDays, color: 'pink' },
    { key: 'regulations', label: 'Regulations', icon: BookOpen, color: 'amber' },
  ] as const;

  const hasAny = entityGroups.some(g => (entities[g.key] || []).length > 0);
  if (!hasAny) return (
    <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/5 flex flex-col items-center text-center gap-4">
      <Tag className="w-10 h-10 text-amber-500 opacity-70" />
      <div>
        <p className="font-semibold text-foreground">No entities extracted</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Entity extraction requires a successful AI analysis pass. If analysis was incomplete due to a quota limit, re-analyze to extract equipment, locations, personnel, and more.
        </p>
      </div>
      {onReanalyze && (
        <button
          onClick={onReanalyze}
          disabled={isReanalyzing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isReanalyzing ? 'animate-spin' : ''}`} />
          {isReanalyzing ? 'Re-analyzing...' : 'Re-analyze Document'}
        </button>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {entityGroups.map(({ key, label, icon: Icon }) => {
        const items: string[] = entities[key] || [];
        if (items.length === 0) return null;
        return (
          <div key={key} className="p-5 rounded-xl border border-border bg-card">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Icon className="w-4 h-4" /> {label}
              <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full">{items.length}</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {items.map((item, i) => <EntityChip key={i} label={item} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyAnalysis() {
  return (
    <div className="text-center py-16 text-muted-foreground">
      <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
      <p className="font-medium">Analysis not yet available.</p>
      <p className="text-sm mt-1">Processing may still be in progress.</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'summary', label: 'Summary', icon: BookOpen },
  { id: 'safety', label: 'Safety', icon: Shield },
  { id: 'entities', label: 'Entities', icon: Tag },
  { id: 'ask', label: 'Ask AI', icon: MessageSquare },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const documentId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabId>('summary');

  const { data: doc, isLoading, isError } = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => getDocument(documentId, getToken),
    enabled: !!documentId,
    refetchInterval: (query) => {
      const status = (query.state.data as any)?.status;
      return status === 'pending' || status === 'processing' || status === 'analyzing' ? 3000 : false;
    },
  });

  // Track previous status to detect completion/failure transitions
  const prevStatusRef = useRef<string | undefined>(undefined);

  const { data: analysisData } = useQuery({
    queryKey: ['documentAnalysis', documentId],
    queryFn: () => getDocumentAnalysis(documentId, getToken),
    enabled: !!documentId,
    refetchInterval: (query) => {
      const status = (query.state.data as any)?.status;
      return status === 'pending' || status === 'processing' || status === 'analyzing' ? 3000 : false;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteDocument(documentId, getToken),
    onSuccess: () => {
      toast.success('Document deleted');
      router.push('/documents');
    },
    onError: (err: any) => toast.error(err.message || 'Delete failed'),
  });

  const reanalyzeMutation = useMutation({
    mutationFn: () => reanalyzeDocument(documentId, getToken),
    onSuccess: () => {
      toast.success('Re-analysis started — processing will begin shortly');
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
      queryClient.invalidateQueries({ queryKey: ['documentAnalysis', documentId] });
    },
    onError: (err: any) => toast.error(err.message || 'Re-analysis failed'),
  });

  // Fire a toast when analysis transitions to completed or failed
  useEffect(() => {
    const current = doc?.status;
    const prev = prevStatusRef.current;
    if (prev && prev !== current) {
      if (current === 'completed') {
        toast.success('✅ AI analysis complete! Results are now available.');
        queryClient.invalidateQueries({ queryKey: ['documentAnalysis', documentId] });
      } else if (current === 'failed') {
        toast.error('❌ Analysis failed. Try re-analyzing the document.');
      }
    }
    prevStatusRef.current = current;
  }, [doc?.status]);

  const isProcessing = doc?.status === 'pending' || doc?.status === 'processing' || doc?.status === 'analyzing';

  const analysis = analysisData?.analysis;

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="h-96 bg-muted rounded-xl" />
          <div className="lg:col-span-3 h-96 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !doc) {
    return (
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto">
        <Button variant="ghost" onClick={() => router.push('/documents')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Registry
        </Button>
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
          <AlertCircle className="w-12 h-12 opacity-40" />
          <p className="font-medium">Document not found or access denied.</p>
          <Button onClick={() => router.push('/documents')}>Go to Documents</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/documents" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Document Registry
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium truncate max-w-xs">{doc.title}</span>
      </div>

      {/* ── Processing Progress Banner ── */}
      {isProcessing && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative w-5 h-5 shrink-0">
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/30" />
              <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              AI analysis in progress — this may take 30–60 seconds
            </p>
          </div>
          <div className="flex items-center gap-2 ml-8 flex-wrap">
            {([
              { id: 'pending',    label: 'Queued' },
              { id: 'processing', label: 'Extracting text' },
              { id: 'analyzing',  label: 'Running AI agents' },
              { id: 'completed',  label: 'Done' },
            ] as const).map((step, i, arr) => {
              const order = ['pending', 'processing', 'analyzing', 'completed'];
              const currentIdx = order.indexOf(doc?.status ?? '');
              const stepIdx = order.indexOf(step.id);
              const isDone = stepIdx < currentIdx;
              const isActive = stepIdx === currentIdx;
              return (
                <React.Fragment key={step.id}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      isDone ? 'bg-blue-500' : isActive ? 'bg-blue-400 animate-pulse' : 'bg-muted-foreground/30'
                    }`} />
                    <span className={`text-xs ${
                      isDone ? 'text-blue-600 dark:text-blue-400 font-medium' :
                      isActive ? 'text-blue-500 font-semibold' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`h-px w-6 shrink-0 ${isDone ? 'bg-blue-400' : 'bg-muted-foreground/20'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Failed Banner ── */}
      {doc?.status === 'failed' && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">Analysis failed</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {(doc as any)?.processing_error || 'An error occurred during AI processing.'}
            </p>
          </div>
          <button
            onClick={() => reanalyzeMutation.mutate()}
            disabled={reanalyzeMutation.isPending}
            className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors font-medium whitespace-nowrap"
          >
            <RefreshCw className={`w-3 h-3 inline mr-1 ${reanalyzeMutation.isPending ? 'animate-spin' : ''}`} />
            Retry
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{doc.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">{doc.file_name}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <StatusBadge
                label={doc.status === 'completed' ? 'Verified' : doc.status === 'processing' ? 'Processing' : doc.status === 'failed' ? 'Failed' : doc.status === 'analyzing' ? 'Analyzing' : 'Pending'}
                tone={doc.status === 'completed' ? 'success' : doc.status === 'processing' || doc.status === 'analyzing' ? 'info' : doc.status === 'failed' ? 'danger' : 'neutral'}
                pulse={doc.status === 'processing' || doc.status === 'analyzing'}
              />
              {doc.category && (
                <span className="text-xs px-2.5 py-1 bg-muted border border-border rounded-full capitalize text-muted-foreground font-medium">
                  {doc.category.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => window.open(doc.file_url, '_blank')}>
            <Download className="w-4 h-4 mr-2" /> Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => reanalyzeMutation.mutate()}
            disabled={reanalyzeMutation.isPending}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${reanalyzeMutation.isPending ? 'animate-spin' : ''}`} />
            Re-analyze
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
            onClick={() => { if (confirm(`Delete "${doc.title}"?`)) deleteMutation.mutate(); }}
            disabled={deleteMutation.isPending}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ── Left: Metadata Sidebar ── */}
        <div className="space-y-4">
          {/* Document Info */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Document Info</h3>
            <div className="space-y-3">
              <MetaRow icon={<HardDrive className="w-4 h-4" />} label="Size" value={formatBytes(doc.file_size)} />
              {doc.page_count != null && (
                <MetaRow icon={<BookOpen className="w-4 h-4" />} label="Pages" value={`${doc.page_count} pages`} />
              )}
              {doc.word_count != null && (
                <MetaRow icon={<FileText className="w-4 h-4" />} label="Words" value={doc.word_count.toLocaleString()} />
              )}
              <MetaRow icon={<Clock className="w-4 h-4" />} label="Uploaded" value={formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })} />
              {doc.processed_at && (
                <MetaRow icon={<CheckCircle2 className="w-4 h-4" />} label="Processed" value={formatDistanceToNow(new Date(doc.processed_at), { addSuffix: true })} />
              )}
            </div>
          </div>

          {/* Safety Score snapshot */}
          {analysis?.safety_score != null && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Safety Score</h3>
              <SafetyGauge score={Math.round(analysis.safety_score)} />
            </div>
          )}

          {/* Compliance Status */}
          {analysis?.compliance_status && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Compliance</h3>
              <ComplianceBadge status={analysis.compliance_status} />
            </div>
          )}

          {/* Quick Actions */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h3>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => setActiveTab('ask')}
            >
              <MessageSquare className="w-4 h-4 text-primary" /> Ask AI About This
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => window.open(doc.file_url, '_blank')}
            >
              <Download className="w-4 h-4" /> Download Original
            </Button>
            <Link href={`/chat`}>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 mt-2">
                <Sparkles className="w-4 h-4" /> Open AI Intelligence
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Right: Tabbed Analysis ── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tab Bar */}
          <div className="flex gap-1 border-b border-border">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'summary' && <SummaryTab analysis={analysis} onReanalyze={() => reanalyzeMutation.mutate()} isReanalyzing={reanalyzeMutation.isPending} />}
            {activeTab === 'safety' && <SafetyTab analysis={analysis} onReanalyze={() => reanalyzeMutation.mutate()} isReanalyzing={reanalyzeMutation.isPending} />}
            {activeTab === 'entities' && <EntitiesTab analysis={analysis} onReanalyze={() => reanalyzeMutation.mutate()} isReanalyzing={reanalyzeMutation.isPending} />}
            {activeTab === 'ask' && (
              <AskDocumentAI documentId={documentId} documentTitle={doc.title} fileUrl={doc.file_url} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="text-muted-foreground/60">{icon}</span>
        {label}
      </div>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  );
}
