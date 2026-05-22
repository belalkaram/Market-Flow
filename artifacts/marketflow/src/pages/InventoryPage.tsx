import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { inventoryApi, ApiProduct, branchesApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AlertTriangle, Package, Loader2, Search, SlidersHorizontal, ArrowLeftRight, Trash2, ClipboardCheck, PackagePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUrlTab } from '@/hooks/useUrlTab';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const adjustmentTypes = [
  { value: 'addition', label: 'إضافة مخزون (وارد)' },
  { value: 'removal', label: 'خصم مخزون (صادر)' },
  { value: 'waste', label: 'هالك / تالف' },
  { value: 'correction', label: 'تصحيح جرد' },
];

const movementTypes: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  sale: { label: 'بيع', variant: 'default' },
  purchase: { label: 'شراء', variant: 'outline' },
  waste: { label: 'هالك', variant: 'destructive' },
  transfer: { label: 'تحويل', variant: 'secondary' },
  adjustment: { label: 'تسوية', variant: 'secondary' },
  return: { label: 'مرتجع', variant: 'secondary' },
};

type ModalType = 'adjust' | 'transfer' | 'waste' | 'stocktake' | 'receive' | null;

export default function InventoryPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [pageTab, setPageTab] = useUrlTab('stock');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeProduct, setActiveProduct] = useState<ApiProduct | null>(null);
  const [modal, setModal] = useState<ModalType>(null);

  const [adjustForm, setAdjustForm] = useState({ adjustmentType: 'addition', quantity: 1, reason: '' });
  const [transferForm, setTransferForm] = useState({ toBranchId: '', quantity: 1, notes: '' });
  const [wasteForm, setWasteForm] = useState({ quantity: 1, reason: '', wasteType: 'damaged' });
  const [stocktakeItems, setStocktakeItems] = useState<{ product: ApiProduct; counted: number }[]>([]);
  const [receiveForm, setReceiveForm] = useState({ quantity: 1, supplierId: '', notes: '', unitCost: '' });

  const { data: stock = [], isLoading } = useQuery({ queryKey: ['inventory-stock'], queryFn: inventoryApi.stock });
  const { data: movements = [], isLoading: movementsLoading } = useQuery({
    queryKey: ['stock-movements'],
    queryFn: inventoryApi.movements,
    enabled: pageTab === 'movements',
  });
  const { data: branches = [] } = useQuery({ queryKey: ['branches'], queryFn: branchesApi.list });

  const openModal = (product: ApiProduct, type: ModalType) => {
    setActiveProduct(product);
    setModal(type);
    setAdjustForm({ adjustmentType: 'addition', quantity: 1, reason: '' });
    setTransferForm({ toBranchId: '', quantity: 1, notes: '' });
    setWasteForm({ quantity: 1, reason: '', wasteType: 'damaged' });
    setReceiveForm({ quantity: 1, supplierId: '', notes: '', unitCost: String(product.purchasePrice ?? '') });
  };

  const openStocktake = () => {
    setStocktakeItems(filtered.map(p => ({ product: p as ApiProduct, counted: p.currentStock })));
    setModal('stocktake');
  };

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['inventory-stock'] });
    qc.invalidateQueries({ queryKey: ['stock-movements'] });
  };

  const adjustMutation = useMutation({
    mutationFn: () => inventoryApi.adjust({
      productId: activeProduct!.id,
      adjustmentType: adjustForm.adjustmentType,
      quantity: adjustForm.quantity,
      reason: adjustForm.reason || undefined,
    }),
    onSuccess: () => { invalidate(); setModal(null); toast({ title: 'تم تسجيل تسوية المخزون بنجاح' }); },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const wasteMutation = useMutation({
    mutationFn: () => inventoryApi.adjust({
      productId: activeProduct!.id,
      adjustmentType: 'waste',
      quantity: wasteForm.quantity,
      reason: `${wasteForm.wasteType === 'damaged' ? 'تالف' : wasteForm.wasteType === 'expired' ? 'منتهي الصلاحية' : 'مفقود'} — ${wasteForm.reason}`,
    }),
    onSuccess: () => { invalidate(); setModal(null); toast({ title: 'تم تسجيل الهالك بنجاح' }); },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const receiveMutation = useMutation({
    mutationFn: () => inventoryApi.adjust({
      productId: activeProduct!.id,
      adjustmentType: 'addition',
      quantity: receiveForm.quantity,
      reason: `استلام بضاعة — ${receiveForm.notes || 'استلام مباشر'}`,
    }),
    onSuccess: () => { invalidate(); setModal(null); toast({ title: 'تم تسجيل الاستلام بنجاح' }); },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const transferMutation = useMutation({
    mutationFn: () => inventoryApi.adjust({
      productId: activeProduct!.id,
      adjustmentType: 'removal',
      quantity: transferForm.quantity,
      reason: `تحويل إلى فرع آخر — ${transferForm.notes || ''}`,
    }),
    onSuccess: () => { invalidate(); setModal(null); toast({ title: 'تم تسجيل التحويل بنجاح' }); },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const stocktakeMutation = useMutation({
    mutationFn: async () => {
      for (const item of stocktakeItems) {
        const diff = item.counted - item.product.currentStock;
        if (diff !== 0) {
          await inventoryApi.adjust({
            productId: item.product.id,
            adjustmentType: diff > 0 ? 'addition' : 'removal',
            quantity: Math.abs(diff),
            reason: 'جرد مخزون',
          });
        }
      }
    },
    onSuccess: () => { invalidate(); setModal(null); toast({ title: 'تم تطبيق نتائج الجرد بنجاح' }); },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const filtered = stock.filter((p: any) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku ?? '').toLowerCase().includes(search.toLowerCase());
    const isLow = p.currentStock <= p.minStock && p.currentStock > 0;
    const isOut = p.currentStock === 0;
    if (statusFilter === 'low') return matchesSearch && isLow;
    if (statusFilter === 'out') return matchesSearch && isOut;
    if (statusFilter === 'good') return matchesSearch && !isLow && !isOut;
    return matchesSearch;
  });

  const lowStock = stock.filter((p: any) => p.currentStock <= p.minStock && p.currentStock > 0);
  const outOfStock = stock.filter((p: any) => p.currentStock === 0);
  const healthy = stock.filter((p: any) => p.currentStock > p.minStock);
  const needsReorder = [...outOfStock, ...lowStock];

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6" dir="rtl">
        <PageHeader title="المخزون" subtitle="نظرة عامة على مستويات المخزون وحركاته"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'المخزون' }]}
          actions={
            pageTab === 'stock' ? (
              <Button variant="outline" onClick={openStocktake} className="gap-2">
                <ClipboardCheck className="h-4 w-4" /> جرد مخزون
              </Button>
            ) : undefined
          }
        />

        <Tabs value={pageTab} onValueChange={setPageTab} className="w-full" dir="rtl">
          <TabsList className="mb-4">
            <TabsTrigger value="stock" className="gap-2">
              <Package className="h-4 w-4" /> المخزون الحالي
            </TabsTrigger>
            <TabsTrigger value="movements" className="gap-2">
              <ArrowLeftRight className="h-4 w-4" /> حركة المخزون
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stock" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter(statusFilter === 'good' ? 'all' : 'good')}>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-green-700 dark:text-green-400">مخزون جيد</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold text-green-600">{isLoading ? '-' : healthy.length}</p></CardContent>
              </Card>
              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter(statusFilter === 'low' ? 'all' : 'low')}>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-orange-700 dark:text-orange-400">مخزون منخفض</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold text-orange-600">{isLoading ? '-' : lowStock.length}</p></CardContent>
              </Card>
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter(statusFilter === 'out' ? 'all' : 'out')}>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-red-700 dark:text-red-400">نفد المخزون</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold text-red-600">{isLoading ? '-' : outOfStock.length}</p></CardContent>
              </Card>
            </div>

            {needsReorder.length > 0 && statusFilter === 'all' && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <CardTitle className="text-sm">منتجات تحتاج إعادة تخزين ({needsReorder.length})</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b bg-muted/30"><tr className="text-right">
                        <th className="p-3 font-medium">المنتج</th>
                        <th className="p-3 font-medium hidden sm:table-cell">الفئة</th>
                        <th className="p-3 font-medium">الكمية الحالية</th>
                        <th className="p-3 font-medium">الحد الأدنى</th>
                        <th className="p-3 font-medium">الحالة</th>
                        <th className="p-3 font-medium">إجراء</th>
                      </tr></thead>
                      <tbody className="divide-y">
                        {needsReorder.map((p: any) => (
                          <tr key={p.id} className="hover:bg-muted/20">
                            <td className="p-3 font-medium">{p.name}</td>
                            <td className="p-3 hidden sm:table-cell text-muted-foreground">{p.categoryName ?? '-'}</td>
                            <td className="p-3 font-bold text-orange-600">{p.currentStock}</td>
                            <td className="p-3">{p.minStock}</td>
                            <td className="p-3"><Badge variant="destructive" className="text-xs">{p.currentStock === 0 ? 'نفد المخزون' : 'منخفض'}</Badge></td>
                            <td className="p-3">
                              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openModal(p, 'receive')}>
                                <PackagePlus className="h-3 w-3 ml-1" /> استلام
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">
                      {statusFilter === 'all' ? 'جميع المنتجات' :
                       statusFilter === 'low' ? 'منتجات المخزون المنخفض' :
                       statusFilter === 'out' ? 'منتجات نفد مخزونها' : 'منتجات المخزون الجيد'}
                      ({filtered.length})
                    </CardTitle>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input placeholder="ابحث عن منتج..." className="pr-8 h-8 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    {statusFilter !== 'all' && (
                      <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setStatusFilter('all')}>إلغاء الفلتر</Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center h-40 items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">لا توجد منتجات مطابقة</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b bg-muted/30"><tr className="text-right">
                        <th className="p-3 font-medium">المنتج</th>
                        <th className="p-3 font-medium hidden md:table-cell">SKU</th>
                        <th className="p-3 font-medium hidden sm:table-cell">الفئة</th>
                        <th className="p-3 font-medium">المخزون</th>
                        <th className="p-3 font-medium hidden sm:table-cell">الحد الأدنى</th>
                        <th className="p-3 font-medium">الحالة</th>
                        <th className="p-3 font-medium">إجراءات</th>
                      </tr></thead>
                      <tbody className="divide-y">
                        {filtered.map((p: any) => {
                          const isLow = p.currentStock <= p.minStock;
                          return (
                            <tr key={p.id} className="hover:bg-muted/20">
                              <td className="p-3 font-medium">{p.name}</td>
                              <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">{p.sku ?? '-'}</td>
                              <td className="p-3 hidden sm:table-cell text-muted-foreground">{p.categoryName ?? '-'}</td>
                              <td className="p-3">
                                <div className="flex items-center gap-1">
                                  {isLow && <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />}
                                  <span className={isLow ? 'text-orange-600 font-bold' : 'font-medium'}>{p.currentStock}</span>
                                </div>
                              </td>
                              <td className="p-3 hidden sm:table-cell text-muted-foreground">{p.minStock}</td>
                              <td className="p-3">
                                <Badge variant={p.currentStock === 0 ? 'destructive' : isLow ? 'secondary' : 'default'} className="text-xs">
                                  {p.currentStock === 0 ? 'نفد' : isLow ? 'منخفض' : 'جيد'}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <div className="flex gap-1 flex-wrap">
                                  <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => openModal(p, 'adjust')} title="تسوية">
                                    <SlidersHorizontal className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => openModal(p, 'receive')} title="استلام">
                                    <PackagePlus className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 text-xs px-2 hidden sm:inline-flex" onClick={() => openModal(p, 'transfer')} title="تحويل">
                                    <ArrowLeftRight className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-destructive hidden sm:inline-flex" onClick={() => openModal(p, 'waste')} title="هالك">
                                    <Trash2 className="h-3 w-3" />
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
          </TabsContent>

          <TabsContent value="movements">
            <Card>
              <CardContent className="p-0">
                {movementsLoading ? (
                  <div className="flex justify-center h-40 items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : (movements as any[]).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">لا توجد حركات مخزون مسجلة</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b bg-muted/30">
                        <tr className="text-right">
                          <th className="p-3 font-medium">التاريخ</th>
                          <th className="p-3 font-medium">المنتج</th>
                          <th className="p-3 font-medium">النوع</th>
                          <th className="p-3 font-medium">الكمية</th>
                          <th className="p-3 font-medium hidden sm:table-cell">قبل</th>
                          <th className="p-3 font-medium hidden sm:table-cell">بعد</th>
                          <th className="p-3 font-medium hidden md:table-cell">ملاحظات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {(movements as any[]).map((m: any) => {
                          const mtype = movementTypes[m.type] ?? { label: m.type, variant: 'secondary' as const };
                          const isNeg = m.quantityChange < 0;
                          return (
                            <tr key={m.id} className="hover:bg-muted/20">
                              <td className="p-3 text-xs text-muted-foreground">
                                {format(new Date(m.createdAt), 'dd MMM HH:mm', { locale: ar })}
                              </td>
                              <td className="p-3 font-medium">{m.productName ?? m.productId}</td>
                              <td className="p-3"><Badge variant={mtype.variant} className="text-xs">{mtype.label}</Badge></td>
                              <td className="p-3">
                                <span className={`font-bold ${isNeg ? 'text-red-600' : 'text-green-600'}`}>
                                  {isNeg ? '' : '+'}{m.quantityChange}
                                </span>
                              </td>
                              <td className="p-3 hidden sm:table-cell text-muted-foreground">{m.quantityBefore}</td>
                              <td className="p-3 hidden sm:table-cell font-medium">{m.quantityAfter}</td>
                              <td className="p-3 hidden md:table-cell text-xs text-muted-foreground max-w-[200px] truncate">{m.notes ?? '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Stock Adjustment Dialog */}
      <Dialog open={modal === 'adjust'} onOpenChange={o => !o && setModal(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>تسوية المخزون — {activeProduct?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-3 text-sm flex justify-between items-center">
              <span className="text-muted-foreground">المخزون الحالي</span>
              <span className="font-bold text-lg">{activeProduct?.currentStock} {activeProduct?.unit ?? 'وحدة'}</span>
            </div>
            <div className="space-y-1.5">
              <Label>نوع التسوية *</Label>
              <Select value={adjustForm.adjustmentType} onValueChange={v => setAdjustForm(f => ({ ...f, adjustmentType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{adjustmentTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>الكمية *</Label>
              <Input type="number" min={1} value={adjustForm.quantity} onChange={e => setAdjustForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
              {activeProduct && (
                <p className="text-xs text-muted-foreground">
                  سيصبح المخزون: {adjustForm.adjustmentType === 'addition'
                    ? activeProduct.currentStock + adjustForm.quantity
                    : Math.max(0, activeProduct.currentStock - adjustForm.quantity)}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>سبب التسوية</Label>
              <Textarea placeholder="وصف سبب التسوية..." rows={2} value={adjustForm.reason} onChange={e => setAdjustForm(f => ({ ...f, reason: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>إلغاء</Button>
            <Button onClick={() => adjustMutation.mutate()} disabled={adjustForm.quantity <= 0 || adjustMutation.isPending}>
              {adjustMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}تأكيد التسوية
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receive Dialog */}
      <Dialog open={modal === 'receive'} onOpenChange={o => !o && setModal(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>استلام بضاعة — {activeProduct?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-3 text-sm flex justify-between items-center">
              <span className="text-muted-foreground">المخزون الحالي</span>
              <span className="font-bold text-lg">{activeProduct?.currentStock} {activeProduct?.unit ?? 'وحدة'}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>الكمية المستلمة *</Label>
                <Input type="number" min={1} value={receiveForm.quantity} onChange={e => setReceiveForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
              </div>
              <div className="space-y-1.5">
                <Label>سعر التكلفة (ر.س)</Label>
                <Input type="number" value={receiveForm.unitCost} onChange={e => setReceiveForm(f => ({ ...f, unitCost: e.target.value }))} placeholder={String(activeProduct?.purchasePrice ?? '')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>ملاحظات</Label>
              <Input placeholder="رقم الفاتورة أو ملاحظات الاستلام" value={receiveForm.notes} onChange={e => setReceiveForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            {activeProduct && receiveForm.quantity > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-sm text-green-700 dark:text-green-400 flex justify-between">
                <span>المخزون بعد الاستلام</span>
                <span className="font-bold">{activeProduct.currentStock + receiveForm.quantity} {activeProduct.unit}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>إلغاء</Button>
            <Button onClick={() => receiveMutation.mutate()} disabled={receiveForm.quantity <= 0 || receiveMutation.isPending}>
              {receiveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}تأكيد الاستلام
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Waste Dialog */}
      <Dialog open={modal === 'waste'} onOpenChange={o => !o && setModal(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>تسجيل هالك — {activeProduct?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-3 text-sm flex justify-between items-center">
              <span className="text-muted-foreground">المخزون الحالي</span>
              <span className="font-bold text-lg">{activeProduct?.currentStock} {activeProduct?.unit ?? 'وحدة'}</span>
            </div>
            <div className="space-y-1.5">
              <Label>نوع الهالك *</Label>
              <Select value={wasteForm.wasteType} onValueChange={v => setWasteForm(f => ({ ...f, wasteType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="damaged">تالف / مكسور</SelectItem>
                  <SelectItem value="expired">منتهي الصلاحية</SelectItem>
                  <SelectItem value="lost">مفقود</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>الكمية الهالكة *</Label>
              <Input type="number" min={1} max={activeProduct?.currentStock} value={wasteForm.quantity}
                onChange={e => setWasteForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1.5">
              <Label>سبب / تفاصيل</Label>
              <Textarea placeholder="وصف تفصيلي للهالك..." rows={2} value={wasteForm.reason} onChange={e => setWasteForm(f => ({ ...f, reason: e.target.value }))} />
            </div>
            {activeProduct && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-sm text-red-700 dark:text-red-400 flex justify-between">
                <span>المخزون بعد الخصم</span>
                <span className="font-bold">{Math.max(0, activeProduct.currentStock - wasteForm.quantity)} {activeProduct.unit}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>إلغاء</Button>
            <Button variant="destructive" onClick={() => wasteMutation.mutate()} disabled={wasteForm.quantity <= 0 || wasteMutation.isPending}>
              {wasteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}تسجيل الهالك
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={modal === 'transfer'} onOpenChange={o => !o && setModal(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>تحويل بين الفروع — {activeProduct?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-3 text-sm flex justify-between items-center">
              <span className="text-muted-foreground">المخزون الحالي</span>
              <span className="font-bold text-lg">{activeProduct?.currentStock} {activeProduct?.unit ?? 'وحدة'}</span>
            </div>
            <div className="space-y-1.5">
              <Label>الفرع المستلم *</Label>
              <Select value={transferForm.toBranchId} onValueChange={v => setTransferForm(f => ({ ...f, toBranchId: v }))}>
                <SelectTrigger><SelectValue placeholder="اختر الفرع" /></SelectTrigger>
                <SelectContent>
                  {branches.filter(b => b.isActive).map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>الكمية المحولة *</Label>
              <Input type="number" min={1} max={activeProduct?.currentStock} value={transferForm.quantity}
                onChange={e => setTransferForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1.5">
              <Label>ملاحظات</Label>
              <Input placeholder="ملاحظات التحويل..." value={transferForm.notes} onChange={e => setTransferForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>إلغاء</Button>
            <Button onClick={() => transferMutation.mutate()} disabled={!transferForm.toBranchId || transferForm.quantity <= 0 || transferMutation.isPending}>
              {transferMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}تأكيد التحويل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stocktake Dialog */}
      <Dialog open={modal === 'stocktake'} onOpenChange={o => !o && setModal(null)}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader><DialogTitle>جرد المخزون الكامل</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">أدخل الكمية الفعلية لكل منتج. سيتم تطبيق الفروق تلقائياً.</p>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {stocktakeItems.map((item, i) => {
                const diff = item.counted - item.product.currentStock;
                return (
                  <div key={item.product.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/20">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">نظام: {item.product.currentStock} {item.product.unit}</p>
                    </div>
                    <Input
                      type="number" min={0} value={item.counted}
                      onChange={e => {
                        const newItems = [...stocktakeItems];
                        newItems[i] = { ...item, counted: Number(e.target.value) };
                        setStocktakeItems(newItems);
                      }}
                      className="w-24 h-8 text-center"
                    />
                    {diff !== 0 && (
                      <span className={`text-xs font-bold w-12 text-left ${diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {diff > 0 ? '+' : ''}{diff}
                      </span>
                    )}
                    {diff === 0 && <span className="text-xs text-muted-foreground w-12 text-left">مطابق</span>}
                  </div>
                );
              })}
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-sm flex justify-between">
              <span className="text-muted-foreground">منتجات بها فروق</span>
              <span className="font-bold">{stocktakeItems.filter(i => i.counted !== i.product.currentStock).length}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>إلغاء</Button>
            <Button onClick={() => stocktakeMutation.mutate()} disabled={stocktakeMutation.isPending}>
              {stocktakeMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              تطبيق نتائج الجرد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
