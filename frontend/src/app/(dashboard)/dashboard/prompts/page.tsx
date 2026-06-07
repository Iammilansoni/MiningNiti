'use client';

import { PageHeader } from '@/components/product/page-header';
import { SectionCard } from '@/components/product/section-card';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, FileText, Search } from 'lucide-react';

const mockPrompts = [
  {
    id: 1,
    title: 'Safety Incident Summary',
    description: 'Extracts and formats key safety incident details into the standard DGMS reporting structure.',
    tags: ['Safety', 'Extraction'],
    usage: '1,204 times'
  },
  {
    id: 2,
    title: 'Compliance Audit Checklist',
    description: 'Generates a compliance checklist based on the uploaded regulatory document.',
    tags: ['Compliance', 'Generation'],
    usage: '843 times'
  },
  {
    id: 3,
    title: 'Geological Core Analysis',
    description: 'Summarizes geological core sample reports, highlighting anomalies and expected ore grades.',
    tags: ['Geological', 'Analysis'],
    usage: '512 times'
  },
  {
    id: 4,
    title: 'Maintenance Log Flagging',
    description: 'Scans maintenance logs for missed mandatory services and generates an alert report.',
    tags: ['Maintenance', 'Alerting'],
    usage: '2,100 times'
  }
];

export default function PromptsPage() {
  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col gap-6">
      <PageHeader
        title="Prompt Library"
        description="Manage standard AI instructions for consistent document intelligence across your team."
        actions={
          <Button className="gap-2">
            <Plus className="size-4" />
            Create Prompt
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search prompt library..."
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-4 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">System Default</Button>
          <Button variant="outline" size="sm">Team Custom</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockPrompts.map((prompt) => (
          <SectionCard key={prompt.id} className="surface-elevated-interactive flex flex-col h-full p-5 cursor-pointer">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <Sparkles className="size-5" />
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs shrink-0">Edit</Button>
            </div>
            
            <h3 className="font-semibold text-foreground mb-1">{prompt.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">
              {prompt.description}
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
              <div className="flex flex-wrap gap-1">
                {prompt.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {prompt.usage}
              </span>
            </div>
          </SectionCard>
        ))}

        {/* Create New Card */}
        <button className="flex flex-col items-center justify-center h-full min-h-[220px] rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group">
           <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <Plus className="size-5" />
           </div>
           <span className="text-sm font-medium text-foreground">Create New Prompt</span>
           <span className="text-xs text-muted-foreground mt-1">Design a custom instruction</span>
        </button>
      </div>
    </div>
  );
}