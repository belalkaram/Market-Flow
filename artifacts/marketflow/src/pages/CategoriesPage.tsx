import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, GripVertical, Edit, Trash2, Loader2, Tag } from 'lucide-react';
import { categoriesApi, ApiCategory } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useStaggerFadeIn } from '@/hooks/useGsap';

const empty: Partial<ApiCategory> = { name: '', icon: 'Tag' };

export default function CategoriesPage() {
  const containerRef = useStaggerFadeIn('.category-item', 0.05);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ApiCategory>>(empty);
  const [isEditing, setIsEditing] = useState(false);

  const { data: categories = [], isLoading } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });

  const createM = useMutation({ mutationFn: categoriesApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setDialogOpen(false); toast({ title: 'تم إضافة الفئة بنجاح' }); }, onError: (e: any) => toast({ title: e.message, variant: 'destructive' }) });
  const updateM = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<ApiCategory> }) => categoriesApi.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setDialogOpen(false); toast({ title: 'تم تحديث الفئة بنجاح' }); }, onError: (e: any) => toast({ title: e.message, variant: 'destructive' }) });
  const deleteM = useMutation({ mutationFn: categoriesApi.delete, onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setDeleteId(null); toast({ title: 'تم حذف الفئة بنجاح' }); }, onError: (e: any) => toast({ title: e.message, variant: 'destructive' }) });

  const openCreate = () => { setIsEditing(false); setForm(empty); setDialogOpen(true); };
  const openEdit = (c: ApiCategory) => { setIsEditing(true); setForm(c); setDialogOpen(true); };
  const handleSubmit = () => isEditing && form.id ? updateM.mutate({ id: form.id, data: form }) : createM.mutate(form);
  const isBusy = createM.isPending || updateM.isPending;

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6" dir="rtl">
        <PageHeader title="التصنيفات" subtitle="إدارة تصنيفات المنتجات"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'المنتجات', href: '/products' }, { label: 'التصنيفات' }]}
          actions={<Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> إضافة تصنيف</Button>}
        />
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-4 pb-3 border-b">قائمة تصنيفات المنتجات في النظام</p>
            {isLoading ? <div className="flex justify-center h-32 items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            : categories.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center"><Tag className="h-6 w-6 text-muted-foreground" /></div>
                <p className="text-muted-foreground font-medium">لا توجد تصنيفات بعد</p>
                <p className="text-sm text-muted-foreground">أضف تصنيفات لتنظيم منتجاتك</p>
                <Button size="sm" onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />إضافة تصنيف</Button>
              </div>
            )
            : (
              <div className="space-y-2" ref={containerRef}>
                {categories.map(category => (
                  <div key={category.id} className="category-item flex items-center justify-between p-3 bg-background border rounded-md hover:border-primary transition-colors group">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-5 w-5 text-muted-foreground opacity-50 group-hover:opacity-100" />
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                        <span className="font-bold text-sm">{category.name.substring(0, 1)}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-xs text-muted-foreground">ترتيب: {category.sortOrder}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-50" onClick={() => openEdit(category)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => setDeleteId(category.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-sm" dir="rtl">
            <DialogHeader><DialogTitle>{isEditing ? 'تعديل الفئة' : 'إضافة فئة جديدة'}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5"><Label>اسم الفئة *</Label><Input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>الأيقونة</Label><Input value={form.icon || ''} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="اسم الأيقونة (Lucide)" /></div>
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
            <AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف هذه الفئة؟</AlertDialogDescription></AlertDialogHeader>
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
