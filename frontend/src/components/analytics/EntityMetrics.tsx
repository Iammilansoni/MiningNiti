import React from 'react';
import { Database, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

interface EntityMetricsProps {
  metrics: {
    totalDocuments: number;
    criticalHazards: number;
    compliantItems: number;
    pendingReviews: number;
  };
}

export function EntityMetrics({ metrics }: EntityMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Documents */}
      <div className="rounded-xl border border-border bg-card p-6 flex items-start gap-4 hover:bg-accent hover:text-accent-foreground transition-colors relative overflow-hidden shadow-sm">
        <div className="p-3 bg-primary/10 text-primary rounded-lg border border-primary/20">
          <Database className="w-6 h-6" />
        </div>
        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total Documents</p>
          <h3 className="text-3xl font-bold text-foreground tracking-tight">{metrics.totalDocuments}</h3>
        </div>
      </div>

      {/* Critical Hazards */}
      <div className="rounded-xl border border-border bg-card p-6 flex items-start gap-4 hover:bg-accent hover:text-accent-foreground transition-colors relative overflow-hidden shadow-sm">
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Critical Hazards</p>
          <h3 className="text-3xl font-bold text-foreground tracking-tight">{metrics.criticalHazards}</h3>
        </div>
      </div>

      {/* Compliant Items */}
      <div className="rounded-xl border border-border bg-card p-6 flex items-start gap-4 hover:bg-accent hover:text-accent-foreground transition-colors relative overflow-hidden shadow-sm">
        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Compliant Files</p>
          <h3 className="text-3xl font-bold text-foreground tracking-tight">{metrics.compliantItems}</h3>
        </div>
      </div>

      {/* Pending Reviews */}
      <div className="rounded-xl border border-border bg-card p-6 flex items-start gap-4 hover:bg-accent hover:text-accent-foreground transition-colors relative overflow-hidden shadow-sm">
        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20">
          <Activity className="w-6 h-6" />
        </div>
        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Pending Reviews</p>
          <h3 className="text-3xl font-bold text-foreground tracking-tight">{metrics.pendingReviews}</h3>
        </div>
      </div>
    </div>
  );
}
