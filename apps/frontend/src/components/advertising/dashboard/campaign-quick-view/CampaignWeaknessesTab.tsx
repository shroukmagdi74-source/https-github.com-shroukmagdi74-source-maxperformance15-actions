import React from "react";
import {
  ShieldAlert,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  Check,
} from "lucide-react";
import { DiagnosedWeakness } from "./types";

export interface CampaignWeaknessesTabProps {
  isEn: boolean;
  weaknesses: DiagnosedWeakness[];
  criticalWeaknessesCount: number;
  warningWeaknessesCount: number;
}

export const CampaignWeaknessesTab: React.FC<CampaignWeaknessesTabProps> = ({
  isEn,
  weaknesses,
  criticalWeaknessesCount,
  warningWeaknessesCount,
}) => {
  return (
    <div className="space-y-4">
      {/* Weakness Audit Banner */}
      <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                {isEn ? "AI Audit & Diagnostic Engine" : "فحص وتشخيص نقاط الضعف والمخاطر الإعلانية"}
              </h4>
              <p className="text-[11px] text-slate-500">
                {isEn
                  ? "Automated audit inspecting bleed, delivery readiness, hook strength, and audience fatigue."
                  : "فحص ذكي مباشر لكشف نزيف الميزانية، عوائق التسليم، ضعف المحتوى الإعلاني، وتشبع الجمهور."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            {criticalWeaknessesCount > 0 && (
              <span className="rounded-md bg-red-100 px-2 py-0.5 text-red-800 dark:bg-red-950/40 dark:text-red-200">
                {criticalWeaknessesCount} {isEn ? "Critical" : "حرجة"}
              </span>
            )}
            {warningWeaknessesCount > 0 && (
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                {warningWeaknessesCount} {isEn ? "Warnings" : "تحذيرات"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Weaknesses List */}
      {weaknesses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 p-8 text-center dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
            <Check className="h-5 w-5" />
          </div>
          <h4 className="mt-2 text-sm font-bold text-emerald-900 dark:text-emerald-200">
            {isEn ? "No Critical Weaknesses Detected" : "لا توجد نقاط ضعف حرجة مكتشفة"}
          </h4>
          <p className="mt-1 max-w-md text-xs text-emerald-700 dark:text-emerald-300">
            {isEn
              ? "Campaign delivery status, pacing, and basic conversion telemetry are stable and performing within healthy ranges."
              : "أداء الحملة، ومعدلات النقر، وحالة التسليم مستقرة وتعمل ضمن الحدود الطبيعية."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {weaknesses.map((w) => {
            const isCritical = w.severity === "critical";
            const isOpportunity = w.severity === "opportunity";

            return (
              <div
                key={w.id}
                className={`rounded-xl border p-4 transition-all ${
                  isCritical
                    ? "border-red-200 bg-red-50/40 dark:border-red-900/60 dark:bg-red-950/20"
                    : isOpportunity
                    ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/20"
                    : "border-amber-200 bg-amber-50/40 dark:border-amber-900/60 dark:bg-amber-950/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                        isCritical
                          ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300"
                          : isOpportunity
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300"
                      }`}
                    >
                      {isCritical ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : isOpportunity ? (
                        <Sparkles className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="text-xs font-black text-slate-900 dark:text-white">
                          {isEn ? w.titleEn : w.title}
                        </h5>
                        {w.metricLabel && w.metricValue && (
                          <span className="rounded-md bg-white/80 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-slate-700 shadow-2xs dark:bg-slate-900 dark:text-slate-300">
                            {w.metricLabel}: {w.metricValue}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                        {isEn ? w.descriptionEn : w.description}
                      </p>
                    </div>
                  </div>

                  {/* Quick Fix Button if available */}
                  {w.action && (
                    <button
                      type="button"
                      onClick={w.action}
                      className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-bold shadow-2xs transition-all active:scale-[0.97] ${
                        isOpportunity
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      {isEn ? w.actionLabelEn || "Apply" : w.actionLabel || "تطبيق"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
