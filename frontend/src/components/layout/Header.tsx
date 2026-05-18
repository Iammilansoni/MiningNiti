// src/components/layout/Header.tsx
// Dashboard header with breadcrumbs and search

'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CommandPalette from '@/components/ui/command-palette';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

const pathNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/documents': 'Documents',
  '/dashboard/chat': 'AI Chat',
  '/dashboard/prompts': 'Prompts',
  '/dashboard/settings': 'Settings',
};

export function Header() {
  const pathname = usePathname();
  const { sidebarCollapsed, setMobileMenuOpen } = useUIStore();

  const currentPage = pathNames[pathname] || 'Dashboard';

  return (
    <header className={cn(
      'fixed top-0 right-0 z-30 h-16 bg-background/80 backdrop-blur-md border-b border-border',
      'transition-all duration-300',
      sidebarCollapsed ? 'left-[72px]' : 'left-[240px]',
      'max-md:left-0'
    )}>
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Page Title & Breadcrumb */}
        <div className="flex-1 min-w-0">
          <motion.h1
            key={currentPage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-semibold truncate"
          >
            {currentPage}
          </motion.h1>
        </div>

        {/* Command Palette Search */}
        <div className="hidden md:flex items-center">
          <CommandPalette />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="py-4 text-center text-sm text-muted-foreground">
                No new notifications
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
