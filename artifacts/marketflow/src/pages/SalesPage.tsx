import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { salesApi, ApiSalesOrder, ApiSalesOrderFull } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Eye, Printer, Search, Loader2, RotateCcw, X } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  completed: { label: 'مكتملة', variant: 'default' },
  returned: { label: 'مرتجع', variant: 'destructive' },
  suspended: { label: 'معلقة', variant: 'secondary' },
  cancelled: { label: 'ملغية', variant: 'destructive' },
};
const paymentMap: Record<string, string> = { cash: 'نقدي', card: 'بطاقة', wallet: 'محفظة', mixed: 'مختلط' };

function printSalesInvoice(order: ApiSalesOrderFull) {
  const w = window.open('', '_blank', 'width=850,height=700');
  if (!w) return;
  const items = order.items ?? [];
  const rows = items.map(({ item }) => `
    <tr>
      <td>${item.productName}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:center">${Number(item.unitPrice).toFixed(2)}</td>
      <td style="text-align:center">${Number(item.discountAmount ?? 0).toFixed(2)}</td>
      <td style="text-align:center">${Number(item.taxPercent ?? 0)}%</td>
      <td style="text-align:center">${Number(item.totalPrice).toFixed(2)}</td>
    </tr>`).join('');
  w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>فاتورة ${order.invoiceNumber}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;padding:20mm;color:#111;font-size:13px}
    .header{text-align:center;margin-bottom:20px;padding-bottom:15px;border-bottom:2px solid #222}
    .company{font-size:22px;font-weight:bold;margin-bottom:4px}
    .inv-title{font-size:16px;color:#555;margin-bottom:8px}
    .inv-num{font-size:14px;font-weight:bold;color:#2563eb}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin:15px 0;padding:12px;background:#f9f9f9;border-radius:6px}
    .lbl{font-size:11px;color:#888;margin-bottom:2px}
    .val{font-weight:600;font-size:13px}
    table{width:100%;border-collapse:collapse;margin:15px 0}
    th{background:#f0f0f0;padding:8px 10px;text-align:right;font-size:12px;border:1px solid #ddd}
    td{padding:7px 10px;border:1px solid #eee;font-size:12px}
    tr:nth-child(even){background:#fafafa}
    .totals{max-width:260px;margin-right:auto;margin-top:10px}
    .tot-row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #eee;font-size:13px}
    .tot-final{font-size:15px;font-weight:bold;border-top:2px solid #222;padding-top:8px;margin-top:4px;display:flex;justify-content:space-between}
    .status-badge{display:inline-block;padding:3px 10px;border-radius:4px;font-size:12px;font-weight:bold;background:#dcfce7;color:#166534}
    .status-returned{background:#fee2e2;color:#991b1b}
    .footer{margin-top:25px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:12px}
    .print-btn{margin-top:20px;text-align:center}
    .print-btn button{padding:8px 24px;background:#2563eb;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:14px;margin-left:8px}
    .print-btn button.close{background:#6b7280}
    @media print{.print-btn{display:none}}
  </style></head><body>
  <div class="header">
    <div class="company">MarketFlow ERP</div>
    <div class="inv-title">فاتورة مبيعات</div>
    <div class="inv-num">${order.invoiceNumber}</div>
  </div>
  <div class="grid">
    <div><div class="lbl">التاريخ والوقت</div><div class="val">${format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: ar })}</div></div>
    <div><div class="lbl">الحالة</div><div class="val"><span class="status-badge ${order.status === 'returned' ? 'status-returned' : ''}">${statusMap[order.status]?.label ?? order.status}</span></div></div>
    <div><div class="lbl">العميل</div><div class="val">${order.customerName ?? 'نقدي'}</div></div>
    <div><div class="lbl">الكاشير</div><div class="val">${order.cashierName ?? '-'}</div></div>
    <div><div class="lbl">طريقة الدفع</div><div class="val">${paymentMap[order.paymentMethod] ?? order.paymentMethod}</div></div>
    ${order.notes ? `<div><div class="lbl">ملاحظات</div><div class="val">${order.notes}</div></div>` : ''}
  </div>
  <table>
    <thead><tr><th>المنتج</th><th style="text-align:center">الكمية</th><th style="text-align:center">سعر الوحدة</th><th style="text-align:center">الخصم</th><th style="text-align:center">الضريبة</th><th style="text-align:center">الإجمالي</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    <div class="tot-row"><span>المجموع الفرعي</span><span>${Number(order.subtotal).toFixed(2)} ر.س</span></div>
    ${Number(order.discountAmount) > 0 ? `<div class="tot-row"><span>الخصم</span><span>- ${Number(order.discountAmount).toFixed(2)} ر.س</span></div>` : ''}
    ${Number(order.taxAmount) > 0 ? `<div class="tot-row"><span>ضريبة القيمة المضافة</span><span>${Number(order.taxAmount).toFixed(2)} ر.س</span></div>` : ''}
    <div class="tot-final"><span>الإجمالي</span><span>${Number(order.totalAmount).toFixed(2)} ر.س</span></div>
  </div>
  <div class="footer">شكراً لتعاملكم معنا — MarketFlow ERP</div>
  <div class="print-btn">
    <button onclick="window.print()">طباعة</button>
    <button class="close" onclick="window.close()">إغلاق</button>
  </div>
  <script>setTimeout(()=>window.print(),400)</script>
  </body></html>`);
  w.document.close();
}

export default function SalesPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewOrder, setViewOrder] = useState<ApiSalesOrderFull | null>(null);
  const [refundTarget, setRefundTarget] = useState<ApiSalesOrder | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales', search, statusFilter],
    queryFn: () => salesApi.list({
      search: search || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    }),
  });

  const refundMutation = useMutation({
    mutationFn: (id: string) => salesApi.refund(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] });
      qc.invalidateQueries({ queryKey: ['inventory-stock'] });
      qc.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setRefundTarget(null);
      toast({ title: 'تم إرجاع الفاتورة بنجاح وتم استعادة المخزون' });
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const totalToday = sales
    .filter(s => new Date(s.createdAt).toDateString() === new Date().toDateString() && s.status === 'completed')
    .reduce((sum, s) => sum + Number(s.totalAmount), 0);

  const handleView = async (id: string) => {
    setViewLoading(true);
    try {
      const order = await salesApi.get(id);
      setViewOrder(order);
    } catch (e: any) {
      toast({ title: e.message, variant: 'destructive' });
    } finally {
      setViewLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6" dir="rtl">
        <PageHeader
          title="سجل المبيعات"
          subtitle={`إجمالي مبيعات اليوم: ${totalToday.toLocaleString('ar-SA')} ر.س`}
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'المبيعات' }]}
        />

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث برقم الفاتورة أو اسم العميل..."
                  className="pr-9"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="كل الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الحالات</SelectItem>
                  <SelectItem value="completed">مكتملة</SelectItem>
                  <SelectItem value="returned">مرتجع</SelectItem>
                  <SelectItem value="cancelled">ملغية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center h-40 items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : sales.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center"><RotateCcw className="h-6 w-6 text-muted-foreground" /></div>
                <p className="text-muted-foreground font-medium">لا توجد مبيعات مطابقة للفلتر المحدد</p>
                <p className="text-sm text-muted-foreground">جرّب تغيير نطاق التاريخ أو مسح البحث</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/30">
                    <tr className="text-right">
                      <th className="p-3 font-medium">رقم الفاتورة</th>
                      <th className="p-3 font-medium hidden md:table-cell">التاريخ</th>
                      <th className="p-3 font-medium hidden sm:table-cell">الكاشير</th>
                      <th className="p-3 font-medium hidden lg:table-cell">العميل</th>
                      <th className="p-3 font-medium hidden sm:table-cell">طريقة الدفع</th>
                      <th className="p-3 font-medium">الإجمالي</th>
                      <th className="p-3 font-medium">الحالة</th>
                      <th className="p-3 font-medium">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sales.map(s => {
                      const status = statusMap[s.status] ?? { label: s.status, variant: 'secondary' as const };
                      return (
                        <tr key={s.id} className="hover:bg-muted/20">
                          <td className="p-3 font-mono text-xs font-medium">{s.invoiceNumber}</td>
                          <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">
                            {format(new Date(s.createdAt), 'dd MMM yyyy HH:mm', { locale: ar })}
                          </td>
                          <td className="p-3 hidden sm:table-cell text-muted-foreground">{(s as any).cashierName ?? '-'}</td>
                          <td className="p-3 hidden lg:table-cell text-muted-foreground">{(s as any).customerName ?? 'نقدي'}</td>
                          <td className="p-3 hidden sm:table-cell">{paymentMap[s.paymentMethod] ?? s.paymentMethod}</td>
                          <td className="p-3 font-bold">{Number(s.totalAmount).toLocaleString('ar-SA')} ر.س</td>
                          <td className="p-3"><Badge variant={status.variant} className="text-xs">{status.label}</Badge></td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button
                                variant="ghost" size="icon" className="h-8 w-8 text-blue-500"
                                onClick={() => handleView(s.id)}
                                disabled={viewLoading}
                                title="عرض الفاتورة"
                              >
                                {viewLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
                              </Button>
                              {s.status === 'completed' && (
                                <Button
                                  variant="ghost" size="icon" className="h-8 w-8 text-orange-500"
                                  onClick={() => setRefundTarget(s)}
                                  title="إرجاع الفاتورة"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                              )}
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

      {/* View Invoice Dialog */}
      <Dialog open={!!viewOrder} onOpenChange={open => !open && setViewOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>فاتورة {viewOrder?.invoiceNumber}</span>
              <div className="flex gap-2">
                <Button
                  size="sm" variant="outline"
                  onClick={() => viewOrder && printSalesInvoice(viewOrder)}
                >
                  <Printer className="h-4 w-4 ml-1" /> طباعة
                </Button>
                {viewOrder?.status === 'completed' && (
                  <Button
                    size="sm" variant="outline" className="text-orange-600 border-orange-300"
                    onClick={() => { setRefundTarget(viewOrder as any); setViewOrder(null); }}
                  >
                    <RotateCcw className="h-4 w-4 ml-1" /> إرجاع
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-muted-foreground text-xs mb-1">التاريخ</div>
                  <div className="font-medium">{format(new Date(viewOrder.createdAt), 'dd/MM/yyyy HH:mm', { locale: ar })}</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-muted-foreground text-xs mb-1">الحالة</div>
                  <Badge variant={statusMap[viewOrder.status]?.variant ?? 'secondary'} className="text-xs">
                    {statusMap[viewOrder.status]?.label ?? viewOrder.status}
                  </Badge>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-muted-foreground text-xs mb-1">طريقة الدفع</div>
                  <div className="font-medium">{paymentMap[viewOrder.paymentMethod] ?? viewOrder.paymentMethod}</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-muted-foreground text-xs mb-1">العميل</div>
                  <div className="font-medium">{viewOrder.customerName ?? 'نقدي'}</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-muted-foreground text-xs mb-1">الكاشير</div>
                  <div className="font-medium">{viewOrder.cashierName ?? '-'}</div>
                </div>
                {viewOrder.notes && (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="text-muted-foreground text-xs mb-1">ملاحظات</div>
                    <div className="font-medium">{viewOrder.notes}</div>
                  </div>
                )}
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr className="text-right">
                      <th className="p-2.5 font-medium">المنتج</th>
                      <th className="p-2.5 font-medium text-center">الكمية</th>
                      <th className="p-2.5 font-medium text-center">سعر الوحدة</th>
                      <th className="p-2.5 font-medium text-center hidden sm:table-cell">الضريبة</th>
                      <th className="p-2.5 font-medium text-center">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(viewOrder.items ?? []).map(({ item }) => (
                      <tr key={item.id}>
                        <td className="p-2.5">{item.productName}</td>
                        <td className="p-2.5 text-center">{item.quantity}</td>
                        <td className="p-2.5 text-center">{Number(item.unitPrice).toFixed(2)}</td>
                        <td className="p-2.5 text-center hidden sm:table-cell">{Number(item.taxPercent ?? 0)}%</td>
                        <td className="p-2.5 text-center font-bold">{Number(item.totalPrice).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col items-end gap-1.5 text-sm">
                <div className="flex justify-between w-48 text-muted-foreground">
                  <span>المجموع الفرعي</span>
                  <span>{Number(viewOrder.subtotal).toFixed(2)} ر.س</span>
                </div>
                {Number(viewOrder.discountAmount) > 0 && (
                  <div className="flex justify-between w-48 text-muted-foreground">
                    <span>الخصم</span>
                    <span>- {Number(viewOrder.discountAmount).toFixed(2)} ر.س</span>
                  </div>
                )}
                {Number(viewOrder.taxAmount) > 0 && (
                  <div className="flex justify-between w-48 text-muted-foreground">
                    <span>ضريبة القيمة المضافة</span>
                    <span>{Number(viewOrder.taxAmount).toFixed(2)} ر.س</span>
                  </div>
                )}
                <div className="flex justify-between w-48 font-bold text-base border-t pt-1.5 mt-0.5">
                  <span>الإجمالي</span>
                  <span className="text-primary">{Number(viewOrder.totalAmount).toFixed(2)} ر.س</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Confirmation */}
      <AlertDialog open={!!refundTarget} onOpenChange={open => !open && setRefundTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد إرجاع الفاتورة</AlertDialogTitle>
            <AlertDialogDescription>
              هل تريد إرجاع الفاتورة <strong>{refundTarget?.invoiceNumber}</strong> بقيمة <strong>{Number(refundTarget?.totalAmount ?? 0).toFixed(2)} ر.س</strong>؟
              سيتم استعادة كميات المخزون تلقائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => refundTarget && refundMutation.mutate(refundTarget.id)}
              disabled={refundMutation.isPending}
            >
              {refundMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              تأكيد الإرجاع
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
