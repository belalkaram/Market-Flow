import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SuperAdminProvider, useSuperAdmin } from '@/hooks/useSuperAdmin';
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Plus, UserCheck, Shield, Power, PowerOff, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

function AdminsContent() {
  const [, navigate] = useLocation();
  const { admin, token, isLoading: authLoading } = useSuperAdmin();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [toggleId, setToggleId] = useState<{ id: string; status: string } | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => { if (!authLoading && !admin) navigate('/super-admin/login'); }, [admin, authLoading]);

  const saFetch = async (path: string, opts: RequestInit = {}) => {
    const res = await fetch(`/api/platform${path}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts.headers ?? {}) },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'حدث خطأ');
    return json.data;
  };

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['sa-admins'],
    queryFn: () => saFetch('/admins'),
    enabled: !!token && !!admin,
  });

  const createM = useMutation({
    mutationFn: (data: typeof form) => saFetch('/admins', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-admins'] }); setCreateOpen(false); setForm({ name: '', email: '', password: '' }); },
  });

  const toggleM = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      saFetch(`/admins/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-admins'] }); setToggleId(null); },
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'الاسم مطلوب';
    if (!form.email.trim()) e.email = 'البريد مطلوب';
    if (form.password.length < 8) e.password = 'كلمة المرور 8 أحرف على الأقل';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  if (authLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>;

  return (
    <SuperAdminLayout title="المشرفون">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold">مشرفو المنصة</h2>
            <p className="text-slate-400 text-sm">إدارة حسابات مشرفي السوبر أدمن</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-2 bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4" /> إضافة مشرف
          </Button>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center h-40 items-center"><Loader2 className="h-6 w-6 animate-spin text-red-500" /></div>
            ) : admins.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <Shield className="h-10 w-10 text-slate-600 mx-auto" />
                <p className="text-slate-400">لا يوجد مشرفون حتى الآن</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-800">
                    <tr className="text-right text-slate-400">
                      <th className="p-4 font-medium">الاسم</th>
                      <th className="p-4 font-medium">البريد الإلكتروني</th>
                      <th className="p-4 font-medium">الحالة</th>
                      <th className="p-4 font-medium hidden md:table-cell">تاريخ الإنشاء</th>
                      <th className="p-4 font-medium">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {admins.map((a: any) => (
                      <tr key={a.id} className="hover:bg-slate-800/40">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center">
                              <UserCheck className="h-4 w-4 text-red-400" />
                            </div>
                            <span className="text-white font-medium">{a.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-400">{a.email}</td>
                        <td className="p-4">
                          <Badge className={a.status === 'active' ? 'bg-green-500/20 text-green-400 border-0' : 'bg-slate-700 text-slate-400 border-0'}>
                            {a.status === 'active' ? 'نشط' : 'موقف'}
                          </Badge>
                        </td>
                        <td className="p-4 text-slate-400 text-xs hidden md:table-cell">
                          {a.createdAt ? format(new Date(a.createdAt), 'dd/MM/yyyy', { locale: ar }) : '-'}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`gap-1.5 text-xs ${a.status === 'active' ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                            onClick={() => setToggleId({ id: a.id, status: a.status === 'active' ? 'inactive' : 'active' })}
                          >
                            {a.status === 'active' ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                            {a.status === 'active' ? 'تعطيل' : 'تفعيل'}
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

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md" dir="rtl">
            <DialogHeader><DialogTitle className="text-white">إضافة مشرف جديد</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300">الاسم *</Label>
                <Input className="bg-slate-800 border-slate-700 text-white" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                {formErrors.name && <p className="text-xs text-red-400">{formErrors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300">البريد الإلكتروني *</Label>
                <Input type="email" className="bg-slate-800 border-slate-700 text-white" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                {formErrors.email && <p className="text-xs text-red-400">{formErrors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300">كلمة المرور *</Label>
                <div className="relative">
                  <Input type={showPass ? 'text' : 'password'} className="bg-slate-800 border-slate-700 text-white pl-10" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formErrors.password && <p className="text-xs text-red-400">{formErrors.password}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" className="text-slate-400" onClick={() => setCreateOpen(false)}>إلغاء</Button>
              <Button className="bg-red-600 hover:bg-red-700"
                disabled={createM.isPending}
                onClick={() => { if (validate()) createM.mutate(form); }}
              >
                {createM.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                إضافة المشرف
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!toggleId} onOpenChange={() => setToggleId(null)}>
          <AlertDialogContent className="bg-slate-900 border-slate-700" dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">تأكيد تغيير الحالة</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                هل تريد {toggleId?.status === 'active' ? 'تفعيل' : 'تعطيل'} هذا المشرف؟
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-800 text-slate-300 border-slate-700">إلغاء</AlertDialogCancel>
              <AlertDialogAction
                className={toggleId?.status === 'active' ? 'bg-green-600' : 'bg-red-600'}
                onClick={() => toggleId && toggleM.mutate(toggleId)}
              >
                تأكيد
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SuperAdminLayout>
  );
}

export default function SuperAdminAdminsPage() {
  return <SuperAdminProvider><AdminsContent /></SuperAdminProvider>;
}
