import React from "react";
import { CheckCircleIcon, PrinterIcon } from "@heroicons/react/24/outline";

interface CheckoutSuccessModalProps {
  show: boolean;
  onClose: () => void;
  createdOrderId: string | null;
  isAffiliate: boolean;
  onViewOrder: () => void;
  onPrintInvoice: () => void;
  onCreateAnother: () => void;
  t: (key: string) => string;
}

export const CheckoutSuccessModal: React.FC<CheckoutSuccessModalProps> = ({
  show,
  onViewOrder,
  onPrintInvoice,
  onCreateAnother,
  t,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full">
            <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
            {t("manualOrder.k_61")}
          </h3>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            {t("manualOrder.k_131")}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onViewOrder}
              className="w-full py-3 px-4 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              {t("manualOrder.k_132")}
            </button>
            <button
              onClick={onPrintInvoice}
              className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <PrinterIcon className="w-5 h-5" />
              {t("manualOrder.k_133")}
            </button>
            <button
              onClick={onCreateAnother}
              className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t("manualOrder.k_134")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
