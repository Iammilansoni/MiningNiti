// src/components/dashboard/QuickActions.tsx
// Quick action cards for common tasks

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Upload, MessageSquare, FileText, Settings, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
  {
    title: 'Upload Document',
    description: 'Add new documents for AI analysis',
    href: '/dashboard/documents',
    icon: Upload,
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'Start Chat',
    description: 'Ask questions about your documents',
    href: '/dashboard/chat',
    icon: MessageSquare,
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    title: 'View Documents',
    description: 'Browse your document library',
    href: '/dashboard/documents',
    icon: FileText,
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    title: 'Settings',
    description: 'Configure your preferences',
    href: '/dashboard/settings',
    icon: Settings,
    gradient: 'from-slate-500 to-zinc-500',
  },
];

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {actions.map((action, index) => (
        <motion.div
          key={action.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link href={action.href}>
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 cursor-pointer transition-shadow hover:shadow-lg"
            >
              {/* Gradient overlay on hover */}
              <div
                className={cn(
                  'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity',
                  `bg-gradient-to-br ${action.gradient}`
                )}
              />

              <div className="relative">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
                    `bg-gradient-to-br ${action.gradient}`
                  )}
                >
                  <action.icon className="w-5 h-5 text-white" />
                </div>

                <h3 className="font-semibold text-sm mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {action.description}
                </p>

                <ArrowRight className="absolute bottom-0 right-0 w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
