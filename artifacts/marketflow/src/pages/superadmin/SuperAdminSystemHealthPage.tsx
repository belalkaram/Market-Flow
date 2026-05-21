import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { SuperAdminProvider, useSuperAdmin } from '@/hooks/useSuperAdmin';
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Loader2, Server, Database, HardDrive, Bell, Users, Store,
  Activity, CheckCircle2, XCircle, Clock, RefreshCw, Cpu, MemoryStick
} from 'lucide-react';

function SystemHealthContent() {
  const [, navigate] = useLocation();
  const { admin, token, isLoading: authLoading } = useSuperAdmin();

  useEffect(() => { if (!authLoading && !admin) navigate('/super-admin/login'); }, [admin, authLoading]);

  const { data: health, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['sa-system-health'],
    queryFn: async () => {
      const res = await fetch('/api/platform/system-health', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'فشل تحميل بيانات الصحة');
      return json.data;
    },
    enabled: !!token && !!admin,
    refetchInterval: 30000,
  });

  if (authLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>;

  const statusIcon = (status: string) =>
    status === 'ok' ? <CheckCircle2 className="h-5 w-5 text-green-400" /> : <XCircle className="h-5 w-5 text-red-400" />;

  const statusBadge = (status: string) => (
    <Badge className={status === 'ok' ? 'bg-green-500/20 text-green-400 border-0' : 'bg-red-500/20 text-red-400 border-0'}>
      {status === 'ok' ? 'يعمل' : 'خطأ'}
    </Badge>
  );

  const services = [
    { icon: Server, label: 'API Server', key: 'api', detail: health?.api?.responseTime },
    { icon: Database, label: 'قاعدة البيانات', key: 'database', detail: health?.database?.responseTime },
    { icon: HardDrive, label: 'التخزين', key: 'storage', detail: health?.storage?.usage },
    { icon: Bell, label: 'الإشعارات', key: 'notifications', detail: '-' },
  ];

  const stats = [
    { icon: Store, label: 'إجمالي المتاجر', value: health?.stats?.totalStores ?? '-', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Users, label: 'إجمالي المستخدمين', value: health?.stats?.totalUsers ?? '-', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: Activity, label: 'عمليات آخر 24 ساعة', value: health?.stats?.opsLast24h ?? '-', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  return (
    <SuperAdminLayout title="صحة النظام">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold">صحة النظام والخدمات</h2>
            <p className="text-slate-400 text-sm">مراقبة حالة جميع مكونات المنصة</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching} className="text-slate-400 gap-2">
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} /> تحديث
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center h-48 items-center"><Loader2 className="h-8 w-8 animate-spin text-red-500" /></div>
        ) : (
          <>
            {/* Services Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {services.map(svc => (
                <Card key={svc.key} className="bg-slate-900 border-slate-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
                        <svc.icon className="w-4 h-4 text-slate-400" />
                      </div>
                      {statusIcon((health?.[svc.key] as any)?.status ?? 'ok')}
                    </div>
                    <p className="text-slate-400 text-xs">{svc.label}</p>
                    <div className="flex items-center justify-between mt-1">
                      {statusBadge((health?.[svc.key] as any)?.status ?? 'ok')}
                      {svc.detail && <span className="text-slate-500 text-xs">{svc.detail}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map((s, i) => (
                <Card key={i} className="bg-slate-900 border-slate-800">
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
                      <s.icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <p className="text-2xl font-bold text-white">{s.value.toLocaleString()}</p>
                    <p className="text-slate-400 text-xs mt-1">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* System Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2"><CardTitle className="text-slate-300 text-sm">معلومات الخادم</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: Clock, label: 'وقت التشغيل', value: health?.uptime ?? '-' },
                    { icon: Cpu, label: 'إصدار Node.js', value: health?.nodeVersion ?? '-' },
                    { icon: MemoryStick, label: 'استخدام الذاكرة', value: health?.memoryMB ? `${health.memoryMB} MB` : '-' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                      <div className="flex items-center gap-2 text-slate-400">
                        <item.icon className="h-4 w-4" />
                        <span className="text-xs">{item.label}</span>
                      </div>
                      <span className="text-white text-xs font-mono">{item.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2"><CardTitle className="text-slate-300 text-sm">حالة الاتصال</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: 'API', status: health?.api?.status ?? 'ok', time: health?.api?.responseTime },
                    { label: 'Database', status: health?.database?.status ?? 'ok', time: health?.database?.responseTime },
                    { label: 'Storage', status: health?.storage?.status ?? 'ok', time: null },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                      <div className="flex items-center gap-2">
                        {statusIcon(c.status)}
                        <span className="text-slate-300 text-xs">{c.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.time && <span className="text-slate-500 text-xs">{c.time}</span>}
                        {statusBadge(c.status)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </SuperAdminLayout>
  );
}

export default function SuperAdminSystemHealthPage() {
  return <SuperAdminProvider><SystemHealthContent /></SuperAdminProvider>;
}
