import React from "react";
import {
  BanknotesIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  CouponInfo,
  CartItem,
  ShippingInfo,
} from "./types";
import {
  EligiblePreviousOrder,
  ExchangeReturnPolicy,
} from "../../../../hooks/useCustomerByPhone";
import {
  headingStyle,
  mutedStyle,
} from "./styles";
import { QuickOrderCouponSection } from "./QuickOrderCouponSection";
import { QuickOrderTotalsSummary } from "./QuickOrderTotalsSummary";

interface QuickOrderPaymentFormProps {
  cartItems: CartItem[];
  subtotal: number;
  totalDiscount: number;
  shippingCost: number;
  grandTotal: number;
  appliedCoupon: CouponInfo | null;
  couponCode: string;
  setCouponCode: (code: string) => void;
  loadingCoupon: boolean;
  handleApplyCoupon: () => void;
  handleRemoveCoupon: () => void;
  manualDiscount: number;
  setManualDiscount: (discount: number) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  status: string;
  setStatus: (status: string) => void;
  requestType: string;
  setRequestType: (type: string) => void;
  returnAmount: string;
  setReturnAmount: (amount: string) => void;
  shippingInfo: ShippingInfo | null;
  isExchangeOrReturn: boolean;
  phoneDigitsCount: number;
  previousOrderMissing: boolean;
  exchangeReturnPolicy: ExchangeReturnPolicy | null;
  eligiblePreviousOrders: EligiblePreviousOrder[];
  selectedPreviousOrder: string;
  setSelectedPreviousOrder: (orderId: string) => void;
  selectedOrderObj?: EligiblePreviousOrder;
}

