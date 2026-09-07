import { useState, useMemo, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { API_BASE } from '@/lib/api';

interface StoreInfo {
  name: string;
  currency: string;
  status: string;
  branches: { id: string; name: string; city: string; phone: string }[];
}

interface PublicProduct {
  id: string;
  name: string;
  unit: string;
  salePrice: string;
  taxPercent: string;
  currentStock: number;
  minStock: number;
  imageUrl: string | null;
  categoryName: string | null;
  categoryId: string | null;
}

interface PublicCategory {
  id: string;
  name: string;
  icon: string | null;
  sortOrder: number;
}

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  maxQty: number;
}

type Step = 'browse' | 'checkout' | 'success';

const paymentLabels: Record<string, string> = {
  cash_on_delivery: 'نقداً عند التسليم',
  card: 'بطاقة ائتمان',
  wallet: 'محفظة إلكترونية',
  bank_transfer: 'تحويل بنكي',
};

const deliveryLabels: Record<string, string> = {
  delivery: 'توصيل للعنوان',
  pickup: 'استلام من الفرع',
};

async function fetchJson(url: string) {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'خطأ في الطلب');
  return json.data;
}

export default function PublicStorePage() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();

  const [step, setStep] = useState<Step>('browse');
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [loadingStore, setLoadingStore] = useState(true);
  const [storeError, setStoreError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerArea: '',
    notes: '',
    paymentMethod: 'cash_on_delivery',
    deliveryMethod: 'delivery',
    _hp: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<{ id: string; total: number; storeName: string } | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoadingStore(true);
    Promise.all([
      fetchJson(`${API_BASE}/public/${slug}/info`),
      fetchJson(`${API_BASE}/public/${slug}/products`),
    ])
      .then(([info, catalog]) => {
        setStoreInfo(info);
        setProducts(catalog.products ?? []);
        setCategories(catalog.categories ?? []);
      })
      .catch(err => setStoreError(err.message ?? 'تعذر تحميل المتجر'))
      .finally(() => setLoadingStore(false));
  }, [slug]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (catFilter !== 'all' && p.categoryId !== catFilter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, catFilter, search]);

  const subtotal = cart.reduce((s, i) => s + i.totalPrice, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const currency = storeInfo?.currency ?? 'SAR';

  function addToCart(p: PublicProduct) {
    setCart(prev => {
      const existing = prev.find(i => i.productId === p.id);
      if (existing) {
        if (existing.quantity >= existing.maxQty) return prev;
        return prev.map(i => i.productId === p.id
          ? { ...i, quantity: i.quantity + 1, totalPrice: (i.quantity + 1) * i.unitPrice }
          : i
        );
      }
      if (p.currentStock < 1) return prev;
      return [...prev, {
        productId: p.id,
        productName: p.name,
        quantity: 1,
        unitPrice: Number(p.salePrice),
        totalPrice: Number(p.salePrice),
        maxQty: p.currentStock,
      }];
    });
  }

  function updateQty(productId: string, delta: number) {
    setCart(prev => prev.map(i => {
      if (i.productId !== productId) return i;
      const newQty = Math.max(1, Math.min(i.maxQty, i.quantity + delta));
      return { ...i, quantity: newQty, totalPrice: newQty * i.unitPrice };
    }));
  }

  function removeFromCart(productId: string) {
    setCart(prev => prev.filter(i => i.productId !== productId));
  }

  function validateForm() {
    const e: Record<string, string> = {};
    if (!form.customerName.trim() || form.customerName.trim().length < 2) e.customerName = 'الاسم مطلوب (حرفان على الأقل)';
    if (!form.customerPhone.trim()) e.customerPhone = 'رقم الهاتف مطلوب';
    else if (form.customerPhone.replace(/\D/g, '').length < 9) e.customerPhone = 'رقم الهاتف غير صحيح';
    if (form.deliveryMethod === 'delivery' && !form.customerAddress.trim()) e.customerAddress = 'العنوان مطلوب للتوصيل';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    if (cart.length === 0) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${API_BASE}/public/${slug}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: cart.map(i => ({
            productId: i.productId,
            productName: i.productName,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            totalPrice: i.totalPrice,
          })),
          subtotal,
          discount: 0,
          deliveryFee: 0,
          total: subtotal,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSubmitError(json.message ?? 'حدث خطأ أثناء إرسال الطلب');
        return;
      }
      setSuccessOrder({ id: json.data.id, total: json.data.total, storeName: json.data.storeName });
      setStep('success');
      setCart([]);
    } catch {
      setSubmitError('تعذر الاتصال بالخادم، تأكد من اتصال الإنترنت وحاول مجدداً');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingStore) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">جاري تحميل المتجر...</p>
        </div>
      </div>
    );
  }

  if (storeError || !storeInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4 px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">🚫</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">المتجر غير متاح</h1>
          <p className="text-gray-500 text-sm">{storeError ?? 'هذا المتجر غير موجود أو تم تعطيله'}</p>
        </div>
      </div>
    );
  }

  if (step === 'success' && successOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center space-y-5">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تم استلام طلبك! 🎉</h1>
            <p className="text-gray-500 mt-1 text-sm">سيتواصل معك فريق {successOrder.storeName} قريباً</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">رقم الطلب</span>
              <span className="font-mono text-xs text-gray-700">{successOrder.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span className="text-gray-700">الإجمالي</span>
              <span className="text-emerald-600">{Number(successOrder.total).toFixed(2)} {currency}</span>
            </div>
          </div>
          <button
            onClick={() => { setStep('browse'); setForm({ customerName: '', customerPhone: '', customerAddress: '', customerArea: '', notes: '', paymentMethod: 'cash_on_delivery', deliveryMethod: 'delivery', _hp: '' }); setFormErrors({}); }}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
          >
            طلب جديد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl" lang="ar">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight text-sm sm:text-base">{storeInfo.name}</h1>
              <p className="text-xs text-gray-500">اطلب الآن ونوصل إليك</p>
            </div>
          </div>
          {step === 'browse' && cartCount > 0 && (
            <button
              onClick={() => setStep('checkout')}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>السلة</span>
              <span className="bg-white text-emerald-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">{cartCount}</span>
            </button>
          )}
          {step === 'checkout' && (
            <button
              onClick={() => setStep('browse')}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              العودة للمنتجات
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5">
        {step === 'browse' && (
          <div className="space-y-4">
            {/* Search + Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="ابحث عن منتج..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl py-2.5 pr-9 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
                />
              </div>
              <select
                value={catFilter}
                onChange={e => setCatFilter(e.target.value)}
                className="border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white min-w-[110px]"
              >
                <option value="all">كل الفئات</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Products Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">📦</div>
                <p>لا توجد منتجات مطابقة</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filtered.map(p => {
                  const inCart = cart.find(i => i.productId === p.id);
                  const outOfStock = p.currentStock === 0;
                  return (
                    <div
                      key={p.id}
                      onClick={() => !outOfStock && addToCart(p)}
                      className={`bg-white rounded-xl border transition-all cursor-pointer select-none ${
                        outOfStock ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:border-emerald-300 active:scale-[0.98]'
                      } ${inCart ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-gray-200'}`}
                    >
                      <div className="p-3 space-y-2">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-full h-24 object-cover rounded-lg" />
                        ) : (
                          <div className="w-full h-24 bg-gradient-to-br from-emerald-50 to-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-10 h-10 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-xs leading-snug line-clamp-2 text-gray-800">{p.name}</p>
                          <p className="text-emerald-600 font-bold text-sm mt-1">
                            {Number(p.salePrice).toFixed(2)} <span className="text-xs font-normal">{currency}</span>
                          </p>
                          {outOfStock ? (
                            <p className="text-red-500 text-xs mt-0.5">نفد المخزون</p>
                          ) : (
                            <p className="text-gray-400 text-xs mt-0.5">{p.unit}</p>
                          )}
                        </div>
                        {inCart && (
                          <div
                            className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1"
                            onClick={e => e.stopPropagation()}
                          >
                            <button
                              onClick={() => removeFromCart(p.id)}
                              className="w-6 h-6 flex items-center justify-center text-red-500 hover:bg-red-50 rounded"
                              title="إزالة"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <span className="text-xs font-bold text-emerald-700 w-6 text-center">{inCart.quantity}</span>
                            <button
                              onClick={() => updateQty(p.id, 1)}
                              disabled={inCart.quantity >= inCart.maxQty}
                              className="w-6 h-6 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 rounded disabled:opacity-40"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Floating Cart Bar */}
            {cartCount > 0 && (
              <div className="fixed bottom-5 right-0 left-0 flex justify-center px-4 z-50">
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full max-w-md bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-2xl py-3.5 px-5 flex items-center justify-between shadow-xl transition-all"
                >
                  <span className="bg-emerald-500 rounded-xl px-2 py-0.5 text-sm font-bold">{cartCount}</span>
                  <span className="font-bold text-base">متابعة الطلب</span>
                  <span className="font-bold">{subtotal.toFixed(2)} {currency}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'checkout' && (
          <div className="max-w-lg mx-auto space-y-4">
            <h2 className="text-lg font-bold text-gray-900">مراجعة الطلب وتأكيده</h2>

            {/* Cart Summary */}
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              <div className="p-4">
                <h3 className="font-semibold text-sm text-gray-700 mb-3">منتجات الطلب</h3>
                <div className="space-y-2">
                  {cart.map(item => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg">
                        <button onClick={() => removeFromCart(item.productId)} className="px-2 py-1 text-red-400 hover:text-red-600 text-xs">✕</button>
                        <span className="px-1 text-sm font-medium text-gray-700 min-w-[20px] text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item.productId, 1)} disabled={item.quantity >= item.maxQty} className="px-2 py-1 text-emerald-600 hover:text-emerald-700 text-base disabled:opacity-30">+</button>
                      </div>
                      <span className="flex-1 text-sm text-gray-700 leading-tight">{item.productName}</span>
                      <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{item.totalPrice.toFixed(2)} {currency}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 flex justify-between items-center">
                <span className="font-bold text-gray-900">الإجمالي</span>
                <span className="font-bold text-xl text-emerald-600">{subtotal.toFixed(2)} {currency}</span>
              </div>
            </div>

            {/* Customer Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
              <h3 className="font-semibold text-sm text-gray-700">بياناتك الشخصية</h3>

              {/* Honeypot - hidden from real users */}
              <input type="text" name="_hp" value={form._hp} onChange={e => setForm(f => ({ ...f, _hp: e.target.value }))} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">الاسم الكامل *</label>
                <input
                  type="text"
                  placeholder="أدخل اسمك الكامل"
                  value={form.customerName}
                  onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                  className={`w-full border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 ${formErrors.customerName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                {formErrors.customerName && <p className="text-xs text-red-500">{formErrors.customerName}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">رقم الهاتف *</label>
                <input
                  type="tel"
                  placeholder="0501234567"
                  value={form.customerPhone}
                  onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))}
                  dir="ltr"
                  inputMode="tel"
                  className={`w-full border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 text-left ${formErrors.customerPhone ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                {formErrors.customerPhone && <p className="text-xs text-red-500">{formErrors.customerPhone}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">طريقة الاستلام</label>
                  <select value={form.deliveryMethod} onChange={e => setForm(f => ({ ...f, deliveryMethod: e.target.value }))} className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white">
                    {Object.entries(deliveryLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">طريقة الدفع</label>
                  <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white">
                    {Object.entries(paymentLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>

              {form.deliveryMethod === 'delivery' && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">العنوان التفصيلي *</label>
                  <input
                    type="text"
                    placeholder="الشارع، الحي، رقم المبنى"
                    value={form.customerAddress}
                    onChange={e => setForm(f => ({ ...f, customerAddress: e.target.value }))}
                    className={`w-full border rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 ${formErrors.customerAddress ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  />
                  {formErrors.customerAddress && <p className="text-xs text-red-500">{formErrors.customerAddress}</p>}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">المدينة / المنطقة</label>
                <input type="text" placeholder="مثال: الرياض — حي النزهة" value={form.customerArea} onChange={e => setForm(f => ({ ...f, customerArea: e.target.value }))} className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">ملاحظات إضافية</label>
                <textarea rows={2} placeholder="أي تعليمات خاصة بالطلب..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none" />
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span>
                  <span>{submitError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || cart.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl py-3.5 font-bold text-base transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري إرسال الطلب...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>تأكيد الطلب — {subtotal.toFixed(2)} {currency}</span>
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                بتأكيد الطلب توافق على التواصل معك لإتمام عملية التسليم
              </p>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400 mt-8">
        <p>{storeInfo.name} &mdash; جميع الأسعار بـ {currency}</p>
      </footer>
    </div>
  );
}
