import React from "react";
import {
  CursorArrowRaysIcon,
  ChartBarIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import {
  FacebookAdPerformanceBreakdownReport,
  FacebookPerformanceBreakdown,
  FacebookPerformanceBreakdownRow,
} from "../../../services/facebookAdsService";

interface AdBreakdownsGridProps {
  breakdowns: Partial<
    Record<FacebookPerformanceBreakdown, FacebookAdPerformanceBreakdownReport>
  >;
  isEn: boolean;
  formatCurrency: (value?: number) => string;
  formatNumber: (value?: number) => string;
  formatDecimal: (value?: number, suffix?: string) => string;
}

export const AdBreakdownsGrid: React.FC<AdBreakdownsGridProps> = ({
  breakdowns,
  isEn,
  formatCurrency,
  formatNumber,
  formatDecimal,
}) => {
  const renderBreakdownRows = (
    report: FacebookAdPerformanceBreakdownReport | undefined,
    emptyLabel: string,
  ) => {
    const rows = report?.rows || [];
    const maxSpend = Math.max(...rows.map((row) => row.metrics.spend), 1);

    if (rows.length === 0) {
      return (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          {emptyLabel}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {rows.slice(0, 5).map((row: FacebookPerformanceBreakdownRow) => (
          <div
            key={row.key}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-950">
                  {row.label}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500 tabular-nums">
                  {formatCurrency(row.metrics.spend)} · ROAS{" "}
                  {formatDecimal(row.metrics.roas)}x · CPA{" "}
                  {formatCurrency(row.metrics.cpa)}
                </p>
              </div>
              <span className="shrink-0 text-xs font-bold text-slate-600 tabular-nums">
                {formatNumber(row.metrics.purchases)} {isEn ? "purchases" : "شراء"}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{
                  width: `${Math.max(4, (row.metrics.spend / maxSpend) * 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {/* Age & Gender */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <CursorArrowRaysIcon className="h-5 w-5 text-slate-700" />
          <h2 className="text-base font-black text-slate-950">
            {isEn ? "Age & Gender" : "العمر والجنس"}
          </h2>
        </div>
        <div className="mt-3">
          {renderBreakdownRows(
            breakdowns.age_gender,
            isEn
              ? "Not enough age/gender data for this ad."
              : "لا توجد بيانات عمر/جنس كافية لهذا الإعلان.",
          )}
        </div>
      </div>

      {/* Platform & Placement */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-slate-700" />
          <h2 className="text-base font-black text-slate-950">
            {isEn ? "Platform & Placement" : "المنصة والموضع"}
          </h2>
        </div>
        <div className="mt-3">
          {renderBreakdownRows(
            breakdowns.placement,
            isEn
              ? "Not enough placement data for this ad."
              : "لا توجد بيانات مواضع كافية لهذا الإعلان.",
          )}
        </div>
      </div>

      {/* Devices */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <BoltIcon className="h-5 w-5 text-slate-700" />
          <h2 className="text-base font-black text-slate-950">
            {isEn ? "Devices" : "الأجهزة"}
          </h2>
        </div>
        <div className="mt-3">
          {renderBreakdownRows(
            breakdowns.device,
            isEn
              ? "Not enough device data for this ad."
              : "لا توجد بيانات أجهزة كافية لهذا الإعلان.",
          )}
        </div>
      </div>
    </div>
  );
};
