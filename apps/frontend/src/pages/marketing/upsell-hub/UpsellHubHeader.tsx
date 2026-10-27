import React from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Zap,
  Calculator,
  Sparkles,
  Store,
  ExternalLink,
} from "lucide-react";

export const UpsellHubHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-black text-gray-900 sm:text-2xl dark:text-white">
              عروض الـ Upsell والـ Cross-sell
            </h1>
            <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
              إدارة عروض الترقية والمكملات لزيادة متوسط قيمة الطلب (AOV) في متجرك.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
        <button
          type="button"
          onClick={() => navigate("/settings/post-purchase-offer")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-xs font-black text-emerald-800 shadow-sm transition hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
          <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          أداة العرض بعد الطلب (One-Click Offer)
        </button>
        <button
          type="button"
          onClick={() => navigate("/tools/upsell-planner")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <Calculator className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          مخطط الأرباح
        </button>
        <button
          type="button"
          onClick={() => navigate("/settings/store/tools")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
          أدوات التحويل
        </button>
        <a
          href="/shop"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Store className="h-4 w-4" />
          معاينة المتجر
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};
