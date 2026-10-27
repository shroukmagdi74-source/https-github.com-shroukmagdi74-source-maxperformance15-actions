import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import {
  facebookAdsService,
  FacebookCampaign,
  FacebookAdSet,
  FacebookAd,
  type FacebookCampaignInsightsResponse,
} from "../../../services/facebookAdsService";
import { getApiErrorMessage } from "./types";

export function useCampaignDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { i18n } = useTranslation();
  const isEn = Boolean(i18n.language && i18n.language.startsWith("en"));

  const [campaign, setCampaign] = useState<FacebookCampaign | null>(null);
  const [insights, setInsights] =
    useState<FacebookCampaignInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [togglingAdSetId, setTogglingAdSetId] = useState<string | null>(null);
  const [togglingAdId, setTogglingAdId] = useState<string | null>(null);
  const [duplicatingAdSetId, setDuplicatingAdSetId] = useState<string | null>(null);
  const [editingBudgetAdSetId, setEditingBudgetAdSetId] = useState<string | null>(null);
  const [editBudgetValue, setEditBudgetValue] = useState<string>("");
  const [savingBudgetId, setSavingBudgetId] = useState<string | null>(null);

  const selectedAdAccountId = searchParams.get("adAccountId") || "";
  const dashboardUrl = `/advertising/facebook-ads${
    selectedAdAccountId
      ? `?adAccountId=${encodeURIComponent(selectedAdAccountId)}`
      : ""
  }`;
  const withAdAccountParam = (path: string) =>
    `${path}${
      selectedAdAccountId
        ? `?adAccountId=${encodeURIComponent(selectedAdAccountId)}`
        : ""
    }`;

  const loadCampaign = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [campaignResult, insightsResult] = await Promise.allSettled([
        facebookAdsService.getCampaign(id),
        facebookAdsService.getCampaignInsights(id),
      ]);

      if (campaignResult.status === "rejected") {
        throw campaignResult.reason;
      }

      setCampaign(campaignResult.value);
      setInsights(
        insightsResult.status === "fulfilled" ? insightsResult.value : null,
      );
    } catch (error: unknown) {
      console.error("Error loading campaign:", error);
      toast.error(
        getApiErrorMessage(
          error,
          isEn ? "Failed to load campaign" : "فشل في تحميل الحملة",
        ),
      );
      navigate(dashboardUrl);
    } finally {
      setLoading(false);
    }
  }, [dashboardUrl, id, isEn, navigate]);

  useEffect(() => {
    if (id) {
      loadCampaign();
    }
  }, [id, loadCampaign]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCampaign();
    setRefreshing(false);
    tToast.success("CampaignDetails.success_update_c9e9");
  };

  const handleSyncMeta = async () => {
    const targetAccountId = selectedAdAccountId || campaign?.adAccountId;
    if (!targetAccountId) {
      toast.error(
        isEn ? "No ad account linked" : "لا يوجد حساب إعلاني مرتبط بهذه الحملة",
      );
      return;
    }

    try {
      setSyncing(true);
      toast.info(
        isEn
          ? "Syncing campaign structure from Meta..."
          : "جاري مزامنة الحملة وهيكلها من Meta...",
      );
      await facebookAdsService.syncFromFacebook(targetAccountId, {
        includeStructure: true,
      });
      await loadCampaign();
      toast.success(
        isEn ? "Synced successfully with Meta" : "تمت المزامنة بنجاح مع Meta",
      );
    } catch (error: unknown) {
      console.error("Error syncing with Meta:", error);
      toast.error(
        getApiErrorMessage(
          error,
          isEn ? "Failed to sync with Meta" : "فشل في المزامنة مع Meta",
        ),
      );
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleAdSetStatus = async (adSet: FacebookAdSet) => {
    const isCurrentlyActive =
      adSet.effectiveStatus === "ACTIVE" || adSet.status === "ACTIVE";
    try {
      setTogglingAdSetId(adSet.id);
      if (isCurrentlyActive) {
        await facebookAdsService.pauseAdSet(adSet.id);
        toast.success(
          isEn
            ? `Ad set "${adSet.name}" paused`
            : `تم إيقاف المجموعة الإعلانية "${adSet.name}"`,
        );
      } else {
        await facebookAdsService.resumeAdSet(adSet.id);
        toast.success(
          isEn
            ? `Ad set "${adSet.name}" activated`
            : `تم تنشيط المجموعة الإعلانية "${adSet.name}"`,
        );
      }
      await loadCampaign();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          isEn ? "Failed to update ad set" : "فشل تحديث المجموعة",
        ),
      );
    } finally {
      setTogglingAdSetId(null);
    }
  };

  const handleToggleAdStatus = async (ad: FacebookAd) => {
    const isCurrentlyActive =
      ad.effectiveStatus === "ACTIVE" || ad.status === "ACTIVE";
    try {
      setTogglingAdId(ad.id);
      if (isCurrentlyActive) {
        await facebookAdsService.pauseAd(ad.id);
        toast.success(
          isEn
            ? `Ad "${ad.name}" paused`
            : `تم إيقاف الإعلان "${ad.name}"`,
        );
      } else {
        await facebookAdsService.resumeAd(ad.id);
        toast.success(
          isEn
            ? `Ad "${ad.name}" activated`
            : `تم تنشيط الإعلان "${ad.name}"`,
        );
      }
      await loadCampaign();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          isEn ? "Failed to update ad" : "فشل تحديث الإعلان",
        ),
      );
    } finally {
      setTogglingAdId(null);
    }
  };

  const handleDuplicateAdSet = async (adSet: FacebookAdSet) => {
    try {
      setDuplicatingAdSetId(adSet.id);
      toast.info(
        isEn
          ? `Duplicating "${adSet.name}"...`
          : `جاري تكرار المجموعة "${adSet.name}"...`,
      );
      await facebookAdsService.duplicateAdSet(adSet.id);
      toast.success(
        isEn
          ? "Ad Set duplicated successfully!"
          : "تم تكرار المجموعة الإعلانية بنجاح!",
      );
      await loadCampaign();
    } catch (error) {
      console.error("Error duplicating ad set:", error);
      toast.error(
        getApiErrorMessage(
          error,
          isEn ? "Failed to duplicate ad set" : "فشل تكرار المجموعة",
        ),
      );
    } finally {
      setDuplicatingAdSetId(null);
    }
  };

  const handleStartEditBudget = (adSet: FacebookAdSet) => {
    setEditingBudgetAdSetId(adSet.id);
    setEditBudgetValue(String(adSet.budgetAmount || ""));
  };

  const handleSaveBudget = async (adSet: FacebookAdSet) => {
    const num = Number(editBudgetValue);
    if (isNaN(num) || num <= 0) {
      toast.error(
        isEn
          ? "Please enter a valid budget amount"
          : "يرجى إدخال مبلغ ميزانية صالح",
      );
      return;
    }
    try {
      setSavingBudgetId(adSet.id);
      await facebookAdsService.updateAdSet(adSet.id, { budgetAmount: num });
      toast.success(
        isEn
          ? "Budget updated successfully on Meta!"
          : "تم تحديث الميزانية بنجاح على Meta!",
      );
      setEditingBudgetAdSetId(null);
      await loadCampaign();
    } catch (error) {
      console.error("Error updating budget:", error);
      toast.error(
        getApiErrorMessage(
          error,
          isEn ? "Failed to update budget" : "فشل تحديث الميزانية",
        ),
      );
    } finally {
      setSavingBudgetId(null);
    }
  };

  const handlePause = async () => {
    if (!id) return;
    try {
      await facebookAdsService.pauseCampaign(id);
      tToast.success("CampaignDetails.msg_c0fb");
      await loadCampaign();
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(
          error,
          isEn ? "Failed to pause campaign" : "فشل في إيقاف الحملة",
        ),
      );
    }
  };

  const handleResume = async () => {
    if (!id) return;
    try {
      await facebookAdsService.resumeCampaign(id);
      tToast.success("CampaignDetails.msg_00e5");
      await loadCampaign();
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(
          error,
          isEn ? "Failed to resume campaign" : "فشل في استئناف الحملة",
        ),
      );
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (
      !window.confirm(
        isEn
          ? "Are you sure you want to delete this campaign?"
          : "هل أنت متأكد من حذف هذه الحملة؟",
      )
    ) {
      return;
    }

    try {
      await facebookAdsService.deleteCampaign(id);
      tToast.success("CampaignDetails.success_delete_b4c9");
      navigate(dashboardUrl);
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(
          error,
          isEn ? "Failed to delete campaign" : "فشل في حذف الحملة",
        ),
      );
    }
  };

  return {
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
    loadCampaign,
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
  };
}
