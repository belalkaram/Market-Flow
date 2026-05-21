import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { suppliersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, Star, Edit, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: supplier, isLoading } = useQuery({
    queryKey: ['supplier', id],
    queryFn: () => suppliersApi.get(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!supplier) {
    return (
      <MainLayout>
        <div className="text-center py-16 text-muted-foreground" dir="rtl">المورد غير موجود</div>
      </MainLayout>
    );
  }

  const recentOrders = (supplier as any).recentOrders ?? [];

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6" dir="rtl">
        <PageHeader
          title={`تفاصيل المورد: ${supplier.name}`}
          subtitle="بيانات المورد وسجل أوامر الشراء"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'الموردون', href: '/suppliers' }, { label: supplier.name }]}
          actions={
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" /> تعديل
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center pb-6 border-b mb-6">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-2xl mb-4">
                  {supplier.name.substring(0, 1)}
                </div>
                <h2 className="text-xl font-bold">{supplier.name}</h2>
                {supplier.rating && (
                  <div className="flex items-center mt-2 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="ml-1 text-sm font-medium text-foreground">{supplier.rating} / 5</span>
                  </div>
                )}
                <Badge variant={supplier.isActive ? 'default' : 'secondary'} className="mt-2">
                  {supplier.isActive ? 'نشط' : 'موقف'}
                </Badge>
              </div>

              <div className="space-y-4">
                {supplier.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">رقم الهاتف</p>
                      <p className="text-sm text-muted-foreground" dir="ltr">{supplier.phone}</p>
                    </div>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">البريد الإلكتروني</p>
                      <p className="text-sm text-muted-foreground">{supplier.email}</p>
                    </div>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">العنوان</p>
                      <p className="text-sm text-muted-foreground">{supplier.address}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الرصيد المستحق</span>
                  <span className={`font-bold ${Number(supplier.balance) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {Math.abs(Number(supplier.balance)).toLocaleString('ar-SA')} ر.س
                    {Number(supplier.balance) < 0 ? ' (لنا)' : Number(supplier.balance) > 0 ? ' (له)' : ''}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            <Tabs defaultValue="orders" dir="rtl">
              <TabsList className="w-full">
                <TabsTrigger value="orders" className="flex-1">أوامر الشراء</TabsTrigger>
                <TabsTrigger value="payments" className="flex-1">سجل الدفعات</TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">أحدث أوامر الشراء</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {recentOrders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">لا توجد أوامر شراء مسجلة</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="border-b bg-muted/30">
                            <tr className="text-right">
                              <th className="p-3 font-medium">رقم الطلب</th>
                              <th className="p-3 font-medium">التاريخ</th>
                              <th className="p-3 font-medium">الإجمالي</th>
                              <th className="p-3 font-medium">الحالة</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {recentOrders.map((o: any) => (
                              <tr key={o.id} className="hover:bg-muted/20">
                                <td className="p-3 font-mono text-xs">{o.orderNumber}</td>
                                <td className="p-3 text-muted-foreground text-xs">{format(new Date(o.createdAt), 'dd MMM yyyy', { locale: ar })}</td>
                                <td className="p-3 font-bold">{Number(o.totalAmount).toLocaleString('ar-SA')} ر.س</td>
                                <td className="p-3">
                                  <Badge variant={o.status === 'received' ? 'default' : 'secondary'} className="text-xs">{o.status}</Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payments" className="mt-4">
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground text-sm">
                    سجل الدفعات غير متاح حالياً
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
