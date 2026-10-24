import React from "react";
import { AlertTriangle } from "lucide-react";
import { fmt } from "./formatters";

interface KpiCard {
  label: string;
  value: string;
  icon: React.ElementType;
  tone: string;
}

interface LoyaltyMapKpiCardsProps {
  kpiCards: KpiCard[];
  cashbackConflict: boolean;
  totalCashback: number;
}

export const LoyaltyMapKpiCards: React.FC<LoyaltyMapKpiCardsProps> = ({
  kpiCards,
  cashbackConflict,
  totalCashback,
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div
              className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${k.tone}`}
            >
              <k.icon className="h-5 w-5" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{k.label}</p>
            <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-gray-900 dark:text-white">
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {cashbackConflict && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div className="text-sm">
            <p className="font-bold text-amber-800 dark:text-amber-200">
              تناقض مؤكد في بيانات الكاش باك
            </p>
            <p className="mt-1 text-amber-700 dark:text-amber-300">
              إجمالي الكاش باك <span className="font-mono tabular-nums">{fmt(totalCashback)}</span> ج.م، لكن صفحة «أداء البرامج التفصيلي»
              تعرض 0 (0 مشترك / 0 نقطة / 0 تحويل كاش باك). عُرض على عقدة «تحليلات الولاء»
              بحالة متضاربة لحين مراجعة المصدرين.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
