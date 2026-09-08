import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Database, CheckCircle2, AlertTriangle, CloudOff } from 'lucide-react';
import { offlineSyncManager, NetworkStatus } from '@/lib/offlineSync';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function NetworkStatusIndicator() {
  const [status, setStatus] = useState<NetworkStatus>(offlineSyncManager.getStatus());
  const [pendingCount, setPendingCount] = useState<number>(offlineSyncManager.getPendingCount());
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = offlineSyncManager.subscribe((newStatus, newPendingCount) => {
      setStatus(newStatus);
      setPendingCount(newPendingCount);
    });
    return unsubscribe;
  }, []);

  const handleSyncNow = async () => {
    setIsManualSyncing(true);
    try {
      await offlineSyncManager.syncPendingQueue();
      toast({
        title: 'تمت المزامنة بنجاح 🎉',
        description: 'تم رفع كافة البيانات والعمليات المحلية إلى السيرفر المركزي بنجاح.',
      });
    } catch (e: any) {
      toast({
        title: 'فشلت المزامنة',
        description: e?.message || 'تأكد من استقرار اتصالك بالإنترنت.',
        variant: 'destructive',
      });
    } finally {
      setIsManualSyncing(false);
    }
  };

  const toggleForceOffline = () => {
    if (status === 'offline') {
      offlineSyncManager.setOnlineManually();
      toast({ title: 'تم تفعيل الاتصال بالأونلاين', description: 'يتم الآن فحص وتحديث البيانات.' });
    } else {
      offlineSyncManager.setOfflineManually();
      toast({
        title: 'تم التبديل لوضع الأوفلاين (المحلي)',
        description: 'سيتم تخزين جميع الفواتير والعمليات في قاعدة البيانات المحلية بأمان فائق وبسرعة قصوى.',
      });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all select-none border',
            status === 'online' && pendingCount === 0 && 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
            status === 'syncing' && 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 animate-pulse',
            (status === 'offline' || pendingCount > 0) && 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
          )}
          title="حالة المزامنة والاتصال"
        >
          {status === 'online' && pendingCount === 0 && (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Wifi className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">متصل وسحابي</span>
            </>
          )}

          {status === 'syncing' && (
            <>
              <RefreshCw className="h-3.5 w-3.5 text-amber-600 animate-spin" />
              <span>جاري الرفع ({pendingCount})</span>
            </>
          )}

          {status === 'offline' && (
            <>
              <WifiOff className="h-3.5 w-3.5 text-rose-600 animate-bounce" />
              <span>أوفلاين {pendingCount > 0 ? `(${pendingCount})` : ''}</span>
            </>
          )}

          {status === 'online' && pendingCount > 0 && (
            <>
              <RefreshCw className="h-3.5 w-3.5 text-amber-600" />
              <span>معلق ({pendingCount})</span>
            </>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-4 rounded-2xl shadow-xl" align="end" dir="rtl">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <Database className="h-4.5 w-4.5 text-primary" />
              <span className="font-extrabold text-sm text-foreground">نظام المزامنة الأوفلاين</span>
            </div>
            <Badge
              variant={status === 'online' ? 'default' : 'destructive'}
              className="text-[10px] rounded-lg"
            >
              {status === 'online' ? 'متصل بالسيرفر' : status === 'syncing' ? 'جاري المزامنة...' : 'يعمل بدون إنترنت'}
            </Badge>
          </div>

          <div className="bg-muted/50 rounded-xl p-3 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">قاعدة البيانات المحلية:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> IndexedDB نشطة
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">العمليات المعلقة للرفع:</span>
              <span className={cn('font-black font-mono', pendingCount > 0 ? 'text-amber-600' : 'text-foreground')}>
                {pendingCount} عملية
              </span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            عند انقطاع الإنترنت يتم حفظ جميع الفواتير والمبيعات في التخزين المحلي فائق السرعة، وبمجرد عودة الاتصال يتم رفع البيانات تلقائياً دون أي تعطيل لسرعة البرنامج.
          </p>

          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              className="flex-1 rounded-xl text-xs font-bold gap-1.5"
              onClick={handleSyncNow}
              disabled={isManualSyncing || pendingCount === 0}
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isManualSyncing && 'animate-spin')} />
              مزامنة الآن
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl text-xs font-medium"
              onClick={toggleForceOffline}
            >
              {status === 'offline' ? 'إعادة الاتصال' : 'تجربة الأوفلاين'}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
