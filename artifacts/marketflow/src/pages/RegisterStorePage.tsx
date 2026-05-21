import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import {
  Store, User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2, Loader2,
  Building2, MapPin, FileText, CreditCard, ChevronRight, ChevronLeft
} from 'lucide-react';

const businessTypes = [
  'سوبرماركت', 'بقالة', 'محل مواد غذائية', 'متجر تجزئة', 'سلسلة متاجر', 'متجر إلكتروني', 'أخرى'
];

const subscriptionPlans = [
  { id: 'trial', name: 'تجريبي', price: '0', features: ['5 مستخدمين', '1 فرع', '100 منتج'], color: 'border-slate-300' },
  { id: 'basic', name: 'أساسي', price: '99', features: ['10 مستخدمين', '2 فرع', '500 منتج'], color: 'border-blue-300' },
  { id: 'pro', name: 'احترافي', price: '199', features: ['30 مستخدماً', '5 فروع', 'منتجات غير محدودة'], color: 'border-emerald-400 ring-2 ring-emerald-200', recommended: true },
  { id: 'enterprise', name: 'مؤسسي', price: '399', features: ['مستخدمون غير محدودون', 'فروع غير محدودة', 'دعم أولوية'], color: 'border-purple-300' },
];

type Step = 'store' | 'owner' | 'branch' | 'plan';

const STEPS: { id: Step; label: string }[] = [
  { id: 'store', label: 'معلومات الشركة' },
  { id: 'owner', label: 'بيانات المالك' },
  { id: 'branch', label: 'الفرع الرئيسي' },
  { id: 'plan', label: 'اختيار الخطة' },
];

