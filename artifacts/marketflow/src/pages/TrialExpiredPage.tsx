import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, LogOut, CreditCard, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function TrialExpiredPage() {
  const [, navigate] = useLocation();
  const { logout, currentUser } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-950 to-slate-900 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 dark:bg-slate-800/95">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            انتهت فترة التجربة المجانية
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-2">
            مرحباً {currentUser?.name}،
          </p>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            انتهت فترة التجربة المجانية لمتجرك. يرجى الترقية إلى خطة مدفوعة للاستمرار في استخدام النظام.
          </p>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 mb-6 text-right">
            <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">لماذا الترقية؟</h3>
            <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-400">
              <li>✓ إدارة غير محدودة للمنتجات والمخزون</li>
              <li>✓ تقارير متقدمة وتحليلات مفصّلة</li>
              <li>✓ دعم فني على مدار الساعة</li>
              <li>✓ نسخ احتياطية يومية تلقائية</li>
              <li>✓ صلاحيات مخصصة لكل موظف</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white" onClick={() => navigate('/settings/billing')}>
              <CreditCard className="w-4 h-4 ml-2" />
              الترقية الآن
            </Button>
            <Button variant="outline" className="w-full" onClick={() => window.open('mailto:support@marketflow.app')}>
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
