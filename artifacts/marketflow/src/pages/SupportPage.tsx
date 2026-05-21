import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Plus, Headphones, Clock, CheckCircle2, AlertCircle, Loader2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface SupportTicket {
  id: string;
  title: string;
  department: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  replyMessage?: string;
  createdAt: string;
  updatedAt: string;
}

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};
const priorityLabels: Record<string, string> = {
  low: 'منخفضة', medium: 'متوسطة', high: 'عالية', critical: 'حرجة',
};
const statusLabels: Record<string, string> = {
  open: 'مفتوحة', in_progress: 'قيد المعالجة',
  waiting_customer: 'انتظار العميل', resolved: 'محلولة', closed: 'مغلقة',
};
const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-orange-100 text-orange-700',
  waiting_customer: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-slate-100 text-slate-700',
};

const departments = ['POS', 'Products', 'Inventory', 'Sales', 'Returns', 'Reports', 'Employees', 'Settings', 'Other'];

const emptyForm = { title: '', department: '', description: '', priority: 'medium' as const };

export default function SupportPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [viewTicket, setViewTicket] = useState<SupportTicket | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: () => api.get<SupportTicket[]>('/support-tickets'),
  });

  const createM = useMutation({
    mutationFn: (data: typeof form) => api.post<SupportTicket>('/support-tickets', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['support-tickets'] });
      setCreateOpen(false);
      setForm(emptyForm);
      toast({ title: 'تم إرسال تذكرة الدعم بنجاح', description: 'سيتواصل معك فريق الدعم قريباً' });
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const open = tickets.filter(t => t.status === 'open').length;
  const inProgress = tickets.filter(t => t.status === 'in_progress').length;
  const resolved = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  return (
    <MainLayout>
      <div className="space-y-5" dir="rtl">
        <PageHeader
          title="الدعم الفني"
          subtitle="إنشاء وإدارة تذاكر الدعم الفني"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'الدعم الفني' }]}
          actions={
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> إنشاء تذكرة دعم
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div><p className="text-2xl font-bold text-blue-700">{open}</p><p className="text-xs text-muted-foreground">تذاكر مفتوحة</p></div>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div><p className="text-2xl font-bold text-orange-700">{inProgress}</p><p className="text-xs text-muted-foreground">قيد المعالجة</p></div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div><p className="text-2xl font-bold text-green-700">{resolved}</p><p className="text-xs text-muted-foreground">محلولة</p></div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Headphones className="h-4 w-4 text-primary" /> تذاكر الدعم ({tickets.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center h-32 items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Headphones className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">لا توجد تذاكر دعم</p>
                <p className="text-sm text-muted-foreground">أنشئ تذكرة دعم وسيتواصل معك فريقنا</p>
                <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> إنشاء أول تذكرة
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/30">
                    <tr className="text-right">
                      <th className="p-3 font-medium">العنوان</th>
                      <th className="p-3 font-medium hidden sm:table-cell">القسم</th>
                      <th className="p-3 font-medium">الأولوية</th>
                      <th className="p-3 font-medium">الحالة</th>
                      <th className="p-3 font-medium hidden md:table-cell">التاريخ</th>
                      <th className="p-3 font-medium">عرض</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {tickets.map(ticket => (
                      <tr key={ticket.id} className="hover:bg-muted/20">
                        <td className="p-3 font-medium max-w-[200px] truncate">{ticket.title}</td>
                        <td className="p-3 hidden sm:table-cell text-muted-foreground text-xs">{ticket.department}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                            {priorityLabels[ticket.priority]}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                            {statusLabels[ticket.status]}
                          </span>
                        </td>
                        <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">
                          {format(new Date(ticket.createdAt), 'dd MMM yyyy', { locale: ar })}
                        </td>
                        <td className="p-3">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewTicket(ticket)}>
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

        {/* Create Ticket Modal */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle>إنشاء تذكرة دعم جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>عنوان المشكلة *</Label>
                <Input
                  placeholder="وصف موجز للمشكلة"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>القسم المتعلق *</Label>
                  <Select value={form.department} onValueChange={v => setForm(f => ({ ...f, department: v }))}>
                    <SelectTrigger><SelectValue placeholder="اختر قسم" /></SelectTrigger>
                    <SelectContent>
                      {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>الأولوية *</Label>
                  <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">منخفضة</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="high">عالية</SelectItem>
                      <SelectItem value="critical">حرجة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>وصف المشكلة *</Label>
                <Textarea
                  placeholder="اشرح المشكلة بالتفصيل..."
                  rows={4}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">معلومات تلقائية</p>
                <p>المتجر: {currentUser?.tenantName ?? '-'}</p>
                <p>الموظف: {currentUser?.name ?? '-'} ({currentUser?.roleName ?? '-'})</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>إلغاء</Button>
              <Button
                onClick={() => createM.mutate(form)}
                disabled={createM.isPending || !form.title || !form.department || !form.description}
              >
                {createM.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                إرسال التذكرة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Ticket Modal */}
        <Dialog open={!!viewTicket} onOpenChange={o => !o && setViewTicket(null)}>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle>تفاصيل التذكرة</DialogTitle>
            </DialogHeader>
            {viewTicket && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-base">{viewTicket.title}</h3>
                  <div className="flex gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[viewTicket.priority]}`}>{priorityLabels[viewTicket.priority]}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[viewTicket.status]}`}>{statusLabels[viewTicket.status]}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">القسم:</span> <span className="font-medium">{viewTicket.department}</span></div>
                  <div><span className="text-muted-foreground">التاريخ:</span> <span className="font-medium">{format(new Date(viewTicket.createdAt), 'dd/MM/yyyy HH:mm')}</span></div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">الوصف</p>
                  <p className="text-sm">{viewTicket.description}</p>
                </div>
                {viewTicket.replyMessage && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <p className="text-xs text-emerald-700 font-medium mb-1">رد فريق الدعم</p>
                    <p className="text-sm">{viewTicket.replyMessage}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewTicket(null)}>إغلاق</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
