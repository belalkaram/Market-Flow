import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { usersApi, rolesApi, branchesApi, ApiUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, Shield, Loader2, Users } from 'lucide-react';

const empty = { name: '', email: '', password: '', phone: '', roleId: '', branchId: '' };

export default function EmployeesPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');

  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: usersApi.list });
  const { data: roles = [] } = useQuery({ queryKey: ['roles'], queryFn: rolesApi.list });
  const { data: branches = [] } = useQuery({ queryKey: ['branches'], queryFn: branchesApi.list });

  const filtered = users.filter(u => !search || u.name.includes(search) || u.email.includes(search));

  const createM = useMutation({
    mutationFn: (data: any) => usersApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setDialogOpen(false); toast({ title: 'تم إضافة الموظف بنجاح' }); },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });
  const updateM = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => usersApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setDialogOpen(false); toast({ title: 'تم تحديث بيانات الموظف' }); },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });
  const deleteM = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setDeleteId(null); toast({ title: 'تم حذف الموظف بنجاح' }); },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const openCreate = () => { setIsEditing(false); setForm(empty); setDialogOpen(true); };
  const openEdit = (u: ApiUser) => {
    setIsEditing(true); setEditId(u.id);
    setForm({ name: u.name, email: u.email, password: '', phone: u.phone ?? '', roleId: (u as any).roleId ?? '', branchId: u.branchId ?? '' });
    setDialogOpen(true);
  };
  const handleSubmit = () => {
    if (isEditing) {
      const { password, ...rest } = form;
      updateM.mutate({ id: editId, data: password ? form : rest });
    } else {
      createM.mutate(form);
    }
  };
  const isBusy = createM.isPending || updateM.isPending;

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6" dir="rtl">
        <PageHeader title="الموظفون" subtitle="إدارة حسابات المستخدمين والأدوار"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'الموظفون' }]}
          actions={<Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> إضافة موظف</Button>}
        />
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث بالاسم أو البريد..." className="pr-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Card>
          <CardContent className="p-0">
            {isLoading ? <div className="flex justify-center h-40 items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            : filtered.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center"><Users className="h-6 w-6 text-muted-foreground" /></div>
                <p className="text-muted-foreground font-medium">{search ? 'لا توجد نتائج مطابقة' : 'لا يوجد موظفون بعد'}</p>
                {!search && <><p className="text-sm text-muted-foreground">أضف موظفيك وحدد صلاحياتهم</p><Button size="sm" onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />إضافة موظف</Button></>}
              </div>
            )
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/30"><tr className="text-right">
                    <th className="p-3 font-medium">الاسم</th>
                    <th className="p-3 font-medium hidden md:table-cell">البريد الإلكتروني</th>
                    <th className="p-3 font-medium">الدور</th>
                    <th className="p-3 font-medium hidden sm:table-cell">الفرع</th>
                    <th className="p-3 font-medium">الحالة</th>
                    <th className="p-3 font-medium">إجراءات</th>
                  </tr></thead>
                  <tbody className="divide-y">
                    {filtered.map(u => (
                      <tr key={u.id} className="hover:bg-muted/20">
                        <td className="p-3">
                          <div className="font-medium">{u.name}</div>
                          <div className="text-xs text-muted-foreground md:hidden">{u.email}</div>
                        </td>
                        <td className="p-3 hidden md:table-cell text-muted-foreground">{u.email}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-primary font-medium text-xs">
                            <Shield className="h-3 w-3" />{u.roleName ?? u.role}
                          </div>
                        </td>
                        <td className="p-3 hidden sm:table-cell text-muted-foreground">{(u as any).branchName ?? '-'}</td>
                        <td className="p-3">
                          <Badge variant={u.isActive ? 'default' : 'secondary'} className="text-xs">{u.isActive ? 'نشط' : 'موقف'}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}><Edit className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(u.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
            <DialogHeader><DialogTitle>{isEditing ? 'تعديل الموظف' : 'إضافة موظف جديد'}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5"><Label>الاسم *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>البريد الإلكتروني *</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>{isEditing ? 'كلمة مرور جديدة (اتركها فارغة للإبقاء)' : 'كلمة المرور *'}</Label><Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>رقم الهاتف</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div className="space-y-1.5">
                <Label>الدور</Label>
                <Select value={form.roleId} onValueChange={v => setForm(f => ({ ...f, roleId: v }))}>
                  <SelectTrigger><SelectValue placeholder="اختر دور" /></SelectTrigger>
                  <SelectContent>{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>الفرع</Label>
                <Select value={form.branchId} onValueChange={v => setForm(f => ({ ...f, branchId: v }))}>
                  <SelectTrigger><SelectValue placeholder="اختر فرع" /></SelectTrigger>
                  <SelectContent>{branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
              <Button onClick={handleSubmit} disabled={isBusy || !form.name || !form.email || (!isEditing && !form.password)}>
                {isBusy && <Loader2 className="h-4 w-4 animate-spin ml-2" />}{isEditing ? 'حفظ' : 'إضافة'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف هذا الموظف؟</AlertDialogDescription></AlertDialogHeader>
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
