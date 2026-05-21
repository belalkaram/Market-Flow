import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { api } from '@/lib/api';
import { TrendingUp, Package, CreditCard, ShoppingBag, Loader2, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface SalesReport {
  dailySales: { date: string; total: number; count: number }[];
  topProducts: { productName: string; totalQty: number; totalRevenue: number }[];
  paymentBreakdown: { method: string; total: number; count: number }[];
  summary: { totalRevenue: number; totalOrders: number; totalTax: number; totalDiscount: number; avgOrderValue: number };
}

interface ExpensesReport {
  byCategory: { type: string; total: number; count: number }[];
  byMonth: { month: string; total: number }[];
  summary: { totalExpenses: number; totalCount: number };
}

interface InventoryReport {
  products: { id: string; name: string; sku?: string; currentStock: number; minStock?: number; costPrice: number; salePrice: number; stockValue: number }[];
  summary: { totalProducts: number; totalStockValue: number; lowStockCount: number; outOfStockCount: number };
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const PAYMENT_LABELS: Record<string, string> = { cash: 'نقدي', card: 'بطاقة', wallet: 'محفظة' };
const EXPENSE_LABELS: Record<string, string> = {
  rent: 'إيجار', utilities: 'مرافق', salaries: 'رواتب',
  maintenance: 'صيانة', marketing: 'تسويق', other: 'أخرى',
};

function StatCard({ title, value, sub, icon: Icon, color = '' }: {
  title: string; value: string; sub?: string; icon: React.ElementType; color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5 flex items-start gap-4">
        <div className={`p-2.5 rounded-xl bg-primary/10 text-primary ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function fmt(v: number) {
  return v.toLocaleString('ar-SA', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' ر.س';
}

export default function ReportsPage() {
  const [period, setPeriod] = useState('30d');
  const [tab, setTab] = useState<'sales' | 'expenses' | 'inventory'>('sales');

  const salesQ = useQuery<SalesReport>({
    queryKey: ['reports-sales', period],
    queryFn: () => api.get(`/reports/sales?period=${period}`),
    enabled: tab === 'sales',
  });

  const expensesQ = useQuery<ExpensesReport>({
    queryKey: ['reports-expenses', period],
    queryFn: () => api.get(`/reports/expenses?period=${period}`),
    enabled: tab === 'expenses',
  });

  const inventoryQ = useQuery<InventoryReport>({
    queryKey: ['reports-inventory'],
    queryFn: () => api.get('/reports/inventory'),
    enabled: tab === 'inventory',
  });

  const periods = [
    { value: '7d', label: '7 أيام' },
    { value: '30d', label: '30 يوم' },
    { value: '90d', label: '90 يوم' },
    { value: '1y', label: 'سنة' },
  ];

  return (
    <MainLayout>
      <div className="space-y-6" dir="rtl">
        <PageHeader
          title="التقارير والإحصائيات"
          subtitle="تحليل أداء المتجر والمبيعات والمخزون"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'التقارير' }]}
          actions={
            tab !== 'inventory' ? (
              <div className="flex gap-2 flex-wrap">
                {periods.map(o => (
                  <Button key={o.value} size="sm" variant={period === o.value ? 'default' : 'outline'}
                    onClick={() => setPeriod(o.value)}>{o.label}</Button>
                ))}
              </div>
            ) : undefined
          }
        />

        <Tabs value={tab} onValueChange={v => setTab(v as typeof tab)}>
          <TabsList className="mb-4">
            <TabsTrigger value="sales" className="gap-2">
              <TrendingUp className="h-4 w-4" /> المبيعات
            </TabsTrigger>
            <TabsTrigger value="expenses" className="gap-2">
              <CreditCard className="h-4 w-4" /> المصروفات
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2">
              <Package className="h-4 w-4" /> المخزون
            </TabsTrigger>
          </TabsList>

          {/* ── SALES ── */}
          <TabsContent value="sales">
            {salesQ.isLoading ? (
              <div className="flex justify-center h-60 items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : salesQ.data ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard title="إجمالي الإيرادات" value={fmt(salesQ.data.summary.totalRevenue)} icon={TrendingUp} />
                  <StatCard title="عدد الفواتير" value={salesQ.data.summary.totalOrders.toLocaleString('ar')} icon={ShoppingBag} />
                  <StatCard title="متوسط الفاتورة" value={fmt(salesQ.data.summary.avgOrderValue)} icon={ArrowUpRight} />
                  <StatCard title="إجمالي الضريبة" value={fmt(salesQ.data.summary.totalTax)} icon={CreditCard} />
                </div>

                <Card>
                  <CardHeader><CardTitle className="text-base">المبيعات اليومية</CardTitle></CardHeader>
                  <CardContent>
                    {salesQ.data.dailySales.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">لا توجد مبيعات في هذه الفترة</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={salesQ.data.dailySales} margin={{ top: 4, right: 4, bottom: 4, left: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => {
                            try { return format(new Date(d + 'T00:00:00'), 'dd/MM', { locale: ar }); } catch { return d; }
                          }} />
                          <YAxis tick={{ fontSize: 11 }} tickFormatter={v => (v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v)} />
                          <Tooltip formatter={(v: number) => [fmt(v), 'الإيرادات']}
                            labelFormatter={d => { try { return format(new Date(d + 'T00:00:00'), 'dd MMM yyyy', { locale: ar }); } catch { return d; } }} />
                          <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader><CardTitle className="text-base">أعلى المنتجات مبيعاً</CardTitle></CardHeader>
                    <CardContent>
                      {salesQ.data.topProducts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">لا بيانات</div>
                      ) : (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={salesQ.data.topProducts.slice(0, 7)} layout="vertical" margin={{ left: 4, right: 12 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => (v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v)} />
                            <YAxis type="category" dataKey="productName" tick={{ fontSize: 10 }} width={85} />
                            <Tooltip formatter={(v: number) => [fmt(v), 'الإيرادات']} />
                            <Bar dataKey="totalRevenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="text-base">طرق الدفع</CardTitle></CardHeader>
                    <CardContent>
                      {salesQ.data.paymentBreakdown.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">لا بيانات</div>
                      ) : (
                        <div className="space-y-3">
                          <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                              <Pie
                                data={salesQ.data.paymentBreakdown.map(p => ({ ...p, name: PAYMENT_LABELS[p.method] ?? p.method }))}
                                dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={65}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {salesQ.data.paymentBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                              </Pie>
                              <Tooltip formatter={(v: number) => [fmt(v), 'الإيرادات']} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="space-y-1.5">
                            {salesQ.data.paymentBreakdown.map((p, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                  <span>{PAYMENT_LABELS[p.method] ?? p.method}</span>
                                </div>
                                <span className="font-medium">{fmt(p.total)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : null}
          </TabsContent>

          {/* ── EXPENSES ── */}
          <TabsContent value="expenses">
            {expensesQ.isLoading ? (
              <div className="flex justify-center h-60 items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : expensesQ.data ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <StatCard title="إجمالي المصروفات" value={fmt(expensesQ.data.summary.totalExpenses)} icon={CreditCard} />
                  <StatCard title="عدد العمليات" value={expensesQ.data.summary.totalCount.toLocaleString('ar')} icon={ShoppingBag} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader><CardTitle className="text-base">المصروفات حسب الفئة</CardTitle></CardHeader>
                    <CardContent>
                      {expensesQ.data.byCategory.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">لا مصروفات في هذه الفترة</div>
                      ) : (
                        <div className="space-y-3">
                          <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                              <Pie
                                data={expensesQ.data.byCategory.map(c => ({ ...c, name: EXPENSE_LABELS[c.type] ?? c.type }))}
                                dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={70}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {expensesQ.data.byCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                              </Pie>
                              <Tooltip formatter={(v: number) => [fmt(v), 'المبلغ']} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="space-y-1.5">
                            {expensesQ.data.byCategory.map((c, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                  <span>{EXPENSE_LABELS[c.type] ?? c.type}</span>
                                </div>
                                <span className="font-medium">{fmt(c.total)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="text-base">المصروفات الشهرية</CardTitle></CardHeader>
                    <CardContent>
                      {expensesQ.data.byMonth.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">لا بيانات</div>
                      ) : (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={expensesQ.data.byMonth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => (v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v)} />
                            <Tooltip formatter={(v: number) => [fmt(v), 'المصروفات']} />
                            <Bar dataKey="total" fill="#ef4444" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : null}
          </TabsContent>

          {/* ── INVENTORY ── */}
          <TabsContent value="inventory">
            {inventoryQ.isLoading ? (
              <div className="flex justify-center h-60 items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : inventoryQ.data ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard title="إجمالي المنتجات" value={inventoryQ.data.summary.totalProducts.toLocaleString('ar')} icon={Package} />
                  <StatCard title="قيمة المخزون" value={fmt(inventoryQ.data.summary.totalStockValue)} icon={TrendingUp} />
                  <StatCard title="منتجات منخفضة" value={inventoryQ.data.summary.lowStockCount.toLocaleString('ar')} icon={Package} color="text-amber-500" />
                  <StatCard title="نفذ من المخزون" value={inventoryQ.data.summary.outOfStockCount.toLocaleString('ar')} icon={Package} color="text-red-500" />
                </div>

                <Card>
                  <CardHeader><CardTitle className="text-base">تفاصيل المخزون</CardTitle></CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b bg-muted/30">
                          <tr className="text-right">
                            <th className="p-3 font-medium">المنتج</th>
                            <th className="p-3 font-medium">الكمية</th>
                            <th className="p-3 font-medium hidden sm:table-cell">الحد الأدنى</th>
                            <th className="p-3 font-medium hidden md:table-cell">قيمة المخزون</th>
                            <th className="p-3 font-medium">الحالة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {inventoryQ.data.products.slice(0, 50).map(p => (
                            <tr key={p.id} className="hover:bg-muted/20">
                              <td className="p-3 font-medium">{p.name}</td>
                              <td className="p-3">{p.currentStock.toLocaleString('ar')}</td>
                              <td className="p-3 text-muted-foreground hidden sm:table-cell">{p.minStock ?? '—'}</td>
                              <td className="p-3 hidden md:table-cell">{fmt(p.stockValue)}</td>
                              <td className="p-3">
                                {p.currentStock === 0 ? (
                                  <Badge variant="destructive" className="text-xs">نفذ</Badge>
                                ) : p.currentStock <= (p.minStock ?? 0) ? (
                                  <Badge className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-100">منخفض</Badge>
                                ) : (
                                  <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-100">متاح</Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
