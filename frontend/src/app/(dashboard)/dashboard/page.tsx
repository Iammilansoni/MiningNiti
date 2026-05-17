// src/app/(dashboard)/dashboard/page.tsx
// Modern dashboard home page with enhanced analytics

'use client';

import { motion } from 'framer-motion';
import { 
  FileText, 
  MessageSquare, 
  Wand2, 
  TrendingUp, 
  Upload, 
  ArrowRight,
  Sparkles,
  Brain,
  Zap
} from 'lucide-react';
import { useDashboardStats, useDocuments, usePrompts } from '@/hooks/useApi';
import { 
  RecentActivity, 
  QuickActions, 
  SafetyScoreWidget, 
  ActivityFeed 
} from '@/components/dashboard';
import { ShinyText, CountUp, SpotlightCard, ScrollReveal } from '@/components/reactbits';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Enhanced Stat card with premium styling
function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  gradient,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  description?: string;
  trend?: { value: number; isPositive: boolean };
  gradient: string;
}) {
  return (
    <SpotlightCard className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">
              <CountUp end={value} duration={1.5} />
            </span>
            {trend && (
              <span
                className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1',
                  trend.isPositive
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-red-500/10 text-red-500'
                )}
              >
                <TrendingUp className={cn('w-3 h-3', !trend.isPositive && 'rotate-180')} />
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>

        <motion.div
          className={cn(
            'p-3 rounded-xl bg-gradient-to-br shadow-lg',
            gradient
          )}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
      </div>
    </SpotlightCard>
  );
}

// AI Insights card
function AIInsightsCard() {
  const insights = [
    { text: '3 documents need safety review', type: 'warning' },
    { text: 'Compliance score improved by 5%', type: 'success' },
    { text: 'New MSHA regulation detected', type: 'info' },
  ];

  return (
    <SpotlightCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold">AI Insights</h3>
        <Badge variant="secondary" className="ml-auto">New</Badge>
      </div>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
          >
            <Sparkles className={cn(
              'w-4 h-4 mt-0.5',
              insight.type === 'warning' && 'text-amber-500',
              insight.type === 'success' && 'text-green-500',
              insight.type === 'info' && 'text-blue-500'
            )} />
            <span className="text-sm">{insight.text}</span>
          </motion.div>
        ))}
      </div>
      <Button variant="ghost" className="w-full mt-4 text-primary">
        View all insights →
      </Button>
    </SpotlightCard>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: documents, isLoading: docsLoading } = useDocuments();
  const { data: prompts } = usePrompts();

  return (
    <div className="space-y-8 relative mesh-gradient min-h-screen -m-6 p-6">
      {/* Welcome Section */}
      <ScrollReveal>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome to <ShinyText>MiningNiti</ShinyText>
            </h1>
            <p className="text-muted-foreground">
              Your AI-powered document intelligence platform for the mining industry.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Zap className="w-3 h-3 mr-1" />
              Pro Plan
            </Badge>
            <p className="text-sm text-muted-foreground">
              Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">⌘K</kbd> for quick actions
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </>
        ) : (
          <>
            <ScrollReveal delay={0}>
              <StatCard
                title="Total Documents"
                value={stats?.total_documents || 0}
                icon={FileText}
                description="Documents in your library"
                gradient="from-emerald-500 to-teal-600"
              />
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <StatCard
                title="Processed"
                value={stats?.processed_documents || 0}
                icon={TrendingUp}
                trend={{ value: 12, isPositive: true }}
                description="AI-analyzed documents"
                gradient="from-violet-500 to-purple-600"
              />
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <StatCard
                title="Chat Sessions"
                value={stats?.total_chat_sessions || 0}
                icon={MessageSquare}
                description="AI conversations"
                gradient="from-amber-500 to-orange-600"
              />
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <StatCard
                title="Custom Prompts"
                value={prompts?.length || 0}
                icon={Wand2}
                description="Saved AI prompts"
                gradient="from-rose-500 to-pink-600"
              />
            </ScrollReveal>
          </>
        )}
      </div>

      {/* Safety Score & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScrollReveal delay={0.2}>
          <SafetyScoreWidget />
        </ScrollReveal>
        <ScrollReveal delay={0.3}>
          <AIInsightsCard />
        </ScrollReveal>
      </div>

      {/* Quick Actions */}
      <ScrollReveal delay={0.3}>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <QuickActions />
      </ScrollReveal>

      {/* Activity Feed & Getting Started */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScrollReveal delay={0.4}>
          <ActivityFeed />
        </ScrollReveal>

        <ScrollReveal delay={0.5}>
          <SpotlightCard className="p-6 h-full">
            <h3 className="text-lg font-semibold mb-4">Getting Started</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <motion.div
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="text-sm font-bold text-white">1</span>
                </motion.div>
                <div>
                  <p className="font-medium">Upload Documents</p>
                  <p className="text-sm text-muted-foreground">
                    Add mining documents, safety protocols, or reports for AI analysis.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <motion.div
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="text-sm font-bold text-white">2</span>
                </motion.div>
                <div>
                  <p className="font-medium">Ask Questions</p>
                  <p className="text-sm text-muted-foreground">
                    Use AI chat to get insights from your documents instantly.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <motion.div
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="text-sm font-bold text-white">3</span>
                </motion.div>
                <div>
                  <p className="font-medium">Create Custom Prompts</p>
                  <p className="text-sm text-muted-foreground">
                    Save specialized prompts for safety reviews, compliance checks, and more.
                  </p>
                </div>
              </div>
            </div>

            <Link href="/dashboard/documents" className="block mt-6">
              <Button className="w-full group bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90">
                <Upload className="w-4 h-4 mr-2" />
                Upload Your First Document
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </SpotlightCard>
        </ScrollReveal>
      </div>
    </div>
  );
}