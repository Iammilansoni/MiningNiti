'use client';

import { useState, useEffect } from 'react';
import { UserButton, useAuth } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Menu, 
  FileText, 
  MessageSquare, 
  Settings, 
  Home,
  Brain,
  HardHat,
  PanelLeft,
  PanelLeftClose,
  Bell,
  Search,
  Command,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { motion, AnimatePresence } from 'framer-motion';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: Home,
    description: 'Overview & Analytics',
    badge: null
  },
  { 
    name: 'Documents', 
    href: '/dashboard/documents', 
    icon: FileText,
    description: 'Document Library',
    badge: 'processing'
  },
  { 
    name: 'AI Chat', 
    href: '/dashboard/chat', 
    icon: MessageSquare,
    description: 'Intelligent Assistant',
    badge: null
  },
  { 
    name: 'AI Prompts', 
    href: '/dashboard/prompts', 
    icon: Brain,
    description: 'Smart Templates',
    badge: 'new'
  },
  { 
    name: 'Settings', 
    href: '/dashboard/settings', 
    icon: Settings,
    description: 'Configuration',
    badge: null
  },
];

const quickActions = [
  {
    name: 'Safety Alert',
    icon: AlertTriangle,
    color: 'text-safety-critical',
    shortcut: '⌘S'
  },
  {
    name: 'Quick Search',
    icon: Search,
    color: 'text-mining-primary',
    shortcut: '⌘K'
  },
  {
    name: 'AI Assistant',
    icon: Zap,
    color: 'text-mining-secondary',
    shortcut: '⌘A'
  }
];

interface SystemStatus {
  overall: 'healthy' | 'warning' | 'critical';
  aiEngine: boolean;
  documents: number;
  processing: number;
  uptime: number;
}

interface EnhancedDashboardLayoutProps {
  children: React.ReactNode;
}

