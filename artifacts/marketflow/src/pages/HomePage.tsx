import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import { dashboardApi } from '@/lib/api';
import {
  ShoppingCart, Package, Warehouse, ShoppingBag,
  RotateCcw, Users, BarChart3, UserCheck,
  Settings, Headphones, ArrowLeft, ClipboardCheck,
  Store, TrendingUp, AlertTriangle,
} from 'lucide-react';

interface AppCard {
  href: string;
  icon: React.ElementType;
  label: string;
  desc: string;
  color: string;
  badgeKey?: string;
}

const cards: AppCard[] = [
  { href: '/pos',             icon: ShoppingCart,   label: 'نقطة البيع',          desc: 'بيع المنتجات وإصدار الفواتير',        color: 'bg-blue-500' },
  { href: '/products',        icon: Package,         label: 'المنتجات',             desc: 'إدارة المنتجات والتصنيفات',           color: 'bg-violet-500' },
  { href: '/inventory',       icon: Warehouse,       label: 'المخزون',              desc: 'متابعة مستويات المخزون وحركاته',      color: 'bg-orange-500', badgeKey: 'lowStock' },
  { href: '/sales',           icon: TrendingUp,      label: 'المبيعات',             desc: 'سجل كل عمليات البيع',                 color: 'bg-green-500' },
  { href: '/returns',         icon: RotateCcw,       label: 'المرتجعات',            desc: 'إدارة مرتجعات العملاء',               color: 'bg-red-500' },
  { href: '/customer-orders', icon: ClipboardCheck,  label: 'طلبات العملاء',        desc: 'طلبات صفحة الطلب العامة',            color: 'bg-emerald-500', badgeKey: 'pendingOrders' },
  { href: '/purchases',       icon: ShoppingBag,     label: 'المشتريات',            desc: 'أوامر شراء من الموردين',              color: 'bg-cyan-500' },
  { href: '/reports',         icon: BarChart3,       label: 'التقارير',             desc: 'تقارير المبيعات والمخزون والمصروفات', color: 'bg-indigo-500' },
  { href: '/employees',       icon: UserCheck,       label: 'الموظفين',             desc: 'إدارة الموظفين والصلاحيات',           color: 'bg-pink-500' },
  { href: '/customers',       icon: Users,           label: 'العملاء',              desc: 'سجل بيانات العملاء',                  color: 'bg-teal-500' },
  { href: '/order-settings',  icon: Store,           label: 'إعدادات طلب الأوردر', desc: 'تحكم في صفحة الطلب العامة',          color: 'bg-amber-500' },
  { href: '/settings',        icon: Settings,        label: 'الإعدادات',            desc: 'إعدادات النظام والمتجر',              color: 'bg-slate-500' },
  { href: '/support',         icon: Headphones,      label: 'الدعم الفني',          desc: 'تواصل مع فريق الدعم',                 color: 'bg-rose-500' },
];

export default function HomePage() {
  const { canViewPage } = usePermissions();
  const { currentUser } = useAuth();

  const { data: summary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.summary,
  });

  const badges: Record<string, number | null> = {
    lowStock: (summary as any)?.lowStockCount ?? null,
    pendingOrders: null,
  };

  const visible = cards.filter(c => canViewPage(c.href));

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6" dir="rtl">
        <PageHeader
          title={`مرحباً، ${currentUser?.name ?? 'بك'} 👋`}
          subtitle="اختر القسم الذي تريد الوصول إليه"
          breadcrumbs={[{ label: 'الرئيسية' }]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visible.map(card => {
            const Icon = card.icon;
            const badge = card.badgeKey ? badges[card.badgeKey] : null;
            return (
              <Link key={card.href} href={card.href}>
                <Card className="group cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200 h-full">
                  <CardContent className="p-5 flex flex-col gap-3 h-full">
                    <div className="flex items-start justify-between">
                      <div className={`${card.color} p-3 rounded-xl text-white`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {badge !== null && badge > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 ml-0.5" />
                          {badge}
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-base">{card.label}</p>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{card.desc}</p>
                    </div>
                    <div className="flex items-center text-xs text-primary font-medium gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      دخول <ArrowLeft className="h-3.5 w-3.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
