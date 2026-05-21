import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { inventoryApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const movementTypes: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  sale: { label: 'بيع', variant: 'default' },
  purchase: { label: 'شراء', variant: 'outline' },
  waste: { label: 'هالك', variant: 'destructive' },
  transfer: { label: 'تحويل', variant: 'secondary' },
  adjustment: { label: 'تسوية', variant: 'secondary' },
  return: { label: 'مرتجع', variant: 'secondary' },
};

export default function StockMovementsPage() {
  const { data: movements = [], isLoading } = useQuery({ queryKey: ['stock-movements'], queryFn: inventoryApi.movements });

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6" dir="rtl">
        <PageHeader title="حركات المخزون" subtitle="سجل جميع حركات المخزون"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'المخزون', href: '/inventory' }, { label: 'حركات المخزون' }]}
        />
        <Card>
          <CardContent className="p-0">
            {isLoading ? <div className="flex justify-center h-40 items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            : movements.length === 0 ? <div className="text-center py-12 text-muted-foreground">لا توجد حركات مخزون مسجلة</div>
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/30"><tr className="text-right">
                    <th className="p-3 font-medium">التاريخ</th>
                    <th className="p-3 font-medium">المنتج</th>
                    <th className="p-3 font-medium">النوع</th>
                    <th className="p-3 font-medium">الكمية</th>
                    <th className="p-3 font-medium hidden sm:table-cell">قبل</th>
                    <th className="p-3 font-medium hidden sm:table-cell">بعد</th>
                    <th className="p-3 font-medium hidden md:table-cell">ملاحظات</th>
                  </tr></thead>
                  <tbody className="divide-y">
                    {movements.map((m: any) => {
                      const mtype = movementTypes[m.type] ?? { label: m.type, variant: 'secondary' as const };
                      const isNeg = m.quantityChange < 0;
                      return (
                        <tr key={m.id} className="hover:bg-muted/20">
                          <td className="p-3 text-xs text-muted-foreground">{format(new Date(m.createdAt), 'dd MMM HH:mm', { locale: ar })}</td>
                          <td className="p-3 font-medium">{m.productName ?? m.productId}</td>
                          <td className="p-3"><Badge variant={mtype.variant} className="text-xs">{mtype.label}</Badge></td>
                          <td className="p-3">
                            <span className={`font-bold ${isNeg ? 'text-red-600' : 'text-green-600'}`}>
                              {isNeg ? '' : '+'}{m.quantityChange}
                            </span>
                          </td>
                          <td className="p-3 hidden sm:table-cell text-muted-foreground">{m.quantityBefore}</td>
                          <td className="p-3 hidden sm:table-cell font-medium">{m.quantityAfter}</td>
                          <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">{m.notes ?? '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
