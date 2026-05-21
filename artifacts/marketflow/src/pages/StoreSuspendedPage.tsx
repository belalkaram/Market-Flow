import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert, LogOut, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function StoreSuspendedPage() {
  const [, navigate] = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 dark:bg-slate-800/95">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            تم إيقاف المتجر مؤقتاً
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            تم إيقاف تشغيل متجرك من قِبل المشرف. جميع بياناتك محفوظة وآمنة. تواصل مع الدعم لإعادة التفعيل.
          </p>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mb-6 text-right">
            <p className="text-sm text-red-700 dark:text-red-400">
              إذا كنت تعتقد أن هذا خطأ أو تريد إعادة تفعيل متجرك، يرجى التواصل مع فريق الدعم فوراً.
            </p>
          </div>

          <div className="space-y-3">
            <Button className="w-full h-11 bg-red-500 hover:bg-red-600 text-white" onClick={() => window.open('mailto:support@marketflow.app')}>
              <Phone className="w-4 h-4 ml-2" />
              تواصل مع الدعم
            </Button>
            <Button variant="ghost" className="w-full text-slate-500" onClick={handleLogout}>
              <LogOut className="w-4 h-4 ml-2" />
              تسجيل الخروج
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
