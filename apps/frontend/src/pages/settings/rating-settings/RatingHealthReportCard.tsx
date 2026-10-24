import React from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { CustomerRatingHealthData } from "../../../services/returnService";

interface RatingHealthReportCardProps {
  healthData: CustomerRatingHealthData | null;
}

export const RatingHealthReportCard: React.FC<RatingHealthReportCardProps> = ({
  healthData,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              تقرير صحة التقييم الآلي للعملاء
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              متابعة حية لتصنيف العملاء المعتمد على نسبة الاستلام ومزامنة الطلبات التلقائية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>نظام تلقائي 100%</span>
          </span>
          {healthData?.rulesVersion && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 tabular-nums">
              v{healthData.rulesVersion}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 bg-slate-50/50 dark:bg-slate-950/30">
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">إجمالي العملاء</span>
          <span className="text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {healthData?.totalCustomers ?? 0}
          </span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-emerald-100 dark:border-emerald-900/40 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">ممتاز</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
            {healthData?.breakdown?.EXCELLENT ?? 0}
          </span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-sky-100 dark:border-sky-900/40 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-sky-700 dark:text-sky-400 font-medium">جيد</span>
            <span className="w-2 h-2 rounded-full bg-sky-500" />
          </div>
          <span className="text-xl font-bold tabular-nums text-sky-700 dark:text-sky-300">
            {healthData?.breakdown?.GOOD ?? 0}
          </span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-amber-100 dark:border-amber-900/40 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">متوسط</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <span className="text-xl font-bold tabular-nums text-amber-700 dark:text-amber-300">
            {healthData?.breakdown?.AVERAGE ?? 0}
          </span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-rose-100 dark:border-rose-900/40 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-rose-700 dark:text-rose-400 font-medium">ضعيف</span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <span className="text-xl font-bold tabular-nums text-rose-700 dark:text-rose-300">
            {healthData?.breakdown?.POOR ?? 0}
          </span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">جديد / غير مصنف</span>
            <span className="w-2 h-2 rounded-full bg-slate-400" />
          </div>
          <span className="text-xl font-bold tabular-nums text-slate-600 dark:text-slate-300">
            {healthData?.breakdown?.UNKNOWN ?? 0}
          </span>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>العملاء المصنفون: <strong className="tabular-nums font-semibold text-slate-700 dark:text-slate-300">{healthData?.ratedCustomers ?? 0}</strong></span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>آخر مزامنة فحص: {healthData?.lastRunAt ? new Date(healthData.lastRunAt).toLocaleTimeString("ar-EG") : "نشط الآن"}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            الأخطاء المسجلة: {healthData?.failureCount ?? 0} (سليم)
          </span>
        </div>
      </div>
    </div>
  );
};
