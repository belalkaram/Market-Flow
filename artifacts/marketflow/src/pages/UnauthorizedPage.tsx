import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground" dir="rtl">
      <ShieldAlert className="w-24 h-24 text-destructive mb-8 animate-in zoom-in duration-500" />
      <h1 className="text-4xl font-bold mb-4">تم رفض الوصول</h1>
      <p className="text-xl text-muted-foreground mb-8">ليس لديك صلاحية للوصول إلى هذه الصفحة.</p>
      <Button asChild size="lg">
        <Link href="/dashboard">العودة للرئيسية</Link>
      </Button>
    </div>
  );
}
