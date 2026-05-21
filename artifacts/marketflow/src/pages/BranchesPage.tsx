import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { branchesApi, ApiBranch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Building2, MapPin, Phone, Loader2 } from 'lucide-react';

const empty: Partial<ApiBranch> = { name: '', city: '', address: '', phone: '' };

export default function BranchesPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ApiBranch>>(empty);
  const [isEditing, setIsEditing] = useState(false);

  const { data: branches = [], isLoading } = useQuery({ queryKey: ['branches'], queryFn: branchesApi.list });

  const createM = useMutation({ mutationFn: branchesApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches'] }); setDialogOpen(false); toast({ title: 'تم إضافة الفرع بنجاح' }); }, onError: (e: any) => toast({ title: e.message, variant: 'destructive' }) });
  const updateM = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<ApiBranch> }) => branchesApi.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches'] }); setDialogOpen(false); toast({ title: 'تم تحديث الفرع بنجاح' }); }, onError: (e: any) => toast({ title: e.message, variant: 'destructive' }) });
  const deleteM = useMutation({ mutationFn: branchesApi.delete, onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches'] }); setDeleteId(null); toast({ title: 'تم حذف الفرع بنجاح' }); }, onError: (e: any) => toast({ title: e.message, variant: 'destructive' }) });

  const openCreate = () => { setIsEditing(false); setForm(empty); setDialogOpen(true); };
  const openEdit = (b: ApiBranch) => { setIsEditing(true); setForm(b); setDialogOpen(true); };
  const handleSubmit = () => isEditing && form.id ? updateM.mutate({ id: form.id, data: form }) : createM.mutate(form);
  const isBusy = createM.isPending || updateM.isPending;

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6" dir="rtl">
        <PageHeader title="الفروع" subtitle="إدارة فروع الشركة"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'الإعدادات', href: '/settings' }, { label: 'الفروع' }]}
          actions={<Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> إضافة فرع</Button>}
        />

        {isLoading ? <div className="flex justify-center h-40 items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        : branches.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center"><Building2 className="h-6 w-6 text-muted-foreground" /></div>
            <p className="text-muted-foreground font-medium">لا توجد فروع بعد</p>
            <p className="text-sm text-muted-foreground">أضف فروعك لإدارة عملياتك في أماكن متعددة</p>
            <Button size="sm" onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />إضافة فرع</Button>
          </div>
        )
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map(b => (
              <Card key={b.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg"><Building2 className="h-5 w-5" /></div>
                    <Badge variant={b.isActive ? 'default' : 'secondary'} className="text-xs">{b.isActive ? 'نشط' : 'موقف'}</Badge>
                  </div>
                  <h3 className="font-bold text-base mb-2">{b.name}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground mb-4">
                    {b.city && <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{b.city}{b.address && ` — ${b.address}`}</div>}
                    {b.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{b.phone}</div>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(b)}><Edit className="h-3.5 w-3.5" />تعديل</Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader><DialogTitle>{isEditing ? 'تعديل الفرع' : 'إضافة فرع جديد'}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5"><Label>اسم الفرع *</Label><Input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>المدينة</Label><Input value={form.city || ''} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>العنوان</Label><Input value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>رقم الهاتف</Label><Input value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
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
            <AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف هذا الفرع؟</AlertDialogDescription></AlertDialogHeader>
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
