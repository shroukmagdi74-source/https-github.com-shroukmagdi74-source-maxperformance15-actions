import React from "react";
import {
  ShoppingCartIcon,
  CubeIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import type { TFunction } from "i18next";
import { Order, getCompanyOrderImageUrl, getStatusInfo } from "./types";

interface CompanyOrdersListAndExpandedDetailsProps {
  t: TFunction;
  isLoading: boolean;
  orders: Order[];
  total: number;
  expandedOrder: string | null;
  toggleOrderExpand: (orderId: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (updater: (prev: number) => number) => void;
}

export const CompanyOrdersListAndExpandedDetails: React.FC<
  CompanyOrdersListAndExpandedDetailsProps
> = ({
  t,
  isLoading,
  orders,
  total,
  expandedOrder,
  toggleOrderExpand,
  page,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <ShoppingCartIcon className="w-5 h-5 text-blue-600" />
          الطلبات (<span className="font-mono tabular-nums">{total}</span>)
        </h2>
      </div>

      {isLoading ? (
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <ShoppingCartIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">لا توجد طلبات</p>
          <p className="text-sm">جرب تغيير الفلاتر</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {orders.map((order) => (
            <div
              key={order.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => toggleOrderExpand(order.id)}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-bold font-mono tabular-nums text-gray-800 dark:text-white">
                        #{order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusInfo(order.status)?.colorClass}`}
                    >
                      {(() => {
                        const info = getStatusInfo(order.status);
                        return (
                          t(info?.labelKey || "") ||
                          info?.label ||
                          order.status
                        );
                      })()}
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        المنتجات
                      </p>
                      <p className="font-bold font-mono tabular-nums text-gray-800 dark:text-white">
                        {order.itemsCount}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        الإجمالي
                      </p>
                      <p className="font-bold font-mono tabular-nums text-green-600">
                        {order.total.toLocaleString()} ج.م
                      </p>
                    </div>
                    <EyeIcon
                      className={`w-5 h-5 text-gray-400 transition-transform ${expandedOrder === order.id ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className="px-4 pb-4 animate-fadeIn">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          العميل:
                        </span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {order.customer.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          الهاتف:
                        </span>
                        <span
                          className="text-sm font-medium font-mono tabular-nums text-gray-800 dark:text-white"
                          dir="ltr"
                        >
                          {order.customer.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          المدينة:
                        </span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {order.customer.city}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <CubeIcon className="w-4 h-4" />
                        المنتجات
                      </h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                                {item.productImage ? (
                                  <img
                                    src={
                                      getCompanyOrderImageUrl(
                                        item.productImage,
                                      ) || ""
                                    }
                                    alt={item.productName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <CubeIcon className="w-6 h-6 m-3 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800 dark:text-white">
                                  {item.productName}
                                </p>
                                {item.sku && (
                                  <p className="text-xs font-mono tabular-nums text-gray-500 dark:text-gray-400">
                                    SKU: {item.sku}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-mono tabular-nums text-gray-600 dark:text-gray-400">
                                {item.quantity} × {item.price.toLocaleString()}{" "}
                                ج.م
                              </p>
                              <p className="font-bold font-mono tabular-nums text-gray-800 dark:text-white">
                                {item.total.toLocaleString()} ج.م
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          المجموع الفرعي
                        </span>
                        <span className="font-mono tabular-nums text-gray-800 dark:text-white">
                          {order.subtotal.toLocaleString()} ج.م
                        </span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">
                            الخصم
                          </span>
                          <span className="font-mono tabular-nums text-red-600">
                            -{order.discount.toLocaleString()} ج.م
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          الشحن
                        </span>
                        <span className="font-mono tabular-nums text-gray-800 dark:text-white">
                          {order.shippingCost.toLocaleString()} ج.م
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-gray-800 dark:text-white">
                          الإجمالي
                        </span>
                        <span className="font-mono tabular-nums text-green-600">
                          {order.total.toLocaleString()} ج.م
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            صفحة <span className="font-mono tabular-nums">{page}</span> من{" "}
            <span className="font-mono tabular-nums">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm disabled:opacity-50"
            >
              السابق
            </button>
            <button
              onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm disabled:opacity-50"
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
