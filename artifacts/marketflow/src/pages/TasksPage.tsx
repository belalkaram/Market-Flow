import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { tasksApi, usersApi, ApiTask, ApiTaskFull } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Eye, Pencil, Trash2, Loader2, MessageSquare, CheckCircle2, Clock, Circle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const priorityMap: Record<string, { label: string; color: string }> = {
  low: { label: 'منخفضة', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  medium: { label: 'متوسطة', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
  high: { label: 'عالية', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' },
  urgent: { label: 'عاجلة', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
};

const statusConfig: Record<string, { label: string; icon: React.ComponentType<any>; color: string }> = {
  pending: { label: 'معلقة', icon: Clock, color: 'text-yellow-500' },
  in_progress: { label: 'قيد التنفيذ', icon: Circle, color: 'text-blue-500' },
  done: { label: 'منجزة', icon: CheckCircle2, color: 'text-green-500' },
  cancelled: { label: 'ملغية', icon: XCircle, color: 'text-gray-400' },
};

const STATUSES = ['pending', 'in_progress', 'done', 'cancelled'] as const;

const emptyForm = { title: '', description: '', priority: 'medium', status: 'pending', assignedTo: '', dueDate: '' };

export default function TasksPage() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<ApiTask | null>(null);
  const [viewTask, setViewTask] = useState<ApiTaskFull | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiTask | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const { data: tasks = [], isLoading } = useQuery({ queryKey: ['tasks'], queryFn: tasksApi.list });
  const { data: users = [] } = useQuery({ queryKey: ['users-list'], queryFn: usersApi.list });

  const filtered = activeTab === 'all' ? tasks : tasks.filter(t => t.status === activeTab);

  const createMutation = useMutation({
    mutationFn: () => tasksApi.create({ ...form, assignedTo: form.assignedTo || undefined, dueDate: form.dueDate || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      setShowForm(false);
      setForm({ ...emptyForm });
      toast({ title: 'تم إنشاء المهمة بنجاح' });
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: () => tasksApi.update(editTask!.id, { ...form, assignedTo: form.assignedTo || undefined, dueDate: form.dueDate || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      setEditTask(null);
      toast({ title: 'تم تحديث المهمة بنجاح' });
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => tasksApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      if (viewTask) {
        setViewTask(prev => prev ? { ...prev, status: (statusMutation.variables as any).status } : null);
      }
      toast({ title: 'تم تحديث حالة المهمة' });
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      setDeleteTarget(null);
      toast({ title: 'تم حذف المهمة بنجاح' });
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const handleView = async (id: string) => {
    setViewLoading(true);
    try {
      const task = await tasksApi.get(id);
      setViewTask(task);
    } catch (e: any) {
      toast({ title: e.message, variant: 'destructive' });
    } finally {
      setViewLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!viewTask || !newComment.trim()) return;
    setCommentLoading(true);
    try {
      await tasksApi.addComment(viewTask.id, newComment.trim());
      const updated = await tasksApi.get(viewTask.id);
      setViewTask(updated);
      setNewComment('');
      qc.invalidateQueries({ queryKey: ['tasks'] });
    } catch (e: any) {
      toast({ title: e.message, variant: 'destructive' });
    } finally {
      setCommentLoading(false);
    }
  };

  const openEdit = (task: ApiTask) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo ?? '',
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    });
  };

  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
    cancelled: tasks.filter(t => t.status === 'cancelled').length,
  };

  const FormDialog = ({ open, onClose, isEdit }: { open: boolean; onClose: () => void; isEdit: boolean }) => (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader><DialogTitle>{isEdit ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>عنوان المهمة <span className="text-destructive">*</span></Label>
            <Input placeholder="أدخل عنوان المهمة" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>الوصف</Label>
            <Textarea placeholder="وصف تفصيلي للمهمة..." rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>الأولوية</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفضة</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                  <SelectItem value="urgent">عاجلة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>الحالة</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{statusConfig[s].label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>تعيين إلى</Label>
              <Select value={form.assignedTo || 'unassigned'} onValueChange={v => setForm(f => ({ ...f, assignedTo: v === 'unassigned' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="اختر موظفاً" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">غير محدد</SelectItem>
                  {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>تاريخ الاستحقاق</Label>
              <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>
        </div>
        <DialogFooter className="flex-row-reverse gap-2 mt-2">
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button
            disabled={!form.title.trim() || (isEdit ? updateMutation.isPending : createMutation.isPending)}
            onClick={() => isEdit ? updateMutation.mutate() : createMutation.mutate()}
          >
            {(isEdit ? updateMutation.isPending : createMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
            {isEdit ? 'حفظ التعديلات' : 'إنشاء المهمة'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6" dir="rtl">
        <PageHeader
          title="المهام"
          subtitle={`${counts.pending} مهمة معلقة · ${counts.in_progress} قيد التنفيذ`}
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'المهام' }]}
          action={<Button onClick={() => { setForm({ ...emptyForm }); setShowForm(true); }}><Plus className="h-4 w-4 ml-1" />مهمة جديدة</Button>}
        />

        {/* Status Tabs */}
        <div className="flex gap-2 flex-wrap">
          {([
            { key: 'all', label: 'الكل', count: counts.all },
            { key: 'pending', label: 'معلقة', count: counts.pending },
            { key: 'in_progress', label: 'قيد التنفيذ', count: counts.in_progress },
            { key: 'done', label: 'منجزة', count: counts.done },
            { key: 'cancelled', label: 'ملغية', count: counts.cancelled },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white/20' : 'bg-background'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center h-40 items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">لا توجد مهام في هذه الفئة</div>
            ) : (
              <div className="divide-y">
                {filtered.map(task => {
                  const pri = priorityMap[task.priority] ?? { label: task.priority, color: 'bg-gray-100 text-gray-700' };
                  const st = statusConfig[task.status] ?? { label: task.status, icon: Circle, color: 'text-gray-400' };
                  const StatusIcon = st.icon;
                  const isOverdue = task.dueDate && task.status !== 'done' && task.status !== 'cancelled' && new Date(task.dueDate) < new Date();
                  return (
                    <div key={task.id} className="flex items-start gap-3 p-4 hover:bg-muted/20">
                      <StatusIcon className={`h-5 w-5 mt-0.5 shrink-0 ${st.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{task.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pri.color}`}>{pri.label}</span>
                          {isOverdue && <span className="text-xs text-red-500 font-medium">متأخرة!</span>}
                        </div>
                        {task.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>}
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          {task.assigneeName && <span>↳ {task.assigneeName}</span>}
                          {task.dueDate && (
                            <span className={isOverdue ? 'text-red-500' : ''}>
                              {format(new Date(task.dueDate), 'dd MMM yyyy', { locale: ar })}
                            </span>
                          )}
                          <span>{format(new Date(task.createdAt), 'dd/MM/yyyy', { locale: ar })}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => handleView(task.id)} title="عرض"><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(task)} title="تعديل"><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(task)} title="حذف"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Form */}
      <FormDialog open={showForm} onClose={() => setShowForm(false)} isEdit={false} />

      {/* Edit Form */}
      <FormDialog open={!!editTask} onClose={() => setEditTask(null)} isEdit={true} />

      {/* View Task Dialog */}
      <Dialog open={!!viewTask} onOpenChange={open => !open && setViewTask(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewTask && (() => { const st = statusConfig[viewTask.status]; return <st.icon className={`h-5 w-5 ${st.color}`} />; })()}
              {viewTask?.title}
            </DialogTitle>
          </DialogHeader>
          {viewTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-muted-foreground text-xs mb-1">الأولوية</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityMap[viewTask.priority]?.color}`}>
                    {priorityMap[viewTask.priority]?.label ?? viewTask.priority}
                  </span>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-muted-foreground text-xs mb-1">المسؤول</div>
                  <div className="font-medium">{viewTask.assigneeName ?? 'غير محدد'}</div>
                </div>
                {viewTask.dueDate && (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="text-muted-foreground text-xs mb-1">تاريخ الاستحقاق</div>
                    <div className="font-medium">{format(new Date(viewTask.dueDate), 'dd/MM/yyyy', { locale: ar })}</div>
                  </div>
                )}
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-muted-foreground text-xs mb-1">تاريخ الإنشاء</div>
                  <div className="font-medium">{format(new Date(viewTask.createdAt), 'dd/MM/yyyy', { locale: ar })}</div>
                </div>
              </div>

              {viewTask.description && (
                <div className="bg-muted/20 rounded-lg p-3 text-sm">
                  <div className="text-muted-foreground text-xs mb-1">الوصف</div>
                  <p className="leading-relaxed">{viewTask.description}</p>
                </div>
              )}

              {/* Status Change */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">تغيير الحالة</Label>
                <div className="flex gap-2 flex-wrap">
                  {STATUSES.map(s => {
                    const cfg = statusConfig[s];
                    const Icon = cfg.icon;
                    return (
                      <Button
                        key={s} size="sm"
                        variant={viewTask.status === s ? 'default' : 'outline'}
                        className="h-8 text-xs gap-1"
                        disabled={statusMutation.isPending}
                        onClick={() => statusMutation.mutate({ id: viewTask.id, status: s })}
                      >
                        <Icon className="h-3 w-3" /> {cfg.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4" />
                  التعليقات ({viewTask.comments?.length ?? 0})
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(viewTask.comments ?? []).length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">لا توجد تعليقات بعد</p>
                  ) : (
                    (viewTask.comments ?? []).map(c => (
                      <div key={c.id} className="bg-muted/30 rounded-lg p-2.5 text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-xs">{c.userName ?? 'مستخدم'}</span>
                          <span className="text-xs text-muted-foreground">{format(new Date(c.createdAt), 'dd/MM HH:mm', { locale: ar })}</span>
                        </div>
                        <p className="text-sm">{c.comment}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="اكتب تعليقاً..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                    className="text-sm"
                  />
                  <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim() || commentLoading}>
                    {commentLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'إرسال'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المهمة</AlertDialogTitle>
            <AlertDialogDescription>
              هل تريد حذف المهمة "<strong>{deleteTarget?.title}</strong>"؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
