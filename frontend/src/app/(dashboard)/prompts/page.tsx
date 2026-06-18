'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPrompts } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { SectionCard } from '@/components/product/section-card';
import { Lightbulb, MessageSquarePlus, Copy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PromptsPage() {
  const { getToken } = useAuth();

  const { data: prompts, isLoading } = useQuery({
    queryKey: ['prompts'],
    queryFn: () => getPrompts(getToken),
  });

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Prompt Library</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Pre-built intelligence queries for standard compliance tasks.
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="gap-2">
            <MessageSquarePlus className="w-4 h-4" /> Create Prompt
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-muted h-48 rounded-xl border border-border"></div>
          ))}
        </div>
      ) : prompts?.length === 0 ? (
        <SectionCard className="p-12 text-center border border-border bg-card shadow-sm z-10 relative">
          <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Prompts Found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            You don't have any saved prompts yet. Create a new prompt to quickly execute repeated analysis tasks.
          </p>
        </SectionCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {prompts?.map((prompt) => (
            <SectionCard key={prompt.id} className="p-6 flex flex-col h-full bg-card border border-border hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <Star className="w-4 h-4" />
                </Button>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{prompt.name}</h3>
              <p className="text-sm text-muted-foreground flex-1 mb-6 line-clamp-3">
                {prompt.prompt}
              </p>
              
              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs font-medium px-2.5 py-1 bg-muted text-muted-foreground rounded-full">
                  {prompt.category || 'General'}
                </span>
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground">
                  <Copy className="w-3.5 h-3.5" /> Use Prompt
                </Button>
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
}
