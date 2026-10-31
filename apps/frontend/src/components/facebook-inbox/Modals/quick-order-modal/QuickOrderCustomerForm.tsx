import React from "react";
import {
  UserIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  CustomerLookupResult,
  PreviousOrder,
} from "../../../../hooks/useCustomerByPhone";
import { CustomerBlockEvaluation } from "../../../../services/customerBlocklistService";
import { headingStyle, mutedStyle, dangerStyle } from "./styles";

interface QuickOrderCustomerFormProps {
  phone: string;
  setPhone: (phone: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  loadingCustomerOrders: boolean;
  customerProfile: CustomerLookupResult | null;
  previousOrders: PreviousOrder[];
  checkingBlock: boolean;
  customerBlock: CustomerBlockEvaluation | null;
  allowBlockedCustomerOverride: boolean;
  setAllowBlockedCustomerOverride: (allow: boolean) => void;
  canOverrideBlockedCustomer: boolean;
}

export const QuickOrderCustomerForm: React.FC<QuickOrderCustomerFormProps> = ({
  phone,
  setPhone,
  customerName,
  setCustomerName,
  loadingCustomerOrders,
  customerProfile,
  previousOrders,
  checkingBlock,
  customerBlock,
  allowBlockedCustomerOverride,
  setAllowBlockedCustomerOverride,
  canOverrideBlockedCustomer,
}) => {
  return (
    <div className="business-page-panel p-3.5 sm:p-4">
      <h3
        className="mb-3 sm:mb-4 flex items-center gap-2 font-semibold text-sm sm:text-base"
        style={headingStyle}
      >
        <UserIcon className="h-5 w-5" style={mutedStyle} />
        بيانات العميل
      </h3>

      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="mb-1 block text-xs" style={mutedStyle}>
              رقم الهاتف <span style={dangerStyle}>*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="business-control-input w-full text-sm font-mono"
                placeholder="01xxxxxxxxx"
                dir="ltr"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs" style={mutedStyle}>
              اسم العميل <span style={dangerStyle}>*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="business-control-input w-full text-sm"
              placeholder="اسم العميل"
            />
          </div>
        </div>

        {/* Customer Profile & Historical Orders Lookup */}
        {(loadingCustomerOrders ||
          customerProfile ||
          previousOrders.length > 0) && (
          <div className="rounded-xl border p-3 text-xs sm:text-sm bg-slate-50/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs" style={headingStyle}>
                  سجل العميل والطلبات السابقة
                </span>
                {loadingCustomerOrders && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-primary animate-pulse">
                    <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                    جاري فحص السجل...
                  </span>
                )}
              </div>

              {customerProfile && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {customerProfile.customerRating && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300">
                      ⭐ {customerProfile.customerRating}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono tabular-nums">
                    {customerProfile.totalOrdersCount || previousOrders.length}{" "}
                    طلبات
                  </span>
                  {customerProfile.deliveryRate != null && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-mono tabular-nums">
                      {customerProfile.deliveryRate}% تسليم
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Customer Tags & Address info if any */}
            {customerProfile &&
              (customerProfile.tags || customerProfile.notes) && (
                <div className="text-[11px] space-y-1 text-muted-foreground border-t border-slate-200/60 dark:border-slate-800/60 pt-1.5">
                  {customerProfile.notes && (
                    <p className="truncate">
                      📝 <span className="font-medium text-foreground">ملاحظات:</span>{" "}
                      {customerProfile.notes}
                    </p>
                  )}
                </div>
              )}

            {/* Full Previous Orders List */}
            {previousOrders.length > 0 ? (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] text-muted-foreground font-medium flex items-center justify-between">
                  <span>
                    الطلبات السابقة المسجلة ({previousOrders.length}):
                  </span>
                  <span className="text-[10px] opacity-75">محدّثة فورياً</span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-0.5">
                  {previousOrders.map((prevOrder) => (
                    <div
                      key={prevOrder.id || prevOrder.orderNumber}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-xs space-y-1 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold font-mono">
                            #{prevOrder.orderNumber}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(prevOrder.createdAt).toLocaleDateString(
                              "ar-EG",
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {prevOrder.status}
                          </span>
                          <span className="font-bold text-primary font-mono tabular-nums">
                            {prevOrder.total?.toLocaleString()} ج.م
                          </span>
                        </div>
                      </div>

                      {prevOrder.orderItems &&
                        prevOrder.orderItems.length > 0 && (
                          <div className="text-[11px] text-muted-foreground truncate">
                            {prevOrder.orderItems
                              .map(
                                (item: any) =>
                                  `${item.quantity}× ${item.productName || item.name}${
                                    item.productSize || item.productColor
                                      ? ` (${[
                                          item.productColor,
                                          item.productSize,
                                        ]
                                          .filter(Boolean)
                                          .join("-")})`
                                      : ""
                                  }`,
                              )
                              .join(" · ")}
                          </div>
                        )}

                      <div className="text-left pt-0.5">
                        <a
                          href={`/orders/${encodeURIComponent(prevOrder.orderNumber || prevOrder.id)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-primary hover:underline font-medium inline-flex items-center gap-1"
                        >
                          عرض تفاصيل الطلب ←
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : !loadingCustomerOrders &&
              phone.replace(/\D/g, "").length >= 10 ? (
              <div className="text-xs text-muted-foreground italic py-1">
                لا توجد طلبات سابقة مسجلة لهذا الرقم (عميل جديد)
              </div>
            ) : null}
          </div>
        )}

        {(checkingBlock || customerBlock) && (
          <div
            className={`rounded-xl border p-3 text-xs sm:text-sm ${
              customerBlock?.blocked
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
                : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
            }`}
          >
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {checkingBlock
                    ? "جاري فحص سجل العميل..."
                    : customerBlock?.blocked
                      ? "تنبيه: العميل محظور من إنشاء الطلبات"
                      : "تنبيه بخصوص هذا العميل"}
                </p>
                {customerBlock?.message && (
                  <p className="mt-1 leading-5 text-xs">
                    {customerBlock.message}
                  </p>
                )}
                {customerBlock?.blocked && canOverrideBlockedCustomer && (
                  <label className="mt-2.5 flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowBlockedCustomerOverride}
                      onChange={(e) =>
                        setAllowBlockedCustomerOverride(e.target.checked)
                      }
                      className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                    />
                    <span>تجاوز الحظر وإتمام الطلب (صلاحية إدارية)</span>
                  </label>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
