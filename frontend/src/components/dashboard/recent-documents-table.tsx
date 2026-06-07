import { SectionCard } from '@/components/product/section-card';
import { StatusBadge } from '@/components/product/status';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const recentDocs = [
  { id: '1', title: 'Q3 Environmental Audit.pdf', category: 'Compliance', status: 'verified', date: '2 hrs ago' },
  { id: '2', title: 'Site Alpha Safety Protocol v2.docx', category: 'Safety', status: 'pending', date: '5 hrs ago' },
  { id: '3', title: 'Geological Survey - Sector 7.pdf', category: 'Survey', status: 'verified', date: '1 day ago' },
  { id: '4', title: 'Equipment Maintenance Log_Oct.xlsx', category: 'Maintenance', status: 'flagged', date: '2 days ago' },
];

export function RecentDocumentsTable() {
  return (
    <SectionCard className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-sm font-semibold">Recent Documents</h2>
        <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
          <Link href="/dashboard/documents">
            View All <ArrowRight className="ml-1 size-3" />
          </Link>
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="h-9 px-4 text-left font-medium">Document</th>
              <th className="h-9 px-4 text-left font-medium hidden sm:table-cell">Category</th>
              <th className="h-9 px-4 text-left font-medium">Status</th>
              <th className="h-9 px-4 text-right font-medium hidden md:table-cell">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {recentDocs.map((doc) => (
              <tr key={doc.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors last:border-0">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="size-4 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate">{doc.title}</span>
                  </div>
                </td>
                <td className="p-4 hidden sm:table-cell text-muted-foreground">
                  {doc.category}
                </td>
                <td className="p-4">
                  {doc.status === 'verified' && <StatusBadge label="Verified" tone="success" />}
                  {doc.status === 'pending' && <StatusBadge label="Processing" tone="info" pulse />}
                  {doc.status === 'flagged' && <StatusBadge label="Flagged" tone="warning" />}
                </td>
                <td className="p-4 hidden md:table-cell text-right text-muted-foreground whitespace-nowrap">
                  {doc.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
