'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  FileText,
  MessageSquare,
  Settings,
  Upload,
  Search,
  Wand2,
  BarChart3,
  HelpCircle,
  Moon,
  Sun,
  Keyboard,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';

interface CommandItem {
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
  const { theme, setTheme } = useTheme();

  // Toggle with keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      // Escape to close
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      icon: <BarChart3 className="w-4 h-4" />,
      shortcut: '⌘D',
      action: () => router.push('/dashboard'),
      category: 'Navigation',
    },
    {
      id: 'documents',
      label: 'Go to Documents',
      icon: <FileText className="w-4 h-4" />,
      shortcut: '⌘1',
      action: () => router.push('/dashboard/documents'),
      category: 'Navigation',
    },
    {
      id: 'chat',
      label: 'Go to AI Chat',
      icon: <MessageSquare className="w-4 h-4" />,
      shortcut: '⌘2',
      action: () => router.push('/dashboard/chat'),
      category: 'Navigation',
    },
    {
      id: 'prompts',
      label: 'Go to Prompts',
      icon: <Wand2 className="w-4 h-4" />,
      shortcut: '⌘3',
      action: () => router.push('/dashboard/prompts'),
      category: 'Navigation',
    },
    {
      id: 'settings',
      label: 'Go to Settings',
      icon: <Settings className="w-4 h-4" />,
      shortcut: '⌘,',
      action: () => router.push('/dashboard/settings'),
      category: 'Navigation',
    },
    // Actions
    {
      id: 'upload',
      label: 'Upload Document',
      icon: <Upload className="w-4 h-4" />,
      shortcut: '⌘U',
      action: () => router.push('/dashboard/documents?upload=true'),
      category: 'Actions',
    },
    {
      id: 'new-chat',
      label: 'New AI Chat',
      icon: <MessageSquare className="w-4 h-4" />,
      shortcut: '⌘N',
      action: () => router.push('/dashboard/chat?new=true'),
      category: 'Actions',
    },
    {
      id: 'search',
      label: 'Search Documents',
      icon: <Search className="w-4 h-4" />,
      shortcut: '⌘F',
      action: () => router.push('/dashboard/documents?search=true'),
      category: 'Actions',
    },
    // Appearance
    {
      id: 'toggle-theme',
      label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      icon: theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
      shortcut: '⌘T',
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      category: 'Appearance',
    },
    // Help
    {
      id: 'shortcuts',
      label: 'Keyboard Shortcuts',
      icon: <Keyboard className="w-4 h-4" />,
      shortcut: '⌘/',
      action: () => console.log('Show shortcuts'),
      category: 'Help',
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => window.open('https://docs.miningniti.com', '_blank'),
      category: 'Help',
    },
  ], [router, theme, setTheme]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    commands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [commands]);

  return (
    <>
      {/* Trigger button for mobile/accessibility */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Search...</span>
        <Badge variant="outline" className="ml-2 text-xs">⌘K</Badge>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="rounded-xl border border-border shadow-2xl">
          <CommandInput 
            placeholder="Type a command or search..." 
            className="border-b border-border"
          />
          <CommandList className="max-h-[400px]">
            <CommandEmpty className="py-6 text-center text-muted-foreground">
              No results found.
            </CommandEmpty>
            
            {Object.entries(groupedCommands).map(([category, items], index) => (
              <div key={category}>
                {index > 0 && <CommandSeparator />}
                <CommandGroup heading={category}>
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => runCommand(item.action)}
                      className="flex items-center justify-between py-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-muted text-muted-foreground">
                          {item.icon}
                        </div>
                        <span>{item.label}</span>
                      </div>
                      {item.shortcut && (
                        <kbd className="px-2 py-1 rounded bg-muted text-xs text-muted-foreground font-mono">
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
