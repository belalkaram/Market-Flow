import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/api';
import {
  Activity, User, ShoppingCart, Package, Settings, LogIn, LogOut,
  Edit, Trash2, Plus, Eye, Search, RefreshCw, Loader2, Clock,
  CheckCircle2, XCircle, AlertTriangle, TrendingUp, Users, Monitor,
  Hash, Calendar, MapPin, FileJson, Globe
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const actionIcons: Record<string, React.ReactNode> = {
  login: <LogIn className="h-4 w-4 text-blue-500" />,
  logout: <LogOut className="h-4 w-4 text-slate-500" />,
  create: <Plus className="h-4 w-4 text-green-500" />,
  update: <Edit className="h-4 w-4 text-orange-500" />,
  delete: <Trash2 className="h-4 w-4 text-red-500" />,
  view: <Eye className="h-4 w-4 text-purple-500" />,
  sale: <ShoppingCart className="h-4 w-4 text-green-500" />,
  purchase: <Package className="h-4 w-4 text-orange-500" />,
  settings: <Settings className="h-4 w-4 text-gray-500" />,
  user: <User className="h-4 w-4 text-purple-500" />,
};

const actionLabels: Record<string, string> = {
  login: 'تسجيل دخول', logout: 'تسجيل خروج', create: 'إنشاء',
  update: 'تعديل', delete: 'حذف', view: 'عرض', sale: 'مبيعة', purchase: 'مشتريات',
};

export default function ActivityLogsPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState<any | null>(null);

  const buildQuery = () => {
    const p = new URLSearchParams();
    if (actionFilter !== 'all') p.set('action', actionFilter);
    if (dateFrom) p.set('dateFrom', dateFrom);
    if (dateTo) p.set('dateTo', dateTo);
    return `/activity-logs${p.toString() ? `?${p}` : ''}`;
  };

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['activity-logs', actionFilter, dateFrom, dateTo],
    queryFn: () => api.get<any[]>(buildQuery()),
  });

  const { data: stats } = useQuery({
    queryKey: ['activity-logs-stats'],
    queryFn: () => api.get<any>('/activity-logs/stats'),
    refetchInterval: 60000,
  });

  const filtered = search
    ? logs.filter(l =>
        l.userName?.toLowerCase().includes(search.toLowerCase()) ||
        l.details?.toLowerCase().includes(search.toLowerCase()) ||
        l.page?.toLowerCase().includes(search.toLowerCase()) ||
        l.action?.toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  return (
    <MainLayout>
      <div className="space-y-5" dir="rtl">
        <PageHeader
          title="سجل نشاط النظام"
          subtitle="مراقبة جميع العمليات في النظام"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'سجل النشاط' }]}
          actions={
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" /> تحديث
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'عمليات اليوم', value: stats?.todayTotal ?? '-', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'ناجحة', value: stats?.todaySuccess ?? '-', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
            { label: 'فاشلة', value: stats?.todayFailed ?? 0, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
            { label: 'حرجة', value: stats?.todayCritical ?? 0, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
            { label: 'أكثر موظف', value: stats?.topEmployee ?? '-', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
            { label: 'أكثر صفحة', value: stats?.topModule ?? '-', icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20' },
          ].map((s, i) => (
            <Card key={i} className={`${s.bg} border-0`}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                  <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                </div>
                <p className={`text-lg font-bold truncate ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث بالاسم أو الصفحة أو التفاصيل..." className="pr-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="كل العمليات" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل العمليات</SelectItem>
              <SelectItem value="login">تسجيل دخول</SelectItem>
              <SelectItem value="logout">تسجيل خروج</SelectItem>
              <SelectItem value="create">إنشاء</SelectItem>
              <SelectItem value="update">تعديل</SelectItem>
              <SelectItem value="delete">حذف</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" className="w-full sm:w-36" placeholder="من" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <Input type="date" className="w-full sm:w-36" placeholder="إلى" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          {(actionFilter !== 'all' || dateFrom || dateTo) && (
            <Button variant="ghost" size="sm" onClick={() => { setActionFilter('all'); setDateFrom(''); setDateTo(''); }}>
              مسح الفلاتر
            </Button>
          )}
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              السجلات ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center h-40 items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-14 space-y-2">
                <Activity className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                <p className="text-muted-foreground">لا توجد سجلات مطابقة</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/30">
                    <tr className="text-right">
                      <th className="p-3 font-medium">الوقت</th>
                      <th className="p-3 font-medium">المستخدم</th>
                      <th className="p-3 font-medium">العملية</th>
                      <th className="p-3 font-medium hidden md:table-cell">الصفحة</th>
                      <th className="p-3 font-medium hidden lg:table-cell">التفاصيل</th>
                      <th className="p-3 font-medium hidden lg:table-cell">IP</th>
                      <th className="p-3 font-medium">عرض</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map((log: any) => (
                      <tr key={log.id} className="hover:bg-muted/20 cursor-pointer" onClick={() => setSelected(log)}>
                        <td className="p-3 text-muted-foreground text-xs whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {log.createdAt ? format(new Date(log.createdAt), 'dd/MM HH:mm', { locale: ar }) : '-'}
                          </div>
                        </td>
                        <td className="p-3 font-medium">{log.userName ?? '-'}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            {actionIcons[log.action] ?? <Activity className="h-4 w-4 text-muted-foreground" />}
                            <span className="text-xs">{actionLabels[log.action] ?? log.action}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs font-mono hidden md:table-cell">{log.page ?? '-'}</td>
                        <td className="p-3 text-muted-foreground text-xs max-w-[200px] truncate hidden lg:table-cell">{log.details ?? '-'}</td>
                        <td className="p-3 text-muted-foreground text-xs font-mono hidden lg:table-cell">{log.ipAddress ?? '-'}</td>
                        <td className="p-3">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); setSelected(log); }}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5 text-primary" />
                تفاصيل سجل النشاط
              </DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">

                {/* Action header */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {actionIcons[selected.action] ?? <Activity className="h-5 w-5 text-primary" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{selected.userName ?? 'مجهول'}</p>
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      <Badge variant="secondary" className="text-xs h-5">
                        {actionLabels[selected.action] ?? selected.action}
                      </Badge>
                      {selected.page && (
                        <Badge variant="outline" className="text-xs h-5 font-mono">
                          {selected.page}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Key fields grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Calendar, label: 'التاريخ والوقت', value: selected.createdAt ? format(new Date(selected.createdAt), 'dd/MM/yyyy HH:mm:ss') : '-' },
                    { icon: MapPin, label: 'عنوان IP', value: selected.ipAddress ?? '-', mono: true },
                    { icon: User, label: 'معرّف المستخدم', value: selected.userId ? selected.userId.slice(0, 16) + '…' : '-', mono: true },
                    { icon: Hash, label: 'رقم السجل', value: selected.id ? selected.id.slice(0, 16) + '…' : '-', mono: true },
                  ].map(item => (
                    <div key={item.label} className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                      </div>
                      <p className={`text-xs font-medium break-all leading-relaxed ${item.mono ? 'font-mono' : ''}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Details block */}
                {selected.details && (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <FileJson className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">وصف العملية</p>
                    </div>
                    <p className="text-sm leading-relaxed">{selected.details}</p>
                  </div>
                )}

                {/* Metadata / JSON block */}
                {selected.metadata && (
                  <div className="bg-slate-950/5 dark:bg-white/5 rounded-lg p-3 border border-dashed">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">بيانات إضافية (JSON)</p>
                    </div>
                    <pre className="text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all">
                      {typeof selected.metadata === 'string'
                        ? selected.metadata
                        : JSON.stringify(selected.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                {/* User agent */}
                {selected.userAgent && (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">المتصفح / الجهاز</p>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground break-all leading-relaxed">
                      {selected.userAgent}
                    </p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelected(null)}>إغلاق</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
