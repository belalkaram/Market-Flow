import { Suspense, lazy, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useStaggerFadeIn } from '@/hooks/useGsap';
import { Moon, Sun, Globe, Loader2, AlertCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ApiError } from '@/lib/api';

const LoginScene = lazy(() => import('../components/three/LoginScene'));

const DEMO_ACCOUNTS = [
  { label: 'دخول كمالك', email: 'owner@demo.local' },
  { label: 'دخول كمدير', email: 'admin@demo.local' },
  { label: 'دخول ككاشير', email: 'cashier@demo.local' },
  { label: 'دخول كمدير مخازن', email: 'inventory@demo.local' },
];

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { theme, setTheme } = useTheme();
  const formRef = useStaggerFadeIn('.form-item', 0.1, 0.2);
  const [email, setEmail] = useState('owner@demo.local');
  const [password, setPassword] = useState('Demo@12345');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const doLogin = async (loginEmail: string, loginPassword: string) => {
    setError('');
    setIsLoading(true);
    try {
      const info = await login(loginEmail, loginPassword);
      if (info.tenantStatus === 'suspended') {
        setLocation('/store-suspended');
      } else if (info.isTrialExpired) {
        setLocation('/trial-expired');
      } else {
        setLocation('/branch-selection');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('تعذر الاتصال بالخادم، حاول مجدداً');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    doLogin(email, password);
  };

  const handleDemoLogin = (demoEmail: string) => doLogin(demoEmail, 'Demo@12345');

  return (
    <div className="flex w-full min-h-screen bg-background" dir="rtl">
      {/* Left panel — 3D scene, desktop only */}
      <div className="hidden lg:flex w-1/2 bg-[#0F172A] relative flex-col items-center justify-center overflow-hidden shrink-0">
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <LoginScene />
          </Suspense>
        </div>
        <div className="absolute top-8 right-8 z-10 flex items-center gap-3 text-white">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-bold text-2xl">M</div>
          <span className="font-bold text-2xl">MarketFlow</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10 text-white px-8 pb-10">
          <h2 className="text-3xl font-extrabold mb-2 leading-tight text-center">
            نظام ERP متكامل<br />
            <span className="text-emerald-400">للسوبرماركت والبقالات</span>
          </h2>
          <p className="text-slate-300 max-w-sm mx-auto text-sm leading-relaxed mb-5 text-center">
            أدر مبيعاتك، مخزونك، موظفيك، ومشترياتك من مكان واحد — بواجهة عربية RTL احترافية.
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-5 max-w-sm mx-auto">
            {[
              { value: '33+', label: 'صفحة متخصصة' },
              { value: '26', label: 'جدول قاعدة بيانات' },
              { value: '10', label: 'أيام تجريبية مجانية' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                <p className="text-xl font-extrabold text-emerald-400">{s.value}</p>
                <p className="text-xs text-slate-300 mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              'نقطة البيع', 'إدارة المخزون', 'التقارير الذكية',
              'دعم متعدد الفروع', 'المشتريات والموردين', 'صلاحيات متقدمة',
            ].map(f => (
              <span key={f} className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium border border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-5 sm:p-8 relative min-h-screen">
        {/* Top actions */}
        <div className="absolute top-4 left-4 flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Globe className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-bold text-xl">M</div>
          <span className="font-bold text-2xl">MarketFlow</span>
        </div>

        <div className="w-full max-w-sm space-y-6" ref={formRef}>
          <div className="text-center form-item">
            <h1 className="text-2xl sm:text-3xl font-bold">تسجيل الدخول</h1>
            <p className="text-muted-foreground mt-1.5 text-sm">أدخل بيانات اعتمادك للوصول إلى النظام</p>
          </div>

          <Card className="form-item border shadow-lg">
            <CardContent className="pt-5 pb-5 space-y-4">
              {error && (
                <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="owner@demo.local"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <span className="text-xs text-muted-foreground">كلمة المرور التجريبية: Demo@12345</span>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                  دخول إلى النظام
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Register store */}
          <div className="form-item text-center text-sm text-muted-foreground">
            ليس لديك حساب؟{' '}
            <Link href="/register-store" className="text-primary font-medium hover:underline">
              سجّل متجرك مجاناً
            </Link>
          </div>

          {/* Demo quick-login */}
          <div className="form-item space-y-3 pt-4 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">دخول سريع للتجربة (Demo)</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map(({ label, email: demoEmail }) => (
                <Button
                  key={demoEmail}
                  variant="outline"
                  size="sm"
                  className="text-xs h-9"
                  onClick={() => handleDemoLogin(demoEmail)}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-3 w-3 animate-spin ml-1" /> : null}
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
