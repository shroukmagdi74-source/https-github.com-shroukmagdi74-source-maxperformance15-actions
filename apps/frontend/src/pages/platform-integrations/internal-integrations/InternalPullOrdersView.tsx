import React from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { Connection, InternalOrder } from "./types";

export interface InternalPullOrdersViewProps {
  selectedProvider: Connection;
  availableOrders: InternalOrder[];
  selectedOrderIds: Set<string>;
  fetchingOrders: boolean;
  importingOrders: boolean;
  onBack: () => void;
  onImportOrders: () => void;
  onToggleOrder: (orderId: string) => void;
}

export const InternalPullOrdersView: React.FC<InternalPullOrdersViewProps> = ({
  selectedProvider,
  availableOrders,
  selectedOrderIds,
  fetchingOrders,
  importingOrders,
  onBack,
  onImportOrders,
  onToggleOrder,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="الرجوع"
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t("platform.k_33")}
              {selectedProvider.provider.name}
            </h2>
            <p className="text-sm text-gray-500">{t("platform.k_34")}</p>
          </div>
        </div>
        <button
          onClick={onImportOrders}
          disabled={importingOrders || selectedOrderIds.size === 0}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {importingOrders ? (
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
          ) : (
            <ArrowDownTrayIcon className="w-5 h-5" />
          )}
          {t("platform.k_93")}
          <span className="tabular-nums">{selectedOrderIds.size}</span>)
        </button>
      </div>

      {fetchingOrders ? (
        <div className="py-20 text-center">
          <ArrowPathIcon className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">{t("platform.k_35")}</p>
        </div>
      ) : availableOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableOrders.map((order: InternalOrder) => {
            const isSelected = selectedOrderIds.has(order.id);
            return (
              <div
                key={order.id}
                onClick={() => onToggleOrder(order.id)}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10"
                    : "border-gray-100 dark:border-gray-700 hover:border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {t("platform.k_36")}
                      <span className="tabular-nums">{order.orderNumber}</span>
                    </h4>
                    <p className="text-xs text-gray-500 tabular-nums">
                      {new Date(order.createdAt).toLocaleString("ar-EG")}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircleIcon className="w-6 h-6 text-indigo-600" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("platform.k_37")}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {order.customer.firstName} {order.customer.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("platform.k_38")}</span>
                    <span className="font-medium text-gray-900 dark:text-white tabular-nums">
                      {order.customer.phone}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 font-bold">
                      {t("platform.k_39")}
                    </span>
                    <span className="font-bold text-green-600 tabular-nums">
                      {order.total}
                      {t("platform.k_27")}
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-[10px] text-gray-400 mb-1">
                    {t("platform.k_40")}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {order.orderItems.map((item: any, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-[10px] rounded-md truncate max-w-[150px]"
                      >
                        {item.product.name} (x
                        <span className="tabular-nums">{item.quantity}</span>)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center">
          <ShoppingCartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t("platform.k_41")}
          </h3>
          <p className="text-gray-500">{t("platform.k_42")}</p>
        </div>
      )}
    </div>
  );
};
