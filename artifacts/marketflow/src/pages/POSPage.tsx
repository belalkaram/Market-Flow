import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Search, ShoppingCart as CartIcon, Trash2, Plus, Minus,
  CreditCard, Banknote, Wallet, Printer, Package, Loader2, CheckCircle,
} from 'lucide-react';
import { productsApi, categoriesApi, salesApi, ApiProduct, ApiSalesOrderFull } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface CartItem {
  id: string;
  name: string;
  barcode?: string;
  salePrice: number;
  taxPercent: number;
  currentStock: number;
  qty: number;
}

type PaymentMethod = 'cash' | 'card' | 'wallet';
const paymentMap: Record<string, string> = { cash: 'نقدي', card: 'بطاقة', wallet: 'محفظة' };

function printReceipt(order: ApiSalesOrderFull) {
  const w = window.open('', '_blank', 'width=400,height=600');
  if (!w) return;
  const rows = (order.items ?? []).map(({ item }) =>
    `<tr><td>${item.productName}</td><td style="text-align:center">${item.quantity}</td><td style="text-align:left">${Number(item.totalPrice).toFixed(2)}</td></tr>`
  ).join('');
  w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>إيصال ${order.invoiceNumber}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;width:80mm;padding:8mm;font-size:12px;color:#111}
    .center{text-align:center}.bold{font-weight:bold}.small{font-size:10px;color:#555}
    .divider{border-top:1px dashed #999;margin:6px 0}
    table{width:100%;border-collapse:collapse;margin:6px 0}
    th{font-size:10px;color:#666;padding:3px 0;border-bottom:1px solid #ddd;text-align:right}
    td{font-size:11px;padding:3px 0}
    td:last-child{text-align:left}
    .total-row{display:flex;justify-content:space-between;padding:2px 0;font-size:12px}
    .grand-total{font-size:14px;font-weight:bold;border-top:1px solid #333;padding-top:4px;margin-top:2px;display:flex;justify-content:space-between}
    .footer{text-align:center;font-size:10px;color:#888;margin-top:10px}
    .print-btn{margin-top:12px;text-align:center}
    .print-btn button{padding:6px 20px;background:#2563eb;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;margin-left:6px}
    .print-btn button.close{background:#6b7280}
    @media print{.print-btn{display:none}body{width:72mm}}
  </style></head><body>
  <div class="center bold" style="font-size:16px;margin-bottom:4px">MarketFlow</div>
  <div class="center small">نظام نقاط البيع</div>
  <div class="divider"></div>
  <div class="total-row small"><span>رقم الإيصال</span><span>${order.invoiceNumber}</span></div>
  <div class="total-row small"><span>التاريخ</span><span>${format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: ar })}</span></div>
  ${order.cashierName ? `<div class="total-row small"><span>الكاشير</span><span>${order.cashierName}</span></div>` : ''}
  <div class="divider"></div>
  <table><thead><tr><th>المنتج</th><th style="text-align:center">الكمية</th><th style="text-align:left">الإجمالي</th></tr></thead>
  <tbody>${rows}</tbody></table>
  <div class="divider"></div>
  ${Number(order.taxAmount) > 0 ? `<div class="total-row small"><span>ضريبة القيمة المضافة</span><span>${Number(order.taxAmount).toFixed(2)} ر.س</span></div>` : ''}
  ${Number(order.discountAmount) > 0 ? `<div class="total-row small"><span>الخصم</span><span>- ${Number(order.discountAmount).toFixed(2)} ر.س</span></div>` : ''}
  <div class="grand-total"><span>الإجمالي</span><span>${Number(order.totalAmount).toFixed(2)} ر.س</span></div>
  <div class="total-row small" style="margin-top:4px"><span>طريقة الدفع</span><span>${paymentMap[order.paymentMethod] ?? order.paymentMethod}</span></div>
  <div class="divider"></div>
  <div class="footer">شكراً لزيارتكم<br>نتمنى لكم يوماً سعيداً</div>
  <div class="print-btn"><button onclick="window.print()">طباعة</button><button class="close" onclick="window.close()">إغلاق</button></div>
  <script>setTimeout(()=>window.print(),400)</script>
  </body></html>`);
  w.document.close();
}

export default function POSPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [mobileTab, setMobileTab] = useState<'products' | 'cart'>('products');
  const [receipt, setReceipt] = useState<ApiSalesOrderFull | null>(null);

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['pos-products'],
    queryFn: () => productsApi.list(),
  });
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  });

  const checkoutMutation = useMutation({
    mutationFn: salesApi.checkout,
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ['pos-products'] });
      qc.invalidateQueries({ queryKey: ['sales'] });
      qc.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setCart([]);
      setMobileTab('products');
      setReceipt(order);
    },
    onError: (e: any) => toast({ title: e.message, variant: 'destructive' }),
  });

  const filteredProducts = products.filter((p: ApiProduct) => {
    if (!p.isActive) return false;
    const matchesSearch = p.name.includes(search) || (p.barcode ?? '').includes(search);
    const matchesCat = activeCategoryId ? p.categoryId === activeCategoryId : true;
    return matchesSearch && matchesCat;
  });

  const addToCart = (product: ApiProduct) => {
    if (product.currentStock <= 0) {
      toast({ title: 'نفد مخزون هذا المنتج', variant: 'destructive' });
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.currentStock) {
          toast({ title: 'لا يمكن إضافة أكثر من الكمية المتاحة', variant: 'destructive' });
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        salePrice: Number(product.salePrice),
        taxPercent: Number(product.taxPercent),
        currentStock: product.currentStock,
        qty: 1,
      }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id !== id) return item;
      const newQty = item.qty + delta;
      return newQty > 0 ? { ...item, qty: newQty } : item;
    }));
  };

  const removeItem = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

  const subtotal = cart.reduce((sum, item) => sum + item.salePrice * item.qty, 0);
  const taxAmount = cart.reduce((sum, item) => sum + item.salePrice * item.qty * (item.taxPercent / 100), 0);
  const total = subtotal + taxAmount;
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    checkoutMutation.mutate({
      items: cart.map(item => ({ productId: item.id, quantity: item.qty })),
      paymentMethod,
    });
  };

  const ProductsPanel = (
    <div className="flex flex-col gap-3 h-full">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="ابحث بالاسم أو الباركود..."
          className="pr-10 h-11 text-base"
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      <ScrollArea className="flex-none" dir="rtl">
        <div className="flex gap-2 pb-2">
          <Button
            variant={activeCategoryId === null ? 'default' : 'outline'}
            size="sm" className="rounded-full shrink-0"
            onClick={() => setActiveCategoryId(null)}
          >الكل</Button>
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={activeCategoryId === cat.id ? 'default' : 'outline'}
              size="sm" className="rounded-full shrink-0"
              onClick={() => setActiveCategoryId(cat.id)}
            >{cat.name}</Button>
          ))}
        </div>
      </ScrollArea>

      <ScrollArea className="flex-1 -mx-1 px-1" dir="rtl">
        {loadingProducts ? (
          <div className="h-40 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 pb-4">
            {filteredProducts.map(product => (
              <Card
                key={product.id}
                className={cn(
                  'cursor-pointer hover:border-primary transition-all p-3 flex flex-col justify-between select-none active:scale-95 duration-100',
                  product.currentStock === 0 && 'opacity-50 cursor-not-allowed',
                  product.currentStock > 0 && product.currentStock <= product.minStock && 'border-orange-300 dark:border-orange-700 bg-orange-50/30',
                )}
                onClick={() => addToCart(product)}
              >
                <div>
                  <div className="text-sm font-bold text-primary mb-1">{Number(product.salePrice).toLocaleString('ar-SA')} ر.س</div>
                  <div className="font-medium text-sm leading-tight line-clamp-2">{product.name}</div>
                </div>
                <div className="mt-2.5 flex items-center justify-between text-xs gap-1">
                  <span className="text-muted-foreground truncate">{product.barcode ?? product.sku}</span>
                  <span className={cn(
                    'px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0',
                    product.currentStock > 20
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                      : product.currentStock > 0
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                      : 'bg-red-100 text-red-700'
                  )}>
                    {product.currentStock === 0 ? 'نفد' : product.currentStock}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  const CartPanel = (
    <div className="flex flex-col bg-card border rounded-xl overflow-hidden shadow-sm h-full">
      <div className="p-3 md:p-4 border-b bg-muted/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 font-bold">
          <CartIcon className="h-5 w-5 text-primary" />
          <span>سلة المشتريات</span>
          {cart.length > 0 && <Badge className="bg-primary text-primary-foreground text-xs">{itemCount}</Badge>}
        </div>
        {cart.length > 0 && (
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive text-xs" onClick={() => setCart([])}>تفريغ</Button>
        )}
      </div>

      <ScrollArea className="flex-1 p-2" dir="rtl">
        {cart.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground/50 py-10">
            <Package className="h-12 w-12 mb-3" />
            <p className="text-sm">السلة فارغة</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-2 p-2.5 border rounded-lg bg-background">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{item.name}</div>
                  <div className="text-primary font-bold text-sm">{item.salePrice.toLocaleString('ar-SA')} ر.س</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center bg-muted rounded-md border overflow-hidden">
                    <button className="w-7 h-7 flex items-center justify-center hover:bg-muted-foreground/10" onClick={() => updateQty(item.id, -1)}>
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-7 text-center font-bold text-sm">{item.qty}</span>
                    <button className="w-7 h-7 flex items-center justify-center hover:bg-muted-foreground/10" onClick={() => updateQty(item.id, 1)}>
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-sm font-bold w-16 text-left">{(item.salePrice * item.qty).toLocaleString('ar-SA')}</span>
                  <button className="text-muted-foreground hover:text-destructive p-1 rounded" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="border-t bg-muted/10 p-3 md:p-4 space-y-3 shrink-0">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">المجموع الفرعي</span>
            <span className="font-medium">{subtotal.toFixed(2)} ر.س</span>
          </div>
          {taxAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">ضريبة القيمة المضافة</span>
              <span className="font-medium">{taxAmount.toFixed(2)} ر.س</span>
            </div>
          )}
          <div className="flex justify-between pt-1.5 border-t text-base font-bold">
            <span>الإجمالي</span>
            <span className="text-primary">{total.toFixed(2)} ر.س</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {([
            { method: 'cash' as const, icon: Banknote, label: 'نقدي' },
            { method: 'card' as const, icon: CreditCard, label: 'بطاقة' },
            { method: 'wallet' as const, icon: Wallet, label: 'محفظة' },
          ]).map(({ method, icon: Icon, label }) => (
            <Button
              key={method}
              variant={paymentMethod === method ? 'default' : 'outline'}
              className="flex-col h-14 gap-1 text-xs p-1"
              onClick={() => setPaymentMethod(method)}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>

        <Button
          className="w-full h-12 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90"
          disabled={cart.length === 0 || checkoutMutation.isPending}
          onClick={handleCheckout}
        >
          {checkoutMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : null}
          إتمام الدفع {cart.length > 0 && `· ${total.toFixed(0)} ر.س`}
        </Button>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="hidden md:flex gap-4 h-[calc(100vh-88px)] overflow-hidden">
        <div className="w-3/5 flex flex-col gap-3">{ProductsPanel}</div>
        <div className="w-2/5">{CartPanel}</div>
      </div>

      <div className="md:hidden flex flex-col h-[calc(100dvh-72px)] overflow-hidden">
        <div className="flex gap-2 mb-3 shrink-0">
          <button
            className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2', mobileTab === 'products' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}
            onClick={() => setMobileTab('products')}
          >
            <Package className="h-4 w-4" /> المنتجات
          </button>
          <button
            className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 relative', mobileTab === 'cart' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}
            onClick={() => setMobileTab('cart')}
          >
            <CartIcon className="h-4 w-4" /> السلة
            {itemCount > 0 && (
              <span className={cn('absolute top-1.5 left-1.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center', mobileTab === 'cart' ? 'bg-white text-primary' : 'bg-primary text-white')}>
                {itemCount}
              </span>
            )}
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {mobileTab === 'products' ? ProductsPanel : CartPanel}
        </div>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={!!receipt} onOpenChange={open => !open && setReceipt(null)}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              تمت عملية البيع بنجاح
            </DialogTitle>
          </DialogHeader>
          {receipt && (
            <div className="space-y-3">
              <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">رقم الإيصال</span>
                  <span className="font-mono font-bold text-xs">{receipt.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">التاريخ</span>
                  <span>{format(new Date(receipt.createdAt), 'dd/MM/yyyy HH:mm', { locale: ar })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">عدد الأصناف</span>
                  <span>{receipt.items?.length ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">طريقة الدفع</span>
                  <span>{paymentMap[receipt.paymentMethod] ?? receipt.paymentMethod}</span>
                </div>
                {Number(receipt.taxAmount) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>ضريبة القيمة المضافة</span>
                    <span>{Number(receipt.taxAmount).toFixed(2)} ر.س</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t pt-2 mt-1">
                  <span>الإجمالي المدفوع</span>
                  <span className="text-primary">{Number(receipt.totalAmount).toFixed(2)} ر.س</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => printReceipt(receipt)}>
                  <Printer className="h-4 w-4 ml-2" /> طباعة الإيصال
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setReceipt(null)}>
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
