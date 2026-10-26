import React from "react";
import { BanknotesIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import {
  EligiblePreviousOrder,
  ExchangeReturnPolicy,
} from "../../../../../hooks/useCustomerByPhone";
import { ShippingInfo } from "./types";

interface CheckoutOrderSettingsSectionProps {
  paymentMethod: string;
  setPaymentMethod: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  requestType: string;
  setRequestType: (val: string) => void;
  returnAmount: string;
  setReturnAmount: (val: string) => void;
  shippingInfo: ShippingInfo | null;
  notes: string;
  setNotes: (val: string) => void;
  isEn: boolean;
  isExchangeOrReturn: boolean;
  phoneDigitsCount: number;
  previousOrderMissing: boolean;
  eligiblePreviousOrders: EligiblePreviousOrder[];
  exchangeReturnPolicy: ExchangeReturnPolicy | null;
  selectedPreviousOrder: string;
  setSelectedPreviousOrder: (val: string) => void;
  selectedOrderObj: EligiblePreviousOrder | undefined;
  t: (key: string) => string;
}

export const CheckoutOrderSettingsSection: React.FC<CheckoutOrderSettingsSectionProps> = ({
  paymentMethod,
  setPaymentMethod,
  status,
  setStatus,
  requestType,
  setRequestType,
  returnAmount,
  setReturnAmount,
  shippingInfo,
  notes,
  setNotes,
  isEn,
  isExchangeOrReturn,
  phoneDigitsCount,
  previousOrderMissing,
  eligiblePreviousOrders,
  exchangeReturnPolicy,
  selectedPreviousOrder,
  setSelectedPreviousOrder,
  selectedOrderObj,
  t,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <BanknotesIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        {t("manualOrder.k_108")}
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            {t("manualOrder.k_109")}
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="CASH">{t("manualOrder.k_12")}</option>
            <option value="WALLET">{t("manualOrder.k_13")}</option>
            <option value="INSTAPAY">Instapay</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            {t("manualOrder.k_110")}
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="PENDING">{t("manualOrder.k_14")}</option>
            <option value="CONFIRMED">{t("manualOrder.k_15")}</option>
            <option value="PROCESSING">{t("manualOrder.k_16")}</option>
            <option value="RETURNED">{t("manualOrder.k_17")}</option>
            <option value="EXCHANGED">{t("manualOrder.k_18")}</option>
          </select>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            {t("manualOrder.k_111")}
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
            className="w-full border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="delivery">{t("manualOrder.k_19")}</option>
            <option value="partial_delivery">
              {isEn ? "Partial Delivery Order" : "طلب تسليم جزئي"}
            </option>
            <option value="return">{t("manualOrder.k_20")}</option>
            <option value="exchange">{t("manualOrder.k_21")}</option>
          </select>
        </div>

        {isExchangeOrReturn && (
          <div className="col-span-2 space-y-2">
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
                    لا يمكن إنشاء طلب {requestType === "return" ? "مرتجع" : "استبدال"}
                  </span>
                </div>
                <p className="leading-relaxed">
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
                  <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                    {eligiblePreviousOrders.length} طلب سابق مؤهل
                  </span>
                </div>
                <select
                  value={selectedPreviousOrder}
                  onChange={(e) => setSelectedPreviousOrder(e.target.value)}
                  className="w-full text-xs border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 py-2"
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
                            `${it.productName}${
                              it.productColor ? ` - ${it.productColor}` : ""
                            }${it.productSize ? ` (${it.productSize})` : ""} × ${
                              it.quantity
                            }`,
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

      {/* Return Collection Amount */}
      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
          {isEn
            ? "💰 Return Collection Amount (Default: Shipping Cost)"
            : "💰 مبلغ التحصيل في حالة المرتجع (افتراضي: مصاريف الشحن)"}
        </label>
        <div className="relative">
          <input
            type="number"
            value={returnAmount}
            onChange={(e) => setReturnAmount(e.target.value)}
            placeholder={
              shippingInfo
                ? `${shippingInfo.price} ${
                    isEn ? "(Shipping Cost)" : "(مصاريف الشحن)"
                  }`
                : isEn
                ? "Shipping cost will be used automatically"
                : "سيتم استخدام مصاريف الشحن تلقائياً"
            }
            className="w-full border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 pe-16"
            min="0"
            step="1"
          />
          <span
            className={`absolute ${
              isEn ? "end-2" : "start-2"
            } top-1/2 -translate-y-1/2 text-xs text-gray-400`}
          >
            {isEn ? "EGP" : "ج.م"}
          </span>
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {isEn
            ? 'This amount appears in the courier system as "Return Collection Amount"'
            : 'هذا المبلغ يظهر في شركة الشحن كـ "مبلغ التحصيل في حالة المرتجع"'}
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
          {t("manualOrder.k_112")}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 h-16 resize-none text-sm dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
          placeholder={t("manualOrder.k_10")}
        />
      </div>
    </div>
  );
};
