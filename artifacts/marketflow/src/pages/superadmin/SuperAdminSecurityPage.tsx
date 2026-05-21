import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SuperAdminProvider, useSuperAdmin } from '@/hooks/useSuperAdmin';
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  ShieldAlert, AlertTriangle, Lock, Unlock, RefreshCw, Search,
  UserX, Key, Loader2, Shield, Eye, CheckCircle2, XCircle,
  Activity, Ban, LogOut
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const SEVERITY_LABELS: Record<string, string> = {
  low: 'منخفض',
  medium: 'متوسط',
  high: 'عالي',
  critical: 'حرج',
};

const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-slate-500/20 text-slate-300 border-0',
  medium: 'bg-yellow-500/20 text-yellow-300 border-0',
  high: 'bg-orange-500/20 text-orange-300 border-0',
  critical: 'bg-red-500/20 text-red-400 border-0',
};

const EVENT_LABELS: Record<string, string> = {
  login_success: 'تسجيل دخول ناجح',
  login_failed_wrong_password: 'كلمة مرور خاطئة',
  login_failed_unknown_email: 'بريد غير معروف',
  login_failed_inactive_user: 'حساب غير نشط',
  login_attempt_on_locked_account: 'محاولة على حساب مقفل',
  account_locked_brute_force: 'قفل حساب - هجوم',
  logout: 'تسجيل خروج',
  permission_denied: 'رفض صلاحية',
};