export const QuickOrderPaymentForm: React.FC<QuickOrderPaymentFormProps> = ({
  cartItems,
  subtotal,
  totalDiscount,
  shippingCost,
  grandTotal,
  appliedCoupon,
  couponCode,
  setCouponCode,
  loadingCoupon,
  handleApplyCoupon,
  handleRemoveCoupon,
  manualDiscount,
  setManualDiscount,
  paymentMethod,
  setPaymentMethod,
  status,
  setStatus,
  requestType,
  setRequestType,
  returnAmount,
  setReturnAmount,
  shippingInfo,
  isExchangeOrReturn,
  phoneDigitsCount,
  previousOrderMissing,
  exchangeReturnPolicy,
  eligiblePreviousOrders,
  selectedPreviousOrder,
  setSelectedPreviousOrder,
  selectedOrderObj,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Coupons and Discounts */}
      <QuickOrderCouponSection
        appliedCoupon={appliedCoupon}
        couponCode={couponCode}
        setCouponCode={setCouponCode}
        loadingCoupon={loadingCoupon}
        handleApplyCoupon={handleApplyCoupon}
        handleRemoveCoupon={handleRemoveCoupon}
        manualDiscount={manualDiscount}
        setManualDiscount={setManualDiscount}
        subtotal={subtotal}
      />

      {/* Order Settings & Payment */}
      <div className="business-page-panel p-3.5 sm:p-4">
        <h3
          className="mb-3 flex items-center gap-2 font-semibold text-sm sm:text-base"
          style={headingStyle}
        >
          <BanknotesIcon className="h-5 w-5" style={mutedStyle} />
          إعدادات الطلب والدفع
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs" style={mutedStyle}>
              طريقة الدفع
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="business-control-input w-full text-sm"
            >
              <option value="CASH">دفع عند الاستلام (كاش)</option>
              <option value="WALLET">محفظة إلكترونية</option>
              <option value="INSTAPAY">إنستاباي (InstaPay)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs" style={mutedStyle}>
              حالة الطلب
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="business-control-input w-full text-sm"
            >
              <option value="CONFIRMED">مؤكد (CONFIRMED)</option>
              <option value="PENDING">معلق (PENDING)</option>
              <option value="PROCESSING">قيد التجهيز (PROCESSING)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs" style={mutedStyle}>
              نوع الطلب
            </label>
            <select
              value={requestType}
              onChange={(e) => {
                const val = e.target.value;
                setRequestType(val);
                if (val === "return") {
                  setStatus("RETURNED");
                } else if (val === "exchange") {
                  setStatus("EXCHANGED");
                } else {
                  setStatus("CONFIRMED");
                }
              }}
              className="business-control-input w-full text-sm"
            >
              <option value="delivery">شحن وتوصيل عادي</option>
              <option value="partial_delivery">طلب تسليم جزئي</option>
              <option value="exchange">طلب استبدال</option>
              <option value="return">طلب مرتجع</option>
            </select>
          </div>
        </div>

        {(requestType === "return" || requestType === "exchange") && (
          <div className="mt-3">
            <label className="mb-1 block text-xs" style={mutedStyle}>
              💰 مبلغ التحصيل في حالة المرتجع (افتراضي: مصاريف الشحن)
            </label>
            <div className="relative">
              <input
                type="number"
                value={returnAmount}
                onChange={(e) => setReturnAmount(e.target.value)}
                placeholder={
                  shippingInfo
                    ? `${shippingInfo.price} (مصاريف الشحن)`
                    : "سيتم استخدام مصاريف الشحن تلقائياً"
                }
                className="business-control-input w-full text-sm pe-12 font-mono tabular-nums"
                min="0"
                step="1"
              />
              <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                ج.م
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              هذا المبلغ يظهر لشركة الشحن كـ &quot;مبلغ التحصيل في حالة
              المرتجع&quot;.
            </p>
          </div>
        )}

        {isExchangeOrReturn && (
          <div className="mt-3 space-y-2">
            {phoneDigitsCount < 9 ? (
              <div className="p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  يرجى إدخال رقم هاتف العميل أولاً للتحقق من وجود طلبات سابقة
                  مؤهلة
                </span>
              </div>
            ) : previousOrderMissing ? (
              <div className="p-3 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/30 text-xs text-red-700 dark:text-red-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    لا يمكن إنشاء طلب{" "}
                    {requestType === "return" ? "مرتجع" : "استبدال"}
                  </span>
                </div>
                <p className="leading-relaxed text-[11px]">
                  سياسة المتجر تشترط وجود طلب سابق مكتمل (
                  {exchangeReturnPolicy?.allowedStatuses?.join(" أو ") ||
                    "DELIVERED"}
                  ) خلال {exchangeReturnPolicy?.timeLimitDays || 14} يوم. لم يتم
                  العثور على أي طلب مؤهل لهذا الرقم.
                </p>
              </div>
            ) : eligiblePreviousOrders.length > 0 ? (
              <div className="p-3 rounded-lg border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-blue-900 dark:text-blue-300">
                    الطلب السابق المرتبط بال
                    {requestType === "return" ? "مرتجع" : "استبدال"}
                    {exchangeReturnPolicy?.requireExplicitOrderLink && (
                      <span className="text-red-500 ms-1">*</span>
                    )}
                  </label>
                  <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                    {eligiblePreviousOrders.length} طلب سابق مؤهل
                  </span>
                </div>
                <select
                  value={selectedPreviousOrder}
                  onChange={(e) => setSelectedPreviousOrder(e.target.value)}
                  className="business-control-input w-full text-xs py-1.5"
                >
                  <option value="">
                    {exchangeReturnPolicy?.requireExplicitOrderLink
                      ? "اختر الطلب السابق (إلزامي)..."
                      : "تحديد تلقائي (أحدث طلب مؤهل)"}
                  </option>
                  {eligiblePreviousOrders.map((ord) => (
                    <option key={ord.id} value={ord.id}>
                      #{ord.orderNumber} —{" "}
                      {new Date(ord.createdAt).toLocaleDateString("ar-EG")} —{" "}
                      {Number(ord.total).toLocaleString()} ج.م ({ord.status})
                    </option>
                  ))}
                </select>
                {selectedOrderObj && (
                  <div className="text-[11px] text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 p-2 rounded border border-gray-200 dark:border-gray-700 space-y-0.5">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                      المنتجات بالطلب السابق:{" "}
                    </span>
                    <span>
                      {selectedOrderObj.orderItems
                        ?.map(
                          (it) =>
                            `${it.productName}${it.productColor ? ` - ${it.productColor}` : ""}${it.productSize ? ` (${it.productSize})` : ""} × ${it.quantity}`,
                        )
                        .join(" | ") || "منتجات الطلب السابق"}
                    </span>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Order Summary */}
      <QuickOrderTotalsSummary
        cartItems={cartItems}
        subtotal={subtotal}
        totalDiscount={totalDiscount}
        shippingCost={shippingCost}
        grandTotal={grandTotal}
      />
    </div>
  );
};
