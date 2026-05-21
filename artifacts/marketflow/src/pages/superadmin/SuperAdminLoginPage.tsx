import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SuperAdminProvider, useSuperAdmin } from '@/hooks/useSuperAdmin';
import { Shield, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

function LoginForm() {
  const [, navigate] = useLocation();
  const { admin, isLoading, login } = useSuperAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && admin) navigate('/super-admin/dashboard');
  }, [admin, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/super-admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-950 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Super Admin</h1>
          <p className="text-slate-400 text-sm">لوحة تحكم المنصة</p>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-center text-lg">تسجيل الدخول</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 text-center">
                  {error}
                </div>
              )}
              <div>
                <Label htmlFor="email" className="text-slate-300 text-sm">البريد الإلكتروني</Label>
                <div className="relative mt-1">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@platform.com"
                    className="pr-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    dir="ltr"
                    disabled={submitting}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password" className="text-slate-300 text-sm">كلمة المرور</Label>
                <div className="relative mt-1">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10 pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    disabled={submitting}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-11 bg-red-600 hover:bg-red-700 text-white" disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري التحقق...</> : 'دخول'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SuperAdminLoginPage() {
  return (
    <SuperAdminProvider>
      <LoginForm />
    </SuperAdminProvider>
  );
}
