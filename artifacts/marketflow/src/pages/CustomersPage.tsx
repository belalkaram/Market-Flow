import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { customersApi, ApiCustomer } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, Phone, Star, Loader2 } from 'lucide-react';

const empty: Partial<ApiCustomer> = { name: '', phone: '', email: '' };

export default function CustomersPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ApiCustomer>>(empty);
  const [isEditing, setIsEditing] = useState(false);

  const { data: customers = [], isLoading } = useQuery({ queryKey: ['customers'], queryFn: customersApi.list });
  const filtered = customers.filter(c => !search || c.name.includes(search) || (c.phone ?? '').includes(search));

  const createM = useMutation({ mutationFn: customersApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); setDialogOpen(false); toast({ title: 'تم إضافة العميل بنجاح' }); }, onError: (e: any) => toast({ title: e.message, variant: 'destructive' }) });
  const updateM = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<ApiCustomer> }) => customersApi.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); setDialogOpen(false); toast({ title: 'تم تحديث بيانات العميل' }); }, onError: (e: any) => toast({ title: e.message, variant: 'destructive' }) });
  const deleteM = useMutation({ mutationFn: customersApi.delete, onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); setDeleteId(null); toast({ title: 'تم حذف العميل بنجاح' }); }, onError: (e: any) => toast({ title: e.message, variant: 'destructive' }) });

  const openCreate = () => { setIsEditing(false); setForm(empty); setDialogOpen(true); };
  const openEdit = (c: ApiCustomer) => { setIsEditing(true); setForm(c); setDialogOpen(true); };
  const handleSubmit = () => isEditing && form.id ? updateM.mutate({ id: form.id, data: form }) : createM.mutate(form);
  const isBusy = createM.isPending || updateM.isPending;

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6" dir="rtl">
        <PageHeader title="العملاء" subtitle="إدارة قاعدة عملائك وبرنامج الولاء"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'العملاء' }]}
          actions={<Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> إضافة عميل</Button>}
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
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center"><Star className="h-6 w-6 text-muted-foreground" /></div>
                <p className="text-muted-foreground font-medium">{search ? 'لا توجد نتائج مطابقة' : 'لا يوجد عملاء بعد'}</p>
                {!search && <><p className="text-sm text-muted-foreground">ابدأ ببناء قاعدة عملائك</p><Button size="sm" onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />إضافة عميل</Button></>}
              </div>
            )
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/30"><tr className="text-right">
                    <th className="p-3 font-medium">العميل</th>
                    <th className="p-3 font-medium hidden sm:table-cell">الهاتف</th>
                    <th className="p-3 font-medium">إجمالي المشتريات</th>
                    <th className="p-3 font-medium hidden md:table-cell">نقاط الولاء</th>
                    <th className="p-3 font-medium">إجراءات</th>
                  </tr></thead>
                  <tbody className="divide-y">
                    {filtered.map(c => (
                      <tr key={c.id} className="hover:bg-muted/20">
                        <td className="p-3 font-medium">{c.name}</td>
                        <td className="p-3 hidden sm:table-cell">
                          {c.phone && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{c.phone}</div>}
                        </td>
                        <td className="p-3 font-bold text-primary">{Number(c.totalPurchases).toLocaleString('ar-SA')} ر.س</td>
                        <td className="p-3 hidden md:table-cell">
                          <div className="flex items-center gap-1 text-yellow-500"><Star className="h-3.5 w-3.5 fill-current" /><span className="text-sm font-bold">{c.loyaltyPoints}</span></div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Edit className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
            <DialogHeader><DialogTitle>{isEditing ? 'تعديل العميل' : 'إضافة عميل جديد'}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5"><Label>اسم العميل *</Label><Input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>رقم الهاتف</Label><Input value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>البريد الإلكتروني</Label><Input type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
              <Button onClick={handleSubmit} disabled={isBusy || !form.name}>
                {isBusy && <Loader2 className="h-4 w-4 animate-spin ml-2" />}{isEditing ? 'حفظ' : 'إضافة'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف هذا العميل؟</AlertDialogDescription></AlertDialogHeader>
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
