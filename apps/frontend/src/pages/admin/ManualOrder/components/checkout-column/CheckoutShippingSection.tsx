import React from "react";
import { TruckIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { ShippingInfo } from "./types";

interface CheckoutShippingSectionProps {
  loadingShipping: boolean;
  shippingInfo: ShippingInfo | null;
  governorate: string;
  t: (key: string) => string;
}

export const CheckoutShippingSection: React.FC<CheckoutShippingSectionProps> = ({
  loadingShipping,
  shippingInfo,
  governorate,
  t,
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <TruckIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        {t("manualOrder.k_24")}
      </h3>

      {loadingShipping ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-4 h-4 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
          {t("manualOrder.k_100")}
        </div>
      ) : shippingInfo?.zoneId ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-green-700 dark:text-green-400">
              {t("manualOrder.k_101")}{shippingInfo.governorate})
            </span>
            <span className="font-bold text-green-700 dark:text-green-400">
              {shippingInfo.price.toLocaleString()} {t("manualOrder.k_75")}
            </span>
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            {t("manualOrder.k_102")} {shippingInfo.deliveryTime}
          </div>
        </div>
      ) : governorate ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400">
            <ExclamationTriangleIcon className="w-4 h-4" />
            {t("manualOrder.k_103")}
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-400 dark:text-gray-500">
          {t("manualOrder.k_104")}
        </div>
      )}
    </div>
  );
};