function SecurityContent() {
  const [, navigate] = useLocation();
  const { admin, token, isLoading: authLoading } = useSuperAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  useEffect(() => { if (!authLoading && !admin) navigate('/super-admin/login'); }, [admin, authLoading]);

  const headers = { Authorization: `Bearer ${token}` };

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['sa-security-stats'],
    queryFn: async () => {
      const res = await fetch('/api/platform/security/stats', { headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      return json.data;
    },
    enabled: !!token && !!admin,
    refetchInterval: 60000,
  });

  const buildLogsUrl = () => {
    const q = new URLSearchParams();
    if (severityFilter !== 'all') q.set('severity', severityFilter);
    return `/api/platform/security${q.toString() ? `?${q}` : ''}`;
  };

  const { data: logs = [], isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['sa-security-logs', severityFilter],
    queryFn: async () => {
      const res = await fetch(buildLogsUrl(), { headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      return json.data || [];
    },
    enabled: !!token && !!admin,
  });

  const { data: lockedUsers = [], refetch: refetchLocked } = useQuery({
    queryKey: ['sa-locked-users'],
    queryFn: async () => {
      const res = await fetch('/api/platform/security/locked-users', { headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      return json.data || [];
    },
    enabled: !!token && !!admin,
  });

  const unlockMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/platform/security/unlock-user/${userId}`, { method: 'POST', headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      return json.data;
    },
    onSuccess: (data) => {
      toast({ title: 'تم فتح الحساب', description: data?.message, className: 'bg-green-50 border-green-200' });
      refetchLocked();
      refetchStats();
    },
    onError: (err: any) => toast({ title: 'خطأ', description: err.message, variant: 'destructive' }),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/platform/security/force-reset-password/${userId}`, { method: 'POST', headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      return json.data;
    },
    onSuccess: (data) => {
      toast({ title: 'تم', description: data?.message, className: 'bg-blue-50 border-blue-200' });
    },
    onError: (err: any) => toast({ title: 'خطأ', description: err.message, variant: 'destructive' }),
  });

  const filteredLogs = search
    ? logs.filter((l: any) =>
        l.event?.toLowerCase().includes(search.toLowerCase()) ||
        l.ipAddress?.includes(search) ||
        EVENT_LABELS[l.event]?.includes(search)
      )
    : logs;

  if (authLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>;

  const statCards = [
    { label: 'محاولات دخول فاشلة اليوم', value: stats?.failedLoginsToday ?? 0, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'حسابات مقفلة حالياً', value: stats?.lockedAccounts ?? 0, icon: Lock, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'أحداث حرجة اليوم', value: stats?.criticalEventsToday ?? 0, icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'إجمالي أحداث الأمان اليوم', value: stats?.totalEventsToday ?? 0, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ];

  return (
    <SuperAdminLayout title="مركز الأمان">
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">مركز الأمان</h1>
              <p className="text-sm text-slate-400">مراقبة الأحداث الأمنية وإدارة الحسابات</p>
            </div>
          </div>
          <Button onClick={() => { refetchStats(); refetchLogs(); refetchLocked(); }} variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <Card key={card.label} className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">{card.label}</p>
                    <p className={`text-2xl font-bold ${card.color}`}>{statsLoading ? '...' : card.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${card.bg}`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Locked Users */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3 border-b border-slate-700">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-400" />
                الحسابات المقفلة ({lockedUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {lockedUsers.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  لا يوجد حسابات مقفلة
                </div>
              ) : (
                <div className="divide-y divide-slate-700">
                  {lockedUsers.map((u: any) => (
                    <div key={u.id} className="p-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{u.name}</p>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                        <p className="text-xs text-orange-400 mt-0.5">
                          {u.failedLoginAttempts} محاولات فاشلة
                        </p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => unlockMutation.mutate(u.id)}
                          disabled={unlockMutation.isPending}
                          className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white text-xs"
                        >
                          <Unlock className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => resetPasswordMutation.mutate(u.id)}
                          disabled={resetPasswordMutation.isPending}
                          className="h-7 px-2 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        >
                          <Key className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Critical Events */}
          <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
            <CardHeader className="pb-3 border-b border-slate-700">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                الأحداث الحرجة الأخيرة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!stats?.recentCritical?.length ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  لا توجد أحداث حرجة مؤخراً
                </div>
              ) : (
                <div className="divide-y divide-slate-700">
                  {stats.recentCritical.slice(0, 5).map((e: any) => (
                    <div key={e.id} className="p-3 flex items-start gap-3">
                      <div className="p-1.5 bg-red-500/20 rounded-lg flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white">{EVENT_LABELS[e.event] ?? e.event}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          {e.ipAddress && <span>IP: {e.ipAddress}</span>}
                          <span>{e.createdAt ? format(new Date(e.createdAt), 'dd/MM HH:mm', { locale: ar }) : ''}</span>
                        </div>
                      </div>
                      <Badge className={SEVERITY_COLORS[e.severity]}>{SEVERITY_LABELS[e.severity]}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Security Logs Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3 border-b border-slate-700">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                سجل الأحداث الأمنية
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="بحث..."
                    className="bg-slate-700 border-slate-600 text-white pr-8 h-8 w-40 text-sm placeholder:text-slate-500"
                  />
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-300 h-8 w-32 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all" className="text-slate-300">الكل</SelectItem>
                    <SelectItem value="low" className="text-slate-300">منخفض</SelectItem>
                    <SelectItem value="medium" className="text-slate-300">متوسط</SelectItem>
                    <SelectItem value="high" className="text-slate-300">عالي</SelectItem>
                    <SelectItem value="critical" className="text-slate-300">حرج</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {logsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Shield className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                <p>لا توجد أحداث أمنية</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-xs">
                      <th className="text-right px-4 py-2 font-medium">الحدث</th>
                      <th className="text-right px-4 py-2 font-medium">الخطورة</th>
                      <th className="text-right px-4 py-2 font-medium">IP</th>
                      <th className="text-right px-4 py-2 font-medium">التوقيت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredLogs.slice(0, 50).map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-2.5 text-white">
                          {EVENT_LABELS[log.event] ?? log.event}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge className={SEVERITY_COLORS[log.severity] ?? SEVERITY_COLORS.low}>
                            {SEVERITY_LABELS[log.severity] ?? log.severity}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-slate-400 font-mono text-xs">
                          {log.ipAddress ?? '-'}
                        </td>
                        <td className="px-4 py-2.5 text-slate-400 text-xs">
                          {log.createdAt ? format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm', { locale: ar }) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
}

export default function SuperAdminSecurityPage() {
  return (
    <SuperAdminProvider>
      <SecurityContent />
    </SuperAdminProvider>
  );
}
