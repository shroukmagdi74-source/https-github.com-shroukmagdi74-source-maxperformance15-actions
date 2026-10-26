import React from "react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { CartItem } from "../types";
import { buildVariantSummary } from "./types";

interface CheckoutConfirmModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  firstName: string;
  lastName: string;
  phone: string;
  cartItems: CartItem[];
  grandTotal: number;
  t: (key: string) => string;
}

export const CheckoutConfirmModal: React.FC<CheckoutConfirmModalProps> = ({
  show,
  onClose,
  onConfirm,
  firstName,
  lastName,
  phone,
  cartItems,
  grandTotal,
  t,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
            <ShoppingCartIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
            {t("manualOrder.k_121")}
          </h3>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
            {t("manualOrder.k_122")}
          </p>

          {/* Order Summary in Modal */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t("manualOrder.k_123")}
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {firstName} {lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t("manualOrder.k_124")}
              </span>
              <span
                className="font-medium text-gray-900 dark:text-gray-100"
                dir="ltr"
              >
                {phone}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t("manualOrder.k_125")}
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {cartItems.length} {t("manualOrder.k_126")}
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}{" "}
                {t("manualOrder.k_119")}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="text-gray-600 dark:text-gray-400 mb-2">
                {t("manualOrder.k_127")}
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cartItems.map((item) => {
                  const variantSummary = buildVariantSummary(item);

                  return (
                    <div
                      key={`${item.productId}-${item.variantId || "default"}-confirm`}
                      className="rounded-md bg-white/70 dark:bg-gray-800/70 px-3 py-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {item.name}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {item.color && (
                              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                                {t("manualOrder.k_85")} {item.color}
                              </span>
                            )}
                            {item.size && (
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                                {t("manualOrder.k_86")} {item.size}
                              </span>
                            )}
                            {!item.color && !item.size && variantSummary && (
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                                {variantSummary}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-left shrink-0">
                          <div className="font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                            {item.price.toLocaleString()} {t("manualOrder.k_75")}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">
                            {t("manualOrder.k_128")} {item.quantity}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600 font-bold">
              <span className="text-gray-900 dark:text-gray-100">
                {t("manualOrder.k_77")}
              </span>
              <span className="text-blue-600 dark:text-blue-400 tabular-nums">
                {grandTotal.toLocaleString()} {t("manualOrder.k_75")}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t("manualOrder.k_129")}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 px-4 bg-green-600 dark:bg-green-500 text-white rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
            >
              {t("manualOrder.k_130")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
