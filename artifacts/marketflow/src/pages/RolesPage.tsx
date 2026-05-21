import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { api, rolesApi, ApiRole } from '@/lib/api';
import { Shield, Loader2, Users, Settings2 } from 'lucide-react';

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

interface PermissionItem {
  id: string;
  resource: string;
  action: string;
  granted: boolean;
}

interface RoleWithPerms {
  role: ApiRole & { isSystem?: boolean };
  permissions: PermissionItem[];
}

export default function RolesPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { currentUser } = useAuth();
  const isOwner = currentUser?.role === 'owner' || currentUser?.role === 'admin';

  const [editRole, setEditRole] = useState<(ApiRole & { userCount?: number }) | null>(null);
  const [grantedIds, setGrantedIds] = useState<Set<string>>(new Set());

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.get<(ApiRole & { userCount?: number })[]>('/roles'),
  });

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

  const openEdit = (role: ApiRole & { userCount?: number }) => {
    setEditRole(role);
    setGrantedIds(new Set());
  };

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

  const canEdit = (role: ApiRole) => isOwner && role.slug !== 'owner' && role.slug !== 'admin';

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6" dir="rtl">
        <PageHeader title="الأدوار والصلاحيات" subtitle="إدارة أدوار المستخدمين والصلاحيات"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'الإعدادات', href: '/settings' }, { label: 'الأدوار' }]}
        />

        {isLoading ? (
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
                    {ROLE_DESCRIPTIONS[role.slug] ?? role.description ?? 'لا يوجد وصف'}
                  </p>
                  <div className="flex items-center justify-between">
                    {role.userCount !== undefined && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span>{role.userCount} مستخدم</span>
                      </div>
                    )}
                    {canEdit(role) && (
                      <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={() => openEdit(role)}>
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
      </div>

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
                    <h4 className="font-medium text-sm mb-2.5 text-foreground">
                      {RESOURCE_LABELS[resource] ?? resource}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['view', 'create', 'update', 'delete'] as const).map(action => {
                        const perm = perms.find(p => p.action === action);
                        if (!perm) return null;
                        return (
                          <label key={action} className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                            <Checkbox
                              checked={grantedIds.has(perm.id)}
                              onCheckedChange={() => togglePerm(perm.id)}
                            />
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
