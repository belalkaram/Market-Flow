import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { purchasesApi, suppliersApi, productsApi, ApiPurchaseOrderFull, ApiSupplier, ApiProduct } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Eye, Plus, Printer, Search, Loader2, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'مسودة', variant: 'secondary' },
  sent: { label: 'مرسل', variant: 'outline' },
  partially_received: { label: 'استلام جزئي', variant: 'secondary' },
  received: { label: 'مستلم', variant: 'default' },
  cancelled: { label: 'ملغي', variant: 'destructive' },
};

function printPurchaseOrder(order: ApiPurchaseOrderFull) {
  const w = window.open('', '_blank', 'width=850,height=700');
  if (!w) return;
  const rows = (order.items ?? []).map(({ item, productName }) => `
    <tr>
      <td>${productName ?? item.productId}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:center">${Number(item.unitPrice).toFixed(2)}</td>
      <td style="text-align:center">${Number(item.totalPrice).toFixed(2)}</td>
    </tr>`).join('');
  w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>أمر شراء ${order.orderNumber}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;padding:20mm;color:#111;font-size:13px}
    .header{text-align:center;margin-bottom:20px;padding-bottom:15px;border-bottom:2px solid #222}
    .company{font-size:22px;font-weight:bold}.po-title{font-size:16px;color:#555;margin:4px 0}
    .po-num{font-size:14px;font-weight:bold;color:#2563eb}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin:15px 0;padding:12px;background:#f9f9f9;border-radius:6px}
    .lbl{font-size:11px;color:#888;margin-bottom:2px}.val{font-weight:600;font-size:13px}
    table{width:100%;border-collapse:collapse;margin:15px 0}
    th{background:#f0f0f0;padding:8px 10px;text-align:right;font-size:12px;border:1px solid #ddd}
    td{padding:7px 10px;border:1px solid #eee;font-size:12px}
    .tot{max-width:220px;margin-right:auto;margin-top:10px;font-size:15px;font-weight:bold;border-top:2px solid #222;padding-top:8px;display:flex;justify-content:space-between}
    .footer{margin-top:25px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:12px}
    .print-btn{margin-top:20px;text-align:center}
    .print-btn button{padding:8px 24px;background:#2563eb;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:14px;margin-left:8px}
    .print-btn button.close{background:#6b7280}
    @media print{.print-btn{display:none}}
  </style></head><body>
  <div class="header"><div class="company">MarketFlow ERP</div><div class="po-title">أمر شراء</div><div class="po-num">${order.orderNumber}</div></div>
  <div class="grid">
    <div><div class="lbl">التاريخ</div><div class="val">${format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: ar })}</div></div>
    <div><div class="lbl">الحالة</div><div class="val">${statusMap[order.status]?.label ?? order.status}</div></div>
    <div><div class="lbl">المورد</div><div class="val">${order.supplierName ?? '-'}</div></div>
    <div><div class="lbl">أنشئ بواسطة</div><div class="val">${order.createdByName ?? '-'}</div></div>
    ${order.notes ? `<div><div class="lbl">ملاحظات</div><div class="val">${order.notes}</div></div>` : ''}
  </div>
  <table><thead><tr><th>المنتج</th><th style="text-align:center">الكمية</th><th style="text-align:center">سعر الوحدة</th><th style="text-align:center">الإجمالي</th></tr></thead>
  <tbody>${rows}</tbody></table>
  <div class="tot"><span>الإجمالي الكلي</span><span>${Number(order.totalAmount).toFixed(2)} ر.س</span></div>
  <div class="footer">MarketFlow ERP — نظام الإدارة الشاملة</div>
  <div class="print-btn"><button onclick="window.print()">طباعة</button><button class="close" onclick="window.close()">إغلاق</button></div>
  <script>setTimeout(()=>window.print(),400)</script>
  </body></html>`);
  w.document.close();
}

interface OrderItem { productId: string; quantity: number; unitPrice: string; }

export default function PurchasesPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewOrder, setViewOrder] = useState<ApiPurchaseOrderFull | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [receiveTarget, setReceiveTarget] = useState<{ id: string; num: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ supplierId: '', notes: '', status: 'draft' });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([{ productId: '', quantity: 1, unitPrice: '' }]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['purchase-orders', search, statusFilter],
    queryFn: () => purchasesApi.list({
      search: search || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    }),
  });
  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers'], queryFn: suppliersApi.list });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => productsApi.list() });

  const createMutation = useMutation({
    mutationFn: () => purchasesApi.create({
      ...createForm,
      items: orderItems.filter(i => i.productId && i.quantity > 0 && i.unitPrice),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-orders'] });
      setShowCreate(false);
      setCreateForm({ supplierId: '', notes: '', status: 'draft' });
      setOrderItems([{ productId: '', quantity: 1, unitPrice: '' }]);
      toast({ title: 'تم إنشاء أمر الشراء بنجاح' });
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const receiveMutation = useMutation({
    mutationFn: (id: string) => purchasesApi.receive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-orders'] });
      qc.invalidateQueries({ queryKey: ['inventory-stock'] });
      setReceiveTarget(null);
      toast({ title: 'تم استلام أمر الشراء وتحديث المخزون' });
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => purchasesApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-orders'] });
      setCancelTarget(null);
      toast({ title: 'تم إلغاء أمر الشراء' });
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const handleView = async (id: string) => {
    setViewLoading(true);
    try {
      const order = await purchasesApi.get(id);
      setViewOrder(order);
    } catch (e: any) {
      toast({ title: e.message, variant: 'destructive' });
    } finally {
      setViewLoading(false);
    }
  };

  const addItem = () => setOrderItems(prev => [...prev, { productId: '', quantity: 1, unitPrice: '' }]);
  const removeItem = (i: number) => setOrderItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof OrderItem, value: string | number) => {
    setOrderItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    updateItem(index, 'productId', productId);
    if (product) updateItem(index, 'unitPrice', product.purchasePrice);
  };

  const total = orderItems.reduce((s, i) => s + (Number(i.unitPrice) || 0) * (Number(i.quantity) || 0), 0);
  const validItems = orderItems.filter(i => i.productId && i.quantity > 0 && i.unitPrice);

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6" dir="rtl">
        <PageHeader
          title="أوامر الشراء"
          subtitle="متابعة طلبات الشراء من الموردين"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'أوامر الشراء' }]}
          action={<Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 ml-1" />أمر شراء جديد</Button>}
        />

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث برقم الطلب أو المورد..."
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
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="sent">مرسل</SelectItem>
                  <SelectItem value="received">مستلم</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center h-40 items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center"><Plus className="h-6 w-6 text-muted-foreground" /></div>
                <p className="text-muted-foreground font-medium">لا توجد أوامر شراء</p>
                <p className="text-sm text-muted-foreground">أنشئ أول أمر شراء لتتبع مشترياتك من الموردين</p>
                <Button size="sm" onClick={() => setShowCreate(true)} className="gap-2"><Plus className="h-4 w-4" />أمر شراء جديد</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/30">
                    <tr className="text-right">
                      <th className="p-3 font-medium">رقم الطلب</th>
                      <th className="p-3 font-medium hidden sm:table-cell">المورد</th>
                      <th className="p-3 font-medium hidden md:table-cell">التاريخ</th>
                      <th className="p-3 font-medium">الإجمالي</th>
                      <th className="p-3 font-medium">الحالة</th>
                      <th className="p-3 font-medium">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map(o => {
                      const status = statusMap[o.status] ?? { label: o.status, variant: 'secondary' as const };
                      return (
                        <tr key={o.id} className="hover:bg-muted/20">
                          <td className="p-3 font-mono text-xs font-medium">{o.orderNumber}</td>
                          <td className="p-3 hidden sm:table-cell text-muted-foreground">{(o as any).supplierName ?? '-'}</td>
                          <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">
                            {format(new Date(o.createdAt), 'dd MMM yyyy', { locale: ar })}
                          </td>
                          <td className="p-3 font-bold">{Number(o.totalAmount).toLocaleString('ar-SA')} ر.س</td>
                          <td className="p-3"><Badge variant={status.variant} className="text-xs">{status.label}</Badge></td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => handleView(o.id)} title="عرض"><Eye className="h-3.5 w-3.5" /></Button>
                              {!['received', 'cancelled'].includes(o.status) && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => setReceiveTarget({ id: o.id, num: o.orderNumber })} title="استلام"><CheckCircle className="h-3.5 w-3.5" /></Button>
                              )}
                              {!['received', 'cancelled'].includes(o.status) && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setCancelTarget(o.id)} title="إلغاء"><XCircle className="h-3.5 w-3.5" /></Button>
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

      {/* View Dialog */}
      <Dialog open={!!viewOrder} onOpenChange={open => !open && setViewOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>أمر الشراء {viewOrder?.orderNumber}</span>
              <Button size="sm" variant="outline" onClick={() => viewOrder && printPurchaseOrder(viewOrder)}>
                <Printer className="h-4 w-4 ml-1" /> طباعة
              </Button>
            </DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                {[
                  { label: 'التاريخ', value: format(new Date(viewOrder.createdAt), 'dd/MM/yyyy', { locale: ar }) },
                  { label: 'المورد', value: viewOrder.supplierName ?? '-' },
                  { label: 'أنشئ بواسطة', value: viewOrder.createdByName ?? '-' },
                ].map(item => (
                  <div key={item.label} className="bg-muted/30 rounded-lg p-3">
                    <div className="text-muted-foreground text-xs mb-1">{item.label}</div>
                    <div className="font-medium">{item.value}</div>
                  </div>
                ))}
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-muted-foreground text-xs mb-1">الحالة</div>
                  <Badge variant={statusMap[viewOrder.status]?.variant ?? 'secondary'} className="text-xs">
                    {statusMap[viewOrder.status]?.label ?? viewOrder.status}
                  </Badge>
                </div>
                {viewOrder.notes && (
                  <div className="bg-muted/30 rounded-lg p-3 col-span-2">
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
                      <th className="p-2.5 font-medium text-center">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(viewOrder.items ?? []).map(({ item, productName }) => (
                      <tr key={item.id}>
                        <td className="p-2.5">{productName ?? item.productId}</td>
                        <td className="p-2.5 text-center">{item.quantity}</td>
                        <td className="p-2.5 text-center">{Number(item.unitPrice).toFixed(2)}</td>
                        <td className="p-2.5 text-center font-bold">{Number(item.totalPrice).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end">
                <div className="font-bold text-base border-t pt-2">
                  الإجمالي: <span className="text-primary">{Number(viewOrder.totalAmount).toFixed(2)} ر.س</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create PO Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>إنشاء أمر شراء جديد</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>المورد <span className="text-destructive">*</span></Label>
                <Select value={createForm.supplierId} onValueChange={v => setCreateForm(f => ({ ...f, supplierId: v }))}>
                  <SelectTrigger><SelectValue placeholder="اختر المورد" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s: ApiSupplier) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>الحالة</Label>
                <Select value={createForm.status} onValueChange={v => setCreateForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="sent">مرسل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>ملاحظات</Label>
              <Textarea placeholder="ملاحظات اختيارية..." value={createForm.notes} onChange={e => setCreateForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>المنتجات</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="h-3.5 w-3.5 ml-1" />إضافة منتج</Button>
              </div>
              {orderItems.map((item, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Select value={item.productId} onValueChange={v => handleProductSelect(i, v)}>
                      <SelectTrigger className="text-sm"><SelectValue placeholder="اختر المنتج" /></SelectTrigger>
                      <SelectContent>
                        {products.map((p: ApiProduct) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    type="number" placeholder="الكمية" min={1}
                    className="w-20 text-sm" value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', Number(e.target.value))}
                  />
                  <Input
                    type="number" placeholder="سعر الوحدة" min={0} step="0.01"
                    className="w-28 text-sm" value={item.unitPrice}
                    onChange={e => updateItem(i, 'unitPrice', e.target.value)}
                  />
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive shrink-0" onClick={() => removeItem(i)} disabled={orderItems.length === 1}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {total > 0 && (
                <div className="text-sm font-bold text-left">
                  الإجمالي: <span className="text-primary">{total.toFixed(2)} ر.س</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="flex-row-reverse gap-2 mt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>إلغاء</Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!createForm.supplierId || validItems.length === 0 || createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              إنشاء الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receive Confirmation */}
      <AlertDialog open={!!receiveTarget} onOpenChange={open => !open && setReceiveTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد استلام الطلب</AlertDialogTitle>
            <AlertDialogDescription>
              هل تريد تأكيد استلام الطلب <strong>{receiveTarget?.num}</strong>؟ سيتم تحديث المخزون تلقائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={() => receiveTarget && receiveMutation.mutate(receiveTarget.id)}
              disabled={receiveMutation.isPending}
            >
              {receiveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              تأكيد الاستلام
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation */}
      <AlertDialog open={!!cancelTarget} onOpenChange={open => !open && setCancelTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد إلغاء الطلب</AlertDialogTitle>
            <AlertDialogDescription>هل تريد إلغاء أمر الشراء؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>تراجع</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => cancelTarget && cancelMutation.mutate(cancelTarget)}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              تأكيد الإلغاء
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
