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
  CreditCard, Boxes, Warehouse, TrendingUp, Undo2,
  Truck, ShoppingBag, PieChart, UserCheck, HeartHandshake,
  Store, SlidersHorizontal, LifeBuoy, ArrowLeft, AlertTriangle,
  Sparkles, ShieldCheck, Cpu
} from 'lucide-react';

interface AppCard {
  href: string;
  icon: React.ElementType;
  label: string;
  desc: string;
  color: string; // Gradient color for icon
  glowColor: string; // Subtle glowing shadow color
  badgeKey?: string;
}

const cards: AppCard[] = [
  { 
    href: '/pos', 
    icon: CreditCard, 
    label: 'نقطة البيع (POS)', 
    desc: 'واجهة مبيعات كاشير فائقة السرعة وإصدار الفواتير الفورية', 
    color: 'from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500', 
    glowColor: 'group-hover:shadow-blue-500/30' 
  },
  { 
    href: '/products', 
    icon: Boxes, 
    label: 'إدارة المنتجات', 
    desc: 'تنظيم المنتجات، التصنيفات، الأسعار، والباركود التلقائي', 
    color: 'from-purple-500 to-violet-600 dark:from-purple-400 dark:to-violet-500', 
    glowColor: 'group-hover:shadow-purple-500/30' 
  },
  { 
    href: '/inventory', 
    icon: Warehouse, 
    label: 'مستودع المخزون', 
    desc: 'متابعة كميات الفروع، تسوية الجرد، وحركة النقل المخزني', 
    color: 'from-amber-500 to-orange-600 dark:from-amber-400 dark:to-orange-500', 
    glowColor: 'group-hover:shadow-amber-500/30', 
    badgeKey: 'lowStock' 
  },
  { 
    href: '/sales', 
    icon: TrendingUp, 
    label: 'سجل المبيعات', 
    desc: 'أرشيف ذكي لكافة فواتير المبيعات، المدفوعات والعملاء', 
    color: 'from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-500', 
    glowColor: 'group-hover:shadow-emerald-500/30' 
  },
  { 
    href: '/returns', 
    icon: Undo2, 
    label: 'مرتجع المبيعات', 
    desc: 'معالجة طلبات المرتجعات للعملاء وإدارة المبالغ المستردة', 
    color: 'from-rose-500 to-red-600 dark:from-rose-400 dark:to-red-500', 
    glowColor: 'group-hover:shadow-rose-500/30' 
  },
  { 
    href: '/customer-orders', 
    icon: Truck, 
    label: 'طلبات العملاء الإلكترونية', 
    desc: 'استقبال ومتابعة الطلبات المباشرة القادمة من متجرك أونلاين', 
    color: 'from-emerald-400 to-green-600 dark:from-emerald-300 dark:to-green-500', 
    glowColor: 'group-hover:shadow-emerald-400/30', 
    badgeKey: 'pendingOrders' 
  },
  { 
    href: '/purchases', 
    icon: ShoppingBag, 
    label: 'المشتريات والموردين', 
    desc: 'أوامر الشراء للمخزن وحساب فواتير وإلتزامات الموردين', 
    color: 'from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500', 
    glowColor: 'group-hover:shadow-cyan-500/30' 
  },
  { 
    href: '/reports', 
    icon: PieChart, 
    label: 'التقارير والإحصائيات', 
    desc: 'لوحة متقدمة لتحليل الأرباح، تقارير الضريبة، وأداء الفروع', 
    color: 'from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500', 
    glowColor: 'group-hover:shadow-indigo-500/30' 
  },
  { 
    href: '/employees', 
    icon: UserCheck, 
    label: 'الموظفين والصلاحيات', 
    desc: 'إدارة الكادر البشري، المندوبين، وتعيين الأدوار والنظام', 
    color: 'from-pink-500 to-rose-600 dark:from-pink-400 dark:to-rose-500', 
    glowColor: 'group-hover:shadow-pink-500/30' 
  },
  { 
    href: '/customers', 
    icon: HeartHandshake, 
    label: 'قاعدة العملاء والولاء', 
    desc: 'سجل تفاعلي لبيانات العملاء، نقاط الولاء، وكشف الحساب', 
    color: 'from-teal-500 to-cyan-600 dark:from-teal-400 dark:to-cyan-500', 
    glowColor: 'group-hover:shadow-teal-500/30' 
  },
  { 
    href: '/order-settings', 
    icon: Store, 
    label: 'إعدادات متجر الويب', 
    desc: 'التحكم في المتجر العام، خيارات التوصيل، والهوية التجارية', 
    color: 'from-amber-400 to-yellow-600 dark:from-amber-300 dark:to-yellow-500', 
    glowColor: 'group-hover:shadow-amber-400/30' 
  },
  { 
    href: '/settings', 
    icon: SlidersHorizontal, 
    label: 'إعدادات النظام العامة', 
    desc: 'ضبط الفروع المترابطة، الضرائب، الفواتير، والأجهزة الملحقة', 
    color: 'from-slate-600 to-slate-800 dark:from-slate-500 dark:to-slate-700', 
    glowColor: 'group-hover:shadow-slate-600/30' 
  },
  { 
    href: '/support', 
    icon: LifeBuoy, 
    label: 'مركز الدعم الفني المباشر', 
    desc: 'طلب مساعدة فورية وفتح تذاكر تواصل مع فريق عملنا', 
    color: 'from-rose-400 to-pink-600 dark:from-rose-300 dark:to-pink-500', 
    glowColor: 'group-hover:shadow-rose-400/30' 
  },
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
      <div className="space-y-6 md:space-y-8" dir="rtl">
        {/* Custom Premium Welcoming Card */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 p-6 md:p-8">
          {/* Futuristic background patterns */}
          <div className="absolute right-0 top-0 -mr-16 -mt-16 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute left-0 bottom-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3.5 py-1 text-emerald-300 text-xs font-semibold">
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span>الوصول الذكي والتحكم الموحد</span>
              </div>
              <h1 className="text-2xl md:text-4.5xl font-black tracking-tight leading-tight">
                أهلاً بك مجدداً، {currentUser?.name ?? 'شريك النجاح'} 👋
              </h1>
              <p className="text-sm md:text-base text-slate-300 font-light leading-relaxed max-w-2xl">
                مرحباً بك في نظام <span className="text-emerald-400 font-bold">MarketFlow ERP</span> لإدارة وتتبع مبيعاتك ومخزونك بكل سلاسة وذكاء. الرجاء اختيار القسم المطلوب لبدء العمل.
              </p>
            </div>

            {/* Quick mini-stats in the welcome banner */}
            <div className="hidden lg:flex items-center gap-4 shrink-0">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center min-w-[120px]">
                <ShieldCheck className="h-5 w-5 text-emerald-400 mx-auto mb-1.5" />
                <span className="text-[10px] text-slate-400 block">رتبة المستخدم</span>
                <span className="text-xs font-bold block truncate max-w-[100px] mt-0.5">
                  {currentUser?.roleName ?? currentUser?.role}
                </span>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center min-w-[120px]">
                <Cpu className="h-5 w-5 text-cyan-400 mx-auto mb-1.5" />
                <span className="text-[10px] text-slate-400 block">حالة الاتصال</span>
                <span className="text-xs font-bold text-green-400 mt-0.5 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                  مستقر
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              لوحة الأقسام والعمليات المتاحة
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
              لديك صلاحيات كاملة للوصول إلى {visible.length} قسماً رئيسياً
            </p>
          </div>
        </div>

        {/* Beautiful Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {visible.map(card => {
            const Icon = card.icon;
            const badge = card.badgeKey ? badges[card.badgeKey] : null;
            return (
              <Link key={card.href} href={card.href}>
                <Card className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col justify-between">
                  {/* Subtle color highlight at top of card on hover */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 from-emerald-500 to-teal-500" />
                  
                  <CardContent className="p-6 flex flex-col gap-4 h-full">
                    {/* Icon container & Badge */}
                    <div className="flex items-start justify-between">
                      <div className={`bg-gradient-to-tr ${card.color} p-3.5 rounded-2xl text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg ${card.glowColor}`}>
                        <Icon className="h-6 w-6 stroke-[1.8]" />
                      </div>
                      
                      {badge !== null && badge > 0 && (
                        <Badge variant="destructive" className="text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm shadow-red-500/20 font-bold border-0 bg-red-500 animate-pulse">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          {badge}
                        </Badge>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 space-y-1">
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-base md:text-lg group-hover:text-primary transition-colors duration-200">
                        {card.label}
                      </p>
                      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                        {card.desc}
                      </p>
                    </div>

                    {/* Footer Slide Indicator */}
                    <div className="flex items-center text-xs text-primary font-bold gap-1 mt-2 transform translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <span>دخول وتصفح القسم</span>
                      <ArrowLeft className="h-3.5 w-3.5 mr-0.5" />
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
