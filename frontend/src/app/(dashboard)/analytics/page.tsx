'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { EntityMetrics } from '@/components/analytics/EntityMetrics';
import { SafetyScoreChart } from '@/components/analytics/SafetyScoreChart';
import { HazardsBreakdown } from '@/components/analytics/HazardsBreakdown';
import { useQuery } from '@tanstack/react-query';
import { getSafetyAnalytics, getDocumentAnalytics } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Eye } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default function AnalyticsPage() {
  const { getToken } = useAuth();
  const router = useRouter();

  const { data: safetyData, isLoading: isLoadingSafety, isError: isErrorSafety } = useQuery({
    queryKey: ['safety-analytics'],
    queryFn: () => getSafetyAnalytics(getToken),
  });

  const { data: docData, isLoading: isLoadingDoc, isError: isErrorDoc } = useQuery({
    queryKey: ['document-analytics'],
    queryFn: () => getDocumentAnalytics(getToken),
  });

  // Fetch real violations from the new endpoint
  const { data: violationsData } = useQuery({
    queryKey: ['recent-violations'],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/v1/analytics/violations?limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) return { violations: [] };
      return res.json();
    },
    staleTime: 30_000,
  });

  const isLoading = isLoadingSafety || isLoadingDoc;
  const isError = isErrorSafety || isErrorDoc;

  const totalDocuments = docData?.by_status.reduce((acc, curr) => acc + curr.count, 0) || 0;
  const pendingReviews = docData?.by_status.find(s => s.status === 'pending')?.count || 0;

  const metricsData = {
    totalDocuments,
    criticalHazards: safetyData?.violation_count || 0,
    compliantItems: safetyData?.compliant_count || 0,
    pendingReviews,
  };

  const scoreData = (docData?.uploads_by_day || []).map((t) => ({
    date: new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' }),
    score: t.count,
  })).slice(-7);

  if (scoreData.length === 0) {
    scoreData.push({ date: 'Today', score: 0 });
  }

  const hazardsData = (docData?.by_category || []).map((c, index) => ({
    name: c.category,
    value: c.count,
    color: `hsl(var(--chart-${(index % 5) + 1}))`,
  }));

  if (hazardsData.length === 0) {
    hazardsData.push({ name: 'No Data', value: 100, color: 'hsl(var(--chart-1))' });
  }

  const recentViolations = violationsData?.violations || [];

  const severityConfig: Record<string, string> = {
    critical: 'text-red-600 bg-red-500/10 border-red-500/20',
    high: 'text-orange-600 bg-orange-500/10 border-orange-500/20',
    medium: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
    low: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-8 animate-fade-in-up">
        <div className="animate-pulse bg-muted h-10 w-64 rounded" />
        <div className="animate-pulse bg-muted h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2 animate-pulse bg-muted h-96 rounded-xl" />
          <div className="col-span-1 animate-pulse bg-muted h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-8 animate-fade-in-up">
        <div className="w-full p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive font-medium mb-8">
          Failed to load analytics data. Please try refreshing the page.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-8 animate-fade-in-up">
      <div className="relative z-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Compliance Analytics</h1>
        <p className="text-muted-foreground mt-2 font-medium">
          Overview of safety scores, hazards, and document processing metrics.
        </p>
      </div>

      <div className="relative z-10">
        <EntityMetrics metrics={metricsData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        <div className="col-span-1 lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">Document Uploads (7-day)</h2>
            <p className="text-sm text-muted-foreground">Daily upload volume over the past week</p>
          </div>
          <SafetyScoreChart data={scoreData} />
        </div>

        <div className="col-span-1 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">Document Categories</h2>
            <p className="text-sm text-muted-foreground">Distribution by document type</p>
          </div>
          <HazardsBreakdown data={hazardsData} />
        </div>
      </div>

      {/* Real Violations Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm relative overflow-hidden z-10">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <div>
            <h2 className="text-xl font-bold text-foreground">Recent Violations & Warnings</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Critical issues detected in analyzed documents
              {recentViolations.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-destructive/10 text-destructive text-xs rounded-full font-semibold">
                  {recentViolations.length} issues
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold">Hazard Type</th>
                <th className="px-6 py-4 font-semibold">Document</th>
                <th className="px-6 py-4 font-semibold">Severity</th>
                <th className="px-6 py-4 font-semibold hidden md:table-cell">Detected</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentViolations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">✅</span>
                      <p className="font-medium">No violations detected.</p>
                      <p className="text-xs">All analyzed documents are compliant.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentViolations.map((v: any, i: number) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors group border-b border-border">
                    <td className="px-6 py-4 font-medium text-foreground">{v.hazard_type}</td>
                    <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">{v.document_title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] uppercase font-bold tracking-widest border ${severityConfig[v.severity] ?? severityConfig.medium}`}>
                        {v.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell whitespace-nowrap">
                      {formatDistanceToNow(new Date(v.detected_at), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => router.push(`/documents/${v.document_id}?tab=safety`)}
                        className="flex items-center gap-1 ml-auto text-primary hover:text-foreground transition-colors font-medium text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
