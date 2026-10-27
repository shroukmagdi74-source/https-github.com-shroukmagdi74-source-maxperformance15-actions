import React from "react";
import { getSafeNumber } from "./helpers";

export interface MetricCardItem {
  label: string;
  value: string;
  comparison?: number;
  inverse?: boolean;
}

interface AdMetricsGridProps {
  metricCards: MetricCardItem[];
  isEn: boolean;
  formatPercent: (value?: number) => string;
}

export const AdMetricsGrid: React.FC<AdMetricsGridProps> = ({
  metricCards,
  isEn,
  formatPercent,
}) => {
  const renderChange = (value?: number, inverse = false) => {
    const change = getSafeNumber(value);
    const isGood = inverse ? change <= 0 : change >= 0;
    const className = isGood ? "text-emerald-700" : "text-red-700";
    const sign = change > 0 ? "+" : "";
    return (
      <span className={`text-[11px] font-bold ${className} tabular-nums`}>
        {sign}
        {formatPercent(change)} {isEn ? "vs previous period" : "عن الفترة السابقة"}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-6">
      {metricCards.map((metric) => (
        <div
          key={metric.label}
          className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm"
        >
          <p className="text-[11px] font-bold text-slate-500">{metric.label}</p>
          <p className="mt-0.5 text-base font-black text-slate-950 tabular-nums">
            {metric.value}
          </p>
          {renderChange(metric.comparison, metric.inverse)}
        </div>
      ))}
    </div>
  );
};
