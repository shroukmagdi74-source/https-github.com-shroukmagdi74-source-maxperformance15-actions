import React from "react";
import { Printer, Coffee } from "lucide-react";
import { LastOrder } from "./types";

interface PosReceiptModalProps {
  show: boolean;
  lastOrder: LastOrder | null;
  onPrintReceipt: () => void;
  onPrintKitchenTicket: () => void;
  onClose: () => void;
  t: (key: string) => string;
}

export const PosReceiptModal: React.FC<PosReceiptModalProps> = ({
  show,
  lastOrder,
  onPrintReceipt,
  onPrintKitchenTicket,
  onClose,
  t,
}) => {
  if (!show || !lastOrder) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t("pos.k_53")}
          </h2>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2 font-mono tabular-nums">
            {lastOrder.orderNumber}
          </p>
        </div>

        {lastOrder.paymentMethod === "CASH" &&
          lastOrder.change !== undefined &&
          lastOrder.change > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6 text-center border border-green-100 dark:border-green-900/30">
              <p className="text-gray-600 dark:text-gray-400">{t("pos.k_8")}</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 font-mono tabular-nums">
                {lastOrder.change.toLocaleString()} {t("pos.k_39")}
              </p>
            </div>
          )}

        <div className="flex gap-2">
          <button
            onClick={onPrintReceipt}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 text-xs sm:text-sm"
          >
            <Printer className="h-4 w-4" />
            {t("pos.k_54")}
          </button>
          <button
            onClick={onPrintKitchenTicket}
            className="flex-1 border border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-700 dark:text-amber-400 py-3 rounded-xl font-medium flex items-center justify-center gap-1.5 transition-all active:scale-95 text-xs sm:text-sm"
          >
            <Coffee className="h-4 w-4" />
            تذكرة البار
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs sm:text-sm"
          >
            {t("pos.k_55")}
          </button>
        </div>
      </div>
    </div>
  );
};
