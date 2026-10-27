import React from "react";
import { PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import {
  FacebookCampaign,
  FacebookAdSet,
  FacebookAd,
} from "../../../services/facebookAdsService";
import { AdSetRow } from "./AdSetRow";

interface AdSetsListSectionProps {
  campaign: FacebookCampaign;
  campaignCurrency: string;
  isEn: boolean;
  syncing: boolean;
  onSyncMeta: () => void;
  onAddAdSet: () => void;
  editingBudgetAdSetId: string | null;
  editBudgetValue: string;
  setEditBudgetValue: (val: string) => void;
  savingBudgetId: string | null;
  duplicatingAdSetId: string | null;
  togglingAdSetId: string | null;
  togglingAdId: string | null;
  onStartEditBudget: (adSet: FacebookAdSet) => void;
  onCancelEditBudget: () => void;
  onSaveBudget: (adSet: FacebookAdSet) => void;
  onDuplicateAdSet: (adSet: FacebookAdSet) => void;
  onToggleAdSetStatus: (adSet: FacebookAdSet) => void;
  onToggleAdStatus: (ad: FacebookAd) => void;
  onCreateNewAd: (adSetId: string) => void;
  onCreateDynamicAd: (adSetId: string) => void;
  onOpenAdAnalysis: (adId: string) => void;
}

export const AdSetsListSection: React.FC<AdSetsListSectionProps> = ({
  campaign,
  campaignCurrency,
  isEn,
  syncing,
  onSyncMeta,
  onAddAdSet,
  editingBudgetAdSetId,
  editBudgetValue,
  setEditBudgetValue,
  savingBudgetId,
  duplicatingAdSetId,
  togglingAdSetId,
  togglingAdId,
  onStartEditBudget,
  onCancelEditBudget,
  onSaveBudget,
  onDuplicateAdSet,
  onToggleAdSetStatus,
  onToggleAdStatus,
  onCreateNewAd,
  onCreateDynamicAd,
  onOpenAdAnalysis,
}) => {
  const campaignAdSets = campaign.adSets || [];

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-black text-slate-950">
            {isEn ? "Campaign Ad Sets" : "مجموعات الإعلانات داخل الحملة"}
          </h2>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">
            {isEn
              ? "Manage ad sets, targeting, and individual ad creative performance."
              : "إدارة مجموعات الإعلانات، الاستهداف، ومتابعة أداء التصاميم الإعلانية."}
          </p>
        </div>
        <button
          onClick={onAddAdSet}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          {isEn ? "Add Ad Set" : "إضافة مجموعة"}
        </button>
      </div>

      {campaignAdSets.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <ArrowPathIcon className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-slate-800">
            {isEn ? "No ad sets available" : "لا توجد مجموعات إعلانات مسجلة بعد"}
          </p>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            {campaign.facebookCampaignId
              ? isEn
                ? "This campaign exists on Meta. Click below to pull its ad sets and ads directly into your system."
                : "هذه الحملة موجودة على Meta. إذا كانت تحتوي على مجموعات وإعلانات نشطة، اضغط مزامنة لجلبها فوراً."
              : isEn
                ? "Create your first ad set to start running ads."
                : "ابدأ بإنشاء أول مجموعة إعلانية لهذه الحملة."}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {campaign.facebookCampaignId && (
              <button
                onClick={onSyncMeta}
                disabled={syncing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <ArrowPathIcon
                  className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
                />
                {syncing
                  ? isEn
                    ? "Syncing..."
                    : "جاري المزامنة..."
                  : isEn
                    ? "Sync Structure from Meta"
                    : "مزامنة الهيكل من Meta الآن"}
              </button>
            )}
            <button
              onClick={onAddAdSet}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              {isEn ? "Create Ad Set" : "إنشاء أول مجموعة"}
            </button>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {campaignAdSets.map((adSet) => (
            <AdSetRow
              key={adSet.id}
              adSet={adSet}
              campaignCurrency={campaignCurrency}
              isEn={isEn}
              editingBudgetAdSetId={editingBudgetAdSetId}
              editBudgetValue={editBudgetValue}
              setEditBudgetValue={setEditBudgetValue}
              savingBudgetId={savingBudgetId}
              duplicatingAdSetId={duplicatingAdSetId}
              togglingAdSetId={togglingAdSetId}
              togglingAdId={togglingAdId}
              onStartEditBudget={onStartEditBudget}
              onCancelEditBudget={onCancelEditBudget}
              onSaveBudget={onSaveBudget}
              onDuplicateAdSet={onDuplicateAdSet}
              onToggleAdSetStatus={onToggleAdSetStatus}
              onToggleAdStatus={onToggleAdStatus}
              onCreateNewAd={onCreateNewAd}
              onCreateDynamicAd={onCreateDynamicAd}
              onOpenAdAnalysis={onOpenAdAnalysis}
            />
          ))}
        </div>
      )}
    </section>
  );
};
