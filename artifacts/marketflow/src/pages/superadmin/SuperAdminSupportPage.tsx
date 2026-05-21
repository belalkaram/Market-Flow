import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SuperAdminProvider, useSuperAdmin } from '@/hooks/useSuperAdmin';
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Loader2, Headphones, MessageSquare, RefreshCw, Search,
  TicketCheck, Clock, CheckCircle2, AlertTriangle, XCircle,
  Building2, Tag, Calendar, Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const priorityColors: Record<string, string> = {
  low: 'bg-slate-700/60 text-slate-300 border-slate-600',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
};
const priorityLabels: Record<string, string> = {
  low: 'منخفضة', medium: 'متوسطة', high: 'عالية', critical: 'حرجة',
};
const statusColors: Record<string, string> = {
  open: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  waiting_customer: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  resolved: 'bg-slate-600/40 text-slate-400 border-slate-600',
  closed: 'bg-slate-700/60 text-slate-500 border-slate-700',
};
const statusLabels: Record<string, string> = {
  open: 'مفتوحة',
  in_progress: 'قيد المعالجة',
  waiting_customer: 'انتظار العميل',
  resolved: 'محلولة',
  closed: 'مغلقة',
};
const statusIcons: Record<string, React.ReactNode> = {
  open: <TicketCheck className="h-3.5 w-3.5" />,
  in_progress: <Clock className="h-3.5 w-3.5" />,
  waiting_customer: <AlertTriangle className="h-3.5 w-3.5" />,
  resolved: <CheckCircle2 className="h-3.5 w-3.5" />,
  closed: <XCircle className="h-3.5 w-3.5" />,
};

