import React from "react";
import { TicketIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CouponInfo } from "./types";
import { headingStyle, mutedStyle } from "./styles";

interface QuickOrderCouponSectionProps {
  appliedCoupon: CouponInfo | null;
  couponCode: string;
  setCouponCode: (code: string) => void;
  loadingCoupon: boolean;
  handleApplyCoupon: () => void;
  handleRemoveCoupon: () => void;
  manualDiscount: number;
  setManualDiscount: (discount: number) => void;
  subtotal: number;
}

export const QuickOrderCouponSection: React.FC<
  QuickOrderCouponSectionProps
> = ({
  appliedCoupon,
  couponCode,
  setCouponCode,
  loadingCoupon,
  handleApplyCoupon,
  handleRemoveCoupon,
  manualDiscount,
  setManualDiscount,
  subtotal,
}) => {
  return (
    <div className="business-page-panel p-3.5 sm:p-4">
      <h3
        className="mb-3 flex items-center gap-2 font-semibold text-sm sm:text-base"
        style={headingStyle}
      >
        <TicketIcon className="h-5 w-5" style={mutedStyle} />
        الكوبونات والخصم
      </h3>

      <div className="space-y-3">
        {/* Coupon Input or Applied Chip */}
        {!appliedCoupon ? (
          <div>
            <label className="mb-1 block text-xs" style={mutedStyle}>
              كود الكوبون
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="أدخل كود الكوبون..."
                className="business-control-input flex-1 text-sm font-mono"
                onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={loadingCoupon || !couponCode.trim() || subtotal <= 0}
                className="business-chip-button px-4 py-2 text-xs sm:text-sm font-semibold"
                data-active="true"
              >
                {loadingCoupon ? "جاري الفحص..." : "تطبيق"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <TicketIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="font-bold text-blue-700 dark:text-blue-300 font-mono">
                {appliedCoupon.code}
              </span>
              <span className="text-muted-foreground font-mono tabular-nums">
                (خصم {appliedCoupon.discountAmount.toLocaleString()} ج.م)
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
              title="إزالة الكوبون"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Manual Discount */}
        <div>
          <label className="mb-1 block text-xs" style={mutedStyle}>
            خصم يدوي مباشر (ج.م)
          </label>
          <input
            type="number"
            value={manualDiscount || ""}
            onChange={(e) =>
              setManualDiscount(Math.max(0, parseFloat(e.target.value) || 0))
            }
            placeholder="0"
            min="0"
            className="business-control-input w-full text-sm font-mono tabular-nums"
          />
        </div>
      </div>
    </div>
  );
};
