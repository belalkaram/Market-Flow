import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { salesApi, api } from '@/lib/api';
import { Loader2, ArrowLeftRight, Search, Plus, RotateCcw, Receipt, Package } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const returnReasons = [
  'منتج تالف', 'منتج غير مطابق', 'طلب العميل', 'خطأ في الفاتورة', 'منتج منتهي الصلاحية', 'أخرى',
];

interface ReturnItem {
  itemId: string;
  productId: string;
  productName: string;
  maxQty: number;
  returnQty: number;
  unitPrice: number;
  selected: boolean;
}

export default function ReturnsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [returnReason, setReturnReason] = useState('');
  const [returnNotes, setReturnNotes] = useState('');
  const [step, setStep] = useState<'search' | 'items'>('search');

  const { data: allSales = [], isLoading: salesLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: () => salesApi.list(),
  });

  const completedSales = useMemo(() =>
    allSales.filter((s: any) => s.status === 'completed' || s.status === 'paid'),
    [allSales]
  );

  const returnedSales = useMemo(() =>
    allSales.filter((s: any) => s.status === 'returned'),
    [allSales]
  );

  const filteredSales = useMemo(() => {
    if (!invoiceSearch.trim()) return completedSales.slice(0, 20);
    const q = invoiceSearch.toLowerCase();
    return completedSales.filter((s: any) =>
      s.invoiceNumber?.toLowerCase().includes(q) ||
      s.customerName?.toLowerCase().includes(q)
    );
  }, [completedSales, invoiceSearch]);

  const handleSelectSale = (sale: any) => {
    setSelectedSale(sale);
    const items: ReturnItem[] = (sale.items ?? []).map((item: any) => ({
      itemId: item.id ?? item.productId,
      productId: item.productId,
      productName: item.productName,
      maxQty: Number(item.quantity),
      returnQty: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      selected: true,
    }));
    setReturnItems(items);
    setStep('items');
  };

  const returnMutation = useMutation({
    mutationFn: (data: any) => api.post(`/sales/${selectedSale.id}/return`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] });
      setReturnDialogOpen(false);
      resetDialog();
      toast({ title: 'تم إنشاء المرتجع بنجاح', description: 'تم تحديث المخزون ورصيد العميل' });
    },
    onError: (e: any) => toast({ title: e.message || 'فشل إنشاء المرتجع', variant: 'destructive' }),
  });

  const resetDialog = () => {
    setStep('search');
    setSelectedSale(null);
    setReturnItems([]);
    setReturnReason('');
    setReturnNotes('');
    setInvoiceSearch('');
  };

  const toggleItem = (itemId: string) => {
    setReturnItems(prev => prev.map(i => i.itemId === itemId ? { ...i, selected: !i.selected } : i));
  };

  const updateQty = (itemId: string, qty: number) => {
    setReturnItems(prev => prev.map(i => i.itemId === itemId ? { ...i, returnQty: Math.max(1, Math.min(i.maxQty, qty)) } : i));
  };

  const selectedItems = returnItems.filter(i => i.selected);
  const returnTotal = selectedItems.reduce((s, i) => s + i.returnQty * i.unitPrice, 0);

  const handleSubmitReturn = () => {
    if (!returnReason) { toast({ title: 'يرجى اختيار سبب الإرجاع', variant: 'destructive' }); return; }
    if (selectedItems.length === 0) { toast({ title: 'يرجى تحديد منتج واحد على الأقل', variant: 'destructive' }); return; }

    returnMutation.mutate({
      items: selectedItems.map(i => ({ productId: i.productId, productName: i.productName, quantity: i.returnQty, unitPrice: i.unitPrice })),
      reason: returnReason,
      notes: returnNotes,
      totalAmount: returnTotal,
    });
  };

  return (
    <MainLayout>
      <div className="space-y-5" dir="rtl">
        <PageHeader
          title="المرتجعات"
          subtitle="إنشاء وإدارة مرتجعات المبيعات"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'المبيعات', href: '/sales' }, { label: 'المرتجعات' }]}
          actions={
            <Button onClick={() => { resetDialog(); setReturnDialogOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" /> إنشاء مرتجع
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><RotateCcw className="h-5 w-5 text-orange-600" /></div>
              <div><p className="text-2xl font-bold text-orange-700">{returnedSales.length}</p><p className="text-xs text-muted-foreground">إجمالي المرتجعات</p></div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><Receipt className="h-5 w-5 text-red-600" /></div>
              <div>
                <p className="text-2xl font-bold text-red-700">
                  {returnedSales.reduce((s: number, r: any) => s + Number(r.totalAmount ?? 0), 0).toFixed(0)} ر.س
                </p>
                <p className="text-xs text-muted-foreground">إجمالي قيمة المرتجعات</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Package className="h-5 w-5 text-blue-600" /></div>
              <div><p className="text-2xl font-bold text-blue-700">{completedSales.length}</p><p className="text-xs text-muted-foreground">فواتير قابلة للإرجاع</p></div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-primary" /> سجل المرتجعات ({returnedSales.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {salesLoading ? (
              <div className="flex justify-center h-40 items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : returnedSales.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center"><ArrowLeftRight className="h-6 w-6 text-muted-foreground" /></div>
                <p className="text-muted-foreground font-medium">لا توجد مرتجعات</p>
                <p className="text-sm text-muted-foreground">أنشئ مرتجعاً من فاتورة مبيعات مكتملة</p>
                <Button size="sm" onClick={() => { resetDialog(); setReturnDialogOpen(true); }} className="gap-2">
                  <Plus className="h-4 w-4" /> إنشاء مرتجع
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/30">
                    <tr className="text-right">
                      <th className="p-3 font-medium">رقم الفاتورة</th>
                      <th className="p-3 font-medium hidden sm:table-cell">التاريخ</th>
                      <th className="p-3 font-medium hidden md:table-cell">العميل</th>
                      <th className="p-3 font-medium">المبلغ</th>
                      <th className="p-3 font-medium">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {returnedSales.map((ret: any) => (
                      <tr key={ret.id} className="hover:bg-muted/20">
                        <td className="p-3 font-mono text-xs font-medium">{ret.invoiceNumber}</td>
                        <td className="p-3 hidden sm:table-cell text-muted-foreground text-xs">
                          {format(new Date(ret.createdAt), 'dd MMM yyyy', { locale: ar })}
                        </td>
                        <td className="p-3 hidden md:table-cell text-muted-foreground">{ret.customerName ?? 'عميل نقدي'}</td>
                        <td className="p-3 font-bold text-orange-600">{Number(ret.totalAmount).toLocaleString('ar-SA')} ر.س</td>
                        <td className="p-3"><Badge variant="destructive" className="text-xs">مرتجع</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Return Dialog */}
        <Dialog open={returnDialogOpen} onOpenChange={o => { if (!o) { setReturnDialogOpen(false); resetDialog(); } }}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {step === 'search' ? 'بحث عن فاتورة للإرجاع' : `إرجاع من: ${selectedSale?.invoiceNumber}`}
              </DialogTitle>
            </DialogHeader>

            {step === 'search' ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث برقم الفاتورة أو اسم العميل..."
                    className="pr-9"
                    value={invoiceSearch}
                    onChange={e => setInvoiceSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {salesLoading ? (
                    <div className="flex justify-center h-24 items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
                  ) : filteredSales.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">لا توجد فواتير مكتملة</p>
                  ) : filteredSales.map((sale: any) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
                      onClick={() => handleSelectSale(sale)}
                    >
                      <div>
                        <p className="font-mono font-medium text-sm">{sale.invoiceNumber}</p>
                        <p className="text-xs text-muted-foreground">{sale.customerName ?? 'عميل نقدي'}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{Number(sale.totalAmount).toFixed(2)} ر.س</p>
                        <Badge variant="outline" className="text-xs mt-1">مكتملة</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="text-muted-foreground">الفاتورة: </span>
                    <span className="font-mono font-medium">{selectedSale?.invoiceNumber}</span>
                    <span className="text-muted-foreground mr-3">العميل: </span>
                    <span className="font-medium">{selectedSale?.customerName ?? 'عميل نقدي'}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setStep('search')}>تغيير</Button>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {returnItems.map(item => (
                    <div key={item.itemId} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${item.selected ? 'border-primary bg-primary/5' : 'border-muted bg-muted/20'}`}>
                      <Checkbox
                        checked={item.selected}
                        onCheckedChange={() => toggleItem(item.itemId)}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.unitPrice.toFixed(2)} ر.س / وحدة</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">الكمية:</Label>
                        <Input
                          type="number"
                          min={1}
                          max={item.maxQty}
                          value={item.returnQty}
                          onChange={e => updateQty(item.itemId, Number(e.target.value))}
                          disabled={!item.selected}
                          className="w-16 h-7 text-xs text-center"
                        />
                        <span className="text-xs text-muted-foreground">/ {item.maxQty}</span>
                      </div>
                      <p className="text-sm font-bold text-primary w-20 text-left">
                        {(item.selected ? item.returnQty * item.unitPrice : 0).toFixed(2)} ر.س
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>سبب الإرجاع *</Label>
                    <Select value={returnReason} onValueChange={setReturnReason}>
                      <SelectTrigger><SelectValue placeholder="اختر السبب" /></SelectTrigger>
                      <SelectContent>
                        {returnReasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>ملاحظات</Label>
                    <Input placeholder="ملاحظات إضافية..." value={returnNotes} onChange={e => setReturnNotes(e.target.value)} />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200">
                  <span className="font-medium">إجمالي المرتجع</span>
                  <span className="text-xl font-bold text-orange-600">{returnTotal.toFixed(2)} ر.س</span>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => { setReturnDialogOpen(false); resetDialog(); }}>إلغاء</Button>
              {step === 'items' && (
                <Button
                  variant="destructive"
                  onClick={handleSubmitReturn}
                  disabled={returnMutation.isPending || selectedItems.length === 0 || !returnReason}
                >
                  {returnMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                  تأكيد الإرجاع ({returnTotal.toFixed(2)} ر.س)
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
