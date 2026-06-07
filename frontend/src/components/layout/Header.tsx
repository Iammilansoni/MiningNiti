'use client';

import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { useUIStore } from '@/stores/uiStore';
import { Menu, Search, Bell } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function Header() {
  const pathname = usePathname();
  const { setMobileMenuOpen } = useUIStore();

  // Simple breadcrumb logic based on pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const currentPage = pathSegments.length > 1 
    ? pathSegments[pathSegments.length - 1].charAt(0).toUpperCase() + pathSegments[pathSegments.length - 1].slice(1)
    : 'Dashboard';

  return (
    <header className="sticky top-0 z-40 flex h-[var(--header-height)] w-full items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Menu className="size-5" />
          <span className="sr-only">Open Menu</span>
        </button>

        {/* Breadcrumbs / Page Title */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">MiningNiti</span>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-foreground">{currentPage}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Command Palette Trigger (Visual only for now) */}
        <button className="hidden md:flex items-center gap-2 rounded-md border border-input bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          <Search className="size-3.5" />
          <span className="mr-6">Search documents...</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        <div className="flex items-center gap-1">
          <button className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative">
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary" />
            <span className="sr-only">Notifications</span>
          </button>
          <ThemeToggle />
        </div>

        <div className="pl-2 ml-2 border-l border-border flex items-center">
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "size-8 rounded-full border border-border"
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}
