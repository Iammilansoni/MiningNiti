// src/app/(dashboard)/dashboard/documents/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useDocuments, useDeleteDocument, useReanalyzeDocument, useDocumentAnalysis, useCreateDocument } from '@/hooks/useApi';
import type { Document, DocumentAnalysis } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollReveal, SpotlightCard, ShinyText } from '@/components/reactbits';
import {
  Search, FileText, MoreHorizontal, Eye, Trash2, Upload, CheckCircle,
  AlertTriangle, RefreshCw, FolderOpen, Brain, Shield, ChevronRight,
  Clock, Zap, BarChart2, FileSearch,
} from 'lucide-react';
import { DragDropUpload } from '@/components/ui/drag-drop-upload';

// ─────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return (
        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 border">
          <CheckCircle className="mr-1 h-3 w-3" />Completed
        </Badge>
      );
    case 'processing':
    case 'analyzing':
      return (
        <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 border">
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="mr-1 h-2 w-2 rounded-full bg-amber-400 inline-block"
          />
          {status === 'analyzing' ? 'Analyzing' : 'Processing'}
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-slate-500/15 text-slate-400 border-slate-500/30 border">
          <Clock className="mr-1 h-3 w-3" />Pending
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="destructive" className="bg-red-500/15 text-red-400 border-red-500/30 border">
          <AlertTriangle className="mr-1 h-3 w-3" />Failed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

// ─────────────────────────────────────────────
// Safety score chip
// ─────────────────────────────────────────────
function SafetyScore({ score }: { score: number | null | undefined }) {
  if (score == null) return <span className="text-muted-foreground text-xs">—</span>;
  const color = score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400';
  return <span className={`font-semibold text-sm ${color}`}>{score.toFixed(0)}</span>;
}

// ─────────────────────────────────────────────
// Document Analysis Drawer
// ─────────────────────────────────────────────
function AnalysisDialog({ doc, open, onClose }: { doc: Document | null; open: boolean; onClose: () => void }) {
  const { data, isLoading } = useDocumentAnalysis(open ? doc?.id ?? null : null);
  const reanalyze = useReanalyzeDocument();
  const analysis = data?.analysis as DocumentAnalysis | undefined;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Analysis — {doc?.title}
          </DialogTitle>
          <DialogDescription>
            Multi-agent classification, safety analysis, and entity extraction results.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !data ? (
          <div className="space-y-3 pt-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : data.status !== 'completed' ? (
          <div className="text-center py-10 text-muted-foreground">
            <Clock className="mx-auto h-10 w-10 opacity-40 mb-3" />
            <p className="font-medium">Analysis in progress</p>
            <p className="text-sm mt-1">Status: <span className="capitalize">{data.status}</span></p>
          </div>
        ) : analysis ? (
          <div className="space-y-5 pt-2">
            {/* Classification */}
            <div className="rounded-xl border border-border bg-card/50 p-4 space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <FileSearch className="h-4 w-4 text-violet-400" />Classification
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">{analysis.category?.replace(/_/g, ' ')}</Badge>
                {analysis.subcategory && <Badge variant="outline">{analysis.subcategory}</Badge>}
                <Badge variant="outline" className="text-xs">
                  {((analysis.classification_confidence ?? 0) * 100).toFixed(0)}% confidence
                </Badge>
              </div>
            </div>

            {/* Summary */}
            {analysis.summary && (
              <div className="rounded-xl border border-border bg-card/50 p-4 space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Zap className="h-4 w-4 text-amber-400" />Summary
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
                {analysis.key_points?.length > 0 && (
                  <ul className="space-y-1 pt-1">
                    {analysis.key_points.map((kp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                        {kp}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Safety */}
            <div className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Shield className="h-4 w-4 text-emerald-400" />Safety Analysis
              </h3>
              {analysis.safety_score != null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Safety Score</span>
                    <span className="font-semibold text-foreground">{analysis.safety_score.toFixed(0)}/100</span>
                  </div>
                  <Progress value={analysis.safety_score} className="h-2" />
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                <Badge className={
                  analysis.compliance_status === 'compliant' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 border' :
                  analysis.compliance_status === 'warning' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 border' :
                  'bg-red-500/15 text-red-400 border-red-500/30 border'
                }>
                  {analysis.compliance_status?.replace(/_/g, ' ')}
                </Badge>
              </div>
              {analysis.hazards_detected?.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-foreground">Detected Hazards</p>
                  {analysis.hazards_detected.map((h, i) => (
                    <div key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                      <AlertTriangle className={`h-3 w-3 flex-shrink-0 ${h.severity === 'high' ? 'text-red-400' : h.severity === 'medium' ? 'text-amber-400' : 'text-yellow-300'}`} />
                      <span>{h.type}: {h.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Entities */}
            {analysis.entities && Object.values(analysis.entities).some(arr => arr.length > 0) && (
              <div className="rounded-xl border border-border bg-card/50 p-4 space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <BarChart2 className="h-4 w-4 text-cyan-400" />Extracted Entities
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(analysis.entities).map(([key, vals]) => vals.length > 0 && (
                    <div key={key}>
                      <p className="text-xs text-muted-foreground capitalize mb-1">{key}</p>
                      <div className="flex flex-wrap gap-1">
                        {vals.slice(0, 4).map((v, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{v}</Badge>
                        ))}
                        {vals.length > 4 && <Badge variant="outline" className="text-xs">+{vals.length - 4}</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  reanalyze.mutate(doc!.id, {
                    onSuccess: () => toast.success('Re-analysis started'),
                    onError: (e) => toast.error('Failed', { description: e.message }),
                  });
                }}
                disabled={reanalyze.isPending}
              >
                <RefreshCw className={`mr-2 h-3 w-3 ${reanalyze.isPending ? 'animate-spin' : ''}`} />
                Re-analyze
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// Upload handler — calls UploadThing then registers with backend
// ─────────────────────────────────────────────
function UploadSection({ onUploaded }: { onUploaded: () => void }) {
  const createDoc = useCreateDocument();
  const [uploading, setUploading] = useState(false);

  /**
   * DragDropUpload gives us raw File objects.
   * Since we're not using UploadThing's widget here, we simulate a direct upload
   * by reading the file locally and sending metadata to the backend.
   * In production, wire this to UploadThing's generateReactHelpers() upload callback.
   */
  const handleFiles = async (files: File[]) => {
    setUploading(true);
    let successCount = 0;
    for (const file of files) {
      try {
        // In a real deployment, upload the file to UploadThing first, get the URL
        // and pass it here. For now we construct a placeholder URL so the backend
        // record is created and the pipeline can be tested end-to-end.
        const fileUrl = URL.createObjectURL(file); // replace with UploadThing URL
        await createDoc.mutateAsync({
          file_url: fileUrl,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type || 'application/octet-stream',
          title: file.name.replace(/\.[^.]+$/, ''),
        });
        successCount++;
      } catch (e) {
        toast.error(`Failed to upload ${file.name}`, {
          description: e instanceof Error ? e.message : 'Unknown error',
        });
      }
    }
    setUploading(false);
    if (successCount > 0) {
      toast.success(`${successCount} file${successCount > 1 ? 's' : ''} uploaded`, {
        description: 'AI analysis has been queued.',
      });
      onUploaded();
    }
  };

  return (
    <SpotlightCard className="p-0">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="mr-2 h-5 w-5 text-cyan-500" />
          Upload Documents
        </CardTitle>
        <CardDescription>
          Upload PDF, DOCX, DOC, or TXT files for AI-powered analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DragDropUpload
          onFilesSelected={() => {}}
          onUpload={handleFiles}
          disabled={uploading || createDoc.isPending}
        />
      </CardContent>
    </SpotlightCard>
  );
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);

  const { data, isLoading, refetch } = useDocuments({ search, page_size: 50 });
  const deleteDoc = useDeleteDocument();

  const documents = data?.documents ?? [];
  const hasProcessing = documents.some(d => d.status === 'processing' || d.status === 'analyzing' || d.status === 'pending');

  const handleDelete = (doc: Document) => {
    deleteDoc.mutate(doc.id, {
      onSuccess: () => toast.success('Document deleted', { description: `"${doc.title}" removed.` }),
      onError: (e) => toast.error('Delete failed', { description: e.message }),
    });
  };

  const openAnalysis = (doc: Document) => {
    setSelectedDoc(doc);
    setAnalysisOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Processing banner */}
      <AnimatePresence>
        {hasProcessing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-lg border-l-4 border-amber-500 bg-amber-500/10 px-4 py-3 text-amber-300"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw className="h-4 w-4" />
            </motion.div>
            <span className="text-sm font-medium">Documents are being processed — results appear automatically.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              <ShinyText>Document Library</ShinyText>
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {data?.total ?? 0} document{(data?.total ?? 0) !== 1 ? 's' : ''} · AI-powered analysis
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </ScrollReveal>

      {/* Upload */}
      <ScrollReveal delay={0.05}>
        <UploadSection onUploaded={() => refetch()} />
      </ScrollReveal>

      {/* Search */}
      <ScrollReveal delay={0.1}>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </ScrollReveal>

      {/* Table */}
      <ScrollReveal delay={0.15}>
        <SpotlightCard className="p-0">
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <FileText className="mr-2 h-5 w-5 text-cyan-500" />
              Documents ({documents.length})
            </CardTitle>
            <CardDescription>AI analysis results, safety scores, and compliance status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Safety</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(8)].map((__, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : documents.length > 0 ? (
                  documents.map((doc, idx) => (
                    <motion.tr
                      key={doc.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="border-b transition-colors hover:bg-muted/40 group"
                    >
                      <TableCell>
                        <div className="font-medium text-sm text-foreground line-clamp-1 max-w-[200px]">
                          {doc.title}
                        </div>
                        <div className="text-xs text-muted-foreground">{doc.file_name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs uppercase">
                          {doc.file_type.split('/')[1] || doc.file_type || 'file'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {(doc.file_size / (1024 * 1024)).toFixed(2)} MB
                      </TableCell>
                      <TableCell>
                        {doc.category ? (
                          <Badge variant="secondary" className="text-xs capitalize">
                            {doc.category.replace(/_/g, ' ')}
                          </Badge>
                        ) : <span className="text-muted-foreground text-xs">—</span>}
                      </TableCell>
                      <TableCell>
                        <SafetyScore score={doc.safety_score} />
                      </TableCell>
                      <TableCell><StatusBadge status={doc.status} /></TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openAnalysis(doc)}>
                              <Brain className="mr-2 h-4 w-4 text-violet-400" />AI Analysis
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(doc.file_url, '_blank')}>
                              <Eye className="mr-2 h-4 w-4" />View File
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="mr-2 h-4 w-4" />Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete document?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    &ldquo;{doc.title}&rdquo; and all its AI analysis data will be permanently removed.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(doc)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-36 text-center">
                      <div className="flex flex-col items-center text-muted-foreground gap-2">
                        <FolderOpen className="h-10 w-10 opacity-30" />
                        <p className="font-medium">No documents yet</p>
                        <p className="text-sm">Upload your first mining document above</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </SpotlightCard>
      </ScrollReveal>

      {/* Analysis Dialog */}
      <AnalysisDialog doc={selectedDoc} open={analysisOpen} onClose={() => setAnalysisOpen(false)} />
    </div>
  );
}