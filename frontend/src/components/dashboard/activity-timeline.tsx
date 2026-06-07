import { SectionCard } from '@/components/product/section-card';
import { FileText, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const activities = [
  {
    id: 1,
    type: 'upload',
    content: 'Uploaded Q3 Environmental Audit.pdf',
    time: '2 hours ago',
    icon: FileText,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
  },
  {
    id: 2,
    type: 'chat',
    content: 'Queried compliance requirements for Sector 7',
    time: '4 hours ago',
    icon: MessageSquare,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-500/10',
  },
  {
    id: 3,
    type: 'alert',
    content: 'Maintenance log missing mandatory signatures',
    time: 'Yesterday',
    icon: AlertCircle,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-500/10',
  },
  {
    id: 4,
    type: 'success',
    content: 'Safety Protocol v2 successfully indexed',
    time: 'Yesterday',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-500/10',
  },
];

export function ActivityTimeline() {
  return (
    <SectionCard className="p-4 h-full">
      <h2 className="text-sm font-semibold mb-4">Recent Activity</h2>
      <div className="relative pl-2">
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
        <ul className="space-y-6 relative">
          {activities.map((item) => (
            <li key={item.id} className="flex gap-4">
              <div className={cn('relative z-10 flex size-8 items-center justify-center rounded-full shrink-0 outline outline-4 outline-card', item.iconBg)}>
                <item.icon className={cn('size-4', item.iconColor)} />
              </div>
              <div className="pt-1.5 flex flex-col gap-1 min-w-0">
                <p className="text-sm text-foreground leading-tight">{item.content}</p>
                <time className="text-xs text-muted-foreground">{item.time}</time>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </SectionCard>
  );
}
