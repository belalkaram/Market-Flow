import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Search, ShoppingCart as CartIcon, Trash2, Plus, Minus,
  CreditCard, Banknote, Wallet, Printer, Package, Loader2, CheckCircle,
  Percent, Sparkles, RefreshCw, Barcode, HelpCircle, ArrowLeft,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { productsApi, categoriesApi, salesApi, ApiProduct, ApiSalesOrderFull } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { playPosSound } from '@/lib/posSounds';
import { getPrimaryCurrency } from '@/lib/currencies';
import { offlineSyncManager } from '@/lib/offlineSync';
import { WifiOff } from 'lucide-react';

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
    .print-btn button{padding:6px 20px;background:#10b981;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;margin-left:6px}
    .print-btn button.close{background:#6b7280}
    @media print{.print-btn{display:none}body{width:72mm}}
  </style></head><body>
  <div class="center bold" style="font-size:16px;margin-bottom:4px">MarketFlow</div>
  <div class="center small">نظام نقاط البيع الذكي</div>
  <div class="divider"></div>
  <div class="total-row small"><span>رقم الإيصال</span><span>${order.invoiceNumber}</span></div>
  <div class="total-row small"><span>التاريخ</span><span>${format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: ar })}</span></div>
  ${order.cashierName ? `<div class="total-row small"><span>الكاشير</span><span>${order.cashierName}</span></div>` : ''}
  <div class="divider"></div>
  <table><thead><tr><th>المنتج</th><th style="text-align:center">الكمية</th><th style="text-align:left">الإجمالي</th></tr></thead>
  <tbody>${rows}</tbody></table>
  <div class="divider"></div>
  ${Number(order.taxAmount) > 0 ? `<div class="total-row small"><span>ضريبة القيمة المضافة</span><span>${Number(order.taxAmount).toFixed(2)} ر.س</span></div>` : ''}
  ${Number(order.discountAmount) > 0 ? `<div class="total-row small"><span>الخصم المطبق</span><span>- ${Number(order.discountAmount).toFixed(2)} ر.س</span></div>` : ''}
  <div class="grand-total"><span>الإجمالي</span><span>${Number(order.totalAmount).toFixed(2)} ر.س</span></div>
  <div class="total-row small" style="margin-top:4px"><span>طريقة الدفع</span><span>${paymentMap[order.paymentMethod] ?? order.paymentMethod}</span></div>
  <div class="divider"></div>
  <div class="footer">شكراً لزيارتكم<br>نظام السوبرماركت المتكامل MarketFlow</div>
  <div class="print-btn"><button onclick="window.print()">طباعة</button><button class="close" onclick="window.close()">إغلاق</button></div>
  <script>setTimeout(()=>window.print(),400)</script>
  </body></html>`);
  w.document.close();
}

export default function POSPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // 1. Load POS settings dynamically from localStorage
  const [taxEnabled, setTaxEnabled] = useState(() => {
    return localStorage.getItem('mf_settings_tax_enabled') !== 'false';
  });
  const [posAutoPrint] = useState(() => {
    return localStorage.getItem('mf_settings_pos_auto_print') !== 'false';
  });
  const [posSoundNotify] = useState(() => {
    return localStorage.getItem('mf_settings_pos_sound_notify') !== 'false';
  });
  const [posShowStock] = useState(() => {
    return localStorage.getItem('mf_settings_pos_show_stock') !== 'false';
  });
  const [posAllowNegative] = useState(() => {
    return localStorage.getItem('mf_settings_pos_allow_negative') === 'true';
  });

  // Load cart from localStorage if present for safety
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('mf_pos_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [search, setSearch] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [mobileTab, setMobileTab] = useState<'products' | 'cart'>('products');
  const [receipt, setReceipt] = useState<ApiSalesOrderFull | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Cashier helpers: Discount and Cash calculator
  const [discountVal, setDiscountVal] = useState<number>(0); // fixed SAR discount
  const [receivedCash, setReceivedCash] = useState<string>(''); // cash from client

  // Enforce autofocus on search bar immediately when entering the POS page
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Save cart changes to localStorage for safety
  useEffect(() => {
    localStorage.setItem('mf_pos_cart', JSON.stringify(cart));
  }, [cart]);

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
      setDiscountVal(0);
      setReceivedCash('');
      setMobileTab('products');
      setReceipt(order);
      setIsPaymentOpen(false);
      
      // Auto print receipt if enabled
      if (posAutoPrint) {
        setTimeout(() => printReceipt(order), 600);
      }
      
      toast({
        title: 'تم إتمام البيع بنجاح 🎉',
        description: `فاتورة رقم ${order.invoiceNumber}`,
        variant: 'default',
      });
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
    if (!posAllowNegative && product.currentStock <= 0) {
      toast({ title: 'نفد مخزون هذا المنتج', variant: 'destructive' });
      return;
    }

    // Play configured POS sound on selecting any product
    playPosSound();

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (!posAllowNegative && existing.qty >= product.currentStock) {
          toast({ title: `لا يتوفر سوى ${product.currentStock} قطع فقط في المخزون`, variant: 'destructive' });
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
      if (!posAllowNegative && newQty > item.currentStock) {
        toast({ title: `الكمية المدخلة تتجاوز المتاح (${item.currentStock})`, variant: 'destructive' });
        return item;
      }
      return newQty > 0 ? { ...item, qty: newQty } : item;
    }));
  };

  const removeItem = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.salePrice * item.qty, 0);
  
  // Calculate tax amount ONLY if tax is enabled in the system settings!
  const taxAmount = taxEnabled 
    ? cart.reduce((sum, item) => sum + item.salePrice * item.qty * (item.taxPercent / 100), 0)
    : 0;
    
  const rawTotal = subtotal + taxAmount;
  const total = Math.max(0, rawTotal - discountVal);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Change calculator calculation
  const cashNum = Number(receivedCash) || 0;
  const changeDue = Math.max(0, cashNum - total);
  const isCashSufficient = cashNum >= total;

  // Global physical barcode scanner listener
  useEffect(() => {
    let scannedBuffer = '';
    let lastKeyTime = Date.now();

    const handleGlobalScan = (e: KeyboardEvent) => {
      const now = Date.now();
      
      // Scanners typically send keystrokes under 40ms difference
      if (now - lastKeyTime > 80) {
        scannedBuffer = '';
      }
      lastKeyTime = now;

      // Filter out typing in input fields
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key.length === 1) {
        scannedBuffer += e.key;
      } else if (e.key === 'Enter') {
        if (scannedBuffer.length >= 4) {
          const matched = products.find(p => p.barcode === scannedBuffer || p.sku === scannedBuffer);
          if (matched) {
            addToCart(matched);
            toast({
              title: `تم إدراج منتج بالباركود: ${matched.name}`,
              description: `سعر المنتج: ${Number(matched.salePrice).toFixed(2)} ر.س`,
              variant: 'default',
            });
            e.preventDefault();
          } else {
            toast({
              title: `لم يتم العثور على باركود: ${scannedBuffer}`,
              variant: 'destructive',
            });
          }
          scannedBuffer = '';
        }
      }
    };

    window.addEventListener('keydown', handleGlobalScan);
    return () => window.removeEventListener('keydown', handleGlobalScan);
  }, [products]);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    checkoutMutation.mutate({
      items: cart.map(item => ({ productId: item.id, quantity: item.qty })),
      paymentMethod,
      discountAmount: discountVal,
      taxEnabled,
      allowNegative: posAllowNegative,
    });
  };

  const applyQuickCash = (amt: number) => {
    setReceivedCash(prev => {
      const cur = Number(prev) || 0;
      return (cur + amt).toString();
    });
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 200;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getInCartCount = (productId: string) => {
    return cart.find(item => item.id === productId)?.qty ?? 0;
  };

  const ProductsPanel = (
    <div className="flex flex-col gap-4 h-full">
      {/* Search and Status bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            ref={searchInputRef}
            placeholder="ابحث سريعاً بالاسم أو الباركود..."
            className="pr-11 h-12 text-base border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl focus-visible:ring-emerald-500 shadow-sm focus:shadow"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        
        {/* Visual Scanner Status indicator */}
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl px-4 py-2 flex items-center justify-between gap-3 shrink-0 select-none">
          <div className="flex items-center gap-2 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">قارئ الباركود نشط</span>
          </div>
          <Barcode className="h-5 w-5 text-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Category selector - Native horizontal scroll with desktop click-to-scroll controls */}
      <div className="relative group/cats flex-none -mx-1">
        {/* Scroll right button */}
        <button
          type="button"
          onClick={() => scrollCategories('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-90 transition-all opacity-0 group-hover/cats:opacity-100 focus:opacity-100"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div 
          ref={categoryScrollRef}
          className="flex gap-2 overflow-x-auto pb-2 flex-nowrap w-full scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth'
          }} 
          dir="rtl"
        >
          <Button
            variant={activeCategoryId === null ? 'default' : 'outline'}
            size="sm" 
            className={cn(
              "rounded-xl shrink-0 font-medium px-4 h-9 shadow-sm transition-all active:scale-95 flex-nowrap",
              activeCategoryId === null ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-white hover:bg-slate-50 text-slate-700"
            )}
            onClick={() => setActiveCategoryId(null)}
          >
            الكل
          </Button>
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={activeCategoryId === cat.id ? 'default' : 'outline'}
              size="sm" 
              className={cn(
                "rounded-xl shrink-0 font-medium px-4 h-9 shadow-sm transition-all active:scale-95 flex-nowrap",
                activeCategoryId === cat.id ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-white hover:bg-slate-50 text-slate-700"
              )}
              onClick={() => setActiveCategoryId(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Scroll left button */}
        <button
          type="button"
          onClick={() => scrollCategories('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-90 transition-all opacity-0 group-hover/cats:opacity-100 focus:opacity-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Products list grid */}
      <ScrollArea className="flex-1 -mx-2 px-2" dir="rtl">
        {loadingProducts ? (
          <div className="h-60 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <span className="text-sm text-slate-400">جاري تحميل المنتجات المتاحة...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-900/20 border border-dashed rounded-3xl p-6">
            <Package className="h-12 w-12 mb-3 opacity-40 text-slate-400" />
            <p className="text-sm font-semibold">لم نجد أي منتجات تطابق البحث</p>
            <p className="text-xs text-slate-400 mt-1">جرب إدخال باركود آخر أو تفقد الأقسام</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pb-4">
            {filteredProducts.map(product => {
              const inCartQty = getInCartCount(product.id);
              const isOut = product.currentStock <= 0;
              const isLow = product.currentStock > 0 && product.currentStock <= product.minStock;

              return (
                <Card
                  key={product.id}
                  className={cn(
                    'group relative cursor-pointer border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-emerald-500/40 hover:shadow-md transition-all p-3 flex flex-col justify-between select-none active:scale-[0.98] duration-150 rounded-2xl overflow-hidden',
                    isOut && 'opacity-50 cursor-not-allowed border-dashed',
                    isLow && 'border-orange-300 dark:border-orange-900/60 bg-orange-50/15',
                  )}
                  onClick={() => addToCart(product)}
                >
                  {/* Glowing top line for items in cart */}
                  {inCartQty > 0 && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />
                  )}

                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-extrabold text-sm md:text-base text-emerald-600 dark:text-emerald-400">
                        {Number(product.salePrice).toLocaleString('ar-SA')} <span className="text-[10px]">ر.س</span>
                      </span>

                      {/* Quantity in cart badge */}
                      {inCartQty > 0 && (
                        <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white rounded-full h-5 w-5 p-0 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-emerald-500/30 animate-in zoom-in duration-200">
                          {inCartQty}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-xs md:text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] gap-2 pt-2 border-t border-slate-50 dark:border-slate-900">
                    <span className="text-slate-400 truncate max-w-[80px] font-mono select-all">
                      {product.barcode ?? product.sku}
                    </span>
                    {posShowStock && (
                      <span className={cn(
                        'px-2 py-0.5 rounded-lg text-[9px] font-extrabold shrink-0 shadow-sm',
                        product.currentStock > 20
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20'
                          : product.currentStock > 0
                          ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border border-orange-100 dark:border-orange-900/20'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-100 dark:border-rose-900/20 animate-pulse'
                      )}>
                        {product.currentStock === 0 ? 'نفد' : `متاح ${product.currentStock}`}
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  const CartPanel = (
    <div className="flex flex-col bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg h-full">
      {/* Cart Header */}
      <div className="px-4 py-3 md:py-3.5 border-b bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CartIcon className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-slate-800 dark:text-white block">سلة المبيعات</span>
            {cart.length > 0 && <span className="text-[10px] text-slate-400 block mt-0.5 font-light">تُحفظ تلقائياً وبأمان</span>}
          </div>
        </div>
        
        {cart.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold rounded-xl" 
            onClick={() => setCart([])}
          >
            مسح الكل
          </Button>
        )}
      </div>

      {/* Cart Items List - Full height with scrolling, no truncation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin" dir="rtl">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12 px-4">
            <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-3">
              <CartIcon className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-xs font-bold text-slate-400">سلة المبيعات فارغة</p>
            <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] text-center font-light leading-relaxed">
              مرر باركود المنتج أو انقر فوق المنتجات لإدراجها هنا.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {cart.map(item => (
              <div 
                key={item.id} 
                className="flex items-center justify-between gap-2 p-2 border border-slate-100 dark:border-slate-900 rounded-xl bg-white dark:bg-slate-950 hover:shadow-sm transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-855 dark:text-slate-100 leading-snug break-words">
                    {item.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-emerald-600 dark:text-emerald-400 font-black text-xs">
                      {item.salePrice.toLocaleString('ar-SA')} ر.س
                    </span>
                    {taxEnabled && (
                      <span className="text-[9px] text-slate-400 font-mono">
                        (VAT {item.taxPercent}%)
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {/* Plus Minus quantity buttons */}
                  <div className="flex items-center bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-150 dark:border-slate-800 overflow-hidden">
                    <button 
                      className="w-6.5 h-6.5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" 
                      onClick={() => updateQty(item.id, -1)}
                    >
                      <Minus className="h-2.5 w-2.5 text-slate-600 dark:text-slate-400" />
                    </button>
                    <span className="w-7 text-center font-black text-xs text-slate-800 dark:text-slate-100">
                      {item.qty}
                    </span>
                    <button 
                      className="w-6.5 h-6.5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" 
                      onClick={() => updateQty(item.id, 1)}
                    >
                      <Plus className="h-2.5 w-2.5 text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>
                  
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 w-14 text-left">
                    {(item.salePrice * item.qty).toLocaleString('ar-SA')}
                  </span>
                  
                  <button 
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-1 rounded-lg transition-all" 
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Summary & Actions segment - Sleek and space-efficient */}
      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 p-4 space-y-3 shrink-0">
        {/* Simple details summary */}
        <div className="space-y-1 text-xs md:text-sm">
          <div className="flex justify-between text-slate-500">
            <span>المجموع الفرعي:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{subtotal.toFixed(2)} ر.س</span>
          </div>
          {taxEnabled && (
            <div className="flex justify-between text-slate-500">
              <span>ضريبة القيمة المضافة:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{taxAmount.toFixed(2)} ر.س</span>
            </div>
          )}
          {discountVal > 0 && (
            <div className="flex justify-between text-rose-500">
              <span>خصم مطبق الفاتورة:</span>
              <span className="font-black">-{discountVal.toFixed(2)} ر.س</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-900">
            <span className="font-black text-slate-800 dark:text-slate-200">إجمالي الطلب:</span>
            <span className="text-emerald-600 dark:text-emerald-400 text-xl font-black">{total.toFixed(2)} ر.س</span>
          </div>
        </div>

        {/* Proceed to Payment Button */}
        <Button
          className="w-full h-12 text-sm font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-lg shadow-emerald-600/25 transition-all mt-1 flex items-center justify-center gap-1.5"
          disabled={cart.length === 0}
          onClick={() => setIsPaymentOpen(true)}
        >
          <CreditCard className="h-4.5 w-4.5 text-white" />
          <span>الانتقال لعملية الدفع</span>
        </Button>
      </div>
    </div>
  );

  return (
    <MainLayout>
      {/* Desktop view */}
      <div className="hidden md:flex gap-5 h-[calc(100vh-88px)] overflow-hidden">
        <div className="w-[58%] lg:w-[62%] xl:w-[65%] flex flex-col gap-3">{ProductsPanel}</div>
        <div className="w-[42%] lg:w-[38%] xl:w-[35%]">{CartPanel}</div>
      </div>

      {/* Mobile view */}
      <div className="md:hidden flex flex-col h-[calc(100dvh-72px)] overflow-hidden">
        <div className="flex gap-2 mb-3 shrink-0">
          <button
            className={cn(
              'flex-1 py-3 rounded-2xl text-sm font-extrabold transition-colors flex items-center justify-center gap-2', 
              mobileTab === 'products' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
            )}
            onClick={() => setMobileTab('products')}
          >
            <Package className="h-4.5 w-4.5" /> السلع والمنتجات
          </button>
          <button
            className={cn(
              'flex-1 py-3 rounded-2xl text-sm font-extrabold transition-colors flex items-center justify-center gap-2 relative', 
              mobileTab === 'cart' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
            )}
            onClick={() => setMobileTab('cart')}
          >
            <CartIcon className="h-4.5 w-4.5" /> سلة الكاشير
            {itemCount > 0 && (
              <span className={cn(
                'absolute top-2 left-3 w-5.5 h-5.5 rounded-full text-[10px] font-black flex items-center justify-center shadow-sm', 
                mobileTab === 'cart' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-900 text-white'
              )}>
                {itemCount}
              </span>
            )}
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden">
          {mobileTab === 'products' ? ProductsPanel : CartPanel}
        </div>
      </div>

      {/* Premium Payment Portal Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-2xl" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-emerald-500" />
              <span>بوابة الدفع والتسوية</span>
            </DialogTitle>
            <p className="text-xs text-slate-400 mt-1">تحديد الخصم، طريقة الدفع ومراجعة الفاتورة</p>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            {/* Total Highlight Banner */}
            <div className="bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/10 rounded-2xl p-4 text-center space-y-1 select-none">
              <span className="text-xs text-slate-400 dark:text-slate-400 font-semibold block">المبلغ الإجمالي المطلوب سداده</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-3xl font-black block">{total.toLocaleString('ar-SA')} <span className="text-sm font-extrabold">ر.س</span></span>
              <span className="text-[10px] text-slate-400 block font-light">
                المجموع الفرعي: {subtotal.toFixed(2)} ر.س | الضريبة: {taxAmount.toFixed(2)} ر.س
              </span>
            </div>

            {/* Discount Section */}
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-900 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-650 dark:text-slate-350">
                  <Percent className="h-4 w-4 text-slate-400" /> تطبيق خصم فوري للفاتورة
                </span>
                {discountVal > 0 && (
                  <span className="text-rose-500 font-black">
                    مخصوم -{discountVal.toFixed(2)} ر.س
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                <div className="flex gap-1 flex-1">
                  {[0, 5, 10, 15].map((pct) => {
                    const val = pct === 0 ? 0 : Math.round(rawTotal * (pct / 100));
                    return (
                      <button
                        key={pct}
                        type="button"
                        className={cn(
                          "flex-1 h-8 text-[11px] rounded-lg border font-black transition-all active:scale-95 duration-100",
                          ((pct === 0 && discountVal === 0) || (pct !== 0 && Math.abs(discountVal - val) <= 1)) 
                            ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-950 dark:border-slate-100" 
                            : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
                        )}
                        onClick={() => setDiscountVal(val)}
                      >
                        {pct === 0 ? 'بلا خصم' : `${pct}%`}
                      </button>
                    );
                  })}
                </div>
                
                <input
                  type="number"
                  placeholder="ريال..."
                  className="w-20 h-8 text-[11px] border border-slate-200 dark:border-slate-800 rounded-lg text-center font-black font-mono focus-visible:ring-emerald-500 bg-white dark:bg-slate-950"
                  value={discountVal || ''}
                  onChange={e => setDiscountVal(Math.max(0, Number(e.target.value)))}
                />
              </div>
            </div>

            {/* Payment Methods Section */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-650 dark:text-slate-350 block">طريقة الدفع</span>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { method: 'cash' as const, icon: Banknote, label: 'نقدي', activeClass: 'border-emerald-500/40 bg-emerald-50/40 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' },
                  { method: 'card' as const, icon: CreditCard, label: 'بطاقة', activeClass: 'border-blue-500/40 bg-blue-50/40 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400' },
                  { method: 'wallet' as const, icon: Wallet, label: 'محفظة', activeClass: 'border-purple-500/40 bg-purple-50/40 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400' },
                ]).map(({ method, icon: Icon, label, activeClass }) => (
                  <Button
                    key={method}
                    variant="outline"
                    className={cn(
                      "flex-col h-14 gap-1 text-xs font-bold rounded-xl border transition-all duration-200 active:scale-95",
                      paymentMethod === method 
                        ? activeClass 
                        : "border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 text-slate-700 dark:text-slate-300"
                    )}
                    onClick={() => setPaymentMethod(method)}
                  >
                    <Icon className="h-4.5 w-4.5 stroke-[1.8]" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Cash Received Calculator (Visible only when 'cash' payment method is active) */}
            {paymentMethod === 'cash' && (
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-3.5 space-y-2 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-650 dark:text-slate-350">المبلغ المستلم والباقي للعميل</span>
                  {receivedCash !== '' && (
                    <span className={cn(
                      "font-black text-xs px-2 py-0.5 rounded-lg shadow-sm border",
                      isCashSufficient 
                        ? "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/20" 
                        : "text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/20"
                    )}>
                      {isCashSufficient 
                        ? `الباقي: ${changeDue.toFixed(2)} ر.س` 
                        : `نقص ${(total - cashNum).toFixed(2)} ر.س`
                      }
                    </span>
                  )}
                </div>

                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="المستلم..."
                    className="w-24 h-9 text-xs border border-emerald-500/25 bg-white dark:bg-slate-950 focus:ring-emerald-500 font-black font-mono text-center rounded-lg shadow-sm"
                    value={receivedCash}
                    onChange={e => setReceivedCash(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-1 flex-1">
                    {[10, 50, 100, 500].map((bill) => (
                      <button
                        key={bill}
                        type="button"
                        className="flex-1 h-9 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 font-mono transition-all active:scale-95"
                        onClick={() => applyQuickCash(bill)}
                      >
                        +{bill}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="px-2 h-9 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold shrink-0 transition-all active:scale-95"
                    onClick={() => setReceivedCash('')}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Submission Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-900">
              <Button
                variant="outline"
                className="flex-1 h-12 text-xs font-bold rounded-xl border-slate-200 hover:bg-slate-50 dark:border-slate-850 dark:hover:bg-slate-900"
                onClick={() => setIsPaymentOpen(false)}
              >
                إلغاء
              </Button>
              <Button
                className="flex-[2] h-12 text-xs font-extrabold rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-1.5"
                disabled={checkoutMutation.isPending || (paymentMethod === 'cash' && receivedCash !== '' && !isCashSufficient)}
                onClick={handleCheckout}
              >
                {checkoutMutation.isPending ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <Sparkles className="h-4.5 w-4.5 text-white animate-pulse" />
                )}
                <span>تأكيد الدفع وإصدار الفاتورة</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modern Thermal Receipt Dialog */}
      <Dialog open={!!receipt} onOpenChange={open => !open && setReceipt(null)}>
        <DialogContent className="max-w-sm rounded-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600 font-black text-lg md:text-xl">
              <CheckCircle className="h-6 w-6 shrink-0" />
              تم البيع وإصدار الفاتورة
            </DialogTitle>
          </DialogHeader>
          
          {receipt && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">رقم الفاتورة المرجعي</span>
                  <span className="font-mono font-black text-slate-800 dark:text-slate-100">{receipt.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">تاريخ المعاملة</span>
                  <span className="font-bold">{format(new Date(receipt.createdAt), 'dd/MM/yyyy HH:mm', { locale: ar })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">إجمالي كمية الأصناف</span>
                  <span className="font-bold">{receipt.items?.length ?? 0} أصناف</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">قناة الدفع المستخدمة</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{paymentMap[receipt.paymentMethod] ?? receipt.paymentMethod}</span>
                </div>
                {Number(receipt.taxAmount) > 0 && (
                  <div className="flex justify-between text-slate-400 text-xs">
                    <span>ضريبة القيمة المضافة</span>
                    <span>{Number(receipt.taxAmount).toFixed(2)} ر.س</span>
                  </div>
                )}
                {Number(receipt.discountAmount) > 0 && (
                  <div className="flex justify-between text-rose-500 text-xs">
                    <span>الخصم المطبق على الفاتورة</span>
                    <span>- {Number(receipt.discountAmount).toFixed(2)} ر.س</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-base border-t border-slate-200 dark:border-slate-800 pt-2.5 mt-2">
                  <span className="text-slate-800 dark:text-slate-200">الإجمالي المدفوع</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-lg font-black">{Number(receipt.totalAmount).toFixed(2)} ر.س</span>
                </div>
              </div>

              {/* Cashier Action Buttons */}
              <div className="flex gap-2">
                <Button className="flex-1 rounded-xl h-11 bg-emerald-600 hover:bg-emerald-700 font-bold" onClick={() => printReceipt(receipt)}>
                  <Printer className="h-4.5 w-4.5 ml-2" /> طباعة إيصال ورقي
                </Button>
                <Button variant="outline" className="flex-1 rounded-xl h-11 border-slate-200 hover:bg-slate-50 dark:border-slate-800 font-bold" onClick={() => setReceipt(null)}>
                  عملية جديدة
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
