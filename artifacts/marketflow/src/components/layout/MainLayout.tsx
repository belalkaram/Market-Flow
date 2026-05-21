import { useRef, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'wouter';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const mainRef = useRef<HTMLElement>(null);

  useScrollRestoration(mainRef);

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden" dir="rtl">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar collapsed={sidebarCollapsed} onClose={() => {}} />
      </div>

      {/* Mobile Sidebar Drawer */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="right" className="p-0 w-64 border-l-0 border-r border-border" dir="rtl">
          <Sidebar
            collapsed={false}
            onClose={() => setMobileSidebarOpen(false)}
            isMobile
          />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          openMobileSidebar={() => setMobileSidebarOpen(true)}
        />
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto p-3 md:p-6 bg-slate-50/50 dark:bg-slate-900/20"
        >
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
