import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SuperAdminProvider, useSuperAdmin } from '@/hooks/useSuperAdmin';
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Plus, Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const emptyForm = { name: '', description: '', priceMonthly: '', priceYearly: '', currency: 'KWD', maxUsers: '10', maxBranches: '3', maxProducts: '500' };

function PlansContent() {
  const [, navigate] = useLocation();
  const { admin, token, isLoading: authLoading } = useSuperAdmin();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [formModal, setFormModal] = useState(false);
  const [editPlan, setEditPlan] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => {
    if (!authLoading && !admin) navigate('/super-admin/login');
  }, [admin, authLoading]);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['sa-plans'],
    queryFn: async () => {
      const res = await fetch('/api/platform/plans', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('فشل تحميل الخطط');
      return (await res.json()).data || [];
    },
    enabled: !!token && !!admin,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editPlan ? `/api/platform/plans/${editPlan.id}` : '/api/platform/plans';
      const method = editPlan ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'فشل الحفظ');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-plans'] });
      toast({ title: editPlan ? 'تم تحديث الخطة' : 'تم إنشاء الخطة' });
      setFormModal(false);
      setEditPlan(null);
      setForm({ ...emptyForm });
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/platform/plans/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).message || 'فشل الحذف');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-plans'] });
      toast({ title: 'تم حذف الخطة' });
      setDeleteTarget(null);
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const openCreate = () => { setEditPlan(null); setForm({ ...emptyForm }); setFormModal(true); };
  const openEdit = (plan: any) => {
    setEditPlan(plan);
    setForm({
      name: plan.name, description: plan.description || '', priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly, currency: plan.currency, maxUsers: String(plan.maxUsers),
      maxBranches: String(plan.maxBranches), maxProducts: String(plan.maxProducts),
    });
    setFormModal(true);
  };

  return (
    <SuperAdminLayout title="الخطط والباقات">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={openCreate} className="bg-red-600 hover:bg-red-700">
            <Plus className="w-4 h-4 ml-1" /> إنشاء خطة جديدة
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
        ) : plans.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="py-16 text-center text-slate-500">لا توجد خطط بعد</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan: any) => (
              <Card key={plan.id} className="bg-slate-900 border-slate-800">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-white">{plan.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{plan.description}</p>
                    </div>
                    <Badge className={plan.isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
                      {plan.isActive ? 'نشطة' : 'معطّلة'}
                    </Badge>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">شهري</span>
                      <span className="text-white font-medium">{plan.priceMonthly} {plan.currency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">سنوي</span>
                      <span className="text-white font-medium">{plan.priceYearly} {plan.currency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">مستخدمون</span>
                      <span className="text-white">{plan.maxUsers}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">فروع</span>
                      <span className="text-white">{plan.maxBranches}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">منتجات</span>
                      <span className="text-white">{plan.maxProducts}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(plan)} className="flex-1 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700">
                      <Pencil className="w-3 h-3 ml-1" /> تعديل
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteTarget(plan)} className="border-red-800 text-red-400 hover:bg-red-900/30">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Form modal */}
      <Dialog open={formModal} onOpenChange={setFormModal}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editPlan ? 'تعديل الخطة' : 'إنشاء خطة جديدة'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2">
              <Label className="text-slate-300 text-sm">اسم الخطة</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1 bg-slate-800 border-slate-700 text-white" />
            </div>
            <div className="col-span-2">
              <Label className="text-slate-300 text-sm">الوصف</Label>
              <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="mt-1 bg-slate-800 border-slate-700 text-white" />
            </div>
            {[
              { key: 'priceMonthly', label: 'السعر الشهري' },
              { key: 'priceYearly', label: 'السعر السنوي' },
              { key: 'maxUsers', label: 'الحد الأقصى للمستخدمين' },
              { key: 'maxBranches', label: 'الحد الأقصى للفروع' },
              { key: 'maxProducts', label: 'الحد الأقصى للمنتجات' },
            ].map(f => (
              <div key={f.key}>
                <Label className="text-slate-300 text-sm">{f.label}</Label>
                <Input
                  type="number"
                  value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="mt-1 bg-slate-800 border-slate-700 text-white"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormModal(false)} className="border-slate-700 text-slate-300">إلغاء</Button>
            <Button disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()} className="bg-red-600 hover:bg-red-700">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الخطة</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              هل أنت متأكد من حذف خطة "{deleteTarget?.name}"؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(deleteTarget!.id)} className="bg-red-600 hover:bg-red-700">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SuperAdminLayout>
  );
}

export default function SuperAdminPlansPage() {
  return (
    <SuperAdminProvider>
      <PlansContent />
    </SuperAdminProvider>
  );
}
