import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { usersApi, rolesApi, branchesApi, ApiUser, api, ApiRole } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUrlTab } from '@/hooks/useUrlTab';
import { Plus, Search, Edit, Trash2, Shield, Loader2, Users, Settings2 } from 'lucide-react';

const empty = { name: '', email: '', password: '', phone: '', roleId: '', branchId: '' };

const ROLE_DESCRIPTIONS: Record<string, string> = {
  owner: 'وصول كامل لجميع ميزات النظام',
  admin: 'إدارة كاملة باستثناء الإعدادات الحساسة',
  branch_manager: 'إدارة فرع كامل مع المبيعات والمخزون',
  cashier: 'نقطة البيع والمبيعات والمرتجعات',
  inventory_manager: 'إدارة المخزون والمنتجات والفئات',
  purchasing_officer: 'إدارة أوامر الشراء والموردين',
  accountant: 'المبيعات والتقارير المالية والمصروفات',
  sales_rep: 'المبيعات والعملاء ونقطة البيع',
  supplier_viewer: 'عرض أوامر الشراء فقط',
};

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-700',
  admin: 'bg-blue-100 text-blue-700',
  branch_manager: 'bg-indigo-100 text-indigo-700',
  cashier: 'bg-green-100 text-green-700',
  inventory_manager: 'bg-orange-100 text-orange-700',
  purchasing_officer: 'bg-amber-100 text-amber-700',
  accountant: 'bg-teal-100 text-teal-700',
  sales_rep: 'bg-cyan-100 text-cyan-700',
  supplier_viewer: 'bg-gray-100 text-gray-700',
};

const RESOURCE_LABELS: Record<string, string> = {
  dashboard: 'الرئيسية', pos: 'نقطة البيع', products: 'المنتجات',
  categories: 'التصنيفات', inventory: 'المخزون', 'stock-movements': 'حركة المخزون',
  purchases: 'المشتريات', suppliers: 'الموردون', sales: 'المبيعات',
  returns: 'المرتجعات', customers: 'العملاء', expenses: 'المصروفات',
  accounting: 'الحسابات', reports: 'التقارير', tasks: 'المهام',
  employees: 'الموظفون', roles: 'الأدوار', branches: 'الفروع',
  notifications: 'الإشعارات', settings: 'الإعدادات', profile: 'الملف الشخصي',
  'activity-logs': 'سجل النشاط',
};

const ACTION_LABELS: Record<string, string> = {
  view: 'عرض', create: 'إضافة', update: 'تعديل', delete: 'حذف',
};

interface PermissionItem { id: string; resource: string; action: string; granted: boolean; }
interface RoleWithPerms { role: ApiRole & { isSystem?: boolean }; permissions: PermissionItem[]; }

