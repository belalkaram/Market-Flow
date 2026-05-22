import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, Copy, ExternalLink, Store, Truck, Settings, CreditCard } from 'lucide-react';
import { useUrlTab } from '@/hooks/useUrlTab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function OrderSettingsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useUrlTab('general');
  const [saving, setSaving] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['order-settings'],
    queryFn: () => api.get<any>('/settings/order-page'),
  });

  const [form, setForm] = useState({
    publicOrderingEnabled: false,
    tenantSlug: '',
    publicStoreName: '',
    publicDescription: '',
    publicWhatsappNumber: '',
    publicPhone: '',
    publicAddress: '',
    publicArea: '',
    deliveryEnabled: true,
    pickupEnabled: true,
    deliveryFee: 0,
    minimumOrderAmount: 0,
    showProductStock: false,
    allowOutOfStockDisplay: false,
    cashEnabled: true,
    walletEnabled: false,
    bankTransferEnabled: false,
  });

  useEffect(() => {
    if (settings) {
      setForm(f => ({ ...f, ...settings }));
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: () => api.put('/settings/order-page', form),
    onSuccess: () => toast({ title: 'تم حفظ إعدادات طلب الأوردر بنجاح' }),
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const handleSave = () => saveMutation.mutate();

  const publicUrl = form.tenantSlug
    ? `${window.location.origin}/store/${form.tenantSlug}`
    : '';

  const copyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    toast({ title: 'تم نسخ الرابط' });
  };

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center h-40 items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6" dir="rtl">
        <PageHeader
          title="إعدادات طلب الأوردر"
          subtitle="تحكم في صفحة الطلب العامة للعملاء"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'إعدادات طلب الأوردر' }]}
          actions={
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-2">
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              حفظ الإعدادات
            </Button>
          }
        />

        {publicUrl && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div>
                <p className="text-sm font-semibold mb-1">رابط صفحة الطلب العامة</p>
                <p className="text-sm text-muted-foreground font-mono break-all">{publicUrl}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={copyLink} className="gap-1.5">
                  <Copy className="h-3.5 w-3.5" /> نسخ
                </Button>
                <Button size="sm" variant="outline" onClick={() => window.open(publicUrl, '_blank')} className="gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" /> معاينة
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={tab} onValueChange={setTab} className="w-full" dir="rtl">
          <TabsList className="mb-4 flex-wrap h-auto p-1">
            <TabsTrigger value="general" className="gap-1.5 py-2">
              <Store className="h-3.5 w-3.5" /> عام
            </TabsTrigger>
            <TabsTrigger value="delivery" className="gap-1.5 py-2">
              <Truck className="h-3.5 w-3.5" /> التوصيل
            </TabsTrigger>
            <TabsTrigger value="payment" className="gap-1.5 py-2">
              <CreditCard className="h-3.5 w-3.5" /> الدفع
            </TabsTrigger>
            <TabsTrigger value="display" className="gap-1.5 py-2">
              <Settings className="h-3.5 w-3.5" /> العرض
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الصفحة العامة</CardTitle>
                <CardDescription>التحكم في تفعيل صفحة الطلب وبيانات المتجر</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <Label className="text-base font-semibold">تفعيل صفحة الطلب العامة</Label>
                    <p className="text-sm text-muted-foreground mt-0.5">السماح للعملاء بتقديم طلبات عبر الرابط العام</p>
                  </div>
                  <Switch
                    checked={form.publicOrderingEnabled}
                    onCheckedChange={v => set('publicOrderingEnabled', v)}
                  />
                </div>
                {!form.publicOrderingEnabled && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-700">صفحة الطلب معطلة حالياً. سيرى العملاء صفحة 404 عند محاولة الوصول.</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Slug الخاص بالمتجر</Label>
                    <Input
                      value={form.tenantSlug}
                      onChange={e => set('tenantSlug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="market-plus"
                      dir="ltr"
                    />
                    <p className="text-xs text-muted-foreground">حروف صغيرة وأرقام وشرطة فقط. لا يتكرر.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>اسم المتجر الظاهر للعميل</Label>
                    <Input value={form.publicStoreName} onChange={e => set('publicStoreName', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>رقم واتساب استقبال الطلبات</Label>
                    <Input value={form.publicWhatsappNumber} onChange={e => set('publicWhatsappNumber', e.target.value)} dir="ltr" placeholder="+966500000000" />
                    <p className="text-xs text-muted-foreground">الطلبات ستُرسل على هذا الرقم عبر واتساب</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>رقم هاتف إضافي (اختياري)</Label>
                    <Input value={form.publicPhone} onChange={e => set('publicPhone', e.target.value)} dir="ltr" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>عنوان المتجر</Label>
                    <Input value={form.publicAddress} onChange={e => set('publicAddress', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>المنطقة / الحي</Label>
                    <Input value={form.publicArea} onChange={e => set('publicArea', e.target.value)} />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>وصف قصير للمتجر</Label>
                    <Textarea
                      value={form.publicDescription}
                      onChange={e => set('publicDescription', e.target.value)}
                      rows={3}
                      placeholder="وصف قصير يظهر للعملاء في صفحة الطلب..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات التوصيل والاستلام</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-semibold">تفعيل التوصيل</Label>
                    <p className="text-sm text-muted-foreground">السماح للعملاء باختيار التوصيل للمنزل</p>
                  </div>
                  <Switch checked={form.deliveryEnabled} onCheckedChange={v => set('deliveryEnabled', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-semibold">تفعيل الاستلام من الفرع</Label>
                    <p className="text-sm text-muted-foreground">السماح للعملاء بالاستلام مباشرة من المتجر</p>
                  </div>
                  <Switch checked={form.pickupEnabled} onCheckedChange={v => set('pickupEnabled', v)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>رسوم التوصيل (ر.س)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      value={form.deliveryFee}
                      onChange={e => set('deliveryFee', Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">0 = توصيل مجاني</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>الحد الأدنى للطلب (ر.س)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.minimumOrderAmount}
                      onChange={e => set('minimumOrderAmount', Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">0 = لا يوجد حد أدنى</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>طرق الدفع المتاحة</CardTitle>
                <CardDescription>اختر طرق الدفع التي يمكن للعملاء استخدامها</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { key: 'cashEnabled', label: 'كاش عند الاستلام', desc: 'الدفع النقدي عند استلام الطلب' },
                  { key: 'walletEnabled', label: 'محفظة إلكترونية', desc: 'STC Pay، Mada، إلخ' },
                  { key: 'bankTransferEnabled', label: 'تحويل بنكي', desc: 'التحويل المسبق قبل التأكيد' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label className="font-medium">{label}</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                    <Switch
                      checked={(form as any)[key]}
                      onCheckedChange={v => set(key, v)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="display" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات العرض</CardTitle>
                <CardDescription>تحكم في ما يراه العملاء في صفحة الطلب</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="font-medium">إظهار الكمية المتاحة للعميل</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">يرى العميل كم تبقى من المنتج</p>
                  </div>
                  <Switch
                    checked={form.showProductStock}
                    onCheckedChange={v => set('showProductStock', v)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="font-medium">عرض المنتجات غير المتوفرة</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">يرى العميل المنتجات المنتهية مع تعطيل الإضافة</p>
                  </div>
                  <Switch
                    checked={form.allowOutOfStockDisplay}
                    onCheckedChange={v => set('allowOutOfStockDisplay', v)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardContent className="p-4 text-center space-y-2">
                <Badge variant="secondary">معاينة مباشرة</Badge>
                <p className="text-sm text-muted-foreground">
                  {publicUrl ? 'اضغط لمعاينة صفحة الطلب العامة كما يراها العميل' : 'أدخل Slug المتجر أولاً لتفعيل المعاينة'}
                </p>
                {publicUrl && (
                  <Button variant="outline" onClick={() => window.open(publicUrl, '_blank')} className="gap-2">
                    <ExternalLink className="h-4 w-4" /> فتح المعاينة
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
