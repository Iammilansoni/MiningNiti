// Single source of truth for the authenticated app's primary navigation.
// The desktop Sidebar and the mobile drawer both render this list; keeping two
// copies is how a route ends up reachable on one breakpoint and not the other.

import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  BarChart2,
  Settings,
  Sparkles,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Intelligence', href: '/chat', icon: MessageSquare },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Compliance', href: '/compliance', icon: ShieldCheck },
  { name: 'Prompts', href: '/prompts', icon: Sparkles },
  { name: 'Analytics', href: '/analytics', icon: BarChart2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];
