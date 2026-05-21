import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SuperAdminProvider, useSuperAdmin } from '@/hooks/useSuperAdmin';
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Loader2, Search, Plus, MoreHorizontal, CheckCircle2, XCircle, Clock,
  ShieldAlert, Trash2, RotateCcw, CalendarPlus, CalendarMinus
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  active: { label: 'نشط', color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
  trial: { label: 'تجريبي', color: 'bg-blue-500/20 text-blue-400', icon: Clock },
  suspended: { label: 'موقوف', color: 'bg-red-500/20 text-red-400', icon: ShieldAlert },
  deactivated: { label: 'معطّل', color: 'bg-slate-500/20 text-slate-400', icon: XCircle },
  deleted: { label: 'محذوف', color: 'bg-rose-500/20 text-rose-400', icon: Trash2 },
};

function StoresContent() {
  const [, navigate] = useLocation();
  const { admin, token, isLoading: authLoading } = useSuperAdmin();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [trialModal, setTrialModal] = useState<{ store: any; type: 'extend' | 'reduce' } | null>(null);
  const [trialDays, setTrialDays] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ storeName: '', ownerName: '', email: '', phone: '', password: '' });

  useEffect(() => {
    if (!authLoading && !admin) navigate('/super-admin/login');
  }, [admin, authLoading]);

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['sa-stores', search, statusFilter],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (search) q.set('search', search);
      if (statusFilter !== 'all') q.set('status', statusFilter);
      const res = await fetch(`/api/platform/stores?${q}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('فشل تحميل المتاجر');
      return (await res.json()).data || [];
    },
    enabled: !!token && !!admin,
  });

  const doAction = async (storeId: string, action: string, body?: any) => {
    const res = await fetch(`/api/platform/stores/${storeId}/${action}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const j = await res.json();
      throw new Error(j.message || 'فشل العملية');
    }
  };

  const actionMutation = useMutation({
    mutationFn: ({ storeId, action, body }: { storeId: string; action: string; body?: any }) =>
      doAction(storeId, action, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-stores'] });
      toast({ title: 'تمت العملية بنجاح' });
      setTrialModal(null);
      setTrialDays('');
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/platform/stores', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'فشل الإنشاء');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-stores'] });
      toast({ title: 'تم إنشاء المتجر بنجاح' });
      setCreateModal(false);
      setCreateForm({ storeName: '', ownerName: '', email: '', phone: '', password: '' });
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  return (
    <SuperAdminLayout title="إدارة المتاجر">
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث باسم المتجر أو البريد..."
              className="pr-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="trial">تجريبي</SelectItem>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="suspended">موقوف</SelectItem>
              <SelectItem value="deactivated">معطّل</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setCreateModal(true)} className="bg-red-600 hover:bg-red-700">
            <Plus className="w-4 h-4 ml-1" /> إنشاء متجر
          </Button>
        </div>

        {/* Table */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
            ) : stores.length === 0 ? (
              <div className="text-center py-16 text-slate-500">لا توجد متاجر</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-right text-xs text-slate-400 px-4 py-3">المتجر</th>
                      <th className="text-right text-xs text-slate-400 px-4 py-3">المالك</th>
                      <th className="text-right text-xs text-slate-400 px-4 py-3">الحالة</th>
                      <th className="text-right text-xs text-slate-400 px-4 py-3">التجربة تنتهي</th>
                      <th className="text-right text-xs text-slate-400 px-4 py-3">تاريخ الإنشاء</th>
                      <th className="text-right text-xs text-slate-400 px-4 py-3">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map((store: any) => {
                      const statusInfo = STATUS_MAP[store.status] || STATUS_MAP.active;
                      return (
                        <tr key={store.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-white text-sm">{store.name}</div>
                            <div className="text-xs text-slate-500">{store.slug}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-slate-300">{store.ownerName || '—'}</div>
                            <div className="text-xs text-slate-500">{store.ownerEmail || '—'}</div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`text-xs ${statusInfo.color}`}>{statusInfo.label}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-400">
                            {store.trialEndsAt ? format(new Date(store.trialEndsAt), 'dd MMM yyyy', { locale: ar }) : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-400">
                            {store.createdAt ? format(new Date(store.createdAt), 'dd MMM yyyy', { locale: ar }) : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-700 h-8 w-8 p-0">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white" align="end">
                                {store.status !== 'active' && (
                                  <DropdownMenuItem onClick={() => actionMutation.mutate({ storeId: store.id, action: 'activate' })}
                                    className="hover:bg-slate-700 cursor-pointer">
                                    <CheckCircle2 className="w-4 h-4 ml-2 text-green-400" /> تفعيل
                                  </DropdownMenuItem>
                                )}
                                {store.status !== 'suspended' && (
                                  <DropdownMenuItem onClick={() => actionMutation.mutate({ storeId: store.id, action: 'suspend' })}
                                    className="hover:bg-slate-700 cursor-pointer">
                                    <ShieldAlert className="w-4 h-4 ml-2 text-red-400" /> إيقاف مؤقت
                                  </DropdownMenuItem>
                                )}
                                {store.status !== 'deactivated' && (
                                  <DropdownMenuItem onClick={() => actionMutation.mutate({ storeId: store.id, action: 'deactivate' })}
                                    className="hover:bg-slate-700 cursor-pointer">
                                    <XCircle className="w-4 h-4 ml-2 text-slate-400" /> تعطيل
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator className="bg-slate-700" />
                                <DropdownMenuItem onClick={() => { setTrialModal({ store, type: 'extend' }); setTrialDays(''); }}
                                  className="hover:bg-slate-700 cursor-pointer">
                                  <CalendarPlus className="w-4 h-4 ml-2 text-blue-400" /> تمديد التجربة
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setTrialModal({ store, type: 'reduce' }); setTrialDays(''); }}
                                  className="hover:bg-slate-700 cursor-pointer">
                                  <CalendarMinus className="w-4 h-4 ml-2 text-orange-400" /> تقليل التجربة
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => actionMutation.mutate({ storeId: store.id, action: 'trial/reset' })}
                                  className="hover:bg-slate-700 cursor-pointer">
                                  <RotateCcw className="w-4 h-4 ml-2 text-yellow-400" /> إعادة التجربة
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-700" />
                                {store.status === 'deleted' ? (
                                  <DropdownMenuItem onClick={() => actionMutation.mutate({ storeId: store.id, action: 'restore' })}
                                    className="hover:bg-slate-700 cursor-pointer">
                                    <RotateCcw className="w-4 h-4 ml-2 text-green-400" /> استعادة
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => actionMutation.mutate({ storeId: store.id, action: 'delete' })}
                                    className="hover:bg-slate-700 cursor-pointer text-red-400">
                                    <Trash2 className="w-4 h-4 ml-2" /> حذف
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trial modal */}
      <Dialog open={!!trialModal} onOpenChange={() => setTrialModal(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white" dir="rtl">
          <DialogHeader>
            <DialogTitle>{trialModal?.type === 'extend' ? 'تمديد التجربة' : 'تقليل التجربة'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-slate-400">
              {trialModal?.type === 'extend' ? 'أدخل عدد الأيام للتمديد' : 'أدخل عدد الأيام للتقليل'} لمتجر: <strong>{trialModal?.store?.name}</strong>
            </p>
            <div>
              <Label className="text-slate-300">عدد الأيام</Label>
              <Input
                type="number"
                min="1"
                value={trialDays}
                onChange={e => setTrialDays(e.target.value)}
                placeholder="مثال: 7"
                className="mt-1 bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrialModal(null)} className="border-slate-700 text-slate-300">إلغاء</Button>
            <Button
              disabled={!trialDays || actionMutation.isPending}
              onClick={() => {
                if (!trialModal) return;
                const action = trialModal.type === 'extend' ? 'trial/extend' : 'trial/reduce';
                actionMutation.mutate({ storeId: trialModal.store.id, action, body: { days: Number(trialDays) } });
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تأكيد'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create store modal */}
      <Dialog open={createModal} onOpenChange={setCreateModal}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white" dir="rtl">
          <DialogHeader>
            <DialogTitle>إنشاء متجر جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {(['storeName', 'ownerName', 'email', 'phone', 'password'] as const).map(field => (
              <div key={field}>
                <Label className="text-slate-300 text-sm">
                  {field === 'storeName' ? 'اسم المتجر' : field === 'ownerName' ? 'اسم المالك' : field === 'email' ? 'البريد الإلكتروني' : field === 'phone' ? 'الهاتف' : 'كلمة المرور'}
                </Label>
                <Input
                  type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                  value={createForm[field]}
                  onChange={e => setCreateForm(prev => ({ ...prev, [field]: e.target.value }))}
                  className="mt-1 bg-slate-800 border-slate-700 text-white"
                  dir={field === 'email' ? 'ltr' : 'rtl'}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModal(false)} className="border-slate-700 text-slate-300">إلغاء</Button>
            <Button
              disabled={createMutation.isPending}
              onClick={() => createMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إنشاء المتجر'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
}

export default function SuperAdminStoresPage() {
  return (
    <SuperAdminProvider>
      <StoresContent />
    </SuperAdminProvider>
  );
}
