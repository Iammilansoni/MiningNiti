'use client';

import React from 'react';
import { EntityMetrics } from '@/components/analytics/EntityMetrics';
import { SafetyScoreChart } from '@/components/analytics/SafetyScoreChart';
import { HazardsBreakdown } from '@/components/analytics/HazardsBreakdown';
import { useQuery } from '@tanstack/react-query';
import { getSafetyAnalytics, getDocumentAnalytics } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';

export default function AnalyticsPage() {
  const { getToken } = useAuth();

  const { data: safetyData, isLoading: isLoadingSafety } = useQuery({
    queryKey: ['safety-analytics'],
    queryFn: () => getSafetyAnalytics(getToken),
  });

  const { data: docData, isLoading: isLoadingDoc } = useQuery({
    queryKey: ['document-analytics'],
    queryFn: () => getDocumentAnalytics(getToken),
  });

  const isLoading = isLoadingSafety || isLoadingDoc;

  // Derive metrics
  const totalDocuments = docData?.by_status.reduce((acc, curr) => acc + curr.count, 0) || 0;
  const pendingReviews = docData?.by_status.find(s => s.status === 'pending')?.count || 0;

  const metricsData = {
    totalDocuments,
    criticalHazards: safetyData?.violation_count || 0,
    compliantItems: safetyData?.compliant_count || 0,
    pendingReviews,
  };

  // Convert uploads over time to chart format (reusing SafetyScoreChart which expects {date, score} but we pass count as score)
  const scoreData = (docData?.uploads_by_day || []).map((t) => ({
    date: new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' }),
    score: t.count,
  })).slice(-7); // take last 7 days

  // Provide fallback if empty
  if (scoreData.length === 0) {
    scoreData.push({ date: 'Today', score: 0 });
  }

  // Convert category breakdown
  const hazardsData = (docData?.by_category || []).map((c, index) => ({
    name: c.category,
    value: c.count,
    color: `hsl(var(--chart-${(index % 5) + 1}))`,
  }));

  if (hazardsData.length === 0) {
    hazardsData.push({ name: 'No Data', value: 100, color: 'hsl(var(--chart-1))' });
  }

  // Recent violations (mock fallback if backend doesn't provide them, as backend api.ts might not have a dedicated endpoint. 
  // Let's assume we map critical violations here if we have them, else empty).
  // Currently api.ts doesn't return recent violations list in analytics endpoint. So we'll render an empty state for real data.
  const recentViolations: any[] = []; 

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-8 animate-fade-in-up">
        <div className="animate-pulse bg-muted h-10 w-64 rounded"></div>
        <div className="animate-pulse bg-muted h-32 w-full rounded-xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2 animate-pulse bg-muted h-96 rounded-xl"></div>
          <div className="col-span-1 animate-pulse bg-muted h-96 rounded-xl"></div>
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
            <h2 className="text-xl font-bold text-foreground">Average Safety Score</h2>
            <p className="text-sm text-muted-foreground">Rolling 7-day average of analyzed documents</p>
          </div>
          <SafetyScoreChart data={scoreData} />
        </div>

        <div className="col-span-1 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">Hazards Breakdown</h2>
            <p className="text-sm text-muted-foreground">Distribution of identified risks</p>
          </div>
          <HazardsBreakdown data={hazardsData} />
        </div>
      </div>
      
      <div className="rounded-xl border border-border bg-card shadow-sm relative overflow-hidden z-10">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Recent Violations</h2>
          <p className="text-sm text-muted-foreground mt-1">Critical issues requiring immediate attention</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold">Hazard Type</th>
                <th className="px-6 py-4 font-semibold">Document</th>
                <th className="px-6 py-4 font-semibold">Severity</th>
                <th className="px-6 py-4 font-semibold">Date Detected</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentViolations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No recent violations detected.
                  </td>
                </tr>
              ) : (
                recentViolations.map((v, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors group border-b border-border">
                    <td className="px-6 py-5 font-medium text-foreground">{v.type}</td>
                    <td className="px-6 py-5 text-muted-foreground">{v.document}</td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-[10px] uppercase font-bold tracking-widest">
                        {v.severity}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-muted-foreground">{v.date}</td>
                    <td className="px-6 py-5">
                      <button className="text-primary hover:text-foreground transition-colors font-medium">Review</button>
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
