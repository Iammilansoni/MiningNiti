'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { getPrompts } from '@/lib/api';
import { Lightbulb, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PromptPickerMenuProps {
  /** Called with the saved prompt's text when the user picks one. */
  onSelect: (promptText: string) => void;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

/**
 * Dropdown that lists the user's saved prompt templates (from the Prompt
 * Library, /prompts) so they can be inserted as a starting point in a chat
 * input. Used from both the general chat page and per-document chat.
 */
export function PromptPickerMenu({ onSelect, className, align = 'start' }: PromptPickerMenuProps) {
  const { getToken } = useAuth();

  const { data: prompts, isLoading } = useQuery({
    queryKey: ['prompts'],
    queryFn: () => getPrompts(getToken),
    staleTime: 30_000,
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn('shrink-0 h-11 w-11 text-muted-foreground hover:text-foreground', className)}
          title="Use a saved prompt"
        >
          <Lightbulb className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-72">
        <DropdownMenuLabel>Saved Prompts</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="px-2 py-3 text-xs text-muted-foreground">Loading prompts…</div>
        ) : !prompts || prompts.length === 0 ? (
          <div className="px-2 py-3 text-xs text-muted-foreground">
            No saved prompts yet.
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {prompts.map((p) => (
              <DropdownMenuItem
                key={p.id}
                onSelect={() => onSelect(p.prompt)}
                className="flex flex-col items-start gap-0.5 py-2"
              >
                <span className="text-sm font-medium text-foreground truncate w-full">{p.name}</span>
                <span className="text-xs text-muted-foreground line-clamp-1 w-full">{p.prompt}</span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/prompts" className="flex items-center gap-2 text-primary">
            <Plus className="w-3.5 h-3.5" />
            Manage Prompt Library
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
