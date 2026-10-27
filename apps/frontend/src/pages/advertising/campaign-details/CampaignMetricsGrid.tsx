import React from "react";
import { type FacebookCampaignInsightsResponse } from "../../../services/facebookAdsService";
import { formatCurrency, formatNumber, formatPercent } from "./types";

interface CampaignMetricsGridProps {
  insights: FacebookCampaignInsightsResponse | null;
  campaignCurrency: string;
  isEn: boolean;
}

export const CampaignMetricsGrid: React.FC<CampaignMetricsGridProps> = ({
  insights,
  campaignCurrency,
  isEn,
}) => {
  const metricItems = [
    {
      label: isEn ? "Spend" : "الإنفاق",
      value: formatCurrency(insights?.data.spend, campaignCurrency, isEn),
      sub: `${formatNumber(insights?.data.impressions, isEn)} ${
        isEn ? "impressions" : "ظهور"
      }`,
    },
    {
      label: isEn ? "Purchases" : "المشتريات",
      value: formatNumber(insights?.data.purchases, isEn),
      sub: `${formatNumber(insights?.data.clicks, isEn)} ${
        isEn ? "clicks" : "نقرة"
      }`,
    },
    {
      label: "ROAS",
      value: `${(insights?.data.roas || 0).toFixed(2)}x`,
      sub: (
        <span dir="ltr" className="inline-flex items-center gap-1 font-semibold tabular-nums">
          <span>CPA</span>
          <span>{formatCurrency(insights?.data.cpa, campaignCurrency, isEn)}</span>
        </span>
      ),
    },
    {
      label: "CTR",
      value: formatPercent(insights?.data.ctr, isEn),
      sub: (
        <span dir="ltr" className="inline-flex items-center gap-1 font-semibold tabular-nums">
          <span>Freq</span>
          <span>{(insights?.data.frequency || 0).toFixed(2)}</span>
        </span>
      ),
    },
  ];

  return (
    <div className="grid border-t border-slate-100 sm:grid-cols-2 xl:grid-cols-4">
      {metricItems.map((item) => (
        <div
          key={item.label}
          className="flex min-h-[72px] items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:border-l sm:border-t-0"
        >
          <div>
            <p className="text-xs font-bold text-slate-500">{item.label}</p>
            <p className="mt-1 text-lg font-black text-slate-950 tabular-nums">
              {item.value}
            </p>
          </div>
          <span className="rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-500 tabular-nums">
            {item.sub}
          </span>
        </div>
      ))}
    </div>
  );
};
