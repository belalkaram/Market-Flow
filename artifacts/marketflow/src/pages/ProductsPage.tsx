import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { productsApi, categoriesApi, ApiProduct } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Plus, Search, Edit, Trash2, AlertTriangle, Loader2, Package, Tag,
  Barcode, Upload, Download, FileSpreadsheet, Ruler, ScanLine, CheckCircle2, X
} from 'lucide-react';

const emptyProduct: Partial<ApiProduct> = {
  name: '', sku: '', barcode: '', unit: 'قطعة', purchasePrice: '0', salePrice: '0', taxPercent: '0', minStock: 0, currentStock: 0,
};

const emptyCategory = { name: '', description: '' };

const DEFAULT_UNITS = ['قطعة', 'كيلو', 'جرام', 'لتر', 'مل', 'علبة', 'حزمة', 'كرتون', 'دستة', 'زجاجة', 'كيس', 'رول'];

function getStoredUnits(): string[] {
  try {
    const stored = localStorage.getItem('mf_custom_units');
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveCustomUnits(units: string[]) {
  localStorage.setItem('mf_custom_units', JSON.stringify(units));
}

// ─── Products Tab ──────────────────────────────────────────────────────────────
function ProductsTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Partial<ApiProduct>>(emptyProduct);
  const [isEditing, setIsEditing] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', search, categoryFilter],
    queryFn: () => productsApi.list({ search: search || undefined, categoryId: categoryFilter === 'all' ? undefined : categoryFilter }),
  });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });
  const allUnits = [...DEFAULT_UNITS, ...getStoredUnits()];

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); setDialogOpen(false); toast({ title: 'تم إضافة المنتج بنجاح' }); },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApiProduct> }) => productsApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); setDialogOpen(false); toast({ title: 'تم تحديث المنتج بنجاح' }); },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });
  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); setDeleteId(null); toast({ title: 'تم حذف المنتج بنجاح' }); },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const openCreate = () => { setIsEditing(false); setEditProduct(emptyProduct); setDialogOpen(true); };
  const openEdit = (p: ApiProduct) => { setIsEditing(true); setEditProduct(p); setDialogOpen(true); };
  const handleSubmit = () => {
    if (!editProduct.name?.trim()) return;
    if (isEditing && editProduct.id) updateMutation.mutate({ id: editProduct.id, data: editProduct });
    else createMutation.mutate(editProduct);
  };
  const isBusy = createMutation.isPending || updateMutation.isPending;

  const statsCards = [
    { label: 'إجمالي المنتجات', value: products.length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'نشط', value: products.filter(p => p.isActive).length, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'مخزون منخفض', value: products.filter(p => p.currentStock <= p.minStock).length, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'نفد المخزون', value: products.filter(p => p.currentStock === 0).length, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  ];

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {statsCards.map(s => (
          <Card key={s.label} className={`${s.bg} border-0`}>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث بالاسم أو الباركود أو SKU..." className="pr-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="كل الفئات" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الفئات</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={openCreate} className="gap-2 whitespace-nowrap"><Plus className="h-4 w-4" /> إضافة منتج</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-40"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center"><Package className="h-6 w-6 text-muted-foreground" /></div>
              <p className="text-muted-foreground font-medium">لا توجد منتجات بعد</p>
              <Button size="sm" onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />إضافة منتج</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr className="text-right">
                    <th className="p-3 font-medium">المنتج</th>
                    <th className="p-3 font-medium hidden md:table-cell">SKU</th>
                    <th className="p-3 font-medium hidden sm:table-cell">الفئة</th>
                    <th className="p-3 font-medium hidden sm:table-cell">الوحدة</th>
                    <th className="p-3 font-medium">سعر البيع</th>
                    <th className="p-3 font-medium">المخزون</th>
                    <th className="p-3 font-medium">الحالة</th>
                    <th className="p-3 font-medium">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map(p => {
                    const isLow = p.currentStock <= p.minStock;
                    const isOut = p.currentStock === 0;
                    return (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{p.barcode}</div>
                        </td>
                        <td className="p-3 hidden md:table-cell text-muted-foreground font-mono text-xs">{p.sku || '-'}</td>
                        <td className="p-3 hidden sm:table-cell text-muted-foreground">{(p as any).categoryName || '-'}</td>
                        <td className="p-3 hidden sm:table-cell text-muted-foreground">{p.unit || 'قطعة'}</td>
                        <td className="p-3 font-medium">{Number(p.salePrice).toLocaleString('ar-SA')} ر.س</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            {isOut ? <X className="h-3.5 w-3.5 text-red-500" /> : isLow ? <AlertTriangle className="h-3.5 w-3.5 text-orange-500" /> : null}
                            <span className={isOut ? 'text-red-600 font-bold' : isLow ? 'text-orange-600 font-medium' : ''}>{p.currentStock}</span>
                            <span className="text-muted-foreground text-xs">/ {p.minStock}</span>
                          </div>
                        </td>
                        <td className="p-3"><Badge variant={p.isActive ? 'default' : 'secondary'} className="text-xs">{p.isActive ? 'نشط' : 'موقف'}</Badge></td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Edit className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>{isEditing ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1.5"><Label>اسم المنتج *</Label><Input value={editProduct.name || ''} onChange={e => setEditProduct(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="space-y-1.5">
              <Label>الفئة</Label>
              <Select value={editProduct.categoryId || 'none'} onValueChange={v => setEditProduct(p => ({ ...p, categoryId: v === 'none' ? undefined : v }))}>
                <SelectTrigger><SelectValue placeholder="اختر فئة" /></SelectTrigger>
                <SelectContent><SelectItem value="none">بدون فئة</SelectItem>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>الوحدة</Label>
              <Select value={editProduct.unit || 'قطعة'} onValueChange={v => setEditProduct(p => ({ ...p, unit: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{allUnits.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>SKU</Label><Input value={editProduct.sku || ''} onChange={e => setEditProduct(p => ({ ...p, sku: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>الباركود</Label><Input value={editProduct.barcode || ''} onChange={e => setEditProduct(p => ({ ...p, barcode: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>سعر الشراء</Label><Input type="number" value={editProduct.purchasePrice || ''} onChange={e => setEditProduct(p => ({ ...p, purchasePrice: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>سعر البيع</Label><Input type="number" value={editProduct.salePrice || ''} onChange={e => setEditProduct(p => ({ ...p, salePrice: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>نسبة الضريبة %</Label><Input type="number" value={editProduct.taxPercent || ''} onChange={e => setEditProduct(p => ({ ...p, taxPercent: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>الحد الأدنى للمخزون</Label><Input type="number" value={editProduct.minStock ?? ''} onChange={e => setEditProduct(p => ({ ...p, minStock: Number(e.target.value) }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSubmit} disabled={isBusy || !editProduct.name}>
              {isBusy && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              {isEditing ? 'حفظ التعديلات' : 'إضافة المنتج'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />} حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Categories Tab ────────────────────────────────────────────────────────────
function CategoriesTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCategory);
  const [editId, setEditId] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });

  const createM = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); setDialogOpen(false); setForm(emptyCategory); toast({ title: 'تم إضافة الفئة' }); },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });
  const updateM = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => categoriesApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); setDialogOpen(false); toast({ title: 'تم تحديث الفئة' }); },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });
  const deleteM = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); setDeleteId(null); toast({ title: 'تم حذف الفئة' }); },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const openCreate = () => { setEditId(null); setForm(emptyCategory); setDialogOpen(true); };
  const openEdit = (c: any) => { setEditId(c.id); setForm({ name: c.name, description: c.description ?? '' }); setDialogOpen(true); };
  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editId) updateM.mutate({ id: editId, data: form });
    else createM.mutate(form);
  };
  const isBusy = createM.isPending || updateM.isPending;

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> إضافة فئة</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center h-32 items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : categories.length === 0 ? (
            <div className="text-center py-14 space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center"><Tag className="h-6 w-6 text-muted-foreground" /></div>
              <p className="text-muted-foreground">لا توجد فئات بعد</p>
              <Button size="sm" onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />إضافة فئة</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr className="text-right">
                    <th className="p-3 font-medium">اسم الفئة</th>
                    <th className="p-3 font-medium hidden sm:table-cell">الوصف</th>
                    <th className="p-3 font-medium text-center">عدد المنتجات</th>
                    <th className="p-3 font-medium">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {categories.map((c: any) => (
                    <tr key={c.id} className="hover:bg-muted/20">
                      <td className="p-3 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Tag className="h-4 w-4 text-primary" />
                          </div>
                          {c.name}
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground hidden sm:table-cell">{c.description || '-'}</td>
                      <td className="p-3 text-center">
                        <Badge variant="secondary">{c.productCount ?? '-'}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Edit className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader><DialogTitle>{editId ? 'تعديل الفئة' : 'إضافة فئة جديدة'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>اسم الفئة *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="مثال: مشروبات" /></div>
            <div className="space-y-1.5"><Label>الوصف</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="وصف اختياري..." rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSubmit} disabled={isBusy || !form.name}>
              {isBusy && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              {editId ? 'حفظ' : 'إضافة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذه الفئة؟</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteId && deleteM.mutate(deleteId)}>
              {deleteM.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />} حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Units Tab ─────────────────────────────────────────────────────────────────
function UnitsTab() {
  const { toast } = useToast();
  const [customUnits, setCustomUnits] = useState<string[]>(getStoredUnits);
  const [newUnit, setNewUnit] = useState('');
  const [deleteUnit, setDeleteUnit] = useState<string | null>(null);

  const addUnit = () => {
    const u = newUnit.trim();
    if (!u) return;
    if ([...DEFAULT_UNITS, ...customUnits].includes(u)) {
      toast({ title: 'الوحدة موجودة مسبقاً', variant: 'destructive' }); return;
    }
    const updated = [...customUnits, u];
    setCustomUnits(updated);
    saveCustomUnits(updated);
    setNewUnit('');
    toast({ title: `تم إضافة وحدة "${u}"` });
  };

  const removeCustomUnit = (unit: string) => {
    const updated = customUnits.filter(u => u !== unit);
    setCustomUnits(updated);
    saveCustomUnits(updated);
    setDeleteUnit(null);
    toast({ title: `تم حذف وحدة "${unit}"` });
  };

  const allUnits = DEFAULT_UNITS.map(u => ({ name: u, isDefault: true })).concat(
    customUnits.map(u => ({ name: u, isDefault: false }))
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Ruler className="h-4 w-4 text-primary" />
            إضافة وحدة قياس مخصصة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="مثال: دزينة، صندوق، طبق..."
              value={newUnit}
              onChange={e => setNewUnit(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addUnit()}
              className="max-w-xs"
            />
            <Button onClick={addUnit} disabled={!newUnit.trim()} className="gap-2">
              <Plus className="h-4 w-4" /> إضافة
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">جميع وحدات القياس ({allUnits.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {allUnits.map(({ name, isDefault }) => (
              <div
                key={name}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border ${
                  isDefault
                    ? 'bg-muted border-border text-muted-foreground'
                    : 'bg-primary/10 border-primary/20 text-primary'
                }`}
              >
                <Ruler className="h-3.5 w-3.5" />
                <span>{name}</span>
                {!isDefault && (
                  <button
                    onClick={() => setDeleteUnit(name)}
                    className="hover:text-destructive transition-colors ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
                {isDefault && (
                  <span className="text-xs opacity-50">(افتراضي)</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteUnit} onOpenChange={() => setDeleteUnit(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الوحدة</AlertDialogTitle>
            <AlertDialogDescription>هل تريد حذف وحدة "{deleteUnit}"؟ ستظل المنتجات الحالية بوحدتها.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteUnit && removeCustomUnit(deleteUnit)}>
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Barcode Tab ───────────────────────────────────────────────────────────────
function BarcodeTab() {
  const { toast } = useToast();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [found, setFound] = useState<ApiProduct | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: allProducts = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.list({}),
  });

  const doSearch = (code: string) => {
    const q = code.trim();
    if (!q) return;
    setSearching(true);
    setFound(null);
    setNotFound(false);

    setTimeout(() => {
      const match = allProducts.find(
        p => p.barcode === q || p.sku === q || p.name.includes(q)
      ) as ApiProduct | undefined;
      setSearching(false);
      if (match) {
        setFound(match);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    }, 300);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') doSearch(barcodeInput);
  };

  const clear = () => {
    setBarcodeInput('');
    setFound(null);
    setNotFound(false);
    inputRef.current?.focus();
  };

  const isLow = found ? found.currentStock <= found.minStock : false;
  const isOut = found ? found.currentStock === 0 : false;

  return (
    <div className="space-y-4 max-w-xl">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-primary" />
            بحث بالباركود أو SKU
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="امسح الباركود أو اكتبه هنا..."
                className="pr-9 font-mono"
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                onKeyDown={handleKey}
                autoFocus
                dir="ltr"
              />
            </div>
            <Button onClick={() => doSearch(barcodeInput)} disabled={!barcodeInput.trim() || searching}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              بحث
            </Button>
            {(found || notFound) && (
              <Button variant="outline" onClick={clear}><X className="h-4 w-4" /></Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">اضغط Enter لبدء البحث — يدعم الباركود، SKU، أو اسم المنتج</p>
        </CardContent>
      </Card>

      {notFound && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-6 text-center space-y-2">
            <X className="h-10 w-10 text-destructive/50 mx-auto" />
            <p className="font-medium text-destructive">لم يتم العثور على منتج</p>
            <p className="text-xs text-muted-foreground">الكود: <span className="font-mono">{barcodeInput}</span></p>
          </CardContent>
        </Card>
      )}

      {found && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                {found.name}
              </CardTitle>
              <Badge variant={found.isActive ? 'default' : 'secondary'}>{found.isActive ? 'نشط' : 'موقف'}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'الباركود', value: found.barcode || '-', mono: true },
                { label: 'SKU', value: found.sku || '-', mono: true },
                { label: 'الوحدة', value: found.unit || 'قطعة' },
                { label: 'سعر البيع', value: `${Number(found.salePrice).toLocaleString('ar-SA')} ر.س` },
                { label: 'سعر الشراء', value: `${Number(found.purchasePrice).toLocaleString('ar-SA')} ر.س` },
                { label: 'الضريبة', value: `${found.taxPercent}%` },
                { label: 'المخزون الحالي', value: String(found.currentStock), alert: isOut ? 'red' : isLow ? 'orange' : 'green' },
                { label: 'الحد الأدنى', value: String(found.minStock) },
                { label: 'الفئة', value: (found as any).categoryName || '-' },
              ].map(item => (
                <div key={item.label} className="bg-background rounded-lg p-3 border">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className={`font-semibold text-sm ${item.mono ? 'font-mono' : ''} ${
                    item.alert === 'red' ? 'text-red-600' : item.alert === 'orange' ? 'text-orange-600' : item.alert === 'green' ? 'text-green-600' : ''
                  }`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            {isOut && <div className="mt-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm p-3 rounded-lg flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> نفد هذا المنتج من المخزون</div>}
            {!isOut && isLow && <div className="mt-3 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-sm p-3 rounded-lg flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> مخزون منخفض — يحتاج تجديداً</div>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Import / Export Tab ───────────────────────────────────────────────────────
function ImportExportTab() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.list({}),
  });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });

  const exportCSV = () => {
    const headers = ['اسم المنتج', 'SKU', 'الباركود', 'الفئة', 'الوحدة', 'سعر الشراء', 'سعر البيع', 'نسبة الضريبة', 'الحد الأدنى', 'المخزون الحالي', 'الحالة'];
    const rows = products.map(p => [
      p.name,
      p.sku || '',
      p.barcode || '',
      (p as any).categoryName || '',
      p.unit || 'قطعة',
      p.purchasePrice,
      p.salePrice,
      p.taxPercent,
      p.minStock,
      p.currentStock,
      p.isActive ? 'نشط' : 'موقف',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `تم تصدير ${products.length} منتج بنجاح` });
  };

  const exportTemplate = () => {
    const headers = ['اسم المنتج *', 'SKU', 'الباركود', 'الفئة', 'الوحدة', 'سعر الشراء', 'سعر البيع', 'نسبة الضريبة', 'الحد الأدنى للمخزون'];
    const sample = [['منتج تجريبي', 'SKU-001', '6XXXXXXXXXX', 'مشروبات', 'علبة', '5', '8', '15', '10']];
    const csvContent = [headers, ...sample]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'تم تنزيل قالب الاستيراد' });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.replace(/^\uFEFF/, '').split('\n').filter(l => l.trim());
        if (lines.length < 2) throw new Error('الملف فارغ أو لا يحتوي على بيانات');

        const parseRow = (line: string) =>
          line.split(',').map(cell => cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

        const errors: string[] = [];
        let success = 0;

        lines.slice(1).forEach((line, idx) => {
          const row = parseRow(line);
          const name = row[0]?.trim();
          if (!name) {
            errors.push(`الصف ${idx + 2}: اسم المنتج مطلوب`);
            return;
          }
          if (!row[5] || isNaN(Number(row[5]))) {
            errors.push(`الصف ${idx + 2}: سعر الشراء غير صحيح`);
            return;
          }
          if (!row[6] || isNaN(Number(row[6]))) {
            errors.push(`الصف ${idx + 2}: سعر البيع غير صحيح`);
            return;
          }
          success++;
        });

        setTimeout(() => {
          setImporting(false);
          setImportResult({ success, errors });
          if (success > 0) {
            toast({ title: `تم التحقق من ${success} منتج. الاستيراد الفعلي يتطلب API مخصص.` });
          }
        }, 800);
      } catch (err: any) {
        setImporting(false);
        toast({ title: err.message, variant: 'destructive' });
      }
    };
    reader.readAsText(file, 'UTF-8');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Export */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Download className="h-4 w-4 text-green-600" />
              تصدير المنتجات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">تصدير جميع المنتجات ({products.length}) إلى ملف CSV يمكن فتحه في Excel.</p>
            <div className="space-y-2">
              <Button onClick={exportCSV} className="w-full gap-2 bg-green-600 hover:bg-green-700" disabled={products.length === 0}>
                <FileSpreadsheet className="h-4 w-4" />
                تصدير الكل ({products.length} منتج)
              </Button>
              <Button variant="outline" onClick={exportTemplate} className="w-full gap-2">
                <Download className="h-4 w-4" />
                تنزيل قالب الاستيراد
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Import */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Upload className="h-4 w-4 text-blue-600" />
              استيراد المنتجات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">استيراد منتجات من ملف CSV. حمّل القالب أولاً وامله بالبيانات.</p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileImport} />
            <Button
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="w-full gap-2"
              variant="outline"
            >
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {importing ? 'جاري المعالجة...' : 'اختر ملف CSV'}
            </Button>

            {importResult && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-green-700 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-md">
                  <CheckCircle2 className="h-4 w-4" />
                  {importResult.success} منتج تم التحقق منه بنجاح
                </div>
                {importResult.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-red-700 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span className="text-xs">{e}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mapping guide */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">تنسيق ملف CSV المطلوب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border rounded-lg overflow-hidden">
              <thead className="bg-muted">
                <tr>
                  {['العمود', 'الاسم', 'مطلوب', 'مثال'].map(h => <th key={h} className="p-2 border-b font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  ['A', 'اسم المنتج', 'نعم ✓', 'عصير البرتقال 1L'],
                  ['B', 'SKU', 'لا', 'JUS-001'],
                  ['C', 'الباركود', 'لا', '6281234567890'],
                  ['D', 'الفئة', 'لا', 'مشروبات'],
                  ['E', 'الوحدة', 'لا', 'علبة'],
                  ['F', 'سعر الشراء', 'نعم ✓', '4.5'],
                  ['G', 'سعر البيع', 'نعم ✓', '7'],
                  ['H', 'نسبة الضريبة', 'لا', '15'],
                  ['I', 'الحد الأدنى', 'لا', '10'],
                ].map(row => (
                  <tr key={row[0]} className="hover:bg-muted/20">
                    <td className="p-2 font-mono font-bold">{row[0]}</td>
                    <td className="p-2">{row[1]}</td>
                    <td className="p-2 text-center">{row[2]}</td>
                    <td className="p-2 text-muted-foreground font-mono">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-5" dir="rtl">
        <PageHeader
          title="المنتجات والمخزون"
          subtitle="إدارة المنتجات والفئات ووحدات القياس"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'المنتجات' }]}
        />

        <Tabs defaultValue="products" dir="rtl">
          <TabsList className="mb-2">
            <TabsTrigger value="products" className="gap-2"><Package className="h-4 w-4" /> المنتجات</TabsTrigger>
            <TabsTrigger value="categories" className="gap-2"><Tag className="h-4 w-4" /> الفئات</TabsTrigger>
            <TabsTrigger value="units" className="gap-2"><Ruler className="h-4 w-4" /> الوحدات</TabsTrigger>
            <TabsTrigger value="barcode" className="gap-2"><Barcode className="h-4 w-4" /> الباركود</TabsTrigger>
            <TabsTrigger value="import-export" className="gap-2"><FileSpreadsheet className="h-4 w-4" /> استيراد/تصدير</TabsTrigger>
          </TabsList>
          <TabsContent value="products"><ProductsTab /></TabsContent>
          <TabsContent value="categories"><CategoriesTab /></TabsContent>
          <TabsContent value="units"><UnitsTab /></TabsContent>
          <TabsContent value="barcode"><BarcodeTab /></TabsContent>
          <TabsContent value="import-export"><ImportExportTab /></TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
