import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-background relative overflow-hidden text-foreground">
      
      {/* Edge-to-edge Sidebar */}
      <div className="hidden md:flex relative z-20 h-screen border-r border-white/[0.05] bg-sidebar/95 backdrop-blur-xl">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-background">
        
        {/* Subtle Ambient Background Gradients */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] mix-blend-screen" />
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <Header />
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
            <div className="w-full max-w-(--content-max-width) mx-auto p-4 md:p-8">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
