import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import {
  Moon, Sun, Eye, EyeOff, Loader2, AlertCircle,
  ShoppingCart, Warehouse, BarChart3, Building2, ShoppingBag, Shield,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { ApiError } from '@/lib/api';

const DEMO_ACCOUNTS = [
  { label: 'دخول كمالك',        email: 'owner@demo.local',    cls: 'border-purple-500/30 hover:border-purple-400/60 hover:bg-purple-500/10' },
  { label: 'دخول كمدير',        email: 'admin@demo.local',     cls: 'border-blue-500/30 hover:border-blue-400/60 hover:bg-blue-500/10' },
  { label: 'دخول ككاشير',       email: 'cashier@demo.local',   cls: 'border-green-500/30 hover:border-green-400/60 hover:bg-green-500/10' },
  { label: 'دخول كمدير مخازن',  email: 'inventory@demo.local', cls: 'border-orange-500/30 hover:border-orange-400/60 hover:bg-orange-500/10' },
];

const STATS = [
  { value: '33+', label: 'صفحة متخصصة' },
  { value: '26',  label: 'جدول بيانات' },
  { value: '10',  label: 'أيام تجريبية' },
];

const FEATURES = [
  { icon: ShoppingCart, label: 'نقطة البيع' },
  { icon: Warehouse,    label: 'إدارة المخزون' },
  { icon: BarChart3,    label: 'التقارير الذكية' },
  { icon: Building2,    label: 'متعدد الفروع' },
  { icon: ShoppingBag,  label: 'المشتريات والموردين' },
  { icon: Shield,       label: 'صلاحيات متقدمة' },
];

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { theme, setTheme } = useTheme();
  const [email, setEmail]       = useState('owner@demo.local');
  const [password, setPassword] = useState('Demo@12345');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');

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

  const handleLogin  = (e: React.FormEvent) => { e.preventDefault(); doLogin(email, password); };
  const handleDemo   = (demoEmail: string)   => doLogin(demoEmail, 'Demo@12345');

  return (
    <div className="flex w-full min-h-screen" dir="rtl">

      {/* ─── RIGHT PANEL — Hero ───────────────────────── */}
      <div
        className="hidden lg:flex w-[52%] relative flex-col overflow-hidden shrink-0"
        style={{ background: 'linear-gradient(145deg,#0F172A 0%,#0B2230 45%,#064E3B 100%)' }}
      >
        {/* Soft decorative blobs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-blue-500/8 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-44 h-44 rounded-full bg-emerald-400/5 blur-2xl pointer-events-none" />
        <div className="absolute top-1/4 right-1/3 w-2 h-2 rounded-full bg-emerald-400/50" />
        <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 rounded-full bg-emerald-300/35" />
        <div className="absolute top-2/3 right-1/5 w-1 h-1 rounded-full bg-white/25" />

        {/* Logo */}
        <div className="absolute top-8 right-8 flex items-center gap-3 z-10 login-fade-in" style={{ animationDelay: '0ms' }}>
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-emerald-500/30">
            M
          </div>
          <span className="font-bold text-xl text-white tracking-wide">MarketFlow</span>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-10 z-10">
          <div className="w-full max-w-md space-y-10">

            {/* Badge + Heading */}
            <div className="text-center space-y-4 login-fade-up" style={{ animationDelay: '80ms' }}>
              <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/25 rounded-full px-4 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 text-xs font-medium">نظام ERP احترافي</span>
              </div>
              <h2 className="text-[2.4rem] font-extrabold text-white leading-tight">
                نظام ERP متكامل
                <br />
                <span className="text-emerald-400">للسوبرماركت والبقالات</span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                أدر مبيعاتك، مخزونك، موظفيك، ومشترياتك من مكان واحد — بواجهة عربية RTL احترافية.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center hover:bg-white/8 hover:border-white/20 transition-colors login-fade-up"
                  style={{ animationDelay: `${200 + i * 70}ms` }}
                >
                  <p className="text-2xl font-extrabold text-emerald-400">{s.value}</p>
                  <p className="text-xs text-slate-400 mt-1 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Feature chips */}
            <div className="flex flex-wrap justify-center gap-2 login-fade-up" style={{ animationDelay: '440ms' }}>
              {FEATURES.map(f => {
                const Icon = f.icon;
                return (
                  <span
                    key={f.label}
                    className="inline-flex items-center gap-1.5 bg-white/8 backdrop-blur-sm border border-white/15 px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:border-emerald-500/40 hover:text-white transition-colors"
                  >
                    <Icon className="h-3 w-3 text-emerald-400 shrink-0" />
                    {f.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="px-8 pb-6 text-center z-10">
          <p className="text-xs text-slate-600">© 2025 MarketFlow ERP — جميع الحقوق محفوظة</p>
        </div>
      </div>

      {/* ─── LEFT PANEL — Form ────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen bg-white dark:bg-slate-900">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center font-bold text-base">M</div>
            <span className="font-bold text-lg">MarketFlow</span>
          </div>
          <div className="hidden lg:block" />
          <Button
            variant="ghost" size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-8">
          <div className="w-full max-w-[400px] space-y-6">

            {/* Heading */}
            <div className="text-center space-y-1.5 login-fade-up" style={{ animationDelay: '0ms' }}>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                تسجيل الدخول
              </h1>
              <p className="text-sm text-muted-foreground">
                أدخل بيانات اعتمادك للوصول إلى النظام
              </p>
            </div>

            {/* Login card */}
            <div
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/60 dark:shadow-slate-950/40 p-7 space-y-4 login-fade-up"
              style={{ animationDelay: '80ms' }}
            >
              {error && (
                <div className="flex items-center gap-2 text-destructive bg-destructive/8 border border-destructive/20 rounded-xl px-3.5 py-2.5 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium text-sm">
                    البريد الإلكتروني
                  </Label>
                  <Input
                    id="email" type="email" autoComplete="username"
                    placeholder="owner@demo.local"
                    value={email} onChange={e => setEmail(e.target.value)}
                    disabled={isLoading} dir="ltr"
                    className="h-11 rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 placeholder:text-slate-400 text-sm focus-visible:ring-emerald-500"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium text-sm">
                    كلمة المرور
                  </Label>
                  <div className="relative">
                    <Input
                      id="password" type={showPass ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password} onChange={e => setPassword(e.target.value)}
                      disabled={isLoading} dir="ltr"
                      className="h-11 rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 pr-4 pl-10 text-sm focus-visible:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      tabIndex={-1}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    كلمة المرور التجريبية:{' '}
                    <span className="font-mono font-medium text-slate-600 dark:text-slate-400">Demo@12345</span>
                  </p>
                </div>

                {/* Submit */}
                <Button
                  type="submit" disabled={isLoading}
                  className="w-full h-11 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md shadow-emerald-600/25 transition-all mt-1"
                >
                  {isLoading
                    ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />جارٍ الدخول...</>
                    : 'دخول إلى النظام'
                  }
                </Button>
              </form>
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-muted-foreground login-fade-up" style={{ animationDelay: '180ms' }}>
              ليس لديك حساب؟{' '}
              <Link href="/register-store" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline underline-offset-2">
                سجّل متجرك مجاناً
              </Link>
            </p>

            {/* Demo quick-login */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700 login-fade-up" style={{ animationDelay: '220ms' }}>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <p className="text-xs text-muted-foreground whitespace-nowrap">دخول سريع للتجربة</p>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map(({ label, email: demoEmail, cls }) => (
                  <button
                    key={demoEmail}
                    onClick={() => handleDemo(demoEmail)}
                    disabled={isLoading}
                    className={`border rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 transition-all duration-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-center bg-transparent ${cls}`}
                  >
                    {isLoading
                      ? <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                      : label
                    }
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-4 text-center">
          <p className="text-xs text-muted-foreground">
            للإدارة العليا:{' '}
            <Link href="/super-admin/login" className="hover:underline">Super Admin</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
