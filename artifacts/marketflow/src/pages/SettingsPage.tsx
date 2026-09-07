import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useUrlTab } from '@/hooks/useUrlTab';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useUrlTab('general');

  const [form, setForm] = useState({
    // General Info
    store_name: 'شركة كنوز التجريبية',
    store_email: 'info@knouz-demo.com',
    store_phone: '+966-11-000-0000',
    store_address: 'الرياض، المملكة العربية السعودية',
    store_tax_number: '300000000000003',
    store_currency: 'ريال سعودي (ر.س)',
    // POS settings
    pos_auto_print: true,
    pos_sound_notify: true,
    pos_show_stock: true,
    pos_allow_negative: false,
    // Invoice settings
    invoice_prefix: 'INV',
    invoice_start_number: 1001,
    invoice_show_logo: true,
    invoice_show_qr: true,
    // Tax settings
    tax_enabled: true,
    tax_percent: 15,
  });

  const { data: serverSettings, isLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: () => api.get<any>('/settings/store'),
  });

  useEffect(() => {
    if (serverSettings) {
      setForm(f => ({ ...f, ...serverSettings }));
      
      // Sync localStorage so POS Page and calculations are updated
      if ('tax_enabled' in serverSettings) {
        localStorage.setItem('mf_settings_tax_enabled', String(serverSettings.tax_enabled));
      }
      if ('tax_percent' in serverSettings) {
        localStorage.setItem('mf_settings_tax_percent', String(serverSettings.tax_percent));
      }
    }
  }, [serverSettings]);

  const saveMutation = useMutation({
    mutationFn: () => api.put('/settings/store', form),
    onSuccess: () => {
      // Invalidate query to refetch fresh data
      qc.invalidateQueries({ queryKey: ['store-settings'] });
      
      // Also update localStorage so POS is immediately aware
      localStorage.setItem('mf_settings_tax_enabled', String(form.tax_enabled));
      localStorage.setItem('mf_settings_tax_percent', String(form.tax_percent));
      
      toast({ title: 'تم حفظ الإعدادات بنجاح' });
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => saveMutation.mutate();

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
          title="إعدادات النظام"
          subtitle="تخصيص إعدادات المتجر والنظام"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'الإعدادات' }]}
          actions={
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-2">
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              حفظ التغييرات
            </Button>
          }
        />

        <Tabs value={tab} onValueChange={setTab} className="w-full" dir="rtl">
          <TabsList className="mb-4 flex-wrap h-auto p-1">
            <TabsTrigger value="general" className="py-2">إعدادات عامة</TabsTrigger>
            <TabsTrigger value="pos" className="py-2">نقطة البيع</TabsTrigger>
            <TabsTrigger value="invoice" className="py-2">الفواتير</TabsTrigger>
            <TabsTrigger value="tax" className="py-2">الضرائب</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>معلومات الشركة</CardTitle><CardDescription>اسم الشركة والبيانات الأساسية</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>اسم الشركة</Label><Input value={form.store_name} onChange={e => set('store_name', e.target.value)} /></div>
                  <div className="space-y-2"><Label>البريد الإلكتروني للشركة</Label><Input value={form.store_email} onChange={e => set('store_email', e.target.value)} dir="ltr" /></div>
                  <div className="space-y-2"><Label>رقم الهاتف</Label><Input value={form.store_phone} onChange={e => set('store_phone', e.target.value)} dir="ltr" /></div>
                  <div className="space-y-2"><Label>العنوان</Label><Input value={form.store_address} onChange={e => set('store_address', e.target.value)} /></div>
                  <div className="space-y-2"><Label>الرقم الضريبي</Label><Input value={form.store_tax_number} onChange={e => set('store_tax_number', e.target.value)} dir="ltr" /></div>
                  <div className="space-y-2"><Label>العملة</Label><Input value={form.store_currency} onChange={e => set('store_currency', e.target.value)} /></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pos" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>إعدادات نقطة البيع</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pos_auto_print" className="cursor-pointer">طباعة إيصال تلقائياً عند الإتمام</Label>
                  <Switch id="pos_auto_print" checked={form.pos_auto_print} onCheckedChange={v => set('pos_auto_print', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pos_sound_notify" className="cursor-pointer">تشغيل صوت عند إضافة منتج</Label>
                  <Switch id="pos_sound_notify" checked={form.pos_sound_notify} onCheckedChange={v => set('pos_sound_notify', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pos_show_stock" className="cursor-pointer">إظهار الكمية المتاحة في شاشة POS</Label>
                  <Switch id="pos_show_stock" checked={form.pos_show_stock} onCheckedChange={v => set('pos_show_stock', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pos_allow_negative" className="cursor-pointer">السماح بالبيع حتى عند نفاد المخزون</Label>
                  <Switch id="pos_allow_negative" checked={form.pos_allow_negative} onCheckedChange={v => set('pos_allow_negative', v)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoice" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>إعدادات الفواتير</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>بادئة رقم الفاتورة</Label><Input value={form.invoice_prefix} onChange={e => set('invoice_prefix', e.target.value)} dir="ltr" /></div>
                  <div className="space-y-2"><Label>رقم بداية الفاتورة</Label><Input type="number" value={form.invoice_start_number} onChange={e => set('invoice_start_number', Number(e.target.value))} /></div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="invoice_show_logo" className="cursor-pointer">إظهار شعار الشركة في الفاتورة</Label>
                  <Switch id="invoice_show_logo" checked={form.invoice_show_logo} onCheckedChange={v => set('invoice_show_logo', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="invoice_show_qr" className="cursor-pointer">إضافة رمز QR للفاتورة</Label>
                  <Switch id="invoice_show_qr" checked={form.invoice_show_qr} onCheckedChange={v => set('invoice_show_qr', v)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tax" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>الإعدادات الضريبية العامة</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border">
                  <div>
                    <Label htmlFor="tax_enabled" className="cursor-pointer font-bold text-sm block">تفعيل ضريبة القيمة المضافة في النظام</Label>
                    <span className="text-xs text-slate-400 block mt-0.5">تطبيق الضريبة تلقائياً على المنتجات في شاشة الكاشير</span>
                  </div>
                  <Switch 
                    id="tax_enabled" 
                    checked={form.tax_enabled}
                    onCheckedChange={v => set('tax_enabled', v)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>نسبة ضريبة القيمة المضافة الإفتراضية (%)</Label>
                    <Input 
                      type="number" 
                      min={0}
                      max={100}
                      value={form.tax_percent} 
                      onChange={e => set('tax_percent', Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
