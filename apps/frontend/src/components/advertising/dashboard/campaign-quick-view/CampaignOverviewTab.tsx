import React from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import {
  type FacebookCampaign,
  type FacebookAdsPerformanceTotals,
  CAMPAIGN_OBJECTIVES,
} from "../../../../services/facebookAdsService";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  getRoasColor,
  getRoasBg,
} from "../../../../utils/facebookAdsHelpers";

export interface CampaignOverviewTabProps {
  isEn: boolean;
  activeCampaign: FacebookCampaign;
  isCboCampaign: boolean;
  budgetType: "DAILY" | "LIFETIME";
  setBudgetType: (type: "DAILY" | "LIFETIME") => void;
  budgetAmount: number;
  setBudgetAmount: (amount: number) => void;
  selectedCurrency: string;
  applyBudgetPercent: (percent: number) => void;
  metrics: FacebookAdsPerformanceTotals;
}

export const CampaignOverviewTab: React.FC<CampaignOverviewTabProps> = ({
  isEn,
  activeCampaign,
  isCboCampaign,
  budgetType,
  setBudgetType,
  budgetAmount,
  setBudgetAmount,
  selectedCurrency,
  applyBudgetPercent,
  metrics,
}) => {
  return (
    <div className="space-y-5">
      {/* Quick Budget Editing Bar */}
      <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isEn ? "Budget Configuration:" : "إعداد الميزانية الحالية:"}
            </span>
            <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-black text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
              {isCboCampaign
                ? isEn
                  ? "Advantage Campaign Budget (CBO)"
                  : "ميزانية مجمعة على مستوى الحملة (CBO)"
                : isEn
                ? "Ad Set Budget (ABO)"
                : "ميزانية مستقلة لكل مجموعة (ABO)"}
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-bold dark:border-slate-800 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setBudgetType("DAILY")}
                className={`rounded-md px-2 py-1 transition-all ${
                  budgetType === "DAILY"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {isEn ? "Daily" : "يومية"}
              </button>
              <button
                type="button"
                onClick={() => setBudgetType("LIFETIME")}
                className={`rounded-md px-2 py-1 transition-all ${
                  budgetType === "LIFETIME"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {isEn ? "Lifetime" : "إجمالية"}
              </button>
            </div>
          </div>

          {/* Budget Input & Fast Scaling Pills */}
          <div className="flex flex-wrap items-center gap-1.5" dir="ltr">
            <div className="flex items-center rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-900">
              <input
                type="number"
                min="1"
                step="10"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(Number(e.target.value) || 0)}
                className="w-24 border-0 bg-transparent text-end text-xs font-black tabular-nums text-slate-900 outline-none dark:text-white"
              />
              <span className="ms-1 text-slate-500 font-semibold">{selectedCurrency}</span>
            </div>

            <button
              type="button"
              onClick={() => applyBudgetPercent(15)}
              title={isEn ? "Scale +15%" : "زيادة الميزانية +15%"}
              className="rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              +15%
            </button>
            <button
              type="button"
              onClick={() => applyBudgetPercent(25)}
              title={isEn ? "Scale +25%" : "زيادة الميزانية +25%"}
              className="rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              +25%
            </button>
            <button
              type="button"
              onClick={() => applyBudgetPercent(-20)}
              title={isEn ? "Cut -20%" : "خفض الميزانية -20%"}
              className="rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
            >
              -20%
            </button>
          </div>
        </div>
      </div>

      {/* High-Impact Performance KPI Bento Grid (8 Metrics) */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {/* Spend */}
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">{isEn ? "Spend" : "الإنفاق"}</span>
            <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="mt-1 text-base font-black tabular-nums text-slate-900 dark:text-white" dir="ltr">
            {formatCurrency(metrics.spend, selectedCurrency)}
          </div>
          <span className="mt-0.5 block text-[10px] text-slate-400">
            {activeCampaign.budgetType === "DAILY"
              ? isEn ? "Daily Budget" : "ميزانية يومية"
              : isEn ? "Lifetime Budget" : "ميزانية إجمالية"}
          </span>
        </div>

        {/* Purchases */}
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">{isEn ? "Purchases" : "المبيعات"}</span>
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <div className="mt-1 text-base font-black tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatNumber(metrics.purchases)}
          </div>
          <span className="mt-0.5 block text-[10px] text-slate-400">
            {metrics.conversionRate && metrics.conversionRate > 0
              ? `${formatPercentage(metrics.conversionRate)} ${isEn ? "CR" : "معدل تحويل"}`
              : isEn ? "Total conversions" : "إجمالي التحويلات"}
          </span>
        </div>

        {/* CPA (Cost Per Purchase) */}
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">
              {isEn ? "Cost / Purchase" : "تكلفة الشراء (CPA)"}
            </span>
            <TrendingDown className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="mt-1 text-base font-black tabular-nums text-slate-900 dark:text-white" dir="ltr">
            {metrics.costPerPurchase && metrics.costPerPurchase > 0
              ? formatCurrency(metrics.costPerPurchase, selectedCurrency)
              : "—"}
          </div>
          <span className="mt-0.5 block text-[10px] text-slate-400">
            {metrics.purchases > 0
              ? isEn ? "Per converted order" : "لكل طلب مؤكد"
              : isEn ? "No purchases yet" : "لا مبيعات حتى الآن"}
          </span>
        </div>

        {/* ROAS */}
        <div className={`rounded-xl border p-3 ${getRoasBg(metrics.roas)} border-slate-200/90 dark:border-slate-800`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">{isEn ? "ROAS" : "العائد الإعلاني (ROAS)"}</span>
            <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className={`mt-1 text-base font-black tabular-nums ${getRoasColor(metrics.roas)}`} dir="ltr">
            {metrics.roas > 0 ? `${formatNumber(metrics.roas, 2)}x` : "—"}
          </div>
          <span className="mt-0.5 block text-[10px] text-slate-400">
            {metrics.purchaseValue > 0
              ? formatCurrency(metrics.purchaseValue, selectedCurrency)
              : isEn ? "Target: > 2.5x" : "الهدف: > 2.5x"}
          </span>
        </div>

        {/* Impressions */}
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
          <span className="text-[11px] font-bold text-slate-500">{isEn ? "Impressions" : "مرات الظهور"}</span>
          <div className="mt-1 text-base font-black tabular-nums text-slate-900 dark:text-white">
            {formatNumber(metrics.impressions)}
          </div>
          <span className="mt-0.5 block text-[10px] text-slate-400">
            {metrics.reach && metrics.reach > 0
              ? `${formatNumber(metrics.reach)} ${isEn ? "reach" : "وصول فريد"}`
              : "Meta Feed & Stories"}
          </span>
        </div>

        {/* Clicks */}
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
          <span className="text-[11px] font-bold text-slate-500">{isEn ? "Clicks" : "النقرات"}</span>
          <div className="mt-1 text-base font-black tabular-nums text-slate-900 dark:text-white">
            {formatNumber(metrics.clicks)}
          </div>
          <span className="mt-0.5 block text-[10px] text-slate-400">
            {metrics.cpc > 0
              ? `${formatCurrency(metrics.cpc, selectedCurrency)} ${isEn ? "CPC" : "للنقرة"}`
              : "—"}
          </span>
        </div>

        {/* CTR (Click-Through Rate) */}
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
          <span className="text-[11px] font-bold text-slate-500">{isEn ? "CTR" : "نسبة النقر (CTR)"}</span>
          <div
            className={`mt-1 text-base font-black tabular-nums ${
              metrics.ctr >= 1.5
                ? "text-emerald-600 dark:text-emerald-400"
                : metrics.ctr > 0 && metrics.ctr < 1.0
                ? "text-amber-600 dark:text-amber-400"
                : "text-slate-900 dark:text-white"
            }`}
          >
            {formatPercentage(metrics.ctr)}
          </div>
          <span className="mt-0.5 block text-[10px] text-slate-400">
            {metrics.ctr >= 1.5
              ? isEn ? "Strong Hook" : "جاذبية ممتازة"
              : isEn ? "Benchmark > 1.2%" : "المعدل المستهدف > 1.2%"}
          </span>
        </div>

        {/* Frequency */}
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
          <span className="text-[11px] font-bold text-slate-500">{isEn ? "Frequency" : "معدل التكرار"}</span>
          <div
            className={`mt-1 text-base font-black tabular-nums ${
              metrics.frequency >= 2.8
                ? "text-red-600 dark:text-red-400"
                : metrics.frequency >= 2.0
                ? "text-amber-600 dark:text-amber-400"
                : "text-slate-900 dark:text-white"
            }`}
          >
            {metrics.frequency > 0 ? `${formatNumber(metrics.frequency, 1)}x` : "1.0x"}
          </div>
          <span className="mt-0.5 block text-[10px] text-slate-400">
            {metrics.frequency >= 2.8
              ? isEn ? "Audience Saturation" : "تشبع الجمهور"
              : isEn ? "Healthy distribution" : "توزيع سليم"}
          </span>
        </div>
      </div>

      {/* Additional Meta Campaign Meta Data Strip */}
      <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/40">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <span className="block text-[11px] text-slate-400">{isEn ? "Objective" : "هدف الحملة"}</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {CAMPAIGN_OBJECTIVES.find((o) => o.value === activeCampaign.objective)?.label ||
                activeCampaign.objective ||
                "SALES"}
            </span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-400">{isEn ? "Pixel ID" : "بيكسل التتبع"}</span>
            <span className="font-bold tabular-nums text-slate-800 dark:text-slate-200">
              {activeCampaign.pixelId || (isEn ? "Not Linked" : "غير مرتبط")}
            </span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-400">{isEn ? "Start Date" : "تاريخ البدء"}</span>
            <span className="font-bold tabular-nums text-slate-800 dark:text-slate-200">
              {formatDate(activeCampaign.facebookStartTime || activeCampaign.startDate || activeCampaign.createdAt)}
            </span>
          </div>
          <div>
            <span className="block text-[11px] text-slate-400">{isEn ? "Last Sync" : "آخر مزامنة"}</span>
            <span className="font-bold tabular-nums text-slate-800 dark:text-slate-200">
              {formatDate(activeCampaign.facebookUpdatedTime || activeCampaign.lastSyncAt || activeCampaign.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
