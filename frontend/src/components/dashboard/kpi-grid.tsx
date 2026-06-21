'use client';

import { MetricCard } from '@/components/product/metric-card';
import { FileText, Search, ShieldCheck, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { Skeleton } from '@/components/ui/skeleton';

export function KPIGrid() {
  const { getToken } = useAuth();
  
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => getDashboardStats(getToken),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl border border-border" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive font-medium mb-8">
        Failed to load dashboard statistics. Please try refreshing the page.
      </div>
    );
  }

  // Provide safe fallbacks if stats is undefined
  const totalDocs = stats?.total_documents || 0;
  const queries = stats?.total_messages || 0; // Using total_messages as a proxy for queries
  const complianceScore = stats?.average_safety_score ? Math.round(stats.average_safety_score) : 100;
  const activeAlerts = (stats?.compliance_violations || 0) + (stats?.compliance_warnings || 0);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <MetricCard
        label="Total Documents"
        value={totalDocs.toLocaleString()}
        icon={FileText}
        tone="info"
        trend={{ label: `${stats?.documents_processed_this_week || 0} this week`, direction: 'up' }}
      />
      <MetricCard
        label="AI Queries"
        value={queries.toLocaleString()}
        icon={Search}
        tone="neutral"
      />
      <MetricCard
        label="Compliance Score"
        value={`${complianceScore}%`}
        icon={ShieldCheck}
        tone={complianceScore > 90 ? 'success' : complianceScore > 75 ? 'warning' : 'danger'}
      />
      <MetricCard
        label="Active Alerts"
        value={activeAlerts.toString()}
        icon={Activity}
        tone={activeAlerts > 0 ? 'warning' : 'success'}
      />
    </div>
  );
}
