import React from "react";
import { FacebookAdDetailResponse } from "../../../services/facebookAdsService";
import { getVerdictClass } from "./helpers";

interface AdDecisionBannerProps {
  decision: FacebookAdDetailResponse["decision"];
  isEn: boolean;
  formatCurrency: (value?: number) => string;
  formatNumber: (value?: number) => string;
  formatDecimal: (value?: number, suffix?: string) => string;
}

export const AdDecisionBanner: React.FC<AdDecisionBannerProps> = ({
  decision,
  isEn,
  formatCurrency,
  formatNumber,
  formatDecimal,
}) => {
  if (!decision) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
      <div className="grid gap-2 xl:grid-cols-[1.35fr_repeat(5,minmax(0,1fr))]">
        <div className={`rounded-md border px-2.5 py-2 ${getVerdictClass(decision.tone)}`}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-black">{decision.label}</span>
            <span className="text-[11px] font-black tabular-nums">
              {isEn ? "Confidence" : "ثقة"} {formatNumber(decision.confidence?.score)}%
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-[11px] font-semibold">
            {decision.reason}
          </p>
          <p className="mt-0.5 line-clamp-1 text-[11px] opacity-80">
            {decision.nextAction}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 px-2.5 py-2">
          <p className="text-[10px] font-bold text-slate-500">
            {isEn ? "Target CPA" : "هدف CPA"}
          </p>
          <p className="mt-0.5 text-sm font-black text-slate-950 tabular-nums">
            {formatCurrency(decision.economics?.targetCpa)}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 px-2.5 py-2">
          <p className="text-[10px] font-bold text-slate-500">
            {isEn ? "Break-even ROAS" : "Break-even ROAS"}
          </p>
          <p className="mt-0.5 text-sm font-black text-slate-950 tabular-nums">
            {formatDecimal(decision.economics?.breakEvenRoas)}x
          </p>
        </div>
        <div className="rounded-md border border-slate-200 px-2.5 py-2">
          <p className="text-[10px] font-bold text-slate-500">
            {isEn ? "Estimated Profit" : "ربح تقديري"}
          </p>
          <p className="mt-0.5 text-sm font-black text-slate-950 tabular-nums">
            {formatCurrency(decision.metrics?.estimatedProfit)}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 px-2.5 py-2">
          <p className="text-[10px] font-bold text-slate-500">
            {isEn ? "Attributed Orders" : "طلبات منسوبة"}
          </p>
          <p className="mt-0.5 text-sm font-black text-slate-950 tabular-nums">
            {formatNumber(decision.attribution?.exactDeliveredOrders)} /{" "}
            {formatNumber(decision.attribution?.relatedDeliveredOrders)}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 px-2.5 py-2">
          <p className="text-[10px] font-bold text-slate-500">
            {isEn ? "Product Cost" : "تكلفة المنتج"}
          </p>
          <p className="mt-0.5 truncate text-sm font-black text-slate-950">
            {decision.economics?.costSource || (isEn ? "Not available" : "غير متاح")}
          </p>
        </div>
      </div>
    </div>
  );
};
