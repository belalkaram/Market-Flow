import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useStaggerFadeIn } from '@/hooks/useGsap';
import { useToast } from '@/hooks/use-toast';
import { productsApi, categoriesApi, suppliersApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function AddProductPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const formRef = useStaggerFadeIn('.form-section', 0.1);

  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    supplierId: '',
    barcode: '',
    sku: '',
    unit: 'قطعة',
    purchasePrice: '',
    salePrice: '',
    taxPercent: '15',
    minStock: '10',
    currentStock: '0',
    expiryDate: '',
    notes: '',
    isActive: true,
  });

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });
  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers'], queryFn: suppliersApi.list });

  const createM = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'تمت إضافة المنتج بنجاح' });
      setLocation('/products');
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createM.mutate({
      ...form,
      categoryId: form.categoryId || undefined,
      supplierId: form.supplierId || undefined,
      minStock: Number(form.minStock),
      currentStock: Number(form.currentStock),
    } as any);
  };

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6" dir="rtl">
        <PageHeader
          title="إضافة منتج جديد"
          subtitle="أدخل بيانات المنتج الجديد"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'المنتجات', href: '/products' }, { label: 'إضافة منتج' }]}
        />

        <div ref={formRef}>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          <Card className="form-section">
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-base border-b pb-2 mb-4">المعلومات الأساسية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="name">اسم المنتج *</Label>
                  <Input id="name" required placeholder="أدخل اسم المنتج" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>الفئة</Label>
                  <Select value={form.categoryId || 'none'} onValueChange={v => set('categoryId', v === 'none' ? '' : v)}>
                    <SelectTrigger dir="rtl"><SelectValue placeholder="اختر الفئة" /></SelectTrigger>
                    <SelectContent dir="rtl">
                      <SelectItem value="none">بدون فئة</SelectItem>
                      {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>المورد</Label>
                  <Select value={form.supplierId || 'none'} onValueChange={v => set('supplierId', v === 'none' ? '' : v)}>
                    <SelectTrigger dir="rtl"><SelectValue placeholder="اختر المورد" /></SelectTrigger>
                    <SelectContent dir="rtl">
                      <SelectItem value="none">بدون مورد</SelectItem>
                      {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الباركود</Label>
                  <Input placeholder="يولد تلقائياً إذا ترك فارغاً" value={form.barcode} onChange={e => set('barcode', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>رمز الصنف (SKU)</Label>
                  <Input placeholder="مثال: PRD-001" value={form.sku} onChange={e => set('sku', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="form-section">
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-base border-b pb-2 mb-4">التسعير والمخزون</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>سعر الشراء (ر.س) *</Label>
                  <Input type="number" required min="0" step="0.01" value={form.purchasePrice} onChange={e => set('purchasePrice', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>سعر البيع (ر.س) *</Label>
                  <Input type="number" required min="0" step="0.01" value={form.salePrice} onChange={e => set('salePrice', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>الضريبة (%)</Label>
                  <Input type="number" min="0" step="1" value={form.taxPercent} onChange={e => set('taxPercent', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>وحدة القياس</Label>
                  <Select value={form.unit} onValueChange={v => set('unit', v)}>
                    <SelectTrigger dir="rtl"><SelectValue /></SelectTrigger>
                    <SelectContent dir="rtl">
                      <SelectItem value="قطعة">قطعة</SelectItem>
                      <SelectItem value="كيلو">كيلو</SelectItem>
                      <SelectItem value="جرام">جرام</SelectItem>
                      <SelectItem value="لتر">لتر</SelectItem>
                      <SelectItem value="كرتونة">كرتونة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>مخزون ابتدائي</Label>
                  <Input type="number" min="0" value={form.currentStock} onChange={e => set('currentStock', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>الحد الأدنى للمخزون</Label>
                  <Input type="number" min="0" value={form.minStock} onChange={e => set('minStock', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>تاريخ الصلاحية</Label>
                  <Input type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="form-section">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>ملاحظات إضافية</Label>
                <Textarea rows={3} placeholder="أي تفاصيل أخرى عن المنتج..." value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Switch id="active" checked={form.isActive} onCheckedChange={v => set('isActive', v)} />
                <Label htmlFor="active">تفعيل المنتج للبيع</Label>
              </div>
            </CardContent>
          </Card>

          <div className="form-section flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setLocation('/products')}>إلغاء</Button>
            <Button type="submit" disabled={createM.isPending || !form.name}>
              {createM.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              حفظ المنتج
            </Button>
          </div>
        </form>
        </div>
      </div>
    </MainLayout>
  );
}
