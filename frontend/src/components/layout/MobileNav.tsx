'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { MiningNitiMark } from '@/components/product/brand';
import { navItems } from '@/components/layout/nav-items';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Home } from 'lucide-react';

/**
 * Mobile navigation drawer.
 *
 * The header's hamburger has always called `setMobileMenuOpen(true)`, but
 * nothing ever read `mobileMenuOpen` and the desktop sidebar is `hidden
 * md:flex` — so below 768px the authenticated app had no navigation at all.
 * This is the missing consumer.
 *
 * Built on the existing shadcn Sheet (Radix Dialog), which supplies the focus
 * trap, Escape handling and `aria-modal` semantics.
 */
export function MobileNav() {
  const pathname = usePathname();
  const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen);
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);

  // Close on navigation — the drawer would otherwise stay over the page the
  // user just asked for.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  // Nothing opens this at md and up, but a viewport that grows past the
  // breakpoint while the drawer is open would leave it stranded on top of the
  // desktop layout.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => {
      if (mq.matches) setMobileMenuOpen(false);
    };
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [setMobileMenuOpen]);

  return (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetContent
        side="left"
        className="w-[min(18rem,85vw)] bg-sidebar text-sidebar-foreground p-0 md:hidden"
      >
        <SheetHeader className="border-b border-sidebar-border px-4 py-4">
          <SheetTitle className="flex items-center gap-2 text-sidebar-foreground">
            <MiningNitiMark className="shrink-0" />
            <span className="text-sm font-semibold tracking-tight">MiningNiti</span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Primary navigation for the MiningNiti workspace
          </SheetDescription>
        </SheetHeader>

        <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="size-[18px] shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto shrink-0 border-t border-sidebar-border p-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <Home className="size-[18px] shrink-0" />
            <span className="truncate">Back to Website</span>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
