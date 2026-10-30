import React from "react";
import {
  CurrencyDollarIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { CommissionStats } from "./types";

export interface CommissionsStatsCardsProps {
  stats: CommissionStats | null;
  pendingPayoutsCount: number;
  pendingPayoutAmount: number;
  formatPrice: (amount: number) => string;
  isDark: boolean;
}

export const CommissionsStatsCards: React.FC<CommissionsStatsCardsProps> = ({
  stats,
  pendingPayoutsCount,
  pendingPayoutAmount,
  formatPrice,
  isDark,
}) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6 mb-8">
      <div
        className={`${
          isDark ? "bg-gray-800" : "bg-white"
        } rounded-lg shadow p-6`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              إجمالي العمولات
            </p>
            <p
              className={`text-2xl font-bold mt-1 tabular-nums ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {formatPrice(stats.totalAmount || 0)}
            </p>
          </div>
          <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      <div
        className={`${
          isDark ? "bg-gray-800" : "bg-white"
        } rounded-lg shadow p-6`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              عمولات المسوقين
            </p>
            <p
              className={`text-2xl font-bold mt-1 tabular-nums ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {formatPrice(stats.byType?.AFFILIATE || 0)}
            </p>
          </div>
          <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <div
        className={`${
          isDark ? "bg-gray-800" : "bg-white"
        } rounded-lg shadow p-6`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              عمولات التجار
            </p>
            <p
              className={`text-2xl font-bold mt-1 tabular-nums ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {formatPrice(stats.byType?.MERCHANT || 0)}
            </p>
          </div>
          <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
        </div>
      </div>

      <div
        className={`${
          isDark ? "bg-gray-800" : "bg-white"
        } rounded-lg shadow p-6`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              عمولات المنصة
            </p>
            <p
              className={`text-2xl font-bold mt-1 tabular-nums ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {formatPrice(stats.byType?.PLATFORM || 0)}
            </p>
          </div>
          <CurrencyDollarIcon className="h-8 w-8 text-orange-600" />
        </div>
      </div>

      <div
        className={`${
          isDark ? "bg-gray-800" : "bg-white"
        } rounded-lg shadow p-6`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              طلبات السحب المعلقة
            </p>
            <p
              className={`text-2xl font-bold mt-1 tabular-nums ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {pendingPayoutsCount}
            </p>
          </div>
          <BanknotesIcon className="h-8 w-8 text-amber-600" />
        </div>
      </div>

      <div
        className={`${
          isDark ? "bg-gray-800" : "bg-white"
        } rounded-lg shadow p-6`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              قيمة السحب المعلق
            </p>
            <p
              className={`text-2xl font-bold mt-1 tabular-nums ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {formatPrice(pendingPayoutAmount)}
            </p>
          </div>
          <BanknotesIcon className="h-8 w-8 text-cyan-600" />
        </div>
      </div>
    </div>
  );
};
