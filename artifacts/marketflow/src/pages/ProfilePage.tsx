import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const { currentUser, logout } = useAuth();

  if (!currentUser) return null;

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6" dir="rtl">
        <PageHeader title="الملف الشخصي" subtitle="إدارة بياناتك الشخصية وكلمة المرور"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'الملف الشخصي' }]}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="md:col-span-1">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {currentUser.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{currentUser.name}</h2>
              <Badge className="mt-2">{currentUser.roleName ?? currentUser.role}</Badge>
              {currentUser.branchName && (
                <p className="text-muted-foreground text-sm mt-2">{currentUser.branchName}</p>
              )}

              <div className="w-full mt-6 space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الحالة</span>
                  <span className="text-emerald-500 font-bold">نشط</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المستأجر</span>
                  <span className="text-xs text-muted-foreground">{currentUser.tenantName ?? 'شركة كنوز'}</span>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={logout}>
                تسجيل الخروج
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>البيانات الشخصية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الاسم بالكامل</Label>
                  <Input defaultValue={currentUser.name} readOnly className="bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label>البريد الإلكتروني</Label>
                  <Input defaultValue={currentUser.email} dir="ltr" className="text-right bg-muted/30" readOnly />
                </div>
                <div className="space-y-2">
                  <Label>رقم الهاتف</Label>
                  <Input defaultValue={currentUser.phone ?? ''} dir="ltr" className="text-right bg-muted/30" readOnly />
                </div>
                <div className="space-y-2">
                  <Label>الدور الوظيفي</Label>
                  <Input defaultValue={currentUser.roleName ?? currentUser.role} readOnly className="bg-muted/30" />
                </div>
              </div>

              <h3 className="font-bold text-lg mt-8 mb-4 border-b pb-2">تغيير كلمة المرور</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>كلمة المرور الحالية</Label>
                  <Input type="password" />
                </div>
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>كلمة المرور الجديدة</Label>
                    <Input type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label>تأكيد كلمة المرور الجديدة</Label>
                    <Input type="password" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button>حفظ التغييرات</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
