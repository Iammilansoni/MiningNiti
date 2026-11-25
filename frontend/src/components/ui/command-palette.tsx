'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  FileText,
  MessageSquareText,
  Search,
  Settings,
  ShieldCheck,
  Upload,
  Wand2,
} from 'lucide-react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';

interface PaletteItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category: string;
}

interface CommandPaletteProps {
  compact?: boolean;
}

export default function CommandPalette({ compact = false }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const runCommand = useCallback((action: () => void) => {
    setOpen(false);
    action();
  }, []);

  const commands = useMemo<PaletteItem[]>(
    () => [
      {
        id: 'overview',
        label: 'Open overview',
        icon: <BarChart3 className="size-4" />,
        shortcut: 'G O',
        action: () => router.push('/dashboard'),
        category: 'Navigation',
      },
      {
        id: 'documents',
        label: 'Open documents',
        icon: <FileText className="size-4" />,
        shortcut: 'G D',
        action: () => router.push('/documents'),
        category: 'Navigation',
      },
      {
        id: 'assistant',
        label: 'Open AI assistant',
        icon: <MessageSquareText className="size-4" />,
        shortcut: 'G A',
        action: () => router.push('/chat'),
        category: 'Navigation',
      },
      {
        id: 'compliance',
        label: 'Open compliance audits',
        icon: <ShieldCheck className="size-4" />,
        shortcut: 'G C',
        action: () => router.push('/compliance'),
        category: 'Navigation',
      },
      {
        id: 'analytics',
        label: 'Open analytics',
        icon: <BarChart3 className="size-4" />,
        shortcut: 'G R',
        action: () => router.push('/analytics'),
        category: 'Navigation',
      },
      {
        id: 'prompts',
        label: 'Open prompts',
        icon: <Wand2 className="size-4" />,
        action: () => router.push('/prompts'),
        category: 'Navigation',
      },
      {
        id: 'settings',
        label: 'Open settings',
        icon: <Settings className="size-4" />,
        action: () => router.push('/settings'),
        category: 'Navigation',
      },
      {
        id: 'upload',
        label: 'Upload documents',
        icon: <Upload className="size-4" />,
        action: () => router.push('/documents?upload=true'),
        category: 'Actions',
      },
      {
        id: 'new-chat',
        label: 'Start new conversation',
        icon: <MessageSquareText className="size-4" />,
        action: () => router.push('/chat'),
        category: 'Actions',
      },
    ],
    [router]
  );

  const groupedCommands = useMemo(() => {
    return commands.reduce<Record<string, PaletteItem[]>>((groups, command) => {
      groups[command.category] = [...(groups[command.category] ?? []), command];
      return groups;
    }, {});
  }, [commands]);

  return (
    <>
      {compact ? (
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setOpen(true)}
          className="hidden sm:flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring shrink-0"
        >
          <Search className="size-3.5 shrink-0" />
          <span className="hidden md:inline mr-4 whitespace-nowrap">Search documents...</span>
          <span className="md:hidden mr-2 whitespace-nowrap">Search...</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-9 w-full max-w-xl items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">Search documents, actions, and pages</span>
          <Badge variant="outline" className="text-[11px] font-medium">
            Ctrl K
          </Badge>
        </button>
      )}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="rounded-lg border shadow-[var(--shadow-overlay)]">
          <CommandInput placeholder="Search MiningNiti..." className="border-b" />
          <CommandList>
            <CommandEmpty>No matching command found.</CommandEmpty>
            {Object.entries(groupedCommands).map(([category, items], index) => (
              <div key={category}>
                {index > 0 && <CommandSeparator />}
                <CommandGroup heading={category}>
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => runCommand(item.action)}
                      className="flex cursor-pointer items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.shortcut && (
                        <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                          {item.shortcut}
                        </kbd>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
