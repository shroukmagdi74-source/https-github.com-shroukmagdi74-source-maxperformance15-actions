import React from "react";
import {
  ArrowLeftIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import {
  type CampaignWithCurrency,
  getStatusBadge,
  getStatusLabel,
  getObjectiveLabel,
  formatCurrency,
} from "./types";

interface CampaignHeaderSectionProps {
  campaign: CampaignWithCurrency;
  isEn: boolean;
  dashboardUrl: string;
  onNavigateBack: () => void;
  syncing: boolean;
  refreshing: boolean;
  onSyncMeta: () => void;
  onRefresh: () => void;
  onPause: () => void;
  onResume: () => void;
  onDelete: () => void;
  campaignCurrency: string;
  activeAdSets: number;
  totalAdSets: number;
  activeAds: number;
  totalAds: number;
  dateRangeLabel: string;
}

export const CampaignHeaderSection: React.FC<CampaignHeaderSectionProps> = ({
  campaign,
  isEn,
  onNavigateBack,
  syncing,
  refreshing,
  onSyncMeta,
  onRefresh,
  onPause,
  onResume,
  onDelete,
  campaignCurrency,
  activeAdSets,
  totalAdSets,
  activeAds,
  totalAds,
  dateRangeLabel,
}) => {
  return (
    <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <button
          onClick={onNavigateBack}
          className="mt-0.5 rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition-colors"
          aria-label={isEn ? "Back to Campaigns" : "العودة لقائمة الحملات"}
          title={isEn ? "Back" : "رجوع"}
        >
          <ArrowLeftIcon className={`h-4 w-4 ${isEn ? "" : "rotate-180"}`} />
        </button>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="max-w-3xl truncate text-xl font-black text-slate-950">
              {campaign.name}
            </h1>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold ${getStatusBadge(
                campaign.status,
              )}`}
            >
              {getStatusLabel(campaign.status, isEn)}
            </span>
            {campaign.deliveryReadiness?.label && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                {campaign.deliveryReadiness.label}
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
            <span className="rounded-lg bg-slate-50 px-2.5 py-1">
              {isEn ? "Objective:" : "الهدف:"}{" "}
              {getObjectiveLabel(campaign.objective)}
            </span>
            <span className="rounded-lg bg-slate-50 px-2.5 py-1">
              {isEn ? "Budget:" : "الميزانية:"}{" "}
              <span className="tabular-nums">
                {formatCurrency(campaign.budgetAmount, campaignCurrency, isEn)}
              </span>
              {campaign.budgetType === "DAILY"
                ? isEn
                  ? " / day"
                  : " / يوم"
                : ""}
            </span>
            <span className="rounded-lg bg-slate-50 px-2.5 py-1">
              {isEn ? "Ad Sets:" : "المجموعات:"}{" "}
              <span className="tabular-nums">
                {activeAdSets}/{totalAdSets}
              </span>
            </span>
            <span className="rounded-lg bg-slate-50 px-2.5 py-1">
              {isEn ? "Ads:" : "الإعلانات:"}{" "}
              <span className="tabular-nums">
                {activeAds}/{totalAds}
              </span>
            </span>
            <span className="rounded-lg bg-slate-50 px-2.5 py-1">
              {isEn ? "Period:" : "الفترة:"} {dateRangeLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          onClick={onSyncMeta}
          disabled={syncing || refreshing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 transition-colors"
          title={
            isEn
              ? "Sync structure & latest data directly from Meta"
              : "مزامنة الهيكل وأحدث البيانات مباشرة من Meta"
          }
        >
          <ArrowPathIcon
            className={`h-4 w-4 ${syncing ? "animate-spin text-indigo-600" : ""}`}
          />
          {syncing
            ? isEn
              ? "Syncing Meta..."
              : "جاري المزامنة..."
            : isEn
              ? "Sync Meta"
              : "مزامنة Meta"}
        </button>

        {campaign.facebookCampaignId && (
          <a
            href={`https://adsmanager.facebook.com/adsmanager/manage/campaigns?selected_campaign_ids=${campaign.facebookCampaignId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            title={
              isEn ? "Open in Facebook Ads Manager" : "فتح في مدير إعلانات فيسبوك"
            }
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-500" />
            {isEn ? "Ads Manager" : "مدير الإعلانات"}
          </a>
        )}

        <button
          onClick={onRefresh}
          disabled={refreshing || syncing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <ArrowPathIcon
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {isEn ? "Refresh" : "تحديث"}
        </button>

        {campaign.status === "ACTIVE" ? (
          <button
            onClick={onPause}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
          >
            <PauseIcon className="h-4 w-4" />
            {isEn ? "Pause" : "إيقاف"}
          </button>
        ) : campaign.status === "PAUSED" ? (
          <button
            onClick={onResume}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <PlayIcon className="h-4 w-4" />
            {isEn ? "Resume" : "تشغيل"}
          </button>
        ) : null}

        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 transition-colors"
        >
          <TrashIcon className="h-4 w-4" />
          {isEn ? "Delete" : "حذف"}
        </button>
      </div>
    </div>
  );
};
