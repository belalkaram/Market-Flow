import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2, Volume2, VolumeX, Play, Coins, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useUrlTab } from '@/hooks/useUrlTab';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { SOUND_OPTIONS, PosSoundType, playPosSound, getPosSoundConfig, savePosSoundConfig } from '@/lib/posSounds';
import { ALL_CURRENCIES, getActiveCurrencies, getPrimaryCurrency } from '@/lib/currencies';
import { cn } from '@/lib/utils';

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
    store_currency: 'SAR',
    store_currencies: ['SAR', 'USD', 'EGP', 'AED'],
    // POS settings
    pos_auto_print: true,
    pos_sound_notify: true,
    pos_sound_type: 'chime' as PosSoundType,
    pos_sound_volume: 70,
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

  const [currencySearch, setCurrencySearch] = useState('');

  const { data: serverSettings, isLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: () => api.get<any>('/settings/store'),
  });

  useEffect(() => {
    // Load local sound config
    const soundConf = getPosSoundConfig();
    const activeCurrencies = getActiveCurrencies();
    const primaryCurr = getPrimaryCurrency();

    setForm(f => ({
      ...f,
      pos_sound_notify: soundConf.enabled,
      pos_sound_type: soundConf.type,
      pos_sound_volume: Math.round(soundConf.volume * 100),
      store_currency: primaryCurr.code,
      store_currencies: activeCurrencies,
    }));
  }, []);

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
      if ('store_currencies' in serverSettings && Array.isArray(serverSettings.store_currencies)) {
        localStorage.setItem('mf_store_active_currencies', JSON.stringify(serverSettings.store_currencies));
      }
      if ('store_currency' in serverSettings) {
        localStorage.setItem('mf_store_primary_currency', String(serverSettings.store_currency));
      }
      if ('pos_sound_notify' in serverSettings) {
        localStorage.setItem('mf_settings_pos_sound_notify', String(serverSettings.pos_sound_notify));
      }
      if ('pos_sound_type' in serverSettings) {
        localStorage.setItem('mf_settings_pos_sound_type', String(serverSettings.pos_sound_type));
      }
      if ('pos_sound_volume' in serverSettings) {
        localStorage.setItem('mf_settings_pos_sound_volume', String(Number(serverSettings.pos_sound_volume) / 100));
      }
    }
  }, [serverSettings]);

  const saveMutation = useMutation({
    mutationFn: () => api.put('/settings/store', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['store-settings'] });
      
      // Update localStorage
      localStorage.setItem('mf_settings_tax_enabled', String(form.tax_enabled));
      localStorage.setItem('mf_settings_tax_percent', String(form.tax_percent));
      localStorage.setItem('mf_store_active_currencies', JSON.stringify(form.store_currencies));
      localStorage.setItem('mf_store_primary_currency', form.store_currency);
      
      savePosSoundConfig({
        enabled: form.pos_sound_notify,
        type: form.pos_sound_type,
        volume: form.pos_sound_volume / 100,
      });
      
      toast({ title: 'تم حفظ كافة الإعدادات بنجاح 🎉' });
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => saveMutation.mutate();

  const toggleCurrency = (code: string) => {
    setForm(prev => {
      const exists = prev.store_currencies.includes(code);
      let updated: string[];
      if (exists) {
        if (prev.store_currencies.length <= 1) {
          toast({ title: 'يجب الإبقاء على عملة واحدة على الأقل للمتجر', variant: 'destructive' });
          return prev;
        }
        updated = prev.store_currencies.filter(c => c !== code);
      } else {
        updated = [...prev.store_currencies, code];
      }

      // If primary currency was unchecked, fallback to first available
      let primary = prev.store_currency;
      if (!updated.includes(primary)) {
        primary = updated[0];
      }

      return {
        ...prev,
        store_currencies: updated,
        store_currency: primary,
      };
    });
  };

  const handleSelectAllCurrencies = () => {
    setForm(f => ({ ...f, store_currencies: ALL_CURRENCIES.map(c => c.code) }));
  };

  const handleSelectGccCurrencies = () => {
    const gcc = ['SAR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR'];
    setForm(f => ({ ...f, store_currencies: Array.from(new Set([...f.store_currencies, ...gcc])) }));
  };

  const handlePreviewSound = (type: PosSoundType) => {
    playPosSound(type, form.pos_sound_volume / 100);
  };

  const filteredCurrencies = ALL_CURRENCIES.filter(c =>
    c.nameAr.includes(currencySearch) ||
    c.country.includes(currencySearch) ||
    c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.symbolAr.includes(currencySearch)
  );

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
          subtitle="تخصيص إعدادات المتجر، العملات، وأصوات نقطة البيع"
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
            <TabsTrigger value="general" className="py-2">إعدادات عامة والعملات</TabsTrigger>
            <TabsTrigger value="pos" className="py-2">نقطة البيع والأصوات</TabsTrigger>
            <TabsTrigger value="invoice" className="py-2">الفواتير</TabsTrigger>
            <TabsTrigger value="tax" className="py-2">الضرائب</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>معلومات الشركة</CardTitle><CardDescription>اسم الشركة والبيانات الأساسية</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>اسم الشركة</Label><Input value={form.store_name} onChange={e => set('store_name', e.target.value)} /></div>
                  <div className="space-y-2"><Label>البريد الإلكتروني للشركة</Label><Input value={form.store_email} onChange={e => set('store_email', e.target.value)} dir="ltr" /></div>
                  <div className="space-y-2"><Label>رقم الهاتف</Label><Input value={form.store_phone} onChange={e => set('store_phone', e.target.value)} dir="ltr" /></div>
                  <div className="space-y-2"><Label>العنوان</Label><Input value={form.store_address} onChange={e => set('store_address', e.target.value)} /></div>
                  <div className="space-y-2"><Label>الرقم الضريبي</Label><Input value={form.store_tax_number} onChange={e => set('store_tax_number', e.target.value)} dir="ltr" /></div>
                  <div className="space-y-2">
                    <Label>العملة الأساسية الافتراضية للمتجر</Label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={form.store_currency}
                      onChange={e => set('store_currency', e.target.value)}
                    >
                      {ALL_CURRENCIES.filter(c => form.store_currencies.includes(c.code)).map(c => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.nameAr} ({c.symbolAr} - {c.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CURRENCIES MANAGEMENT (CHECKBOX SYSTEM) */}
            <Card className="border-primary/20 shadow-sm">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg font-black">
                      <Coins className="h-5 w-5 text-primary" />
                      <span>إدارة العملات المقبولة في المتجر (Checkboxes)</span>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      حدد العملات التي ترغب في تفعيلها لمتجرك عبر مربعات الاختيار. تشمل القائمة جميع عملات الوطن العربي بالإضافة إلى الدولار واليورو.
                    </CardDescription>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button type="button" variant="outline" size="sm" onClick={handleSelectAllCurrencies} className="text-xs h-8">
                      تحديد الكل
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleSelectGccCurrencies} className="text-xs h-8">
                      دول الخليج
                    </Button>
                  </div>
                </div>

                <div className="pt-2">
                  <Input
                    placeholder="ابحث عن عملة أو دولة..."
                    value={currencySearch}
                    onChange={e => setCurrencySearch(e.target.value)}
                    className="max-w-sm h-9 text-xs"
                  />
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-[420px] overflow-y-auto p-1">
                  {filteredCurrencies.map((c) => {
                    const isChecked = form.store_currencies.includes(c.code);
                    const isPrimary = form.store_currency === c.code;

                    return (
                      <div
                        key={c.code}
                        onClick={() => toggleCurrency(c.code)}
                        className={cn(
                          'flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none',
                          isChecked
                            ? 'bg-primary/5 border-primary/40 shadow-xs'
                            : 'bg-muted/30 border-border hover:bg-muted/60 opacity-70'
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleCurrency(c.code)}
                            onClick={e => e.stopPropagation()}
                            id={`curr-${c.code}`}
                          />
                          <span className="text-xl shrink-0">{c.flag}</span>
                          <div className="min-w-0">
                            <label
                              htmlFor={`curr-${c.code}`}
                              className="text-xs font-bold block cursor-pointer text-foreground truncate"
                            >
                              {c.nameAr}
                            </label>
                            <span className="text-[10px] text-muted-foreground block truncate">
                              {c.country}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0.5">
                            {c.symbolAr}
                          </Badge>
                          {isPrimary && (
                            <Badge className="bg-emerald-600 text-white text-[9px] px-1 py-0 font-bold">
                              أساسية
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* POS SETTINGS & SOUND EFFECTS */}
          <TabsContent value="pos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-primary" />
                  <span>تخصيص أصوات نقطة البيع (POS Audio)</span>
                </CardTitle>
                <CardDescription>
                  التحكم في المؤثرات الصوتية التي تصدر عند اختيار أي منتج أو قراءة الباركود في شاشة الكاشير
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enable / Disable switch */}
                <div className="flex items-center justify-between p-3.5 bg-muted/40 rounded-2xl border">
                  <div className="space-y-0.5">
                    <Label htmlFor="pos_sound_notify" className="cursor-pointer font-bold text-sm block">
                      تشغيل الصوت التفاعلي عند اختيار أي منتج
                    </Label>
                    <span className="text-xs text-muted-foreground block">
                      إصدار نغمة تأكيدية فورية بدون أي تأخير عند النقر على المنتج أو مسحه
                    </span>
                  </div>
                  <Switch
                    id="pos_sound_notify"
                    checked={form.pos_sound_notify}
                    onCheckedChange={v => set('pos_sound_notify', v)}
                  />
                </div>

                {/* Sound profiles grid */}
                <div className="space-y-3">
                  <Label className="font-bold text-sm">اختر نوع الصوت المفضل:</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {SOUND_OPTIONS.map(opt => {
                      const isSelected = form.pos_sound_type === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            set('pos_sound_type', opt.id);
                            handlePreviewSound(opt.id);
                          }}
                          className={cn(
                            'p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3',
                            isSelected
                              ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                              : 'border-border bg-card hover:bg-muted/40'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                                {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                                <span>{opt.label}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                                {opt.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-end pt-1 border-t border-border/50">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="h-7 text-xs gap-1 rounded-xl"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreviewSound(opt.id);
                              }}
                            >
                              <Play className="h-3 w-3 fill-current" />
                              تجربة الصوت
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sound volume slider */}
                <div className="p-4 bg-muted/30 rounded-2xl border space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold text-xs flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                      <span>مستوى الصوت في نقطة البيع</span>
                    </Label>
                    <span className="font-mono text-xs font-bold">{form.pos_sound_volume}%</span>
                  </div>
                  <Slider
                    value={[form.pos_sound_volume]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(vals) => set('pos_sound_volume', vals[0])}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>سلوك شاشة البيع والمخزون</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pos_auto_print" className="cursor-pointer">طباعة إيصال تلقائياً عند الإتمام</Label>
                  <Switch id="pos_auto_print" checked={form.pos_auto_print} onCheckedChange={v => set('pos_auto_print', v)} />
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
