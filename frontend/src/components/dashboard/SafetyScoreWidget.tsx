'use client';

import { motion } from 'framer-motion';
import { Shield, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { CountUp } from '@/components/reactbits';

interface SafetyScoreProps {
  score: number;
  trend?: number;
  incidents?: number;
  warnings?: number;
  compliant?: number;
}

export default function SafetyScoreWidget({
  score = 96,
  trend = 2,
  incidents = 0,
  warnings = 3,
  compliant = 45,
}: SafetyScoreProps) {
  // Determine score color
  const getScoreColor = () => {
    if (score >= 90) return { ring: 'stroke-green-500', text: 'text-green-500', bg: 'bg-green-500' };
    if (score >= 70) return { ring: 'stroke-amber-500', text: 'text-amber-500', bg: 'bg-amber-500' };
    return { ring: 'stroke-red-500', text: 'text-red-500', bg: 'bg-red-500' };
  };

  const colors = getScoreColor();
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Safety Score</h3>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-500">+{trend}%</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {/* Circular progress */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/20"
              />
              {/* Progress circle */}
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                className={colors.ring}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${colors.text}`}>
                <CountUp end={score} duration={1.5} />
              </span>
              <span className="text-xs text-muted-foreground">Overall</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="flex-grow grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 rounded-full bg-green-500/10">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{compliant}</p>
              <p className="text-xs text-muted-foreground">Compliant</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 rounded-full bg-amber-500/10">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{warnings}</p>
              <p className="text-xs text-muted-foreground">Warnings</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 rounded-full bg-red-500/10">
                  <Shield className="w-4 h-4 text-red-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{incidents}</p>
              <p className="text-xs text-muted-foreground">Incidents</p>
            </div>
          </div>
        </div>

        {/* Progress bar footer */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Monthly Target: 95%</span>
            <span className={colors.text}>{score >= 95 ? 'Achieved ✓' : `${95 - score}% to go`}</span>
          </div>
          <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${colors.bg}`}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
