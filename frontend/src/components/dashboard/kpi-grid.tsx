'use client';

import { MetricCard } from '@/components/product/metric-card';
import { FileText, Search, ShieldCheck, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export function KPIGrid() {
  const { getToken } = useAuth();
  
  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => getDashboardStats(getToken),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Shaped like MetricCard — label, value, trend — so the grid does not
            visibly reflow when the real numbers arrive. */}
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl border border-border bg-card p-5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-4">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="size-8 rounded-lg shrink-0" />
            </div>
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full p-6 bg-destructive/10 border border-destructive/20 rounded-xl mb-8 flex flex-col items-start gap-3">
        <p className="text-destructive font-medium">Failed to load dashboard statistics.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  // Provide safe fallbacks if stats is undefined.
  //
  // The compliance score used to fall back to 100%. Two things were wrong with
  // that: an account with nothing analysed yet was shown a perfect score, and
  // because the check was truthiness rather than a null check, a real score of
  // 0 — the worst possible result — also rendered as 100%. Absence of data now
  // renders as "—" in a neutral tone; only a number that actually came back
  // from the API is presented as a score.
  const hasStats = stats !== undefined;
  const totalDocs = stats?.total_documents ?? 0;
  const queries = stats?.total_messages ?? 0; // Using total_messages as a proxy for queries
  const rawScore = stats?.average_safety_score;
  const complianceScore =
    typeof rawScore === 'number' && Number.isFinite(rawScore) ? Math.round(rawScore) : null;
  const hasAlertData =
    hasStats &&
    (typeof stats?.compliance_violations === 'number' ||
      typeof stats?.compliance_warnings === 'number');
  const activeAlerts = (stats?.compliance_violations ?? 0) + (stats?.compliance_warnings ?? 0);

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
        value={complianceScore === null ? '—' : `${complianceScore}%`}
        detail={complianceScore === null ? 'No analysed documents yet' : undefined}
        icon={ShieldCheck}
        tone={
          complianceScore === null
            ? 'neutral'
            : complianceScore > 90
              ? 'success'
              : complianceScore > 75
                ? 'warning'
                : 'danger'
        }
      />
      <MetricCard
        label="Active Alerts"
        value={hasAlertData ? activeAlerts.toString() : '—'}
        detail={hasAlertData ? undefined : 'No data'}
        icon={Activity}
        tone={!hasAlertData ? 'neutral' : activeAlerts > 0 ? 'warning' : 'success'}
      />
    </div>
  );
}
