import { SectionCard } from '@/components/product/section-card';
import { Upload, MessageSquare, Search, FileText } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const actions = [
  {
    title: 'Upload Document',
    description: 'Parse and index new files',
    icon: Upload,
    href: '/dashboard/documents?upload=true',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    title: 'New AI Chat',
    description: 'Query your knowledge base',
    icon: MessageSquare,
    href: '/dashboard/chat',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    title: 'Search Registry',
    description: 'Find compliance records',
    icon: Search,
    href: '/dashboard/documents',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    title: 'Generate Report',
    description: 'Create summary export',
    icon: FileText,
    href: '/dashboard/analytics',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
];

export function QuickActions() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {actions.map((action) => (
        <Link key={action.title} href={action.href} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
          <SectionCard className="h-full p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors bg-card border-border shadow-sm">
            <div className={cn('size-10 rounded-lg flex items-center justify-center shrink-0', action.bg)}>
              <action.icon className={cn('size-5', action.color)} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{action.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>
            </div>
          </SectionCard>
        </Link>
      ))}
    </div>
  );
}
