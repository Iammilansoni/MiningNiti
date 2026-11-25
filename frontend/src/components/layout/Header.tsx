'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';
import { Menu, Bell } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import CommandPalette from '@/components/ui/command-palette';

// Dynamically import UserButton with ssr:false to prevent hydration mismatch.
// Clerk's UserButton depends on browser auth state which is unavailable during SSR.
const UserButton = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.UserButton),
  { ssr: false, loading: () => <div className="size-8 rounded-full bg-muted animate-pulse" /> }
);

// Sections carry a name the sidebar already uses; deriving the label from the
// URL segment gave "Chat" where the nav says "AI Intelligence", and detail
// routes rendered a raw UUID as the page title.
const SECTION_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  chat: 'AI Intelligence',
  documents: 'Documents',
  compliance: 'Compliance',
  prompts: 'Prompts',
  analytics: 'Analytics',
  settings: 'Settings',
};

export function Header() {
  const pathname = usePathname();
  const { setMobileMenuOpen } = useUIStore();

  const pathSegments = pathname.split('/').filter(Boolean);
  const [section, ...rest] = pathSegments;

  // The previous condition was `length > 1`, so every top-level route — /chat,
  // /documents, /analytics — has one segment and fell through to "Dashboard".
  const sectionLabel = section
    ? SECTION_LABELS[section] ??
      section.charAt(0).toUpperCase() + section.slice(1)
    : 'Dashboard';

  // Detail routes append "Detail" rather than an opaque identifier.
  const isDetail = rest.length > 0;

  return (
    <header className="sticky top-0 z-40 flex h-(--header-height) w-full min-w-0 items-center justify-between gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Mobile & Tablet Menu Toggle */}
        <button
          suppressHydrationWarning
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
        >
          <Menu className="size-5" />
          <span className="sr-only">Open Menu</span>
        </button>

        {/* Breadcrumbs / Page Title */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 text-sm min-w-0">
          <span className="text-muted-foreground/70 shrink-0">MiningNiti</span>
          <span className="text-muted-foreground/30 shrink-0" aria-hidden>/</span>
          {isDetail ? (
            <>
              <span className="text-muted-foreground/70 truncate">{sectionLabel}</span>
              <span className="text-muted-foreground/30 shrink-0" aria-hidden>/</span>
              <span className="font-medium text-foreground truncate" aria-current="page">Detail</span>
            </>
          ) : (
            <span className="font-medium text-foreground truncate" aria-current="page">{sectionLabel}</span>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <CommandPalette compact />

        <div className="flex items-center gap-1">
          <button suppressHydrationWarning className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative">
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary" />
            <span className="sr-only">Notifications</span>
          </button>
          <ThemeToggle />
        </div>

        <div className="pl-2 ml-1 sm:ml-2 border-l border-border flex items-center shrink-0">
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "size-8 rounded-full border border-border shadow-sm"
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}
