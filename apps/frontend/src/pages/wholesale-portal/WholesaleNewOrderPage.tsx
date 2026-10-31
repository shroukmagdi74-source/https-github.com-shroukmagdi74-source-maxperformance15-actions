import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  RotateCw,
  MapPin,
  FileText,
  CreditCard,
  ShieldAlert,
  ArrowRight,
  Package,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  wholesalePortalApi,
  WholesalePriceItem,
  WholesaleProfile,
} from './wholesalePortalApi';
import { WholesaleAccessCheck } from './WholesaleAccessCheck';

interface CartItem {
  item: WholesalePriceItem;
  quantity: number;
}

export const WholesaleNewOrderPage: React.FC = () => {
  const [profile, setProfile] = useState<WholesaleProfile | null>(null);
  const [catalog, setCatalog] = useState<WholesalePriceItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [createdOrderResult, setCreatedOrderResult] = useState<{
    id: string;
    orderNumber: string;
    total: number;
  } | null>(null);

  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [profData, catalogData] = await Promise.all([
        wholesalePortalApi.getProfile(),
        wholesalePortalApi.getPriceList(),
      ]);
      setProfile(profData);
      setCatalog(catalogData || []);

      // Check if an item was preselected from prices screen
      try {
        const stored = sessionStorage.getItem('ws_preselected_item');
        if (stored) {
          sessionStorage.removeItem('ws_preselected_item');
          const parsed = JSON.parse(stored);
          const found = catalogData.find(
            (c) =>
              c.productId === parsed.productId &&
              (parsed.variantId ? c.variantId === parsed.variantId : true)
          );
          if (found) {
            setCart([
              {
                item: found,
                quantity: Math.max(parsed.quantity || 1, found.minQuantity || 1),
              },
            ]);
          }
        }
      } catch (_) {}
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'تعذر تحميل بيانات الطلب';
      const code = err?.response?.data?.code;
      setError(msg);
      setErrorCode(code);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addToCart = (product: WholesalePriceItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === product.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === product.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item: product, quantity: product.minQuantity || 1 }];
    });
  };

  const updateQuantity = (itemId: string, qty: number) => {
    const target = cart.find((ci) => ci.item.id === itemId);
    if (!target) return;
    const min = target.item.minQuantity || 1;
    if (qty < min) return;

    setCart((prev) =>
      prev.map((ci) => (ci.item.id === itemId ? { ...ci, quantity: qty } : ci))
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
  };

  const orderTotal = useMemo(() => {
    return cart.reduce((sum, ci) => sum + ci.item.wholesalePrice * ci.quantity, 0);
  }, [cart]);

  const creditLimit = profile ? Number(profile.creditLimit || 0) : 0;
  const currentBalance = profile ? Number(profile.currentBalance || 0) : 0;
  const availableCredit = profile ? Number(profile.availableCredit || 0) : 0;
  const exceedsCredit = creditLimit > 0 && currentBalance + orderTotal > creditLimit;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('يجب إضافة صنف واحد على الأقل للطلب');
      return;
    }

    if (exceedsCredit) {
      alert('إجمالي الطلب يتجاوز الحد الائتماني المسموح به لحسابك.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        items: cart.map((ci) => ({
          productId: ci.item.productId,
          variantId: ci.item.variantId || null,
          quantity: ci.quantity,
        })),
        notes,
        shippingAddress,
        city,
      };

      const result = await wholesalePortalApi.createOrder(payload);
      setCreatedOrderResult(result);
      setCart([]);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'حدث خطأ أثناء إرسال الطلب';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (errorCode === 'NOT_WHOLESALE_CUSTOMER' || errorCode === 'WHOLESALE_INACTIVE') {
    return <WholesaleAccessCheck error={error} errorCode={errorCode} />;
  }

  // Order Success Screen
  if (createdOrderResult) {
    return (
      <div dir="rtl" className="max-w-2xl mx-auto my-8 p-8 bg-white rounded-2xl shadow-sm border border-gray-200 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle size={36} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">تم تسجيل طلب الجملة بنجاح!</h2>
          <p className="text-gray-500 text-sm mt-1">
            الطلب قيد المراجعة في مركز التأكيد برقم{' '}
            <strong className="font-mono text-indigo-600">#{createdOrderResult.orderNumber}</strong>
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl text-sm border border-gray-100 space-y-2 text-right">
          <div className="flex justify-between">
            <span className="text-gray-500">حالة الطلب الأولية:</span>
            <span className="font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full text-xs">
              قيد المراجعة (PENDING)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">إجمالي الفاتورة:</span>
            <span className="font-bold font-mono text-gray-900">
              {createdOrderResult.total.toLocaleString('ar-EG')} ج.م
            </span>
          </div>
          <div className="text-xs text-indigo-700 bg-indigo-50/70 p-2.5 rounded-lg mt-3">
            ℹ️ <strong>ملاحظة مالية:</strong> لم يتم تعديل رصيدك المالي حالياً، وسيتم إضافة الفاتورة لرصيدك عند مراجعة وتأكيد الطلب من قِبل الشركة.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              setCreatedOrderResult(null);
              navigate('/wholesale-portal/orders');
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-colors"
          >
            عرض في «طلباتي»
          </button>
          <button
            onClick={() => setCreatedOrderResult(null)}
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-sm rounded-xl transition-colors"
          >
            إنشاء طلب آخر
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="text-indigo-600" size={26} />
            طلب جملة جديد
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            اختر المنتجات والكميات المطلوبة مع فحص فوري للحد الائتماني المتاح
          </p>
        </div>

        {/* Credit Limit Badge in Header */}
        <div className="flex items-center gap-4 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 text-xs">
          <div>
            <span className="text-gray-400 block">الحد الائتماني:</span>
            <span className="font-bold text-gray-800 font-mono">
              {creditLimit.toLocaleString('ar-EG')} ج.م
            </span>
          </div>
          <span className="text-gray-300">|</span>
          <div>
            <span className="text-gray-400 block">المتاح حالياً:</span>
            <span className={`font-bold font-mono ${availableCredit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {availableCredit.toLocaleString('ar-EG')} ج.م
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 flex items-center gap-3 text-sm">
          <AlertTriangle size={20} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Credit Exceeded Warning Banner */}
      {exceedsCredit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-sm">
          <ShieldAlert size={22} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">تجاوز الحد الائتماني المسموح به</h4>
            <p className="text-xs text-red-700 mt-0.5">
              إجمالي هذا الطلب ({orderTotal.toLocaleString('ar-EG')} ج.م) بالإضافة إلى رصيدك الحالي ({currentBalance.toLocaleString('ar-EG')} ج.م) يتجاوز الحد المسموح به ({creditLimit.toLocaleString('ar-EG')} ج.م). يرجى تقليل الكميات لتناسب الحد المتاح ({availableCredit.toLocaleString('ar-EG')} ج.م).
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Cart & Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">سلة منتجات الطلب</h3>
              <span className="text-xs text-gray-400">{cart.length} أصناف مضافة</span>
            </div>

            {cart.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Package className="mx-auto mb-2 text-gray-300" size={40} />
                <p className="text-sm font-medium">السلة فارغة حالياً</p>
                <p className="text-xs text-gray-400 mt-1">اختر الأصناف من القائمة على اليسار لإضافتها للطلب</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cart.map((ci) => {
                  const item = ci.item;
                  const itemTotal = item.wholesalePrice * ci.quantity;
                  const isMin = ci.quantity <= (item.minQuantity || 1);

                  return (
                    <div
                      key={item.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-sm text-gray-900">{item.productName}</div>
                        {item.variantName && (
                          <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {item.variantName}
                          </span>
                        )}
                        <div className="text-xs text-gray-400 font-mono">
                          سعر القطعة: {item.wholesalePrice.toLocaleString('ar-EG')} ج.م
                          {item.minQuantity > 1 && ` (أقل كمية: ${item.minQuantity})`}
                        </div>
                      </div>

                      {/* Quantity Controls & Total */}
                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl p-1 bg-gray-50">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, ci.quantity - 1)}
                            disabled={isMin}
                            className="p-1 hover:bg-white rounded-lg text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                            title={isMin ? `الحد الأدنى هو ${item.minQuantity}` : 'تقليل'}
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            type="number"
                            min={item.minQuantity || 1}
                            value={ci.quantity}
                            onChange={(e) =>
                              updateQuantity(item.id, parseInt(e.target.value, 10) || item.minQuantity || 1)
                            }
                            className="w-12 text-center text-xs font-bold font-mono bg-transparent border-0 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, ci.quantity + 1)}
                            className="p-1 hover:bg-white rounded-lg text-gray-600"
                            title="زيادة"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="w-24 text-left font-bold font-mono text-sm text-gray-900">
                          {itemTotal.toLocaleString('ar-EG')} ج.م
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Shipping & Notes Form */}
          <form onSubmit={handleSubmitOrder} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">بيانات التسليم والملاحظات</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  المدينة / المركز
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="مثال: القاهرة / مدينة نصر"
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  عنوان المستودع أو الاستلام
                </label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="شارع المخازن - مستودع الموزع"
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ملاحظات خاصة بالطلب (اختياري)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي تعليمات خاصة بالتحميل أو أوقات الاستلام..."
                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Total and Submit */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-gray-400 block">إجمالي قيمة الطلب</span>
                <div className="text-2xl font-bold text-indigo-600 font-mono">
                  {orderTotal.toLocaleString('ar-EG')} <span className="text-sm font-normal">ج.م</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || cart.length === 0 || exceedsCredit}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-50 disabled:hover:bg-indigo-600 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <RotateCw size={16} className="animate-spin" />
                    جاري إرسال الطلب...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    تأكيد وإرسال طلب الجملة
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Catalog Quick Selector */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center justify-between">
              <span>قائمة منتجاتك بالجملة</span>
              <span className="text-xs text-gray-400">{catalog.length} صنف</span>
            </h3>

            {loading ? (
              <div className="text-center py-8 text-xs text-gray-500">
                <div className="mx-auto h-5 w-5 animate-spin rounded-full border-b-2 border-indigo-600 mb-2" />
                جاري التحميل...
              </div>
            ) : catalog.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">لا توجد منتجات مسجلة في قائمتك.</p>
            ) : (
              <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
                {catalog.map((item) => {
                  const inCart = cart.some((ci) => ci.item.id === item.id);

                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-gray-100 hover:border-indigo-200 bg-gray-50/60 transition-all flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 overflow-hidden">
                        <div className="font-bold text-gray-900 truncate">{item.productName}</div>
                        {item.variantName && (
                          <div className="text-gray-500">{item.variantName}</div>
                        )}
                        <div className="font-mono text-indigo-600 font-semibold">
                          {item.wholesalePrice.toLocaleString('ar-EG')} ج.م
                          <span className="text-gray-400 font-normal mr-1">
                            (أقل كمية: {item.minQuantity})
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                          inCart
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {inCart ? 'تمت الإضافة +' : 'إضافة'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
