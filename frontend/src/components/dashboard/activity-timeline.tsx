'use client';

import { SectionCard } from '@/components/product/section-card';
import { FileText, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { getDocuments, getChatSessions } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';

export function ActivityTimeline() {
  const { getToken } = useAuth();

  const { data: docsData, isLoading: isLoadingDocs } = useQuery({
    queryKey: ['activity-documents'],
    queryFn: () => getDocuments(getToken, { page_size: 5 }),
  });

  const { data: chatData, isLoading: isLoadingChats } = useQuery({
    queryKey: ['activity-chats'],
    queryFn: () => getChatSessions(getToken),
  });

  const isLoading = isLoadingDocs || isLoadingChats;

  // Merge and sort activities
  type Activity = {
    id: string;
    type: string;
    content: string;
    date: Date;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
  };
  const activities: Activity[] = [];

  if (docsData?.documents) {
    docsData.documents.forEach((doc) => {
      activities.push({
        id: `doc-${doc.id}`,
        type: 'upload',
        content: `Uploaded ${doc.title || doc.file_name}`,
        date: new Date(doc.created_at),
        icon: FileText,
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-500/10',
      });
    });
  }

  if (chatData) {
    chatData.slice(0, 5).forEach((chat) => {
      activities.push({
        id: `chat-${chat.id}`,
        type: 'chat',
        content: `Chat session: ${chat.title}`,
        date: new Date(chat.created_at),
        icon: MessageSquare,
        iconColor: 'text-emerald-500',
        iconBg: 'bg-emerald-500/10',
      });
    });
  }

  activities.sort((a, b) => b.date.getTime() - a.date.getTime());
  const recentActivities = activities.slice(0, 5);

  return (
    <SectionCard className="p-4 h-full bg-card border border-border shadow-sm">
      <h2 className="text-sm font-semibold mb-4 text-foreground">Recent Activity</h2>
      <div className="relative pl-2">
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
        <ul className="space-y-6 relative">
          {isLoading ? (
            <li className="text-sm text-muted-foreground">Loading activity...</li>
          ) : recentActivities.length === 0 ? (
            <li className="text-sm text-muted-foreground">No recent activity.</li>
          ) : (
            recentActivities.map((item) => (
              <li key={item.id} className="flex gap-4">
                <div className={cn('relative z-10 flex size-8 items-center justify-center rounded-lg shrink-0 ring-4 ring-card', item.iconBg)}>
                  <item.icon className={cn('size-4', item.iconColor)} />
                </div>
                <div className="pt-1.5 flex flex-col gap-1 min-w-0">
                  <p className="text-sm text-foreground/90 leading-tight truncate">{item.content}</p>
                  <time className="text-xs text-muted-foreground">{formatDistanceToNow(item.date, { addSuffix: true })}</time>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </SectionCard>
  );
}
