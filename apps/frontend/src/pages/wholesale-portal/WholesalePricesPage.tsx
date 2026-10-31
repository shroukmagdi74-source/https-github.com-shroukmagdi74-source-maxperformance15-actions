import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag,
  Search,
  ShoppingCart,
  RotateCw,
  AlertCircle,
  Package,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { wholesalePortalApi, WholesalePriceItem } from './wholesalePortalApi';
import { WholesaleAccessCheck } from './WholesaleAccessCheck';

export const WholesalePricesPage: React.FC = () => {
  const [items, setItems] = useState<WholesalePriceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const navigate = useNavigate();

  const fetchPrices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await wholesalePortalApi.getPriceList();
      setItems(data || []);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'تعذر تحميل قائمة الأسعار';
      const code = err?.response?.data?.code;
      setError(msg);
      setErrorCode(code);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  if (errorCode === 'NOT_WHOLESALE_CUSTOMER' || errorCode === 'WHOLESALE_INACTIVE') {
    return <WholesaleAccessCheck error={error} errorCode={errorCode} />;
  }

  const filteredItems = items.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.productName.toLowerCase().includes(q) ||
      (item.productSku && item.productSku.toLowerCase().includes(q)) ||
      (item.variantName && item.variantName.toLowerCase().includes(q))
    );
  });

  const handleOrderProduct = (item: WholesalePriceItem) => {
    // Store selected product in session/local storage for the new order page
    try {
      sessionStorage.setItem(
        'ws_preselected_item',
        JSON.stringify({
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.minQuantity || 1,
        })
      );
    } catch (_) {}
    navigate('/wholesale-portal/new-order');
  };

  return (
    <div dir="rtl" className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="text-indigo-600" size={26} />
            قائمة أسعاري ومنتجات الجملة
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            المنتجات والأسعار المعتمدة لحسابك بسعر الجملة الخاص بك مع حدود الكميات الدنيا
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/wholesale-portal/new-order')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <ShoppingCart size={16} />
            إنشاء طلب جديد
          </button>
          <button
            onClick={fetchPrices}
            disabled={loading}
            className="p-2.5 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
            title="تحديث الأسعار"
          >
            <RotateCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative">
          <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو الرمز (SKU)..."
            className="w-full pr-10 pl-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-gray-200">
          <div className="text-center text-gray-500">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600 mb-2" />
            <p className="text-sm">جاري تحميل قائمة الأسعار المخصصة...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
          <Package className="mx-auto text-gray-400 mb-3" size={48} />
          <h3 className="text-lg font-bold text-gray-800">لا توجد منتجات مطابقة</h3>
          <p className="text-sm text-gray-500 mt-1">
            لم يتم العثور على أي منتجات في قائمة أسعار الجملة المعتمدة لحسابك.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const hasDiscount = item.regularPrice > item.wholesalePrice;
            const savingsPercent = hasDiscount
              ? Math.round(((item.regularPrice - item.wholesalePrice) / item.regularPrice) * 100)
              : 0;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-4">
                  {/* Image & Badges */}
                  <div className="relative aspect-video rounded-xl bg-gray-50 overflow-hidden flex items-center justify-center border border-gray-100">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={40} className="text-gray-300" />
                    )}

                    {savingsPercent > 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-xs font-bold font-mono">
                        وفر {savingsPercent}%
                      </span>
                    )}

                    {item.minQuantity > 1 && (
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                        أقل كمية: {item.minQuantity} قطعة
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="font-bold text-base text-gray-900 line-clamp-1">
                      {item.productName}
                    </h3>
                    {item.variantName && (
                      <span className="inline-block text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md mt-1">
                        النوع: {item.variantName}
                      </span>
                    )}
                    <div className="text-xs text-gray-400 font-mono mt-1">
                      SKU: {item.productSku || '—'}
                    </div>
                  </div>

                  {/* Pricing Box */}
                  <div className="p-3 bg-gray-50 rounded-xl flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-gray-500 block">سعر الجملة</span>
                      <div className="text-xl font-bold text-indigo-600 font-mono">
                        {item.wholesalePrice.toLocaleString('ar-EG')} <span className="text-xs font-normal">ج.م</span>
                      </div>
                    </div>

                    {hasDiscount && (
                      <div className="text-left">
                        <span className="text-xs text-gray-400 block">سعر التجزئة</span>
                        <span className="text-sm text-gray-400 line-through font-mono">
                          {item.regularPrice.toLocaleString('ar-EG')} ج.م
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    الحد الأدنى: <strong>{item.minQuantity}</strong>
                  </span>
                  <button
                    onClick={() => handleOrderProduct(item)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    <ShoppingCart size={14} />
                    إضافة للطلب
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
