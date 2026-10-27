/**
 * Campaign Details Page
 *
 * صفحة تفاصيل الحملة الإعلانية
 */

import React from "react";
import {
  type CampaignWithCurrency,
  useCampaignDetails,
  CampaignHeaderSection,
  CampaignMetricsGrid,
  AdSetsListSection,
} from "./campaign-details";

const CampaignDetails: React.FC = () => {
  const {
    id,
    isEn,
    campaign,
    insights,
    loading,
    refreshing,
    syncing,
    togglingAdSetId,
    togglingAdId,
    duplicatingAdSetId,
    editingBudgetAdSetId,
    setEditingBudgetAdSetId,
    editBudgetValue,
    setEditBudgetValue,
    savingBudgetId,
    dashboardUrl,
    withAdAccountParam,
    navigate,
    handleRefresh,
    handleSyncMeta,
    handlePause,
    handleResume,
    handleDelete,
    handleToggleAdSetStatus,
    handleToggleAdStatus,
    handleDuplicateAdSet,
    handleStartEditBudget,
    handleSaveBudget,
  } = useCampaignDetails();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">
          {isEn ? "Campaign not found" : "الحملة غير موجودة"}
        </p>
        <button
          onClick={() => navigate(dashboardUrl)}
          className="mt-4 text-indigo-600 hover:text-indigo-700 font-bold"
        >
          {isEn ? "Back to Dashboard" : "العودة للقائمة"}
        </button>
      </div>
    );
  }

  const campaignAdSets = campaign.adSets || [];
  const campaignAds = campaignAdSets.flatMap((adSet) => adSet.ads || []);
  const activeAdSets = campaignAdSets.filter(
    (adSet) => adSet.status === "ACTIVE" || adSet.effectiveStatus === "ACTIVE",
  ).length;
  const activeAds = campaignAds.filter(
    (ad) => ad.status === "ACTIVE" || ad.effectiveStatus === "ACTIVE",
  ).length;
  const campaignCurrency =
    (campaign as CampaignWithCurrency).adAccount?.currency || "EGP";
  const dateRangeLabel = insights?.dateRange
    ? `${insights.dateRange.startDate} → ${insights.dateRange.endDate}`
    : isEn
      ? "Last 30 days"
      : "آخر 30 يوم";

  return (
    <div className="space-y-3" dir={isEn ? "ltr" : "rtl"}>
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <CampaignHeaderSection
          campaign={campaign as CampaignWithCurrency}
          isEn={isEn}
          dashboardUrl={dashboardUrl}
          onNavigateBack={() => navigate(dashboardUrl)}
          syncing={syncing}
          refreshing={refreshing}
          onSyncMeta={handleSyncMeta}
          onRefresh={handleRefresh}
          onPause={handlePause}
          onResume={handleResume}
          onDelete={handleDelete}
          campaignCurrency={campaignCurrency}
          activeAdSets={activeAdSets}
          totalAdSets={campaignAdSets.length}
          activeAds={activeAds}
          totalAds={campaignAds.length}
          dateRangeLabel={dateRangeLabel}
        />

        <CampaignMetricsGrid
          insights={insights}
          campaignCurrency={campaignCurrency}
          isEn={isEn}
        />
      </section>

      <AdSetsListSection
        campaign={campaign}
        campaignCurrency={campaignCurrency}
        isEn={isEn}
        syncing={syncing}
        onSyncMeta={handleSyncMeta}
        onAddAdSet={() =>
          navigate(
            withAdAccountParam(
              `/advertising/facebook-ads/campaigns/${id}/adsets/create`,
            ),
          )
        }
        editingBudgetAdSetId={editingBudgetAdSetId}
        editBudgetValue={editBudgetValue}
        setEditBudgetValue={setEditBudgetValue}
        savingBudgetId={savingBudgetId}
        duplicatingAdSetId={duplicatingAdSetId}
        togglingAdSetId={togglingAdSetId}
        togglingAdId={togglingAdId}
        onStartEditBudget={handleStartEditBudget}
        onCancelEditBudget={() => setEditingBudgetAdSetId(null)}
        onSaveBudget={handleSaveBudget}
        onDuplicateAdSet={handleDuplicateAdSet}
        onToggleAdSetStatus={handleToggleAdSetStatus}
        onToggleAdStatus={handleToggleAdStatus}
        onCreateNewAd={(adSetId) =>
          navigate(
            withAdAccountParam(
              `/advertising/facebook-ads/adsets/${adSetId}/ads/create`,
            ),
          )
        }
        onCreateDynamicAd={(adSetId) =>
          navigate(
            withAdAccountParam(
              `/advertising/facebook-ads/adsets/${adSetId}/dynamic-ads/create`,
            ),
          )
        }
        onOpenAdAnalysis={(adId) =>
          navigate(
            withAdAccountParam(
              `/advertising/facebook-ads/ads/${adId}`,
            ),
          )
        }
      />
    </div>
  );
};

export default CampaignDetails;