export default function EmployeesPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [tab, setTab] = useUrlTab('employees');
  const isOwner = currentUser?.role === 'owner' || currentUser?.role === 'admin';

  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');

  const [editRole, setEditRole] = useState<(ApiRole & { userCount?: number }) | null>(null);
  const [grantedIds, setGrantedIds] = useState<Set<string>>(new Set());

  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: usersApi.list });
  const { data: roles = [], isLoading: rolesLoading } = useQuery({ queryKey: ['roles'], queryFn: () => api.get<(ApiRole & { userCount?: number })[]>('/roles') });
  const { data: branches = [] } = useQuery({ queryKey: ['branches'], queryFn: branchesApi.list });

  const { data: rolePerms, isLoading: loadingPerms } = useQuery<RoleWithPerms>({
    queryKey: ['role-permissions', editRole?.id],
    queryFn: () => api.get<RoleWithPerms>(`/roles/${editRole!.id}/permissions`),
    enabled: !!editRole,
  });

  useEffect(() => {
    if (rolePerms) {
      setGrantedIds(new Set(rolePerms.permissions.filter(p => p.granted).map(p => p.id)));
    }
  }, [rolePerms]);

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
  const updatePerms = useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
      api.put(`/roles/${roleId}/permissions`, { permissionIds }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['role-permissions'] });
      qc.invalidateQueries({ queryKey: ['user-permissions'] });
      toast({ title: 'تم تحديث الصلاحيات بنجاح' });
      setEditRole(null);
    },
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

  const canEditRole = (role: ApiRole) => isOwner && role.slug !== 'owner' && role.slug !== 'admin';

  const togglePerm = (permId: string) => {
    setGrantedIds(prev => {
      const next = new Set(prev);
      next.has(permId) ? next.delete(permId) : next.add(permId);
      return next;
    });
  };

  const grouped = rolePerms
    ? Object.entries(
        rolePerms.permissions.reduce((acc, p) => {
          (acc[p.resource] = acc[p.resource] ?? []).push(p);
          return acc;
        }, {} as Record<string, PermissionItem[]>)
      )
    : [];

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6" dir="rtl">
        <PageHeader
          title="الموظفون والصلاحيات"
          subtitle="إدارة حسابات المستخدمين والأدوار والصلاحيات"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'الموظفون' }]}
          actions={
            tab === 'employees' ? (
              <Button onClick={openCreate} className="gap-2">
                <Plus className="h-4 w-4" /> إضافة موظف
              </Button>
            ) : undefined
          }
        />

        <Tabs value={tab} onValueChange={setTab} className="w-full" dir="rtl">
          <TabsList className="mb-4">
            <TabsTrigger value="employees" className="gap-2">
              <Users className="h-4 w-4" /> الموظفين
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2">
              <Shield className="h-4 w-4" /> الأدوار والصلاحيات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <div className="space-y-4">
              <div className="relative max-w-sm">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="بحث بالاسم أو البريد..." className="pr-9" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center h-40 items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                  ) : filtered.length === 0 ? (
                    <div className="text-center py-16 space-y-3">
                      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center"><Users className="h-6 w-6 text-muted-foreground" /></div>
                      <p className="text-muted-foreground font-medium">{search ? 'لا توجد نتائج مطابقة' : 'لا يوجد موظفون بعد'}</p>
                      {!search && <><p className="text-sm text-muted-foreground">أضف موظفيك وحدد صلاحياتهم</p><Button size="sm" onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />إضافة موظف</Button></>}
                    </div>
                  ) : (
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
            </div>
          </TabsContent>

          <TabsContent value="roles">
            {rolesLoading ? (
              <div className="flex justify-center h-40 items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : roles.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">لا توجد أدوار</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map(role => (
                  <Card key={role.id} className="hover:border-primary/30 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${ROLE_COLORS[role.slug] ?? 'bg-gray-100 text-gray-600'}`}>
                            <Shield className="h-4 w-4" />
                          </div>
                          <CardTitle className="text-base">{role.name}</CardTitle>
                        </div>
                        <Badge variant="outline" className="text-xs font-mono">{role.slug}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {ROLE_DESCRIPTIONS[role.slug] ?? (role as any).description ?? 'لا يوجد وصف'}
                      </p>
                      <div className="flex items-center justify-between">
                        {role.userCount !== undefined && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            <span>{role.userCount} مستخدم</span>
                          </div>
                        )}
                        {canEditRole(role) && (
                          <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={() => { setEditRole(role); setGrantedIds(new Set()); }}>
                            <Settings2 className="h-3.5 w-3.5" /> تعديل الصلاحيات
                          </Button>
                        )}
                        {(role.slug === 'owner' || role.slug === 'admin') && (
                          <Badge className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-100">جميع الصلاحيات</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Employee Dialog */}
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
                <SelectContent>{(roles as ApiRole[]).map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
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

      {/* Permissions Edit Dialog */}
      <Dialog open={!!editRole} onOpenChange={o => { if (!o) setEditRole(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل صلاحيات — {editRole?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-1">
            {loadingPerms ? (
              <div className="flex justify-center h-40 items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <div className="space-y-4">
                {grouped.map(([resource, perms]) => (
                  <div key={resource} className="border rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2.5 text-foreground">{RESOURCE_LABELS[resource] ?? resource}</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['view', 'create', 'update', 'delete'] as const).map(action => {
                        const perm = perms.find(p => p.action === action);
                        if (!perm) return null;
                        return (
                          <label key={action} className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                            <Checkbox checked={grantedIds.has(perm.id)} onCheckedChange={() => togglePerm(perm.id)} />
                            {ACTION_LABELS[action]}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="pt-4 border-t gap-2">
            <Button variant="outline" onClick={() => setEditRole(null)}>إلغاء</Button>
            <Button
              onClick={() => editRole && updatePerms.mutate({ roleId: editRole.id, permissionIds: [...grantedIds] })}
              disabled={updatePerms.isPending || loadingPerms}
            >
              {updatePerms.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              حفظ الصلاحيات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
