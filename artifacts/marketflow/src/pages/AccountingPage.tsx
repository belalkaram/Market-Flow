import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfitChart } from '@/components/charts/ProfitChart';
import { Wallet, TrendingUp, TrendingDown, Landmark, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardApi } from '@/lib/api';

export default function AccountingPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.summary,
  });

  const monthSales = Number(summary?.monthSales ?? 0);
  const todaySales = Number(summary?.todaySales ?? 0);
  const estimatedCost = Math.round(monthSales * 0.65);
  const netProfit = monthSales - estimatedCost;

  const profitData = [
    { name: 'يناير', sales: 400000, cost: 320000, profit: 80000 },
    { name: 'فبراير', sales: 300000, cost: 240000, profit: 60000 },
    { name: 'مارس', sales: 450000, cost: 350000, profit: 100000 },
    { name: 'أبريل', sales: 278000, cost: 220000, profit: 58000 },
    { name: 'مايو', sales: monthSales > 0 ? Math.round(monthSales) : 589000, cost: estimatedCost > 0 ? estimatedCost : 450000, profit: netProfit > 0 ? Math.round(netProfit) : 139000 },
  ];

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6" dir="rtl">
        <PageHeader title="الحسابات والمالية" subtitle="نظرة مالية شاملة على أداء الشركة"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'الحسابات' }]}
        />

        {isLoading ? (
          <div className="flex justify-center h-40 items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="مبيعات الشهر" value={monthSales} isCurrency icon={<TrendingUp className="h-5 w-5" />} />
              <StatCard title="مبيعات اليوم" value={todaySales} isCurrency icon={<TrendingDown className="h-5 w-5" />} />
              <StatCard title="صافي الربح التقديري" value={netProfit} isCurrency icon={<Wallet className="h-5 w-5" />} />
              <StatCard title="إجمالي المنتجات" value={summary?.totalProducts ?? 0} icon={<Landmark className="h-5 w-5" />} />
            </div>

            <Tabs defaultValue="overview" className="w-full" dir="rtl">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                <TabsTrigger value="pnl">أرباح وخسائر</TabsTrigger>
                <TabsTrigger value="tax">التقرير الضريبي</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader><CardTitle>مؤشر الأرباح والمبيعات</CardTitle></CardHeader>
                  <CardContent><ProfitChart data={profitData} height={400} /></CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pnl">
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    تقرير الأرباح والخسائر التفصيلي سيكون متاحاً قريباً
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tax">
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    التقرير الضريبي سيكون متاحاً قريباً
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </MainLayout>
  );
}
