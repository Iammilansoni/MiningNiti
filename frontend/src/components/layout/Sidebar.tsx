'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { MiningNitiMark } from '@/components/product/brand';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'AI Intelligence',
    href: '/dashboard/chat',
    icon: MessageSquare,
  },
  {
    name: 'Documents',
    href: '/dashboard/documents',
    icon: FileText,
  },
  {
    name: 'Prompts',
    href: '/dashboard/prompts',
    icon: Sparkles,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart2,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        'group flex h-screen flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-[var(--sidebar-width-collapsed)]' : 'w-[var(--sidebar-width)]'
      )}
    >
      {/* ── Brand ── */}
      <div className="flex h-[var(--header-height)] shrink-0 items-center px-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2 focus-visible:outline-none hover:opacity-80 transition-opacity">
          <MiningNitiMark className="shrink-0" />
          {!sidebarCollapsed && (
            <span className="text-sm font-semibold tracking-tight truncate transition-opacity duration-300">
              MiningNiti
            </span>
          )}
        </Link>
      </div>

      {/* ── Workspace Switcher (Mock) ── */}
      {!sidebarCollapsed && (
        <div className="px-4 py-4">
          <button className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent transition-colors">
            <div className="flex items-center gap-2 truncate">
              <div className="size-5 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                M
              </div>
              <span className="truncate">Mining Corp Inc.</span>
            </div>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-muted-foreground shrink-0">
              <path d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className={cn('flex-1 overflow-y-auto px-2 py-2 space-y-1', sidebarCollapsed && 'pt-4')}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                sidebarCollapsed ? 'justify-center' : 'justify-start'
              )}
              title={sidebarCollapsed ? item.name : undefined}
            >
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary" />
              )}
              <item.icon className="size-[18px] shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="shrink-0 border-t border-border p-2 space-y-1">
        <Link
          href="/"
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            sidebarCollapsed ? 'justify-center' : 'justify-start'
          )}
          title={sidebarCollapsed ? "Return to Website" : undefined}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-[18px] shrink-0"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          {!sidebarCollapsed && <span className="truncate">Back to Website</span>}
        </Link>
        <button
          onClick={toggleSidebar}
          className={cn(
            'flex w-full items-center rounded-md px-2 py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            sidebarCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {!sidebarCollapsed && <span className="text-sm font-medium">Collapse</span>}
          {sidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>
    </aside>
  );
}