export default function RegisterStorePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<Step>('store');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    storeName: '', businessType: '', taxNumber: '', commercialRegNo: '',
    ownerName: '', email: '', phone: '', password: '', confirmPassword: '',
    branchName: 'الفرع الرئيسي', branchCity: '', branchAddress: '', branchPhone: '',
    selectedPlan: 'trial',
  });

  const setField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const stepIndex = STEPS.findIndex(s => s.id === currentStep);

  const validateStep = (step: Step): boolean => {
    const e: Record<string, string> = {};
    if (step === 'store') {
      if (!form.storeName.trim()) e.storeName = 'اسم الشركة مطلوب';
      if (!form.businessType) e.businessType = 'نوع النشاط مطلوب';
    } else if (step === 'owner') {
      if (!form.ownerName.trim()) e.ownerName = 'اسم المالك مطلوب';
      if (!form.email.trim()) e.email = 'البريد الإلكتروني مطلوب';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'بريد إلكتروني غير صحيح';
      if (!form.phone.trim()) e.phone = 'رقم الهاتف مطلوب';
      if (!form.password) e.password = 'كلمة المرور مطلوبة';
      else if (form.password.length < 8) e.password = 'كلمة المرور 8 أحرف على الأقل';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'كلمتا المرور غير متطابقتين';
    } else if (step === 'branch') {
      if (!form.branchName.trim()) e.branchName = 'اسم الفرع مطلوب';
      if (!form.branchCity.trim()) e.branchCity = 'المدينة مطلوبة';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    const idx = STEPS.findIndex(s => s.id === currentStep);
    if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1].id);
  };

  const prevStep = () => {
    const idx = STEPS.findIndex(s => s.id === currentStep);
    if (idx > 0) setCurrentStep(STEPS[idx - 1].id);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await api.post<{ token: string; user: any; store: any; trialEndsAt: string }>('/stores/register', {
        storeName: form.storeName,
        ownerName: form.ownerName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        businessType: form.businessType,
        taxNumber: form.taxNumber,
        commercialRegNo: form.commercialRegNo,
        branchName: form.branchName,
        branchCity: form.branchCity,
        branchAddress: form.branchAddress,
        branchPhone: form.branchPhone,
        selectedPlan: form.selectedPlan,
      });
      localStorage.setItem('mf_token', result.token);
      toast({ title: 'تم إنشاء متجرك بنجاح!', description: 'لديك 10 أيام تجربة مجانية. ابدأ الآن!' });
      navigate('/dashboard');
    } catch (err: any) {
      toast({ title: err.message || 'فشل إنشاء المتجر', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-600/30">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">MarketFlow ERP</h1>
          <p className="text-blue-200/70 text-sm">إنشاء متجر جديد</p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                step.id === currentStep
                  ? 'bg-emerald-600 text-white'
                  : i < stepIndex
                    ? 'bg-emerald-600/30 text-emerald-300'
                    : 'bg-white/10 text-white/40'
              }`}>
                {i < stepIndex ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-px w-4 ${i < stepIndex ? 'bg-emerald-500' : 'bg-white/20'}`} />}
            </div>
          ))}
        </div>

        <Card className="border-0 shadow-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold">{STEPS[stepIndex].label}</CardTitle>
            {currentStep === 'store' && <CardDescription>معلومات الشركة والسجل التجاري</CardDescription>}
            {currentStep === 'owner' && <CardDescription>بيانات المالك وبيانات الدخول</CardDescription>}
            {currentStep === 'branch' && <CardDescription>معلومات الفرع الرئيسي</CardDescription>}
            {currentStep === 'plan' && <CardDescription>اختر الخطة المناسبة لحجم عملك</CardDescription>}
          </CardHeader>
          <CardContent>
            {/* Step 1: Store Info */}
            {currentStep === 'store' && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">اسم الشركة / المتجر *</Label>
                  <div className="relative mt-1">
                    <Store className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input value={form.storeName} onChange={e => setField('storeName', e.target.value)} placeholder="مثال: سوبرماركت الأمل" className="pr-10" />
                  </div>
                  {errors.storeName && <p className="text-red-500 text-xs mt-1">{errors.storeName}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium">نوع النشاط التجاري *</Label>
                  <Select value={form.businessType} onValueChange={v => setField('businessType', v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="اختر نوع النشاط" /></SelectTrigger>
                    <SelectContent>{businessTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.businessType && <p className="text-red-500 text-xs mt-1">{errors.businessType}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">الرقم الضريبي</Label>
                    <div className="relative mt-1">
                      <FileText className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input value={form.taxNumber} onChange={e => setField('taxNumber', e.target.value)} placeholder="300XXXXXXXXX" className="pr-10" dir="ltr" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">السجل التجاري</Label>
                    <div className="relative mt-1">
                      <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input value={form.commercialRegNo} onChange={e => setField('commercialRegNo', e.target.value)} placeholder="رقم السجل" className="pr-10" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Owner */}
            {currentStep === 'owner' && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">اسم المالك *</Label>
                  <div className="relative mt-1">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input value={form.ownerName} onChange={e => setField('ownerName', e.target.value)} placeholder="الاسم الكامل" className="pr-10" />
                  </div>
                  {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">البريد الإلكتروني *</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="email@example.com" className="pr-10" dir="ltr" />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">رقم الهاتف *</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="+966 XXXX XXXX" className="pr-10" />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">كلمة المرور *</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setField('password', e.target.value)} placeholder="8 أحرف على الأقل" className="pr-10 pl-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium">تأكيد كلمة المرور *</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={e => setField('confirmPassword', e.target.value)} placeholder="أعد كتابة كلمة المرور" className="pr-10 pl-10" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}

            {/* Step 3: Branch */}
            {currentStep === 'branch' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">اسم الفرع *</Label>
                    <Input value={form.branchName} onChange={e => setField('branchName', e.target.value)} placeholder="الفرع الرئيسي" className="mt-1" />
                    {errors.branchName && <p className="text-red-500 text-xs mt-1">{errors.branchName}</p>}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">المدينة *</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input value={form.branchCity} onChange={e => setField('branchCity', e.target.value)} placeholder="الرياض، جدة..." className="pr-10" />
                    </div>
                    {errors.branchCity && <p className="text-red-500 text-xs mt-1">{errors.branchCity}</p>}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">العنوان التفصيلي</Label>
                  <Input value={form.branchAddress} onChange={e => setField('branchAddress', e.target.value)} placeholder="الحي، الشارع، رقم المبنى..." className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium">هاتف الفرع</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input value={form.branchPhone} onChange={e => setField('branchPhone', e.target.value)} placeholder="رقم الهاتف" className="pr-10" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Plan */}
            {currentStep === 'plan' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {subscriptionPlans.map(plan => (
                    <div
                      key={plan.id}
                      onClick={() => setField('selectedPlan', plan.id)}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        form.selectedPlan === plan.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 hover:border-slate-300'
                      } ${plan.color}`}
                    >
                      {(plan as any).recommended && (
                        <div className="absolute -top-2 right-3 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">موصى به</div>
                      )}
                      <p className="font-bold text-sm">{plan.name}</p>
                      <p className="text-emerald-600 font-bold text-lg">
                        {plan.price === '0' ? 'مجاني' : `${plan.price} ر.س/شهر`}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>جميع الخطط تبدأ بـ <strong>10 أيام مجانية</strong> بدون بطاقة ائتمان. يمكنك التغيير لاحقاً.</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className={`flex mt-6 gap-3 ${stepIndex > 0 ? 'justify-between' : 'justify-end'}`}>
              {stepIndex > 0 && (
                <Button variant="outline" onClick={prevStep} className="gap-2">
                  <ChevronRight className="h-4 w-4" /> السابق
                </Button>
              )}
              {currentStep !== 'plan' ? (
                <Button onClick={nextStep} className="gap-2">
                  التالي <ChevronLeft className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isLoading} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الإنشاء...</> : 'إنشاء متجري الآن مجاناً'}
                </Button>
              )}
            </div>

            <p className="text-center text-sm text-slate-500 mt-4">
              لديك حساب؟{' '}
              <button type="button" onClick={() => navigate('/login')} className="text-blue-600 hover:underline font-medium">سجّل الدخول</button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
