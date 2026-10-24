import React from "react";
import { Download, FileImage, Info, Loader2, RefreshCw } from "lucide-react";
import { DateRangeKey } from "./types";

interface LoyaltyMapHeaderProps {
  lastUpdated: string;
  hasTemporalData: boolean;
  dateRange: DateRangeKey;
  setDateRange: (key: DateRangeKey) => void;
  exportCsv: () => void;
  exportSvg: () => void;
  svgBusy: boolean;
  setSvgBusy: (busy: boolean) => void;
  load: () => Promise<void>;
  loading: boolean;
}

export const LoyaltyMapHeader: React.FC<LoyaltyMapHeaderProps> = ({
  lastUpdated,
  hasTemporalData,
  dateRange,
  setDateRange,
  exportCsv,
  exportSvg,
  svgBusy,
  setSvgBusy,
  load,
  loading,
}) => {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            خريطة نظام الولاء + إعادة الاستهداف
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            خريطة أدوات قسم العملاء، تدفقها الزمني، توجيه الرسائل، وحلقات إعادة الاستهداف
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-gray-400 font-mono tabular-nums" title={lastUpdated}>
              آخر تحديث {lastUpdated}
            </span>
          )}
          <div
            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800"
            title={!hasTemporalData ? "لا توجد بيانات تاريخية بعد" : undefined}
          >
            {(
              [
                ["all", "كل الفترات"],
                ["30d", "30 يوم"],
                ["7d", "7 أيام"],
                ["today", "اليوم"],
              ] as [DateRangeKey, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setDateRange(key)}
                disabled={!hasTemporalData}
                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  dateRange === key
                    ? "bg-fuchsia-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <Download className="h-4 w-4" />
            CSV
          </button>
          <button
            onClick={() => {
              setSvgBusy(true);
              setTimeout(exportSvg, 0);
            }}
            disabled={svgBusy}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <FileImage className="h-4 w-4" />
            SVG
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            تحديث
          </button>
        </div>
      </div>

      {!hasTemporalData ? (
        <p className="flex items-center gap-1.5 text-xs text-gray-400">
          <Info className="h-3.5 w-3.5" />
          لا توجد بيانات تاريخية بعد — الفلتر الزمني بيتفعل لما تبقى فيه حملات/مناسبات/رحلات/برامج مسجلة.
        </p>
      ) : dateRange !== "all" ? (
        <p className="flex items-center gap-1.5 text-xs text-gray-400">
          <Info className="h-3.5 w-3.5" />
          الفلتر بينطبق على الأنشطة التاريخية (الحملات/المناسبات/الرحلات) في الخريطة —
          إجماليات الولاء (المشتركين/النقاط/الكاش باك) تراكمية وملها بُعد تاريخي في
          بيانات التحليلات.
        </p>
      ) : null}
    </>
  );
};
