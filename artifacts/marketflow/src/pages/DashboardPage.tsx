import { Suspense, lazy } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { SalesChart } from '@/components/charts/SalesChart';
import { useAuth } from '@/hooks/useAuth';
import { dashboardApi } from '@/lib/api';
import {
  Wallet, TrendingUp, AlertTriangle,
  Users, Package, ArrowUpRight, Building2, Loader2,
  ClipboardList, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStaggerFadeIn } from '@/hooks/useGsap';
import { Link } from 'wouter';

const DashboardScene = lazy(() => import('../components/three/DashboardScene'));

const DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

function formatCurrency(val: number) {
  return val.toLocaleString('ar-SA');
}

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const containerRef = useStaggerFadeIn('.dashboard-item', 0.06);

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.summary,
    refetchInterval: 60000,
  });

  const chartData = summary?.salesChart?.map((d: any) => ({
    name: DAY_NAMES[new Date(d.date).getDay()] ?? d.date,
    value: Number(d.total ?? 0),
  })) ?? [];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const s = summary;

  return (
    <MainLayout>
      <div ref={containerRef} className="space-y-6">
        <PageHeader
          className="dashboard-item"
          title={`لوحة التحكم — ${currentUser?.roleName ?? ''}`}
          subtitle={`مرحباً ${currentUser?.name}، إليك ملخص اليوم`}
        />

        {/* Trial warning banner */}
        {currentUser?.trialDaysLeft != null && !currentUser.isTrialExpired && currentUser.trialDaysLeft <= 7 && (
          <div className="dashboard-item flex items-center gap-3 rounded-xl border border-orange-300 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800 px-4 py-3 text-sm">
            <Clock className="h-5 w-5 text-orange-500 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold text-orange-700 dark:text-orange-400">
                تنبيه: تبقّت {currentUser.trialDaysLeft} أيام على انتهاء فترة التجربة المجانية.
              </span>
              <span className="text-orange-600 dark:text-orange-500 mr-1">يُرجى الترقية للاستمرار.</span>
            </div>
          </div>
        )}

        {/* KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard className="dashboard-item" title="مبيعات اليوم"    value={s?.todaySales ?? 0}       isCurrency icon={<Wallet className="h-5 w-5" />}        trend={{ value: 12.5, isPositive: true }} />
          <StatCard className="dashboard-item" title="مبيعات الشهر"    value={s?.monthSales ?? 0}       isCurrency icon={<TrendingUp className="h-5 w-5" />}    trend={{ value: 8.3, isPositive: true }} />
          <StatCard className="dashboard-item" title="إجمالي المنتجات" value={s?.totalProducts ?? 0}    icon={<Package className="h-5 w-5" />} />
          <StatCard className="dashboard-item" title="مخزون منخفض"     value={s?.lowStockProducts ?? 0} icon={<AlertTriangle className="h-5 w-5" />} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard className="dashboard-item" title="إجمالي العملاء"  value={s?.totalCustomers ?? 0} icon={<Users className="h-5 w-5" />} />
          <StatCard className="dashboard-item" title="المهام المعلقة"  value={s?.pendingTasks ?? 0}   icon={<ClipboardList className="h-5 w-5" />} />
          <StatCard className="dashboard-item" title="الفروع النشطة"   value={s?.totalBranches ?? 0}  icon={<Building2 className="h-5 w-5" />} />
          <StatCard className="dashboard-item" title="إجمالي الموظفين" value={s?.totalUsers ?? 0}     icon={<Users className="h-5 w-5" />} />
        </div>

        {/* Insights */}
        <div className="dashboard-item">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-0.5">الإحصاءات</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Sales Chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm md:text-base">مبيعات آخر 7 أيام</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <SalesChart data={chartData} />
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                    لا توجد بيانات مبيعات بعد
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Sales */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm md:text-base">أحدث المبيعات</CardTitle>
                  <Link href="/sales">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                      عرض الكل <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {(s?.recentSales ?? []).slice(0, 5).map((sale: any) => (
                  <div key={sale.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                    <div>
                      <p className="text-xs font-medium">{sale.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {sale.paymentMethod === 'cash' ? 'نقدي' : sale.paymentMethod === 'card' ? 'بطاقة' : 'محفظة'}
                      </p>
                    </div>
                    <Badge variant={sale.status === 'completed' ? 'default' : 'destructive'} className="text-xs">
                      {formatCurrency(Number(sale.totalAmount))} ر.س
                    </Badge>
                  </div>
                ))}
                {!s?.recentSales?.length && (
                  <p className="text-xs text-muted-foreground text-center py-4">لا توجد مبيعات حتى الآن</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Welcome 3D Banner */}
        <Card className="dashboard-item overflow-hidden">
          <CardContent className="p-0">
            <div className="h-36 md:h-48 bg-[#0F172A] rounded-lg relative">
              <Suspense fallback={null}>
                <DashboardScene />
              </Suspense>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
                <h3 className="text-base md:text-lg font-bold">مرحباً، {currentUser?.name}</h3>
                <p className="text-xs md:text-sm text-slate-400 mt-1">{currentUser?.tenantName ?? 'شركة كنوز التجريبية'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
