import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { SuperAdminProvider, useSuperAdmin } from '@/hooks/useSuperAdmin';
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Store, Users, CreditCard, Clock, TrendingUp, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

function DashboardContent() {
  const [, navigate] = useLocation();
  const { admin, token, isLoading: authLoading } = useSuperAdmin();

  useEffect(() => {
    if (!authLoading && !admin) navigate('/super-admin/login');
  }, [admin, authLoading]);

  const { data: summary, isLoading } = useQuery({
    queryKey: ['sa-dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/platform/dashboard/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('فشل تحميل البيانات');
      const json = await res.json();
      return json.data;
    },
    enabled: !!token && !!admin,
  });

  const { data: stores = [], isLoading: storesLoading } = useQuery({
    queryKey: ['sa-stores-recent'],
    queryFn: async () => {
      const res = await fetch('/api/platform/stores?limit=5', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('فشل تحميل المتاجر');
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!token && !!admin,
  });

  if (authLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
    </div>
  );

  const statCards = [
    { label: 'إجمالي المتاجر', value: summary?.totalStores ?? '-', icon: Store, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'متاجر نشطة', value: summary?.activeStores ?? '-', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'فترة تجريبية', value: summary?.trialStores ?? '-', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'إجمالي المستخدمين', value: summary?.totalUsers ?? '-', icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'موقوفة', value: summary?.suspendedStores ?? '-', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'تجارب منتهية', value: summary?.expiredTrials ?? '-', icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: 'نشط', color: 'bg-green-500/20 text-green-400' },
    trial: { label: 'تجريبي', color: 'bg-blue-500/20 text-blue-400' },
    suspended: { label: 'موقوف', color: 'bg-red-500/20 text-red-400' },
    deactivated: { label: 'معطّل', color: 'bg-slate-500/20 text-slate-400' },
    expired: { label: 'منتهي', color: 'bg-yellow-500/20 text-yellow-400' },
  };

  return (
    <SuperAdminLayout title="لوحة التحكم">
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((card, i) => (
            <Card key={i} className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center mb-3`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="text-2xl font-bold text-white">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : card.value}
                </div>
                <div className="text-xs text-slate-400 mt-1">{card.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Stores */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center justify-between">
              آخر المتاجر المسجّلة
              <button onClick={() => navigate('/super-admin/stores')} className="text-xs text-red-400 hover:text-red-300 font-normal">
                عرض الكل ←
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {storesLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : stores.length === 0 ? (
              <div className="text-center py-8 text-slate-500">لا توجد متاجر بعد</div>
            ) : (
              <div className="space-y-3">
                {stores.map((store: any) => (
                  <div key={store.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-white">{store.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {store.ownerName || store.slug} •{' '}
                        {store.createdAt ? format(new Date(store.createdAt), 'dd MMM yyyy', { locale: ar }) : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {store.trialEndsAt && (
                        <span className="text-xs text-slate-400">
                          تنتهي: {format(new Date(store.trialEndsAt), 'dd MMM', { locale: ar })}
                        </span>
                      )}
                      <Badge className={`text-xs ${statusMap[store.status]?.color || 'bg-slate-700 text-slate-300'}`}>
                        {statusMap[store.status]?.label || store.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
}

export default function SuperAdminDashboardPage() {
  return (
    <SuperAdminProvider>
      <DashboardContent />
    </SuperAdminProvider>
  );
}
