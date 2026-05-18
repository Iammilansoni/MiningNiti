// src/app/(dashboard)/dashboard/analytics/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDashboardStats, useDocumentAnalytics, useSafetyAnalytics } from '@/hooks/useApi';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollReveal, SpotlightCard, ShinyText } from '@/components/reactbits';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import {
  Shield, FileText, TrendingUp, AlertTriangle, CheckCircle,
  BarChart2, Activity, Zap,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Color palette for charts
// ─────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  safety_protocol: '#10b981',
  equipment_manual: '#6366f1',
  regulatory: '#f59e0b',
  incident_report: '#ef4444',
  geological: '#8b5cf6',
  environmental: '#06b6d4',
  training: '#84cc16',
  permit: '#f97316',
  maintenance: '#ec4899',
  other: '#6b7280',
};

const STATUS_COLORS: Record<string, string> = {
  completed: '#10b981',
  processing: '#f59e0b',
  analyzing: '#6366f1',
  pending: '#6b7280',
  failed: '#ef4444',
};

const SAFETY_RANGE_COLORS = ['#ef4444', '#f59e0b', '#84cc16', '#10b981'];

// ─────────────────────────────────────────────
// Metric card
// ─────────────────────────────────────────────
function MetricCard({
  title, value, subtitle, icon: Icon, gradient, trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType<{ className?: string }>;
  gradient: string;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <SpotlightCard className="p-5">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} bg-opacity-15`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend && (
          <Badge className={trend.positive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}>
            {trend.positive ? '+' : ''}{trend.value}%
          </Badge>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm font-medium text-foreground mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </SpotlightCard>
  );
}

// ─────────────────────────────────────────────
// Loading skeleton row of cards
// ─────────────────────────────────────────────
function CardSkeletons({ n }: { n: number }) {
  return (
    <>
      {[...Array(n)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
export default function AnalyticsPage() {
  const [days, setDays] = useState(30);

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: docAnalytics, isLoading: docLoading } = useDocumentAnalytics(days);
  const { data: safety, isLoading: safetyLoading } = useSafetyAnalytics();

  const complianceTotal = (safety?.compliant_count ?? 0) + (safety?.warning_count ?? 0) + (safety?.violation_count ?? 0);
  const complianceRate = complianceTotal > 0
    ? Math.round((safety!.compliant_count / complianceTotal) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              <ShinyText>Analytics</ShinyText>
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              AI-powered insights across your mining document corpus
            </p>
          </div>
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ScrollReveal>

      {/* ── Overview KPIs ── */}
      <ScrollReveal delay={0.05}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? <CardSkeletons n={4} /> : (
            <>
              <MetricCard
                title="Total Documents"
                value={stats?.total_documents ?? 0}
                subtitle={`${stats?.documents_processed_this_week ?? 0} this week`}
                icon={FileText}
                gradient="from-cyan-500 to-blue-600"
                trend={{ value: 12, positive: true }}
              />
              <MetricCard
                title="Processed"
                value={stats?.processed_documents ?? 0}
                subtitle={`${stats?.documents_processed_today ?? 0} today`}
                icon={CheckCircle}
                gradient="from-emerald-500 to-teal-600"
              />
              <MetricCard
                title="Avg Safety Score"
                value={stats?.average_safety_score != null ? `${stats.average_safety_score}/100` : '—'}
                subtitle="Across analyzed docs"
                icon={Shield}
                gradient="from-violet-500 to-purple-600"
              />
              <MetricCard
                title="Compliance Issues"
                value={(stats?.compliance_violations ?? 0) + (stats?.compliance_warnings ?? 0)}
                subtitle={`${stats?.compliance_violations ?? 0} violations · ${stats?.compliance_warnings ?? 0} warnings`}
                icon={AlertTriangle}
                gradient="from-amber-500 to-orange-600"
              />
            </>
          )}
        </div>
      </ScrollReveal>

      {/* ── Upload trend + Status distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScrollReveal delay={0.1}>
          <SpotlightCard className="p-0">
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <TrendingUp className="mr-2 h-4 w-4 text-cyan-500" />
                Document Uploads Over Time
              </CardTitle>
              <CardDescription>Daily upload count for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {docLoading ? (
                <Skeleton className="h-56 w-full" />
              ) : (docAnalytics?.uploads_by_day?.length ?? 0) > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={docAnalytics!.uploads_by_day}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(v) => new Date(v).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                      labelFormatter={(v) => new Date(v).toLocaleDateString()}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981', r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
                  <Activity className="mr-2 h-4 w-4" />No uploads in this period
                </div>
              )}
            </CardContent>
          </SpotlightCard>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <SpotlightCard className="p-0">
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <BarChart2 className="mr-2 h-4 w-4 text-violet-500" />
                Processing Status Distribution
              </CardTitle>
              <CardDescription>Current state of all documents in your library</CardDescription>
            </CardHeader>
            <CardContent>
              {docLoading ? (
                <Skeleton className="h-56 w-full" />
              ) : (docAnalytics?.by_status?.length ?? 0) > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={docAnalytics!.by_status}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="status" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {docAnalytics!.by_status.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#6b7280'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
                  <FileText className="mr-2 h-4 w-4" />No documents yet
                </div>
              )}
            </CardContent>
          </SpotlightCard>
        </ScrollReveal>
      </div>

      {/* ── Category breakdown + Safety ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScrollReveal delay={0.2}>
          <SpotlightCard className="p-0">
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <FileText className="mr-2 h-4 w-4 text-amber-500" />
                Document Categories
              </CardTitle>
              <CardDescription>Distribution of AI-classified document types</CardDescription>
            </CardHeader>
            <CardContent>
              {docLoading ? (
                <Skeleton className="h-56 w-full" />
              ) : (docAnalytics?.by_category?.length ?? 0) > 0 ? (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={180}>
                    <PieChart>
                      <Pie
                        data={docAnalytics!.by_category}
                        dataKey="count"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        strokeWidth={2}
                      >
                        {docAnalytics!.by_category.map((entry) => (
                          <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] ?? '#6b7280'} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5">
                    {docAnalytics!.by_category.map((cat) => (
                      <div key={cat.category} className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                          style={{ background: CATEGORY_COLORS[cat.category] ?? '#6b7280' }}
                        />
                        <span className="text-xs text-muted-foreground capitalize flex-1 line-clamp-1">
                          {cat.category.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-semibold">{cat.count}</span>
                        <span className="text-xs text-muted-foreground w-10 text-right">{cat.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
                  <FileText className="mr-2 h-4 w-4" />No categorized documents yet
                </div>
              )}
            </CardContent>
          </SpotlightCard>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <SpotlightCard className="p-0">
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Shield className="mr-2 h-4 w-4 text-emerald-500" />
                Safety Analysis
              </CardTitle>
              <CardDescription>Compliance and safety score overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {safetyLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <>
                  {/* Avg score */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Average Safety Score</span>
                      <span className="font-semibold text-foreground">
                        {safety?.average_safety_score?.toFixed(1) ?? '—'} / 100
                      </span>
                    </div>
                    <Progress value={safety?.average_safety_score ?? 0} className="h-2" />
                  </div>

                  {/* Compliance breakdown */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Compliant', val: safety?.compliant_count ?? 0, color: 'emerald' },
                      { label: 'Warnings', val: safety?.warning_count ?? 0, color: 'amber' },
                      { label: 'Violations', val: safety?.violation_count ?? 0, color: 'red' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className={`rounded-xl border border-${color}-500/20 bg-${color}-500/10 p-3 text-center`}>
                        <p className={`text-xl font-bold text-${color}-400`}>{val}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Score distribution */}
                  {(safety?.score_distribution?.length ?? 0) > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Score Distribution</p>
                      {safety!.score_distribution.map((bucket, i) => (
                        <div key={bucket.range} className="space-y-0.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{bucket.range}</span>
                            <span className="text-foreground">{bucket.count} docs ({bucket.percentage}%)</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: SAFETY_RANGE_COLORS[i] }}
                              initial={{ width: 0 }}
                              animate={{ width: `${bucket.percentage}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {complianceTotal > 0 && (
                    <div className="flex items-center gap-2 text-sm border-t border-border pt-3 mt-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <span className="text-muted-foreground">Overall compliance rate:</span>
                      <span className={`font-bold ${complianceRate >= 80 ? 'text-emerald-400' : complianceRate >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                        {complianceRate}%
                      </span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </SpotlightCard>
        </ScrollReveal>
      </div>

      {/* ── Chat activity ── */}
      <ScrollReveal delay={0.3}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statsLoading ? <CardSkeletons n={3} /> : (
            <>
              <MetricCard
                title="Chat Sessions"
                value={stats?.total_chat_sessions ?? 0}
                subtitle="Total AI conversations"
                icon={Zap}
                gradient="from-violet-500 to-purple-600"
              />
              <MetricCard
                title="Total Messages"
                value={stats?.total_messages ?? 0}
                subtitle="User + AI messages"
                icon={Activity}
                gradient="from-cyan-500 to-blue-600"
              />
              <MetricCard
                title="Docs With Hazards"
                value={stats?.documents_with_hazards ?? 0}
                subtitle="Flagged by Safety Agent"
                icon={AlertTriangle}
                gradient="from-red-500 to-rose-600"
              />
            </>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}
