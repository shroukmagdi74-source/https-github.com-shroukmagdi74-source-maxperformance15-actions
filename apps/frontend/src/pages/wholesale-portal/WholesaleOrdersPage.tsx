import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  AlertCircle,
  RotateCw,
  ShoppingBag,
  Calendar,
  X,
  CreditCard,
  MapPin,
} from 'lucide-react';
import { wholesalePortalApi, WholesaleOrder } from './wholesalePortalApi';
import { WholesaleAccessCheck } from './WholesaleAccessCheck';

export const WholesaleOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<WholesaleOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<WholesaleOrder | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await wholesalePortalApi.getOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setOrders(res.data || []);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'تعذر تحميل الطلبات';
      const code = err?.response?.data?.code;
      setError(msg);
      setErrorCode(code);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const viewOrderDetails = async (orderId: string) => {
    try {
      setDetailsLoading(true);
      const order = await wholesalePortalApi.getOrderDetails(orderId);
      setSelectedOrder(order);
    } catch (err: any) {
      alert(err?.response?.data?.error || 'تعذر تحميل تفاصيل الطلب');
    } finally {
      setDetailsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={13} />
            قيد المراجعة
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle size={13} />
            تم التأكيد
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Package size={13} />
            جاري التجهيز
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck size={13} />
            تم الشحن
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle size={13} />
            تم التسليم
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle size={13} />
            ملغي
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  if (errorCode === 'NOT_WHOLESALE_CUSTOMER' || errorCode === 'WHOLESALE_INACTIVE') {
    return <WholesaleAccessCheck error={error} errorCode={errorCode} />;
  }

  return (
    <div dir="rtl" className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="text-indigo-600" size={26} />
            طلبات الجملة
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            متابعة حالة طلبات التوريد والجملة الخاصة بك وتفاصيل الشحن
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
        >
          <RotateCw size={16} className={loading ? 'animate-spin' : ''} />
          تحديث القائمة
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'الكل' },
          { key: 'pending', label: 'قيد المراجعة' },
          { key: 'confirmed', label: 'تم التأكيد' },
          { key: 'processing', label: 'جاري التجهيز' },
          { key: 'shipped', label: 'تم الشحن' },
          { key: 'delivered', label: 'تم التسليم' },
          { key: 'cancelled', label: 'ملغي' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === tab.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-gray-200">
          <div className="text-center text-gray-500">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600 mb-2" />
            <p className="text-sm">جاري تحميل طلبات الجملة...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
          <Package className="mx-auto text-gray-400 mb-3" size={48} />
          <h3 className="text-lg font-bold text-gray-800">لا توجد طلبات في هذا القسم</h3>
          <p className="text-sm text-gray-500 mt-1">لم تقم بإنشاء أي طلبات توريد جملة تطابق هذا الفلتر بعد.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-indigo-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-base text-gray-900 font-mono">
                    #{order.orderNumber}
                  </span>
                  {getStatusBadge(order.status)}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {new Date(order.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span>•</span>
                  <span>{order.itemsCount} أصناف في الطلب</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <div className="text-left">
                  <div className="text-xs text-gray-500">إجمالي الطلب</div>
                  <div className="text-lg font-bold text-gray-900 font-mono">
                    {Number(order.total).toLocaleString('ar-EG')} ج.م
                  </div>
                </div>

                <button
                  onClick={() => viewOrderDetails(order.id)}
                  disabled={detailsLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                >
                  <Eye size={16} />
                  عرض التفاصيل
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100 p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  تفاصيل الطلب #{selectedOrder.orderNumber}
                </h3>
                <span className="text-xs text-gray-500">
                  {new Date(selectedOrder.createdAt).toLocaleDateString('ar-EG', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl text-sm">
              <div>
                <span className="text-xs text-gray-500 block">حالة الطلب</span>
                <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">حالة الدفع</span>
                <span className="font-semibold text-gray-800 mt-1 block">
                  {selectedOrder.paymentStatus === 'PAID' ? 'تم السداد' : 'آجل / في الحساب'}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">إجمالي الفاتورة</span>
                <span className="font-bold text-indigo-600 mt-1 block font-mono">
                  {Number(selectedOrder.total).toLocaleString('ar-EG')} ج.م
                </span>
              </div>
            </div>

            {selectedOrder.shippingAddress && (
              <div className="text-sm p-3 bg-amber-50/60 rounded-xl border border-amber-200/50 flex items-start gap-2 text-gray-700">
                <MapPin size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold block text-xs text-amber-900">عنوان التسليم:</span>
                  <span>{selectedOrder.shippingAddress} {selectedOrder.city ? `- ${selectedOrder.city}` : ''}</span>
                </div>
              </div>
            )}

            {/* Items Table */}
            <div>
              <h4 className="font-bold text-sm text-gray-800 mb-3">الأصناف المطلوبة</h4>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-right">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-600">
                    <tr>
                      <th className="p-3">المنتج</th>
                      <th className="p-3 text-center">الكمية</th>
                      <th className="p-3 text-left">السعر</th>
                      <th className="p-3 text-left">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(selectedOrder.items || []).map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="p-3">
                          <div className="font-medium text-gray-900">{item.productName}</div>
                          {item.productSku && (
                            <span className="text-xs text-gray-400 font-mono">{item.productSku}</span>
                          )}
                        </td>
                        <td className="p-3 text-center font-mono font-semibold">{item.quantity}</td>
                        <td className="p-3 text-left font-mono">{Number(item.price).toLocaleString('ar-EG')} ج.م</td>
                        <td className="p-3 text-left font-mono font-bold text-gray-900">
                          {Number(item.total).toLocaleString('ar-EG')} ج.م
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600">
                <span className="font-semibold block mb-0.5">ملاحظات الطلب:</span>
                {selectedOrder.notes}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-sm font-medium transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
