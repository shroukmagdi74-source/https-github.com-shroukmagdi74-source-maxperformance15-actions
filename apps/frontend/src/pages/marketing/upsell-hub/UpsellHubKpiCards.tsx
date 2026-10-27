import React from "react";
import { Layers, CheckCircle2, TrendingUp, ShoppingCart } from "lucide-react";

interface UpsellHubKpiCardsProps {
  stats: {
    total: number;
    withOffers: number;
    coverage: number;
    totalUpsells: number;
    totalCrossSells: number;
    activePlacements: number;
  };
}

export const UpsellHubKpiCards: React.FC<UpsellHubKpiCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
          <span>مواضع الظهور</span>
          <Layers className="h-4 w-4 text-blue-500" />
        </div>
        <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white tabular-nums">
          {stats.activePlacements} / 3
        </div>
        <p className="mt-1 text-[11px] text-gray-500">
          صفحة المنتج، السلة، صفحة الشكر
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
          <span>تغطية المنتجات</span>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
          {stats.coverage}%
        </div>
        <p className="mt-1 text-[11px] text-gray-500 tabular-nums">
          {stats.withOffers} من {stats.total} منتج بعروض
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
          <span>روابط الترقية (Upsell)</span>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white tabular-nums">
          {stats.totalUpsells}
        </div>
        <p className="mt-1 text-[11px] text-gray-500">
          بدائل أعلى قيمة جاهزة
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
          <span>المكملات (Cross-sell)</span>
          <ShoppingCart className="h-4 w-4 text-indigo-500" />
        </div>
        <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white tabular-nums">
          {stats.totalCrossSells}
        </div>
        <p className="mt-1 text-[11px] text-gray-500">
          مكملات السلة و Bought Together
        </p>
      </div>
    </div>
  );
};
