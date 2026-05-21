import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse,
  ArrowLeftRight, ShoppingBag, Truck, Receipt, RotateCcw,
  Users, CreditCard, Calculator, BarChart3, UserCheck,
  Shield, Building2, Bell, Settings, User, Activity, ClipboardList,
  Headphones, ClipboardCheck
} from 'lucide-react';
import { useStaggerFadeIn } from '@/hooks/useGsap';

const navGroups = [
  {
    label: 'الرئيسية',
    items: [
      { icon: LayoutDashboard, label: 'لوحة التحكم', href: '/dashboard' },
    ],
  },
  {
    label: 'نقطة البيع والمبيعات',
    items: [
      { icon: ShoppingCart,   label: 'نقطة البيع',      href: '/pos' },
      { icon: Receipt,        label: 'المبيعات',         href: '/sales' },
      { icon: RotateCcw,      label: 'المرتجعات',        href: '/returns' },
      { icon: ClipboardCheck, label: 'طلب أوردر',        href: '/order-request' },
      { icon: Users,          label: 'العملاء',          href: '/customers' },
    ],
  },
  {
    label: 'المخزون والمنتجات',
    items: [
      { icon: Package,        label: 'المنتجات',         href: '/products' },
      { icon: Warehouse,      label: 'المخزون',          href: '/inventory' },
      { icon: ArrowLeftRight, label: 'حركة المخزون',     href: '/stock-movements' },
    ],
  },
  {
    label: 'المشتريات',
    items: [
      { icon: ShoppingBag,    label: 'المشتريات',        href: '/purchases' },
      { icon: Truck,          label: 'الموردين',         href: '/suppliers' },
    ],
  },
  {
    label: 'المالية',
    items: [
      { icon: CreditCard,     label: 'المصروفات',        href: '/expenses' },
      { icon: Calculator,     label: 'الحسابات',         href: '/accounting' },
      { icon: BarChart3,      label: 'التقارير',         href: '/reports' },
    ],
  },
  {
    label: 'الإدارة',
    items: [
      { icon: ClipboardList,  label: 'المهام',           href: '/tasks' },
      { icon: UserCheck,      label: 'الموظفين',         href: '/employees' },
      { icon: Shield,         label: 'الأدوار والصلاحيات', href: '/roles' },
      { icon: Building2,      label: 'الفروع',           href: '/branches' },
    ],
  },
  {
    label: 'الإعدادات',
    items: [
      { icon: Headphones,     label: 'الدعم الفني',      href: '/support' },
      { icon: Bell,           label: 'الإشعارات',        href: '/notifications' },
      { icon: Settings,       label: 'الإعدادات',        href: '/settings' },
      { icon: User,           label: 'الملف الشخصي',    href: '/profile' },
      { icon: Activity,       label: 'سجل النشاط',      href: '/activity-logs' },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

export function Sidebar({ collapsed, onClose, isMobile = false }: SidebarProps) {
  const [location] = useLocation();
  const { currentUser } = useAuth();
  const { canViewPage } = usePermissions();
  const containerRef = useStaggerFadeIn('.nav-item', 0.03, 0.1);

  if (!currentUser) return null;

  const showLabel = isMobile || !collapsed;

  return (
    <aside
      className={cn(
        "bg-sidebar border-l border-sidebar-border transition-all duration-300 flex flex-col h-full",
        collapsed && !isMobile ? "w-[72px]" : "w-64"
      )}
    >
      <div className="h-16 flex items-center justify-center border-b border-sidebar-border px-4 shrink-0">
        {showLabel ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-lg shrink-0">
              M
            </div>
            <span className="font-bold text-xl text-sidebar-foreground">MarketFlow</span>
          </div>
        ) : (
          <div className="w-9 h-9 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-xl">
            M
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-3 scrollbar-thin" ref={containerRef}>
        <nav className="px-2 space-y-4">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter(item => canViewPage(item.href));
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.label}>
                {showLabel && (
                  <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 select-none">
                    {group.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href || location.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={isMobile ? onClose : undefined}
                        className={cn(
                          "nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
                          isActive
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          !showLabel && "justify-center px-0"
                        )}
                        title={!showLabel ? item.label : undefined}
                      >
                        <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-primary-foreground" : "text-sidebar-foreground/70")} />
                        {showLabel && <span className="truncate">{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-sidebar-border text-xs text-center text-muted-foreground shrink-0">
        {showLabel && (
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span>الإصدار 1.0.0</span>
          </div>
        )}
      </div>
    </aside>
  );
}
