'use client';

import { PageHeader } from '@/components/product/page-header';
import { SectionCard } from '@/components/product/section-card';
import { MetricCard } from '@/components/product/metric-card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, ShieldAlert, Activity, FileCheck } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

const mockActivityData = [
  { name: 'Mon', queries: 400, documents: 240 },
  { name: 'Tue', queries: 300, documents: 139 },
  { name: 'Wed', queries: 550, documents: 400 },
  { name: 'Thu', queries: 450, documents: 280 },
  { name: 'Fri', queries: 600, documents: 390 },
  { name: 'Sat', queries: 200, documents: 100 },
  { name: 'Sun', queries: 150, documents: 50 },
];

const mockComplianceData = [
  { name: 'Sector 1', score: 98 },
  { name: 'Sector 2', score: 92 },
  { name: 'Sector 3', score: 85 },
  { name: 'Sector 4', score: 96 },
  { name: 'Sector 5', score: 89 },
];

export default function AnalyticsPage() {
  return (
    <div className="animate-in fade-in duration-500 flex flex-col h-full gap-6">
      <PageHeader
        title="Platform Analytics"
        description="Monitor system usage, compliance health, and document intelligence metrics."
        actions={
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="size-4" />
            Export Report
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Queries"
          value="2,650"
          icon={TrendingUp}
          tone="info"
          trend={{ label: '+15% from last week', direction: 'up' }}
        />
        <MetricCard
          label="Avg. Compliance"
          value="92.4%"
          icon={FileCheck}
          tone="success"
          trend={{ label: '+0.4% from last week', direction: 'up' }}
        />
        <MetricCard
          label="Flagged Items"
          value="14"
          icon={ShieldAlert}
          tone="warning"
          trend={{ label: '-3 from last week', direction: 'down' }}
        />
        <MetricCard
          label="System Load"
          value="42%"
          icon={Activity}
          tone="neutral"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Chart */}
        <SectionCard className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-foreground">Platform Activity</h3>
            <p className="text-sm text-muted-foreground">Queries and document uploads over time</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-sm)'
                  }} 
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Area 
                  type="monotone" 
                  dataKey="queries" 
                  name="AI Queries" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorQueries)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="documents" 
                  name="Documents Processed" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorDocs)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Compliance Score Chart */}
        <SectionCard className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-foreground">Compliance by Sector</h3>
            <p className="text-sm text-muted-foreground">Average safety and regulatory scores</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockComplianceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  domain={[0, 100]} 
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-sm)'
                  }} 
                />
                <Bar 
                  dataKey="score" 
                  name="Compliance Score (%)" 
                  fill="hsl(var(--chart-2))" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
