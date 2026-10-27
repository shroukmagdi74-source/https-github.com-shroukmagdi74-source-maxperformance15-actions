import React from "react";
import { PhotoIcon, ChartBarIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { FacebookAd } from "../../../services/facebookAdsService";
import { getStatusBadge, getStatusLabel } from "./types";

interface AdCardProps {
  ad: FacebookAd;
  isEn: boolean;
  togglingAdId: string | null;
  onToggleStatus: (ad: FacebookAd) => void;
  onOpenAnalysis: (adId: string) => void;
}

export const AdCard: React.FC<AdCardProps> = ({
  ad,
  isEn,
  togglingAdId,
  onToggleStatus,
  onOpenAnalysis,
}) => {
  const isToggling = togglingAdId === ad.id;
  const status = ad.effectiveStatus || ad.status;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:border-indigo-300 hover:bg-indigo-50/40 transition">
      <div className="flex items-center gap-3 min-w-0">
        {ad.imageUrl ? (
          <img
            src={ad.imageUrl}
            alt={ad.name}
            className="h-12 w-12 rounded-lg object-cover border border-slate-200 shrink-0"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400 shrink-0">
            <PhotoIcon className="h-6 w-6" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-950">{ad.name}</p>
          {ad.headline && (
            <p className="truncate text-xs font-medium text-slate-600">
              {ad.headline}
            </p>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <button
              onClick={() => onToggleStatus(ad)}
              disabled={isToggling}
              className={`cursor-pointer rounded px-1.5 py-0.5 text-[10px] font-bold transition hover:opacity-80 disabled:opacity-50 ${getStatusBadge(
                status,
              )}`}
              title={
                isEn
                  ? "Click to toggle ad status"
                  : "اضغط لإيقاف أو تشغيل الإعلان"
              }
            >
              {isToggling ? "..." : getStatusLabel(status, isEn)}
            </button>
            {ad.callToAction && (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                {ad.callToAction}
              </span>
            )}
            {ad.facebookAdId && (
              <span className="text-[10px] font-mono text-slate-400">
                Meta ID: {ad.facebookAdId}
              </span>
            )}
          </div>

          {/* Micro-Metrics Bar or Learning Badge */}
          <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-1.5 text-[11px]">
            {(ad as any).spend != null && Number((ad as any).spend) > 0 ? (
              <>
                <span className="font-semibold text-slate-500">
                  {isEn ? "Spend:" : "الإنفاق:"}{" "}
                  <strong className="font-mono text-slate-900 tabular-nums">
                    {Number((ad as any).spend).toLocaleString()} ج.م
                  </strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-semibold text-slate-500">
                  ROAS:{" "}
                  <strong className="font-mono text-emerald-700 tabular-nums">
                    {Number((ad as any).roas || 0).toFixed(2)}x
                  </strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-semibold text-slate-500">
                  {isEn ? "Orders:" : "الطلبات:"}{" "}
                  <strong className="font-mono text-indigo-700 tabular-nums">
                    {Number((ad as any).purchases || 0)}
                  </strong>
                </span>
              </>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                <SparklesIcon className="h-3 w-3 text-amber-500" />
                {isEn
                  ? "Learning Phase (Meta AI)"
                  : "إعلان نشط - في مرحلة التعلّم الذكي لـ Meta"}
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => onOpenAnalysis(ad.id)}
        className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors"
        title={
          isEn
            ? "Open ad diagnostics and performance"
            : "فتح تشخيص الإعلان وتحليله"
        }
      >
        <ChartBarIcon className="h-4 w-4" />
        <span>{isEn ? "Analysis" : "تشخيص الأداء"}</span>
      </button>
    </div>
  );
};
