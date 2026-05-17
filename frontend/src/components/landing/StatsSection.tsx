'use client';

import { motion } from 'framer-motion';
import { FileText, Shield, Zap, Brain, Users, TrendingUp, Clock, Database } from 'lucide-react';
import { CountUp } from '@/components/reactbits';

interface StatItemProps {
  value: number;
  suffix?: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  delay: number;
}

function StatItem({ value, suffix = '', label, sublabel, icon, delay }: StatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative glass p-6 rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
            {icon}
          </div>
          <motion.div
            className="w-12 h-1 rounded-full bg-gradient-to-r from-primary to-primary/50"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: delay + 0.3 }}
          />
        </div>
        <div className="text-4xl md:text-5xl font-bold text-foreground mb-1 tabular-nums">
          <CountUp end={value} duration={2} />
          <span className="text-primary">{suffix}</span>
        </div>
        <p className="text-foreground font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{sublabel}</p>
      </div>
    </motion.div>
  );
}

export default function StatsSection() {
  const stats = [
    {
      value: 2500000,
      suffix: '+',
      label: 'Documents Processed',
      sublabel: 'Across 850+ mining operations',
      icon: <FileText className="w-6 h-6 text-primary" />,
      delay: 0.1,
    },
    {
      value: 99.9,
      suffix: '%',
      label: 'System Uptime',
      sublabel: 'Enterprise-grade reliability',
      icon: <Shield className="w-6 h-6 text-primary" />,
      delay: 0.2,
    },
    {
      value: 75,
      suffix: '%',
      label: 'Faster Response',
      sublabel: 'Incident response time reduction',
      icon: <Zap className="w-6 h-6 text-primary" />,
      delay: 0.3,
    },
    {
      value: 850,
      suffix: '+',
      label: 'Mining Companies',
      sublabel: 'Trust MiningNiti globally',
      icon: <Users className="w-6 h-6 text-primary" />,
      delay: 0.4,
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-chart-3/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4" />
            Trusted by Industry Leaders
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Powering the Future of{' '}
            <span className="text-primary text-glow">Mining Intelligence</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of mining companies that have transformed their operations 
            with AI-powered document intelligence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatItem key={index} {...stat} />
          ))}
        </div>

        {/* Bottom metrics bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16"
        >
          {[
            { icon: <Brain className="w-5 h-5" />, label: 'AI Models Trained', value: '50+' },
            { icon: <Database className="w-5 h-5" />, label: 'Total Data Points', value: '10B+' },
            { icon: <Clock className="w-5 h-5" />, label: 'Avg Response Time', value: '<2s' },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 text-muted-foreground">
              <div className="p-2 rounded-lg bg-muted/50">{item.icon}</div>
              <div>
                <p className="text-lg font-bold text-foreground">{item.value}</p>
                <p className="text-sm">{item.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
