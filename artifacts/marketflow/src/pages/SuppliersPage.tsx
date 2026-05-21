import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { suppliersApi, ApiSupplier } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Eye, Edit, Trash2, Phone, Mail, Star, Loader2, Truck } from 'lucide-react';

const empty: Partial<ApiSupplier> = { name: '', phone: '', email: '', address: '' };

export default function SuppliersPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ApiSupplier>>(empty);
  const [isEditing, setIsEditing] = useState(false);

  const { data: suppliers = [], isLoading } = useQuery({ queryKey: ['suppliers'], queryFn: suppliersApi.list });

  const filtered = suppliers.filter(s => !search || s.name.includes(search) || (s.phone ?? '').includes(search));

  const createM = useMutation({
    mutationFn: suppliersApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['suppliers'] }); setDialogOpen(false); toast({ title: 'تم إضافة المورد بنجاح' }); },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });
  const updateM = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApiSupplier> }) => suppliersApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['suppliers'] }); setDialogOpen(false); toast({ title: 'تم تحديث المورد بنجاح' }); },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });
  const deleteM = useMutation({
    mutationFn: suppliersApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['suppliers'] }); setDeleteId(null); toast({ title: 'تم حذف المورد بنجاح' }); },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const openCreate = () => { setIsEditing(false); setForm(empty); setDialogOpen(true); };
  const openEdit = (s: ApiSupplier) => { setIsEditing(true); setForm(s); setDialogOpen(true); };
  const handleSubmit = () => isEditing && form.id ? updateM.mutate({ id: form.id, data: form }) : createM.mutate(form);
  const isBusy = createM.isPending || updateM.isPending;

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6" dir="rtl">
        <PageHeader title="الموردون" subtitle="إدارة الموردين وطلبات الشراء"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'الموردون' }]}
          actions={<Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> إضافة مورد</Button>}
        />
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث بالاسم أو الهاتف..." className="pr-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Card>
          <CardContent className="p-0">
            {isLoading ? <div className="flex justify-center h-40 items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            : filtered.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center"><Truck className="h-6 w-6 text-muted-foreground" /></div>
                <p className="text-muted-foreground font-medium">{search ? 'لا توجد نتائج مطابقة' : 'لا يوجد موردون بعد'}</p>
                {!search && <><p className="text-sm text-muted-foreground">أضف موردينك لمتابعة طلبات الشراء</p><Button size="sm" onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />إضافة مورد</Button></>}
              </div>
            )
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/30"><tr className="text-right">
                    <th className="p-3 font-medium">المورد</th>
                    <th className="p-3 font-medium hidden sm:table-cell">التواصل</th>
                    <th className="p-3 font-medium">الرصيد</th>
                    <th className="p-3 font-medium hidden md:table-cell">التقييم</th>
                    <th className="p-3 font-medium">إجراءات</th>
                  </tr></thead>
                  <tbody className="divide-y">
                    {filtered.map(s => (
                      <tr key={s.id} className="hover:bg-muted/20">
                        <td className="p-3 font-medium">{s.name}</td>
                        <td className="p-3 hidden sm:table-cell">
                          {s.phone && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{s.phone}</div>}
                          {s.email && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{s.email}</div>}
                        </td>
                        <td className="p-3">
                          <span className={Number(s.balance) < 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                            {Math.abs(Number(s.balance)).toLocaleString('ar-SA')} {Number(s.balance) < 0 ? '(لنا)' : '(له)'}
                          </span>
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          <div className="flex items-center gap-1 text-yellow-500"><Star className="h-3.5 w-3.5 fill-current" /><span className="text-sm">{s.rating}</span></div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Link href={`/suppliers/${s.id}`}><Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button></Link>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}><Edit className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
            <DialogHeader><DialogTitle>{isEditing ? 'تعديل المورد' : 'إضافة مورد جديد'}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5"><Label>اسم المورد *</Label><Input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>رقم الهاتف</Label><Input value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>البريد الإلكتروني</Label><Input type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>العنوان</Label><Input value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
              <Button onClick={handleSubmit} disabled={isBusy || !form.name}>
                {isBusy && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                {isEditing ? 'حفظ' : 'إضافة'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف هذا المورد؟</AlertDialogDescription></AlertDialogHeader>
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
