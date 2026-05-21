import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { expensesApi, ApiExpense } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Loader2, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const EXPENSE_TYPES: Record<string, string> = {
  rent: 'إيجار', utilities: 'مرافق', salaries: 'رواتب',
  maintenance: 'صيانة', marketing: 'تسويق', other: 'أخرى',
};

const empty: Partial<ApiExpense> = {
  type: 'other', description: '', amount: '', paymentMethod: 'cash',
  expenseDate: new Date().toISOString().split('T')[0],
};

export default function ExpensesPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ApiExpense>>(empty);
  const [isEditing, setIsEditing] = useState(false);

  const { data: expenses = [], isLoading } = useQuery({ queryKey: ['expenses'], queryFn: expensesApi.list });

  const createM = useMutation({ mutationFn: expensesApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); setDialogOpen(false); toast({ title: 'تم تسجيل المصروف بنجاح' }); }, onError: (e: any) => toast({ title: e.message, variant: 'destructive' }) });
  const updateM = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<ApiExpense> }) => expensesApi.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); setDialogOpen(false); toast({ title: 'تم تحديث المصروف بنجاح' }); }, onError: (e: any) => toast({ title: e.message, variant: 'destructive' }) });
  const deleteM = useMutation({ mutationFn: expensesApi.delete, onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); setDeleteId(null); toast({ title: 'تم حذف المصروف بنجاح' }); }, onError: (e: any) => toast({ title: e.message, variant: 'destructive' }) });

  const openCreate = () => { setIsEditing(false); setForm(empty); setDialogOpen(true); };
  const openEdit = (e: ApiExpense) => { setIsEditing(true); setForm(e); setDialogOpen(true); };
  const handleSubmit = () => isEditing && form.id ? updateM.mutate({ id: form.id, data: form }) : createM.mutate(form);
  const isBusy = createM.isPending || updateM.isPending;

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6" dir="rtl">
        <PageHeader title="المصروفات" subtitle={`إجمالي المصروفات: ${total.toLocaleString('ar-SA')} ر.س`}
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'المصروفات' }]}
          actions={<Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> تسجيل مصروف</Button>}
        />
        <Card>
          <CardContent className="p-0">
            {isLoading ? <div className="flex justify-center h-40 items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            : expenses.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center"><Receipt className="h-6 w-6 text-muted-foreground" /></div>
                <p className="text-muted-foreground font-medium">لا توجد مصروفات مسجلة</p>
                <p className="text-sm text-muted-foreground">ابدأ بتسجيل مصروفات متجرك لمتابعة نفقاتك</p>
                <Button size="sm" onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />تسجيل مصروف</Button>
              </div>
            )
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/30"><tr className="text-right">
                    <th className="p-3 font-medium">التاريخ</th>
                    <th className="p-3 font-medium">النوع</th>
                    <th className="p-3 font-medium hidden sm:table-cell">الوصف</th>
                    <th className="p-3 font-medium">القيمة</th>
                    <th className="p-3 font-medium hidden md:table-cell">طريقة الدفع</th>
                    <th className="p-3 font-medium">الحالة</th>
                    <th className="p-3 font-medium">إجراءات</th>
                  </tr></thead>
                  <tbody className="divide-y">
                    {expenses.map(e => (
                      <tr key={e.id} className="hover:bg-muted/20">
                        <td className="p-3 text-xs text-muted-foreground">{format(new Date(e.expenseDate), 'dd MMM yyyy', { locale: ar })}</td>
                        <td className="p-3 font-medium">{EXPENSE_TYPES[e.type] ?? e.type}</td>
                        <td className="p-3 hidden sm:table-cell text-muted-foreground">{e.description}</td>
                        <td className="p-3 font-bold text-red-600">{Number(e.amount).toLocaleString('ar-SA')} ر.س</td>
                        <td className="p-3 hidden md:table-cell text-muted-foreground">{e.paymentMethod === 'cash' ? 'نقدي' : e.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : e.paymentMethod}</td>
                        <td className="p-3">
                          <Badge variant={e.isApproved ? 'default' : 'secondary'} className="text-xs">{e.isApproved ? 'معتمد' : 'قيد المراجعة'}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(e)}><Edit className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(e.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader><DialogTitle>{isEditing ? 'تعديل المصروف' : 'تسجيل مصروف جديد'}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label>نوع المصروف *</Label>
                <Select value={form.type || 'other'} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(EXPENSE_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>الوصف *</Label><Input value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>المبلغ *</Label><Input type="number" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
              <div className="space-y-1.5">
                <Label>طريقة الدفع</Label>
                <Select value={form.paymentMethod || 'cash'} onValueChange={v => setForm(f => ({ ...f, paymentMethod: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                    <SelectItem value="card">بطاقة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>تاريخ المصروف</Label><Input type="date" value={form.expenseDate?.split('T')[0] || ''} onChange={e => setForm(f => ({ ...f, expenseDate: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
              <Button onClick={handleSubmit} disabled={isBusy || !form.description || !form.amount}>
                {isBusy && <Loader2 className="h-4 w-4 animate-spin ml-2" />}{isEditing ? 'حفظ' : 'تسجيل'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف هذا المصروف؟</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteId && deleteM.mutate(deleteId)}>حذف</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
