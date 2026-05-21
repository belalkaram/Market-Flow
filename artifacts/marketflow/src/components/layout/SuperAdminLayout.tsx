import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import {
  LayoutDashboard, Store, CreditCard, Users, FileText,
  LogOut, ChevronLeft, Shield, Activity, Menu, X, Headphones, ShieldAlert
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'لوحة التحكم', href: '/super-admin/dashboard' },
  { icon: Store, label: 'إدارة المتاجر', href: '/super-admin/stores' },
  { icon: CreditCard, label: 'الخطط والباقات', href: '/super-admin/plans' },
  { icon: Users, label: 'المشرفون', href: '/super-admin/admins' },
  { icon: Activity, label: 'سجل النشاط', href: '/super-admin/activity-logs' },
  { icon: FileText, label: 'صحة النظام', href: '/super-admin/system-health' },
  { icon: Headphones, label: 'الدعم الفني', href: '/super-admin/support' },
  { icon: ShieldAlert, label: 'مركز الأمان', href: '/super-admin/security' },
];

interface SuperAdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export function SuperAdminLayout({ children, title }: SuperAdminLayoutProps) {
  const [location] = useLocation();
  const { admin, logout } = useSuperAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!admin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-white" dir="rtl">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:relative z-50 flex flex-col h-full bg-slate-900 border-l border-slate-800 transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16",
        mobileOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
      )}>
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate">Super Admin</div>
              <div className="text-xs text-slate-400 truncate">MarketFlow Platform</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-auto text-slate-400 hover:text-white hidden md:block"
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", !sidebarOpen && "rotate-180")} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location === item.href || location.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm",
                  isActive
                    ? "bg-red-600/20 text-red-400 font-medium"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}>
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          {sidebarOpen && (
            <div className="px-3 py-2 mb-2 text-xs text-slate-500">
              <div className="font-medium text-slate-300 truncate">{admin.name}</div>
              <div className="truncate">{admin.email}</div>
            </div>
          )}
          <button
            onClick={() => { logout(); window.location.href = '/super-admin/login'; }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors text-sm"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white md:hidden">
            <Menu className="w-5 h-5" />
          </button>
          {title && <h1 className="text-lg font-bold text-white">{title}</h1>}
          <div className="mr-auto flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-400">النظام يعمل بشكل طبيعي</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
