import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { productsApi, categoriesApi, branchesApi, api, ApiProduct } from '@/lib/api';
import {
  Search, ShoppingCart, Plus, Minus, Trash2, Send, Package,
  Loader2, MessageCircle, ClipboardCheck, Phone, MapPin, User
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  maxQty: number;
}

interface CustomerForm {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerArea: string;
  notes: string;
  paymentMethod: string;
  deliveryMethod: string;
}

const emptyCustomer: CustomerForm = {
  customerName: '', customerPhone: '', customerAddress: '',
  customerArea: '', notes: '', paymentMethod: 'cash_on_delivery', deliveryMethod: 'delivery',
};

const statusLabels: Record<string, string> = {
  draft: 'مسودة', sent_to_whatsapp: 'أُرسل واتساب', confirmed: 'مؤكد',
  cancelled: 'ملغي', converted_to_sale: 'حُوّل لفاتورة',
};

const statusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  sent_to_whatsapp: 'bg-green-100 text-green-700',
  confirmed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  converted_to_sale: 'bg-purple-100 text-purple-700',
};

export default function OrderRequestPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [customer, setCustomer] = useState<CustomerForm>(emptyCustomer);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [customerErrors, setCustomerErrors] = useState<Partial<CustomerForm>>({});

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.list(),
  });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });
  const { data: branches = [] } = useQuery({ queryKey: ['branches'], queryFn: branchesApi.list });
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['order-requests'],
    queryFn: () => api.get<any[]>('/order-requests'),
  });

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (!p.isActive) return false;
      if (catFilter !== 'all' && p.categoryId !== catFilter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, catFilter, search]);

  const addToCart = (p: ApiProduct) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === p.id);
      if (existing) {
        if (existing.quantity >= p.currentStock) {
          toast({ title: 'الكمية المتاحة غير كافية', variant: 'destructive' });
          return prev;
        }
        return prev.map(i => i.productId === p.id
          ? { ...i, quantity: i.quantity + 1, totalPrice: (i.quantity + 1) * i.unitPrice }
          : i
        );
      }
      if (p.currentStock < 1) { toast({ title: 'هذا المنتج غير متاح في المخزون', variant: 'destructive' }); return prev; }
      return [...prev, {
        productId: p.id,
        productName: p.name,
        quantity: 1,
        unitPrice: Number(p.salePrice),
        totalPrice: Number(p.salePrice),
        maxQty: p.currentStock,
      }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.productId !== productId) return i;
      const newQty = Math.max(1, Math.min(i.maxQty, i.quantity + delta));
      return { ...i, quantity: newQty, totalPrice: newQty * i.unitPrice };
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  };

  const subtotal = cart.reduce((s, i) => s + i.totalPrice, 0);
  const total = subtotal - discount + deliveryFee;

  const validateCustomer = () => {
    const e: Partial<CustomerForm> = {};
    if (!customer.customerName.trim()) e.customerName = 'الاسم مطلوب';
    if (!customer.customerPhone.trim()) e.customerPhone = 'رقم الواتساب مطلوب';
    else if (customer.customerPhone.replace(/\D/g, '').length < 9) e.customerPhone = 'رقم غير صحيح';
    setCustomerErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildWhatsAppMessage = () => {
    const itemLines = cart.map(i => `• ${i.productName} × ${i.quantity} = ${(i.totalPrice).toFixed(2)} ر.س`).join('\n');
    const branchName = branches[0]?.name ?? '-';
    return `طلب جديد من متجر ${currentUser?.tenantName ?? ''}

بيانات العميل:
الاسم: ${customer.customerName}
رقم الهاتف: ${customer.customerPhone}
العنوان: ${customer.customerAddress || '-'}
المنطقة: ${customer.customerArea || '-'}

تفاصيل الطلب:
${itemLines}

الإجمالي الفرعي: ${subtotal.toFixed(2)} ر.س
الخصم: ${discount.toFixed(2)} ر.س
رسوم التوصيل: ${deliveryFee.toFixed(2)} ر.س
الإجمالي النهائي: ${total.toFixed(2)} ر.س

طريقة الدفع: ${customer.paymentMethod === 'cash_on_delivery' ? 'نقداً عند التسليم' : customer.paymentMethod === 'card' ? 'بطاقة' : customer.paymentMethod === 'wallet' ? 'محفظة' : 'تحويل بنكي'}
طريقة الاستلام: ${customer.deliveryMethod === 'delivery' ? 'توصيل' : 'استلام من الفرع'}

الفرع: ${branchName}
تم إنشاء الطلب بواسطة: ${currentUser?.name ?? '-'}

ملاحظات:
${customer.notes || '-'}`;
  };

  const createM = useMutation({
    mutationFn: (data: any) => api.post('/order-requests', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order-requests'] });
      toast({ title: 'تم إنشاء الطلب وإرساله على واتساب' });
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const handleSendWhatsApp = () => {
    if (!validateCustomer()) return;
    if (cart.length === 0) { toast({ title: 'السلة فارغة', variant: 'destructive' }); return; }

    const phone = customer.customerPhone.replace(/\D/g, '');
    const msg = buildWhatsAppMessage();
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');

    createM.mutate({
      ...customer,
      items: cart.map(i => ({ productId: i.productId, productName: i.productName, quantity: i.quantity, unitPrice: i.unitPrice, totalPrice: i.totalPrice })),
      subtotal, discount, deliveryFee, total,
    });
  };

  const stockStatusColor = (p: ApiProduct) => {
    if (p.currentStock === 0) return 'text-red-500';
    if (p.currentStock <= p.minStock) return 'text-orange-500';
    return 'text-green-500';
  };

  return (
    <MainLayout>
      <div className="space-y-4" dir="rtl">
        <PageHeader
          title="طلب أوردر"
          subtitle="إنشاء طلب من منتجات المتجر وإرساله على واتساب"
          breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'طلب أوردر' }]}
          actions={
            <Button variant="outline" onClick={() => setHistoryOpen(true)} className="gap-2">
              <ClipboardCheck className="h-4 w-4" /> سجل الطلبات
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Products Panel */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="بحث عن منتج..." className="pr-9" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <Select value={catFilter} onValueChange={setCatFilter}>
                    <SelectTrigger className="w-36"><SelectValue placeholder="الفئة" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">كل الفئات</SelectItem>
                      {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {productsLoading ? (
              <div className="flex justify-center h-40 items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filtered.map(p => {
                  const inCart = cart.find(i => i.productId === p.id);
                  const outOfStock = p.currentStock === 0;
                  return (
                    <Card
                      key={p.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${outOfStock ? 'opacity-60' : ''} ${inCart ? 'border-primary ring-1 ring-primary/20' : ''}`}
                      onClick={() => !outOfStock && addToCart(p)}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="w-full h-16 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <div>
                          <p className="font-medium text-xs leading-tight line-clamp-2">{p.name}</p>
                          <p className="text-primary font-bold text-sm mt-1">{Number(p.salePrice).toFixed(2)} ر.س</p>
                          <p className={`text-xs ${stockStatusColor(p)}`}>
                            {p.currentStock === 0 ? 'نفد المخزون' : `متاح: ${p.currentStock}`}
                          </p>
                        </div>
                        {inCart && (
                          <div className="bg-primary/10 rounded text-center text-xs text-primary font-medium py-0.5">
                            في السلة: {inCart.quantity}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    لا توجد منتجات مطابقة
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart + Customer Panel */}
          <div className="space-y-4">
            {/* Cart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-primary" /> سلة الطلب ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-6">أضف منتجات من اليمين</p>
                ) : (
                  <>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {cart.map(item => (
                        <div key={item.productId} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">{item.unitPrice.toFixed(2)} ر.س × {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQty(item.productId, -1)}><Minus className="h-3 w-3" /></Button>
                            <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQty(item.productId, 1)}><Plus className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeFromCart(item.productId)}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-2 space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">الإجمالي الفرعي</span><span className="font-medium">{subtotal.toFixed(2)} ر.س</span></div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">خصم</span>
                        <Input type="number" min={0} value={discount} onChange={e => setDiscount(Number(e.target.value))} className="h-7 text-xs flex-1" />
                        <span className="text-xs">ر.س</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">توصيل</span>
                        <Input type="number" min={0} value={deliveryFee} onChange={e => setDeliveryFee(Number(e.target.value))} className="h-7 text-xs flex-1" />
                        <span className="text-xs">ر.س</span>
                      </div>
                      <div className="flex justify-between font-bold text-base border-t pt-1">
                        <span>الإجمالي</span><span className="text-primary">{total.toFixed(2)} ر.س</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Customer Form */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> بيانات العميل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">اسم العميل *</Label>
                  <Input
                    placeholder="الاسم الكامل"
                    value={customer.customerName}
                    onChange={e => setCustomer(c => ({ ...c, customerName: e.target.value }))}
                    className={`h-8 text-sm ${customerErrors.customerName ? 'border-red-400' : ''}`}
                  />
                  {customerErrors.customerName && <p className="text-xs text-red-500">{customerErrors.customerName}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">رقم الواتساب *</Label>
                  <Input
                    placeholder="966xxxxxxxxx+"
                    value={customer.customerPhone}
                    onChange={e => setCustomer(c => ({ ...c, customerPhone: e.target.value }))}
                    className={`h-8 text-sm ${customerErrors.customerPhone ? 'border-red-400' : ''}`}
                    dir="ltr"
                  />
                  {customerErrors.customerPhone && <p className="text-xs text-red-500">{customerErrors.customerPhone}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">العنوان</Label>
                  <Input placeholder="العنوان التفصيلي" value={customer.customerAddress} onChange={e => setCustomer(c => ({ ...c, customerAddress: e.target.value }))} className="h-8 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">المنطقة</Label>
                  <Input placeholder="المدينة / الحي" value={customer.customerArea} onChange={e => setCustomer(c => ({ ...c, customerArea: e.target.value }))} className="h-8 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">طريقة الدفع</Label>
                    <Select value={customer.paymentMethod} onValueChange={v => setCustomer(c => ({ ...c, paymentMethod: v }))}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash_on_delivery">نقدي عند التسليم</SelectItem>
                        <SelectItem value="card">بطاقة</SelectItem>
                        <SelectItem value="wallet">محفظة</SelectItem>
                        <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">طريقة الاستلام</Label>
                    <Select value={customer.deliveryMethod} onValueChange={v => setCustomer(c => ({ ...c, deliveryMethod: v }))}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="delivery">توصيل</SelectItem>
                        <SelectItem value="pickup">استلام من الفرع</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">ملاحظات</Label>
                  <Textarea placeholder="أي تعليمات خاصة..." rows={2} value={customer.notes} onChange={e => setCustomer(c => ({ ...c, notes: e.target.value }))} className="text-sm" />
                </div>
                <Button
                  className="w-full gap-2 bg-green-600 hover:bg-green-700"
                  onClick={handleSendWhatsApp}
                  disabled={createM.isPending || cart.length === 0}
                >
                  {createM.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                  إرسال الطلب على واتساب
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Order History */}
        <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
          <DialogContent className="max-w-3xl" dir="rtl">
            <DialogHeader><DialogTitle>سجل الطلبات</DialogTitle></DialogHeader>
            {ordersLoading ? (
              <div className="flex justify-center h-32 items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">لا توجد طلبات سابقة</div>
            ) : (
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/30">
                    <tr className="text-right">
                      <th className="p-3 font-medium">العميل</th>
                      <th className="p-3 font-medium">الهاتف</th>
                      <th className="p-3 font-medium">الإجمالي</th>
                      <th className="p-3 font-medium">الحالة</th>
                      <th className="p-3 font-medium">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map((o: any) => (
                      <tr key={o.id} className="hover:bg-muted/20">
                        <td className="p-3 font-medium">{o.customer_name ?? o.customerName}</td>
                        <td className="p-3 text-muted-foreground text-xs">{o.customer_phone ?? o.customerPhone}</td>
                        <td className="p-3 font-bold text-primary">{Number(o.total).toFixed(2)} ر.س</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[o.status] ?? 'bg-slate-100 text-slate-700'}`}>
                            {statusLabels[o.status] ?? o.status}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">
                          {format(new Date(o.created_at ?? o.createdAt), 'dd/MM/yyyy', { locale: ar })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setHistoryOpen(false)}>إغلاق</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
