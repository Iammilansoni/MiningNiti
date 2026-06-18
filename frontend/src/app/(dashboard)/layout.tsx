import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-background relative overflow-hidden">
      
      {/* Edge-to-edge Sidebar */}
      <div className="hidden md:flex relative z-10 h-screen border-r border-border bg-sidebar">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-background">
        <Header />
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="w-full max-w-(--content-max-width) mx-auto p-4 md:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