export default function EnhancedDashboardLayout({ children }: EnhancedDashboardLayoutProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    overall: 'healthy',
    aiEngine: true,
    documents: 2547,
    processing: 3,
    uptime: 99.9
  });
  const [notifications] = useState(2);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    // Simulate real-time system monitoring
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        processing: Math.max(0, prev.processing + Math.floor(Math.random() * 3) - 1),
        uptime: prev.uptime + Math.random() * 0.01
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-mining-primary border-t-transparent rounded-full animate-spin mx-auto mining-shadow-neon"></div>
          <p className="text-muted-foreground">Loading MiningNiti Platform...</p>
          <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-mining-gradient-primary animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const getSystemStatusColor = () => {
    switch (systemStatus.overall) {
      case 'healthy': return 'text-safety-ok';
      case 'warning': return 'text-safety-warning';
      case 'critical': return 'text-safety-critical';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        {/* Mobile sidebar */}
        <SheetContent side="left" className="w-80 p-0 bg-card/95 backdrop-blur">
          <div className="flex h-full flex-col">
            {/* Mobile Header */}
            <div className="flex h-16 items-center justify-between border-b border-border bg-gradient-to-r from-mining-primary/10 to-mining-secondary/10 px-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-mining-gradient-primary rounded-lg shadow-lg mining-shadow-neon">
                  <HardHat className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-foreground">MiningNiti</span>
                  <p className="text-xs text-muted-foreground">AI Intelligence</p>
                </div>
              </div>
            </div>

            {/* System Status - Mobile */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">System Status</span>
                <div className={cn("flex items-center space-x-1", getSystemStatusColor())}>
                  <Activity className="h-3 w-3" />
                  <span className="font-medium capitalize">{systemStatus.overall}</span>
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>AI Engine</span>
                  <CheckCircle2 className="h-3 w-3 text-safety-ok" />
                </div>
                <div className="flex justify-between text-xs">
                  <span>Processing</span>
                  <span className="text-mining-secondary">{systemStatus.processing} docs</span>
                </div>
              </div>
            </div>

            {/* Navigation - Mobile */}
            <nav className="flex-1 space-y-2 p-4">
              {navigation.map((item) => (
                <motion.div
                  key={item.name}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300',
                      isActive(item.href)
                        ? 'bg-mining-gradient-primary text-white shadow-lg mining-shadow-neon'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-5 w-5" />
                      <div>
                        <div>{item.name}</div>
                        <div className="text-xs opacity-75">{item.description}</div>
                      </div>
                    </div>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Quick Actions - Mobile */}
            <div className="border-t border-border p-4">
              <p className="text-xs font-medium text-muted-foreground mb-3">Quick Actions</p>
              <div className="grid grid-cols-3 gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.name}
                    variant="ghost"
                    size="sm"
                    className="flex-col h-auto p-3 space-y-1"
                  >
                    <action.icon className={cn("h-4 w-4", action.color)} />
                    <span className="text-xs">{action.name.split(' ')[0]}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>

        {/* Desktop sidebar */}
        <motion.div 
          className={cn(
            "hidden md:fixed md:inset-y-0 md:flex md:flex-col transition-all duration-300 z-50",
            sidebarCollapsed ? "md:w-20" : "md:w-80"
          )}
          animate={{ width: sidebarCollapsed ? 80 : 320 }}
        >
          <div className="flex min-h-0 flex-1 flex-col border-r border-border bg-card/95 backdrop-blur">
            {/* Desktop Header */}
            <div className="flex h-16 items-center justify-between border-b border-border bg-gradient-to-r from-mining-primary/10 to-mining-secondary/10 px-4">
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.div 
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-2 bg-mining-gradient-primary rounded-lg shadow-lg mining-shadow-neon">
                      <HardHat className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <span className="text-lg font-bold text-foreground">MiningNiti</span>
                      <p className="text-xs text-muted-foreground">AI Intelligence Platform</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-8 w-8 hover:bg-accent"
              >
                {sidebarCollapsed ? (
                  <PanelLeft className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* System Status - Desktop */}
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div 
                  className="px-4 py-3 border-b border-border"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-muted-foreground">System Status</span>
                    <div className={cn("flex items-center space-x-1", getSystemStatusColor())}>
                      <Activity className="h-3 w-3" />
                      <span className="font-medium capitalize">{systemStatus.overall}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>AI Engine</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-safety-ok animate-pulse"></div>
                        <span>Active</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span>Documents</span>
                      <span className="font-mono">{systemStatus.documents.toLocaleString()}</span>
                    </div>
                    
                    {systemStatus.processing > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span>Processing</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-mining-secondary animate-spin" />
                          <span>{systemStatus.processing}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Uptime</span>
                        <span className="font-mono">{systemStatus.uptime.toFixed(1)}%</span>
                      </div>
                      <Progress value={systemStatus.uptime} className="h-1" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation - Desktop */}
            <nav className="flex-1 space-y-2 p-4">
              {navigation.map((item) => (
                <motion.div
                  key={item.name}
                  whileHover={!sidebarCollapsed ? { x: 4 } : { scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative',
                      isActive(item.href)
                        ? 'bg-mining-gradient-primary text-white shadow-lg mining-shadow-neon'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      sidebarCollapsed && 'justify-center'
                    )}
                    title={sidebarCollapsed ? `${item.name} - ${item.description}` : undefined}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 flex-shrink-0",
                      sidebarCollapsed ? "mr-0" : "mr-3"
                    )} />
                    
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.div
                          className="flex-1 flex items-center justify-between"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div>
                            <div>{item.name}</div>
                            <div className="text-xs opacity-75">{item.description}</div>
                          </div>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Quick Actions - Desktop */}
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div 
                  className="border-t border-border p-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <p className="text-xs font-medium text-muted-foreground mb-3">Quick Actions</p>
                  <div className="space-y-2">
                    {quickActions.map((action) => (
                      <Button
                        key={action.name}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-auto p-2"
                      >
                        <action.icon className={cn("h-4 w-4 mr-2", action.color)} />
                        <span className="flex-1 text-left">{action.name}</span>
                        <kbd className="text-xs bg-muted px-1 rounded">{action.shortcut}</kbd>
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Main content */}
        <div className={cn(
          "flex flex-col min-h-screen transition-all duration-300",
          sidebarCollapsed ? "md:pl-20" : "md:pl-80"
        )}>
          {/* Top bar */}
          <header className="sticky top-0 z-40 flex h-16 flex-shrink-0 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex flex-1 items-center justify-between px-4 md:px-8">
              {/* Mobile menu button */}
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open sidebar</span>
                </Button>
              </SheetTrigger>

              {/* Breadcrumb / Page title could go here */}
              <div className="hidden md:block">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Home className="h-4 w-4" />
                  <span>/</span>
                  <span className="text-foreground capitalize">
                    {pathname.split('/').slice(-1)[0] || 'dashboard'}
                  </span>
                </div>
              </div>

              {/* Right side actions */}
              <div className="flex items-center gap-4">
                {/* Command palette trigger */}
                <Button variant="ghost" size="icon" className="relative">
                  <Command className="h-4 w-4" />
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                      {notifications}
                    </Badge>
                  )}
                </Button>

                <ThemeToggle />
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1">
            <div className="py-6 px-4 md:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </div>
          </main>
        </div>

        <Toaster richColors position="top-right" />
      </div>
    </Sheet>
  );
}