function SupportContent() {
  const [, navigate] = useLocation();
  const { admin, token, isLoading: authLoading } = useSuperAdmin();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<any | null>(null);
  const [reply, setReply] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && !admin) navigate('/super-admin/login');
  }, [admin, authLoading]);

  const saFetch = async (path: string, opts: RequestInit = {}) => {
    const res = await fetch(`/api${path}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(opts.headers ?? {}),
      },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'حدث خطأ');
    return json.data;
  };

  const { data: tickets = [], isLoading, refetch } = useQuery({
    queryKey: ['sa-support-tickets'],
    queryFn: () => saFetch('/support-tickets'),
    enabled: !!token && !!admin,
  });

  const updateM = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      saFetch(`/support-tickets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-support-tickets'] });
      setSelected(null);
      setReply('');
    },
  });

  const handleUpdate = () => {
    if (!selected) return;
    const data: any = {};
    if (reply.trim()) data.replyMessage = reply.trim();
    if (newStatus) data.status = newStatus;
    updateM.mutate({ id: selected.id, data });
  };

  // Stats
  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((t: any) => t.status === 'open').length,
    in_progress: tickets.filter((t: any) => t.status === 'in_progress').length,
    resolved: tickets.filter((t: any) => t.status === 'resolved' || t.status === 'closed').length,
    critical: tickets.filter((t: any) => t.priority === 'critical').length,
  }), [tickets]);

  // Filtered tickets
  const filtered = useMemo(() => {
    return tickets.filter((t: any) => {
      const q = search.toLowerCase();
      const matchSearch = !q || t.title?.toLowerCase().includes(q) || t.department?.toLowerCase().includes(q) || t.storeName?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <SuperAdminLayout title="الدعم الفني">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold text-lg">تذاكر الدعم الفني</h2>
            <p className="text-slate-400 text-sm">مراجعة وإدارة تذاكر الدعم من جميع المتاجر</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetch()} className="text-slate-400 hover:text-white gap-2">
            <RefreshCw className="h-4 w-4" /> تحديث
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'إجمالي التذاكر', value: stats.total, icon: Headphones, color: 'text-slate-300', bg: 'bg-slate-800' },
            { label: 'مفتوحة', value: stats.open, icon: TicketCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'قيد المعالجة', value: stats.in_progress, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'محلولة / مغلقة', value: stats.resolved, icon: CheckCircle2, color: 'text-slate-400', bg: 'bg-slate-700/40' },
            { label: 'حرجة الأولوية', value: stats.critical, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
          ].map(s => (
            <Card key={s.label} className={`${s.bg} border-slate-800`}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                  <p className="text-xs text-slate-400 truncate">{s.label}</p>
                </div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="بحث بالعنوان أو القسم أو اسم المتجر..."
              className="pr-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44 bg-slate-800 border-slate-700 text-white">
              <Filter className="h-4 w-4 ml-1 text-slate-400" />
              <SelectValue placeholder="كل الحالات" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-white">كل الحالات</SelectItem>
              {Object.entries(statusLabels).map(([k, v]) =>
                <SelectItem key={k} value={k} className="text-white">{v}</SelectItem>
              )}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="كل الأولويات" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-white">كل الأولويات</SelectItem>
              {Object.entries(priorityLabels).map(([k, v]) =>
                <SelectItem key={k} value={k} className="text-white">{v}</SelectItem>
              )}
            </SelectContent>
          </Select>
          {(statusFilter !== 'all' || priorityFilter !== 'all' || search) && (
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white"
              onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setSearch(''); }}>
              مسح
            </Button>
          )}
        </div>

        {/* Ticket List */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center h-40 items-center">
                <Loader2 className="h-6 w-6 animate-spin text-red-500" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <Headphones className="h-10 w-10 text-slate-600 mx-auto" />
                <p className="text-slate-400">لا توجد تذاكر مطابقة</p>
                {(statusFilter !== 'all' || priorityFilter !== 'all' || search) && (
                  <p className="text-slate-600 text-xs">جرّب تغيير الفلاتر</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-800">
                    <tr className="text-right text-slate-400">
                      <th className="p-4 font-medium">العنوان</th>
                      <th className="p-4 font-medium hidden sm:table-cell">المتجر / القسم</th>
                      <th className="p-4 font-medium">الأولوية</th>
                      <th className="p-4 font-medium">الحالة</th>
                      <th className="p-4 font-medium hidden md:table-cell">التاريخ</th>
                      <th className="p-4 font-medium">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filtered.map((t: any) => (
                      <tr key={t.id} className="hover:bg-slate-800/40 cursor-pointer transition-colors" onClick={() => { setSelected(t); setNewStatus(t.status); setReply(t.replyMessage ?? ''); }}>
                        <td className="p-4 max-w-[200px]">
                          <p className="text-white font-medium truncate">{t.title}</p>
                          {t.description && (
                            <p className="text-slate-500 text-xs truncate mt-0.5">{t.description}</p>
                          )}
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          {t.storeName && (
                            <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
                              <Building2 className="h-3 w-3" />
                              <span>{t.storeName}</span>
                            </div>
                          )}
                          {t.department && (
                            <div className="flex items-center gap-1 text-slate-500 text-xs">
                              <Tag className="h-3 w-3" />
                              <span>{t.department}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColors[t.priority] ?? 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                            {priorityLabels[t.priority] ?? t.priority}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[t.status] ?? 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                            {statusIcons[t.status]}
                            {statusLabels[t.status] ?? t.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-xs hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {t.createdAt ? format(new Date(t.createdAt), 'dd/MM/yyyy', { locale: ar }) : '-'}
                          </div>
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1.5 text-xs"
                            onClick={e => {
                              e.stopPropagation();
                              setSelected(t);
                              setNewStatus(t.status);
                              setReply(t.replyMessage ?? '');
                            }}
                          >
                            <MessageSquare className="h-3.5 w-3.5" /> رد
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length > 0 && (
                  <div className="px-4 py-2.5 border-t border-slate-800 text-xs text-slate-500">
                    عرض {filtered.length} من {tickets.length} تذكرة
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reply Dialog */}
        <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-red-400" />
                الرد على التذكرة
              </DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-4">
                {/* Ticket summary */}
                <div className="bg-slate-800 rounded-xl p-4 space-y-2.5">
                  <p className="text-white font-semibold">{selected.title}</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{selected.description}</p>
                  <Separator className="bg-slate-700" />
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColors[selected.priority]}`}>
                      {priorityLabels[selected.priority]}
                    </span>
                    {selected.department && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300 border border-slate-600">
                        {selected.department}
                      </span>
                    )}
                    {selected.storeName && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300 border border-slate-600">
                        <Building2 className="h-3 w-3" />
                        {selected.storeName}
                      </span>
                    )}
                  </div>
                  {selected.createdAt && (
                    <p className="text-slate-500 text-xs flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(selected.createdAt), 'dd/MM/yyyy HH:mm', { locale: ar })}
                    </p>
                  )}
                </div>

                {/* Change status */}
                <div className="space-y-1.5">
                  <Label className="text-slate-300">تغيير الحالة</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {Object.entries(statusLabels).map(([k, v]) =>
                        <SelectItem key={k} value={k} className="text-white">{v}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reply */}
                <div className="space-y-1.5">
                  <Label className="text-slate-300">الرد على المتجر</Label>
                  <Textarea
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
                    placeholder="اكتب ردك هنا..."
                    rows={4}
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                  />
                  {selected.replyMessage && (
                    <p className="text-xs text-slate-500">
                      آخر رد: {selected.replyMessage.slice(0, 80)}{selected.replyMessage.length > 80 ? '…' : ''}
                    </p>
                  )}
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setSelected(null)}>
                إلغاء
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleUpdate}
                disabled={updateM.isPending}
              >
                {updateM.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                حفظ الرد
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SuperAdminLayout>
  );
}

export default function SuperAdminSupportPage() {
  return <SuperAdminProvider><SupportContent /></SuperAdminProvider>;
}
