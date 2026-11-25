import { WelcomeHeader } from '@/components/dashboard/welcome-header';
import { KPIGrid } from '@/components/dashboard/kpi-grid';
import { RecentDocumentsTable } from '@/components/dashboard/recent-documents-table';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { ActivityTimeline } from '@/components/dashboard/activity-timeline';

export default function DashboardPage() {
  return (
    <div className="min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <WelcomeHeader />
      <KPIGrid />
      
      <div className="grid gap-4 lg:grid-cols-3 min-w-0">
        <div className="lg:col-span-2 min-w-0 flex flex-col gap-4">
          <RecentDocumentsTable />
        </div>
        <div className="min-w-0 flex flex-col gap-4">
          <QuickActions />
          <div className="flex-1 min-h-[300px] min-w-0">
            <ActivityTimeline />
          </div>
        </div>
      </div>
    </div>
  );
}
