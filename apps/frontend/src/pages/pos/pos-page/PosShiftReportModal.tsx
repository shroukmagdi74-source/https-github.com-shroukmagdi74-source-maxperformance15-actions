import React from "react";
import {
  X,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  RotateCcw,
} from "lucide-react";
import { ShiftData } from "./types";

interface PosShiftReportModalProps {
  show: boolean;
  onClose: () => void;
  shiftData: ShiftData;
  onResetShift: () => void;
  locale: string;
  t: (key: string) => string;
}

export const PosShiftReportModal: React.FC<PosShiftReportModalProps> = ({
  show,
  onClose,
  shiftData,
  onResetShift,
  locale,
  t,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t("pos.k_56")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center border border-blue-100 dark:border-blue-900/30">
            <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("posPage.totalSales")}
            </p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono tabular-nums">
              {shiftData.totalSales.toLocaleString(locale)} {t("posPage.egp")}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center border border-green-100 dark:border-green-900/30">
            <Package className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("posPage.ordersCount")}
            </p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400 font-mono tabular-nums">
              {shiftData.totalOrders}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center border border-purple-100 dark:border-purple-900/30">
            <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("posPage.totalProducts")}
            </p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400 font-mono tabular-nums">
              {shiftData.totalItems}
            </p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 text-center border border-orange-100 dark:border-orange-900/30">
            <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("posPage.shiftStart")}
            </p>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400 font-mono tabular-nums">
              {shiftData.startTime.toLocaleTimeString("ar-EG")}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onResetShift}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 text-xs sm:text-sm"
          >
            <RotateCcw className="h-5 w-5" />
            {t("posPage.newShift")}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs sm:text-sm"
          >
            {t("posPage.close")}
          </button>
        </div>
      </div>
    </div>
  );
};
