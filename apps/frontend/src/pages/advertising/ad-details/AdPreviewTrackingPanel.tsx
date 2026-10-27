import React from "react";
import { EyeIcon } from "@heroicons/react/24/outline";
import { FacebookAdDetailResponse } from "../../../services/facebookAdsService";
import { HealthLine } from "./helpers";

interface AdPreviewTrackingPanelProps {
  details: FacebookAdDetailResponse;
  previewHtml: string;
  previewLoading: boolean;
  isEn: boolean;
  onPreview: () => void;
  formatNumber: (value?: number) => string;
}

export const AdPreviewTrackingPanel: React.FC<AdPreviewTrackingPanelProps> = ({
  details,
  previewHtml,
  previewLoading,
  isEn,
  onPreview,
  formatNumber,
}) => {
  const summary = details.summary;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {/* Ad Preview */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm xl:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-950">
            {isEn ? "Ad Preview" : "معاينة الإعلان"}
          </h2>
          <button
            onClick={onPreview}
            disabled={previewLoading || !details.ad.facebookAdId}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <EyeIcon className="h-4 w-4" />
            {isEn ? "Load Preview" : "تحميل المعاينة"}
          </button>
        </div>

        {previewHtml ? (
          <iframe
            title="Meta Ad Preview"
            srcDoc={previewHtml}
            sandbox="allow-scripts allow-same-origin"
            className="mt-3 h-[420px] w-full rounded-lg border border-slate-200 bg-white"
          />
        ) : (
          <div className="mt-3 flex h-52 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            {details.ad.facebookAdId
              ? isEn
                ? "Click load preview to view how this ad renders on Meta."
                : "اضغط تحميل المعاينة لعرض شكل الإعلان من Meta."
              : isEn
                ? "Preview requires Facebook Ad ID."
                : "المعاينة تحتاج Facebook Ad ID."}
          </div>
        )}
      </div>

      {/* Tracking & Connection Health */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-black text-slate-950">
          {isEn ? "Tracking & Connection Health" : "صحة التتبع والربط"}
        </h2>
        <div className="mt-3 space-y-2 text-sm">
          <HealthLine
            ok={Boolean(details.ad.facebookAdId)}
            label="Facebook Ad ID"
            value={details.ad.facebookAdId || (isEn ? "Not connected" : "غير مربوط")}
          />
          <HealthLine
            ok={Boolean(details.campaign.pixelId)}
            label="Pixel"
            value={
              details.campaign.pixelId ||
              (isEn ? "Not registered locally" : "غير مسجل محلياً")
            }
          />
          <HealthLine
            ok={summary.purchases > 0 || summary.spend === 0}
            label="Purchase Event"
            value={
              summary.purchases > 0
                ? `${formatNumber(summary.purchases)} ${
                    isEn ? "purchases" : "حدث شراء"
                  }`
                : isEn
                  ? "No Purchases in period"
                  : "لا يوجد Purchase في الفترة"
            }
          />
          <HealthLine
            ok={Boolean(details.ad.lastSyncAt)}
            label={isEn ? "Last Sync" : "آخر مزامنة"}
            value={
              details.ad.lastSyncAt
                ? new Date(details.ad.lastSyncAt).toLocaleString(
                    isEn ? "en-US" : "ar-EG",
                  )
                : isEn
                  ? "Not available"
                  : "غير متاح"
            }
          />
        </div>
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
          {isEn
            ? "Scaling/pausing decisions rely on accurate Purchase & CAPI tracking; if tracking is incomplete, ROAS & CPA may mislead decisions."
            : "أي قرار إيقاف/توسيع يعتمد على صحة Purchase وCAPI؛ لو التتبع ناقص، ROAS وCPA ممكن يضللوا القرار."}
        </div>
      </div>
    </div>
  );
};
