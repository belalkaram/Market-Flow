import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCheck, AlertTriangle, Info, CheckCircle, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Notification {
  id: number;
  type: 'alert' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: 1, type: 'alert', title: 'نفاد مخزون', message: 'المنتج "زيت الزيتون الفاخر" نفد مخزونه في فرع الرياض', time: new Date(Date.now() - 30 * 60000).toISOString(), read: false },
  { id: 2, type: 'warning', title: 'مخزون منخفض', message: '5 منتجات وصلت إلى الحد الأدنى للمخزون', time: new Date(Date.now() - 2 * 3600000).toISOString(), read: false },
  { id: 3, type: 'success', title: 'تمت عملية البيع', message: 'تم إتمام فاتورة رقم INV-2024-0087 بمبلغ 1,250 ر.س', time: new Date(Date.now() - 4 * 3600000).toISOString(), read: true },
  { id: 4, type: 'info', title: 'طلب شراء جديد', message: 'تم إنشاء طلب شراء PO-2024-0023 بانتظار الموافقة', time: new Date(Date.now() - 24 * 3600000).toISOString(), read: true },
  { id: 5, type: 'success', title: 'استلام بضاعة', message: 'تم استلام طلب الشراء PO-2024-0019 من مورد التوابل العربية', time: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), read: true },
  { id: 6, type: 'alert', title: 'تنبيه تاريخ انتهاء', message: '3 منتجات تاريخ انتهاء صلاحيتها خلال 30 يوم', time: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), read: true },
];

const typeIcon: Record<string, React.ReactNode> = {
  alert: <AlertTriangle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-orange-500" />,
  success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

const typeBg: Record<string, string> = {
  alert: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800',
  warning: 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800',
  success: 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800',
  info: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800',
};

function timeAgo(isoString: string): string {
  const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
  if (diff < 3600) return `منذ ${Math.round(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.round(diff / 3600)} ساعة`;
  return `منذ ${Math.round(diff / 86400)} يوم`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  const markRead = (id: number) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6 max-w-3xl mx-auto" dir="rtl">
        <PageHeader
          title="الإشعارات"
          subtitle={unread > 0 ? `${unread} إشعارات غير مقروءة` : 'جميع الإشعارات مقروءة'}
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'الإشعارات' }]}
          actions={
            unread > 0 ? (
              <Button variant="outline" onClick={markAllRead} className="gap-2">
                <CheckCheck className="h-4 w-4" /> تحديد الكل كمقروء
              </Button>
            ) : undefined
          }
        />

        {notifications.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>لا توجد إشعارات</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <Card
                key={n.id}
                className={cn('cursor-pointer transition-all hover:shadow-sm', n.read ? '' : typeBg[n.type])}
                onClick={() => markRead(n.id)}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{typeIcon[n.type]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('font-medium text-sm', !n.read && 'font-bold')}>{n.title}</p>
                      <span className="text-xs text-muted-foreground shrink-0">{timeAgo(n.time)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
