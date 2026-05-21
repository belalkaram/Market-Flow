import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { SuperAdminProvider, useSuperAdmin } from '@/hooks/useSuperAdmin';
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Activity, Search, Filter, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

function ActivityLogsContent() {
  const [, navigate] = useLocation();
  const { admin, token, isLoading: authLoading } = useSuperAdmin();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => { if (!authLoading && !admin) navigate('/super-admin/login'); }, [admin, authLoading]);

  const buildUrl = () => {
    const q = new URLSearchParams();
    if (actionFilter !== 'all') q.set('action', actionFilter);
    if (dateFrom) q.set('dateFrom', dateFrom);
    if (dateTo) q.set('dateTo', dateTo);
    return `/api/platform/activity-logs${q.toString() ? `?${q}` : ''}`;
  };

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['sa-activity-logs', actionFilter, dateFrom, dateTo],
    queryFn: async () => {
      const res = await fetch(buildUrl(), { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'فشل تحميل السجلات');
      return json.data || [];
    },
    enabled: !!token && !!admin,
  });

  const filtered = search
    ? logs.filter((l: any) =>
        l.userName?.toLowerCase().includes(search.toLowerCase()) ||
        l.details?.toLowerCase().includes(search.toLowerCase()) ||
        l.action?.toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  const actionIcons: Record<string, string> = {
    login: '🔐', logout: '🚪', create: '➕', update: '✏️',
    delete: '🗑️', view: '👁️', export: '📤',
  };

  if (authLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>;

  return (
    <SuperAdminLayout title="سجل النشاطات">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold">سجل نشاطات المنصة</h2>
            <p className="text-slate-400 text-sm">{filtered.length} سجل</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetch()} className="text-slate-400 gap-2">
            <RefreshCw className="h-4 w-4" /> تحديث
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="بحث بالمستخدم أو العملية..."
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pr-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="العملية" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-white">كل العمليات</SelectItem>
              <SelectItem value="login" className="text-white">تسجيل دخول</SelectItem>
              <SelectItem value="create" className="text-white">إنشاء</SelectItem>
              <SelectItem value="update" className="text-white">تعديل</SelectItem>
              <SelectItem value="delete" className="text-white">حذف</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input type="date" className="bg-slate-800 border-slate-700 text-white text-xs" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center h-48 items-center"><Loader2 className="h-6 w-6 animate-spin text-red-500" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <Activity className="h-10 w-10 text-slate-600 mx-auto" />
                <p className="text-slate-400">لا توجد سجلات مطابقة</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-800">
                    <tr className="text-right text-slate-400">
                      <th className="p-4 font-medium">الوقت</th>
                      <th className="p-4 font-medium">المستخدم</th>
                      <th className="p-4 font-medium hidden md:table-cell">الصفحة</th>
                      <th className="p-4 font-medium">العملية</th>
                      <th className="p-4 font-medium hidden lg:table-cell">التفاصيل</th>
                      <th className="p-4 font-medium hidden lg:table-cell">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filtered.map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-800/40">
                        <td className="p-4 text-slate-400 text-xs whitespace-nowrap">
                          {log.createdAt ? format(new Date(log.createdAt), 'dd/MM HH:mm', { locale: ar }) : '-'}
                        </td>
                        <td className="p-4 text-white font-medium text-xs">{log.userName ?? '-'}</td>
                        <td className="p-4 text-slate-500 text-xs font-mono hidden md:table-cell">{log.page ?? '-'}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs">
                            <span>{actionIcons[log.action] ?? '📋'}</span>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-xs max-w-[200px] truncate hidden lg:table-cell">{log.details ?? '-'}</td>
                        <td className="p-4 text-slate-500 text-xs font-mono hidden lg:table-cell">{log.ipAddress ?? '-'}</td>
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

export default function SuperAdminActivityLogsPage() {
  return <SuperAdminProvider><ActivityLogsContent /></SuperAdminProvider>;
}
