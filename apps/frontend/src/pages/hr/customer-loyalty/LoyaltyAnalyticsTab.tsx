import React from "react";
import { TrendingUp, Star, Target, Award, DollarSign } from "lucide-react";
import type { CustomerLoyaltyProgram, WalletStats } from "./types";
import { getProgramIcon } from "./helpers";

interface LoyaltyAnalyticsTabProps {
  programs: CustomerLoyaltyProgram[];
  walletStats: WalletStats | null;
}

export const LoyaltyAnalyticsTab: React.FC<LoyaltyAnalyticsTabProps> = ({
  programs,
  walletStats,
}) => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700/60 rounded-xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              معدل النمو
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono tabular-nums">
            +24%
          </p>
          <p className="text-xs text-emerald-600 mt-1">من الشهر الماضي</p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/60 rounded-xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              متوسط النقاط
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono tabular-nums">
            1,250
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            لكل عميل
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/60 rounded-xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              معدل الاستبدال
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono tabular-nums">
            68%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            من النقاط المكتسبة
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/60 rounded-xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              قيمة المكافآت
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono tabular-nums">
            45,200 ج.م
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            هذا الشهر
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/60 rounded-xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-pink-600" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              إجمالي الكاش باك
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono tabular-nums">
            {walletStats?.totalCashback
              ? walletStats.totalCashback.toLocaleString()
              : "0"}{" "}
            ج.م
          </p>
          <p className="text-xs text-pink-600 mt-1">مدفوعات فعلية</p>
        </div>
      </div>

      {/* Program Performance Breakdown */}
      <div className="bg-gray-50 dark:bg-gray-700/60 rounded-xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          أداء البرامج
        </h3>
        {programs.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            لا توجد بيانات برامج لعرضها حالياً.
          </p>
        ) : (
          <div className="space-y-3">
            {programs.map((program) => (
              <div
                key={program.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600">
                    {getProgramIcon(program.type)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {program.nameAr || program.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono tabular-nums">
                      {program.customersCount} عميل مشترك
                    </p>
                  </div>
                </div>
                <div className="text-right sm:text-left">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm font-mono tabular-nums">
                    {program.totalPointsIssued.toLocaleString()} نقطة صادرة
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono tabular-nums">
                    {program.totalPointsRedeemed.toLocaleString()} مستبدلة
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
