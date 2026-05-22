import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, MessageCircle, ShoppingBag, Phone, MapPin, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending:           { label: 'معلق', variant: 'secondary' },
  confirmed:         { label: 'مؤكد', variant: 'default' },
  preparing:         { label: 'قيد التحضير', variant: 'default' },
  ready:             { label: 'جاهز', variant: 'default' },
  out_for_delivery:  { label: 'في الطريق', variant: 'default' },
  delivered:         { label: 'تم التوصيل', variant: 'default' },
  cancelled:         { label: 'ملغي', variant: 'destructive' },
  converted_to_sale: { label: 'تحوّل لفاتورة', variant: 'outline' },
};

const paymentLabels: Record<string, string> = {
  cash: 'كاش عند الاستلام',
  wallet: 'محفظة',
  bank_transfer: 'تحويل بنكي',
};

const deliveryLabels: Record<string, string> = {
  delivery: 'توصيل',
  pickup: 'استلام من الفرع',
};

function fmt(n: number) {
  return n.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CustomerOrdersPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [viewOrder, setViewOrder] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['customer-orders'],
    queryFn: () => api.get<any[]>('/customer-orders'),
  });

  const updateStatusM = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/customer-orders/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-orders'] });
      if (viewOrder) setViewOrder((o: any) => ({ ...o }));
      toast({ title: 'تم تحديث حالة الطلب' });
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const convertM = useMutation({
    mutationFn: (id: string) => api.post(`/customer-orders/${id}/convert-to-sale`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-orders'] });
      setViewOrder(null);
      toast({ title: 'تم تحويل الطلب إلى فاتورة بيع بنجاح' });
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const sendWhatsApp = (order: any) => {
    const items = (order.items ?? [])
      .map((i: any) => `• ${i.productName} × ${i.quantity} = ${fmt(i.subtotal)} ر.س`)
      .join('\n');
    const msg = `✅ تحديث طلبك — ${order.orderNumber}\n\nالحالة: ${statusConfig[order.status]?.label ?? order.status}\n\n${items}\n\nالإجمالي: ${fmt(order.total)} ر.س`;
    window.open(`https://wa.me/${order.customerPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const filtered = statusFilter === 'all' ? orders : orders.filter((o: any) => o.status === statusFilter);

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6" dir="rtl">
        <PageHeader
          title="طلبات العملاء"
          subtitle="إدارة الطلبات الواردة من صفحة الطلب العامة"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'طلبات العملاء' }]}
          actions={
            <Button variant="outline" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" /> تحديث
            </Button>
          }
        />

        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'].map(s => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? 'default' : 'outline'}
              onClick={() => setStatusFilter(s)}
              className="text-xs h-7"
            >
              {s === 'all' ? 'الكل' : statusConfig[s]?.label ?? s}
              {s !== 'all' && (
                <span className="mr-1 text-[10px]">({orders.filter((o: any) => o.status === s).length})</span>
              )}
            </Button>
          ))}
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center h-40 items-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                  <ShoppingBag className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">لا توجد طلبات</p>
                <p className="text-sm text-muted-foreground">ستظهر طلبات العملاء هنا عند ورودها من صفحة الطلب العامة</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/30">
                    <tr className="text-right">
                      <th className="p-3 font-medium">رقم الطلب</th>
                      <th className="p-3 font-medium">العميل</th>
                      <th className="p-3 font-medium hidden sm:table-cell">الهاتف</th>
                      <th className="p-3 font-medium">الإجمالي</th>
                      <th className="p-3 font-medium">الحالة</th>
                      <th className="p-3 font-medium hidden md:table-cell">الاستلام</th>
                      <th className="p-3 font-medium hidden md:table-cell">الدفع</th>
                      <th className="p-3 font-medium hidden lg:table-cell">التاريخ</th>
                      <th className="p-3 font-medium">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map((order: any) => {
                      const sc = statusConfig[order.status] ?? { label: order.status, variant: 'secondary' as const };
                      return (
                        <tr key={order.id} className="hover:bg-muted/20">
                          <td className="p-3 font-mono text-xs font-bold">{order.orderNumber}</td>
                          <td className="p-3 font-medium">{order.customerName}</td>
                          <td className="p-3 hidden sm:table-cell text-muted-foreground">{order.customerPhone}</td>
                          <td className="p-3 font-bold">{fmt(order.total)} ر.س</td>
                          <td className="p-3">
                            <Badge variant={sc.variant} className="text-xs">{sc.label}</Badge>
                          </td>
                          <td className="p-3 hidden md:table-cell text-xs text-muted-foreground">
                            {deliveryLabels[order.deliveryMethod] ?? order.deliveryMethod}
                          </td>
                          <td className="p-3 hidden md:table-cell text-xs text-muted-foreground">
                            {paymentLabels[order.paymentMethod] ?? order.paymentMethod}
                          </td>
                          <td className="p-3 hidden lg:table-cell text-xs text-muted-foreground">
                            {order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy HH:mm', { locale: ar }) : '-'}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewOrder(order)} title="عرض التفاصيل">
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => sendWhatsApp(order)} title="واتساب">
                                <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                              </Button>
                            </div>
                          </td>
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

      <Dialog open={!!viewOrder} onOpenChange={o => { if (!o) setViewOrder(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              تفاصيل الطلب — {viewOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-2">
                  <p className="font-semibold text-muted-foreground text-xs uppercase">بيانات العميل</p>
                  <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{viewOrder.customerName}</p>
                  <p className="text-muted-foreground">{viewOrder.customerPhone}</p>
                  {viewOrder.customerAddress && (
                    <p className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{viewOrder.customerAddress}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-muted-foreground text-xs uppercase">تفاصيل الطلب</p>
                  <p>طريقة الاستلام: <span className="font-medium">{deliveryLabels[viewOrder.deliveryMethod] ?? viewOrder.deliveryMethod}</span></p>
                  <p>طريقة الدفع: <span className="font-medium">{paymentLabels[viewOrder.paymentMethod] ?? viewOrder.paymentMethod}</span></p>
                  <div className="flex items-center gap-2">
                    <span>الحالة:</span>
                    <Select value={viewOrder.status} onValueChange={v => {
                      updateStatusM.mutate({ id: viewOrder.id, status: v });
                      setViewOrder((o: any) => ({ ...o, status: v }));
                    }}>
                      <SelectTrigger className="h-7 text-xs w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([val, cfg]) => (
                          <SelectItem key={val} value={val}>{cfg.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/30 px-3 py-2 text-xs font-semibold">المنتجات</div>
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-right text-xs text-muted-foreground">
                      <th className="p-2">المنتج</th>
                      <th className="p-2">الكمية</th>
                      <th className="p-2">السعر</th>
                      <th className="p-2">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(viewOrder.items ?? []).map((item: any, i: number) => (
                      <tr key={i}>
                        <td className="p-2 font-medium">{item.productName}</td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">{fmt(item.unitPrice)} ر.س</td>
                        <td className="p-2 font-bold">{fmt(item.subtotal)} ر.س</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-muted/20 rounded-lg p-3 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">إجمالي المنتجات</span><span>{fmt(viewOrder.subtotal ?? 0)} ر.س</span></div>
                {viewOrder.deliveryFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">رسوم التوصيل</span><span>{fmt(viewOrder.deliveryFee)} ر.س</span></div>}
                {viewOrder.discount > 0 && <div className="flex justify-between text-green-600"><span>خصم</span><span>−{fmt(viewOrder.discount)} ر.س</span></div>}
                <div className="flex justify-between font-bold text-base border-t pt-1.5"><span>الإجمالي النهائي</span><span>{fmt(viewOrder.total)} ر.س</span></div>
              </div>

              {viewOrder.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                  <p className="font-medium text-amber-800 mb-1">ملاحظات</p>
                  <p className="text-amber-700">{viewOrder.notes}</p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" onClick={() => sendWhatsApp(viewOrder)} className="gap-2">
                  <MessageCircle className="h-4 w-4 text-green-600" /> واتساب
                </Button>
                {viewOrder.status !== 'converted_to_sale' && viewOrder.status !== 'cancelled' && (
                  <Button onClick={() => convertM.mutate(viewOrder.id)} disabled={convertM.isPending} className="gap-2">
                    {convertM.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    <ShoppingBag className="h-4 w-4" /> تحويل إلى فاتورة بيع
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
