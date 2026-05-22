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
import { useState } from 'react';
import { useUrlTab } from '@/hooks/useUrlTab';

export default function SettingsPage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useUrlTab('general');

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    setSaving(false);
    toast({ title: 'تم حفظ الإعدادات بنجاح' });
  };

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6" dir="rtl">
        <PageHeader
          title="إعدادات النظام"
          subtitle="تخصيص إعدادات المتجر والنظام"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'الإعدادات' }]}
          actions={
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
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
                  <div className="space-y-2"><Label>اسم الشركة</Label><Input defaultValue="شركة كنوز التجريبية" /></div>
                  <div className="space-y-2"><Label>البريد الإلكتروني للشركة</Label><Input defaultValue="info@knouz-demo.com" dir="ltr" /></div>
                  <div className="space-y-2"><Label>رقم الهاتف</Label><Input defaultValue="+966-11-000-0000" dir="ltr" /></div>
                  <div className="space-y-2"><Label>العنوان</Label><Input defaultValue="الرياض، المملكة العربية السعودية" /></div>
                  <div className="space-y-2"><Label>الرقم الضريبي</Label><Input defaultValue="300000000000003" dir="ltr" /></div>
                  <div className="space-y-2"><Label>العملة</Label><Input defaultValue="ريال سعودي (ر.س)" /></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pos" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>إعدادات نقطة البيع</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: 'auto-print', label: 'طباعة إيصال تلقائياً عند الإتمام' },
                  { id: 'sound-notify', label: 'تشغيل صوت عند إضافة منتج' },
                  { id: 'show-stock', label: 'إظهار الكمية المتاحة في شاشة POS' },
                  { id: 'allow-neg', label: 'السماح بالبيع حتى عند نفاد المخزون', defaultChecked: false },
                ].map(s => (
                  <div key={s.id} className="flex items-center justify-between">
                    <Label htmlFor={s.id} className="cursor-pointer">{s.label}</Label>
                    <Switch id={s.id} defaultChecked={s.defaultChecked !== false} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoice" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>إعدادات الفواتير</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>بادئة رقم الفاتورة</Label><Input defaultValue="INV" dir="ltr" /></div>
                  <div className="space-y-2"><Label>رقم بداية الفاتورة</Label><Input type="number" defaultValue="1001" /></div>
                </div>
                {[
                  { id: 'logo-invoice', label: 'إظهار شعار الشركة في الفاتورة' },
                  { id: 'qr-invoice', label: 'إضافة رمز QR للفاتورة' },
                ].map(s => (
                  <div key={s.id} className="flex items-center justify-between">
                    <Label htmlFor={s.id} className="cursor-pointer">{s.label}</Label>
                    <Switch id={s.id} defaultChecked />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tax" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>الإعدادات الضريبية</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>نسبة ضريبة القيمة المضافة (%)</Label><Input type="number" defaultValue="15" /></div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="tax-incl" className="cursor-pointer">الأسعار شاملة الضريبة</Label>
                  <Switch id="tax-incl" defaultChecked={false} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
