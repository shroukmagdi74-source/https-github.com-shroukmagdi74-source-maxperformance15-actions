import React from "react";
import { TicketIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CouponInfo } from "./types";

interface CheckoutDiscountsSectionProps {
  couponCode: string;
  setCouponCode: (val: string) => void;
  appliedCoupon: CouponInfo | null;
  loadingCoupon: boolean;
  manualDiscount: number;
  setManualDiscount: (val: number) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  t: (key: string) => string;
}

export const CheckoutDiscountsSection: React.FC<CheckoutDiscountsSectionProps> = ({
  couponCode,
  setCouponCode,
  appliedCoupon,
  loadingCoupon,
  manualDiscount,
  setManualDiscount,
  onApplyCoupon,
  onRemoveCoupon,
  t,
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <TicketIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        {t("manualOrder.k_105")}
      </h3>

      {/* Coupon Input */}
      {!appliedCoupon ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder={t("manualOrder.k_9")}
            className="flex-1 border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
            onKeyDown={(e) => e.key === "Enter" && onApplyCoupon()}
          />
          <button
            onClick={onApplyCoupon}
            disabled={loadingCoupon || !couponCode.trim()}
            className="px-3 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md text-sm hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
          >
            {loadingCoupon ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              t("manualOrder.k_71")
            )}
          </button>
        </div>
      ) : (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                {appliedCoupon.code}
              </span>
              <span className="text-xs text-blue-600 dark:text-blue-400 mr-2">
                ({appliedCoupon.name})
              </span>
            </div>
            <button
              onClick={onRemoveCoupon}
              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-400 mt-1">
            {t("manualOrder.k_106")}{appliedCoupon.discountAmount.toLocaleString()} {t("manualOrder.k_75")}
          </div>
        </div>
      )}

      {/* Manual Discount */}
      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
          {t("manualOrder.k_107")}
        </label>
        <input
          type="number"
          value={manualDiscount || ""}
          onChange={(e) => setManualDiscount(parseFloat(e.target.value) || 0)}
          className="w-full border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm dark:bg-gray-700 dark:text-gray-100"
          placeholder="0"
          min="0"
        />
      </div>
    </div>
  );
};
