'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  FileText,
  MessageSquareText,
  Search,
  Settings,
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

export default function CommandPalette() {
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
        action: () => router.push('/dashboard/documents'),
        category: 'Navigation',
      },
      {
        id: 'assistant',
        label: 'Open AI assistant',
        icon: <MessageSquareText className="size-4" />,
        shortcut: 'G A',
        action: () => router.push('/dashboard/chat'),
        category: 'Navigation',
      },
      {
        id: 'analytics',
        label: 'Open analytics',
        icon: <BarChart3 className="size-4" />,
        shortcut: 'G R',
        action: () => router.push('/dashboard/analytics'),
        category: 'Navigation',
      },
      {
        id: 'prompts',
        label: 'Open prompts',
        icon: <Wand2 className="size-4" />,
        action: () => router.push('/dashboard/prompts'),
        category: 'Navigation',
      },
      {
        id: 'settings',
        label: 'Open settings',
        icon: <Settings className="size-4" />,
        action: () => router.push('/dashboard/settings'),
        category: 'Navigation',
      },
      {
        id: 'upload',
        label: 'Upload documents',
        icon: <Upload className="size-4" />,
        action: () => router.push('/dashboard/documents?upload=true'),
        category: 'Actions',
      },
      {
        id: 'new-chat',
        label: 'Start new conversation',
        icon: <MessageSquareText className="size-4" />,
        action: () => router.push('/dashboard/chat'),
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
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-xl items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search documents, actions, and pages</span>
        <Badge variant="outline" className="text-[11px] font-medium">
          Ctrl K
        </Badge>
      </button>

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
