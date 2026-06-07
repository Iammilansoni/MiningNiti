import { MetricCard } from '@/components/product/metric-card';
import { FileText, Search, ShieldCheck, Activity } from 'lucide-react';

export function KPIGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <MetricCard
        label="Total Documents"
        value="1,248"
        icon={FileText}
        tone="info"
        trend={{ label: '+12 this week', direction: 'up' }}
      />
      <MetricCard
        label="AI Queries"
        value="8,492"
        icon={Search}
        tone="neutral"
        trend={{ label: '+842 this week', direction: 'up' }}
      />
      <MetricCard
        label="Compliance Score"
        value="94%"
        icon={ShieldCheck}
        tone="success"
        trend={{ label: '+2% from last month', direction: 'up' }}
      />
      <MetricCard
        label="Active Alerts"
        value="3"
        icon={Activity}
        tone="warning"
        trend={{ label: '-2 from yesterday', direction: 'down' }}
      />
    </div>
  );
}
