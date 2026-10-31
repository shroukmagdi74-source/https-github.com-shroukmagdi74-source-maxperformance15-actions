import React from "react";
import {
  RotateCw,
  ExternalLink,
  X,
  Loader2,
  Copy,
  CheckCheck,
} from "lucide-react";

export interface CampaignQuickViewHeaderProps {
  isEn: boolean;
  campaignStatus: string;
  togglingStatus: boolean;
  campaignName: string;
  setCampaignName: (name: string) => void;
  deliveryBadgeClass: string;
  deliveryLabel: string;
  facebookCampaignId?: string | null;
  copiedId: boolean;
  loadingDetails: boolean;
  metaAccountId?: string;
  selectedAdAccountId: string;
  onToggleStatus: () => void;
  onCopyMetaId: () => void;
  onRefresh: () => void;
  onClose: () => void;
}

export const CampaignQuickViewHeader: React.FC<CampaignQuickViewHeaderProps> = ({
  isEn,
  campaignStatus,
  togglingStatus,
  campaignName,
  setCampaignName,
  deliveryBadgeClass,
  deliveryLabel,
  facebookCampaignId,
  copiedId,
  loadingDetails,
  metaAccountId,
  selectedAdAccountId,
  onToggleStatus,
  onCopyMetaId,
  onRefresh,
  onClose,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/90 bg-slate-50/70 px-4 py-3 sm:px-6 dark:border-slate-800/90 dark:bg-slate-900/50">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Quick Status Toggle Switch */}
        <button
          type="button"
          onClick={onToggleStatus}
          disabled={togglingStatus}
          title={
            campaignStatus === "ACTIVE"
              ? isEn
                ? "Pause Campaign"
                : "إيقاف الحملة مؤقتاً"
              : isEn
              ? "Activate Campaign"
              : "تنشيط الحملة"
          }
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-[0.97] ${
            campaignStatus === "ACTIVE" ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
          }`}
        >
          {togglingStatus ? (
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-3 w-3 animate-spin text-white" />
            </span>
          ) : (
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                campaignStatus === "ACTIVE"
                  ? isEn
                    ? "translate-x-5"
                    : "-translate-x-5"
                  : "translate-x-0"
              }`}
            />
          )}
        </button>

        {/* Campaign Title & Meta ID */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder={isEn ? "Campaign Name" : "اسم الحملة الإعلانية"}
              className="w-full max-w-md truncate rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-sm font-extrabold text-slate-900 outline-none transition-colors hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 dark:text-white dark:hover:border-slate-700 dark:focus:bg-slate-900"
            />
            <span
              className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${deliveryBadgeClass}`}
            >
              {deliveryLabel}
            </span>
            {facebookCampaignId ? (
              <button
                type="button"
                onClick={onCopyMetaId}
                title={isEn ? "Copy Meta Campaign ID" : "نسخ معرّف الحملة على Meta"}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <span>ID: {facebookCampaignId}</span>
                {copiedId ? (
                  <CheckCheck className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3 text-slate-400" />
                )}
              </button>
            ) : (
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                {isEn ? "Local Only" : "مسودة محلية"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Close & Meta Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={loadingDetails}
          title={
            isEn
              ? "Refresh live telemetry from Meta"
              : "تحديث الإحصائيات اللحظية من Meta"
          }
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-blue-400 disabled:opacity-50 transition-all active:scale-[0.97]"
        >
          <RotateCw
            className={`h-4 w-4 ${loadingDetails ? "animate-spin text-blue-600" : ""}`}
          />
        </button>
        {facebookCampaignId && (
          <a
            href={`https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${metaAccountId || selectedAdAccountId}&selected_campaign_ids=${facebookCampaignId}`}
            target="_blank"
            rel="noreferrer"
            title={isEn ? "Open in Meta Ads Manager" : "فتح في مدير إعلانات Meta"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-blue-400"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label={isEn ? "Close dialog" : "إغلاق النافذة"}
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
