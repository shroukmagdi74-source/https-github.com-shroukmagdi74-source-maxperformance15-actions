/**
 * CampaignQuickViewModal
 *
 * شاشة منبثقة تفاعلية وسريعة لملخص الحملة، تشخيص نقاط الضعف،
 * والتعديل الفوري للاسم والميزانية والحالة دون مغادرة لوحة الإعلانات.
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, ShieldAlert, Layers } from "lucide-react";
import { toast } from "sonner";
import {
  facebookAdsService,
  type FacebookCampaign,
  type FacebookAdsPerformanceTotals,
  type FacebookCampaignInsightsResponse,
} from "../../../services/facebookAdsService";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  getCampaignDeliveryBadge,
  getCampaignDeliveryLabel,
  getCampaignEffectiveStatus,
  isCampaignDelivering,
} from "../../../utils/facebookAdsHelpers";

import {
  EGYPT_GOVERNORATES,
  parseGenders,
  parseLocationsArray,
  CampaignQuickViewModalProps,
  TabType,
  DiagnosedWeakness,
  CampaignQuickViewHeader,
  CampaignOverviewTab,
  CampaignWeaknessesTab,
  CampaignAdSetsTab,
  CampaignQuickViewFooter,
} from "./campaign-quick-view";

export { EGYPT_GOVERNORATES };

export const CampaignQuickViewModal: React.FC<CampaignQuickViewModalProps> = ({
  isOpen,
  campaign,
  performance,
  selectedCurrency,
  selectedAdAccountId,
  onClose,
  onCampaignUpdated,
}) => {
  const { i18n } = useTranslation();
  const isEn = Boolean(i18n.language && i18n.language.startsWith("en"));

  const [activeTab, setActiveTab] = useState<TabType>("summary");
  const [fullCampaign, setFullCampaign] = useState<FacebookCampaign | null>(null);
  const [liveInsights, setLiveInsights] = useState<FacebookCampaignInsightsResponse | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Editable campaign fields
  const [campaignName, setCampaignName] = useState("");
  const [budgetType, setBudgetType] = useState<"DAILY" | "LIFETIME">("DAILY");
  const [budgetAmount, setBudgetAmount] = useState<number>(0);
  const [campaignStatus, setCampaignStatus] = useState<string>("ACTIVE");
  const [saving, setSaving] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  // Editable Ad Set / Targeting fields
  const [editingAdSetId, setEditingAdSetId] = useState<string | null>(null);
  const [adSetName, setAdSetName] = useState("");
  const [adSetBudget, setAdSetBudget] = useState(0);
  const [adSetAgeMin, setAdSetAgeMin] = useState(18);
  const [adSetAgeMax, setAdSetAgeMax] = useState(65);
  const [adSetGenders, setAdSetGenders] = useState<string[]>(["1", "2"]);
  const [adSetLocations, setAdSetLocations] = useState<string[]>([]);
  const [savingAdSet, setSavingAdSet] = useState(false);
  const [togglingAdSetId, setTogglingAdSetId] = useState<string | null>(null);
  const [togglingAdId, setTogglingAdId] = useState<string | null>(null);

  // Sync initial campaign data
  useEffect(() => {
    if (!campaign) return;
    setCampaignName(campaign.name || "");
    setBudgetType(campaign.budgetType || "DAILY");
    setBudgetAmount(campaign.budgetAmount || 0);
    setCampaignStatus(getCampaignEffectiveStatus(campaign));
    setFullCampaign(campaign);
    setActiveTab("summary");
  }, [campaign]);

  // Load deep campaign details and live insights asynchronously
  const fetchDeepDetails = useCallback(async () => {
    if (!campaign?.id) return;
    setLoadingDetails(true);
    try {
      const [campaignData, insightsData] = await Promise.allSettled([
        facebookAdsService.getCampaign(campaign.id),
        facebookAdsService.getCampaignInsights(campaign.id),
      ]);

      if (campaignData.status === "fulfilled" && campaignData.value?.id) {
        setFullCampaign(campaignData.value);
        if (campaignData.value.name) setCampaignName(campaignData.value.name);
        if (campaignData.value.budgetType) setBudgetType(campaignData.value.budgetType);
        if (campaignData.value.budgetAmount !== undefined) setBudgetAmount(campaignData.value.budgetAmount);
        setCampaignStatus(getCampaignEffectiveStatus(campaignData.value));
      }

      if (insightsData.status === "fulfilled" && insightsData.value) {
        setLiveInsights(insightsData.value);
      }
    } catch (err) {
      console.error("Error fetching deep campaign details:", err);
    } finally {
      setLoadingDetails(false);
    }
  }, [campaign?.id]);

  useEffect(() => {
    if (isOpen && campaign?.id) {
      fetchDeepDetails();
    }
  }, [isOpen, campaign?.id, fetchDeepDetails]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const activeCampaign = fullCampaign || campaign;

  const isCboCampaign = Boolean(
    activeCampaign?.budgetOptimization ||
    (activeCampaign?.budgetAmount && Number(activeCampaign.budgetAmount) > 0) ||
    (activeCampaign?.dailyBudget && Number(activeCampaign.dailyBudget) > 0)
  );

  const metrics: FacebookAdsPerformanceTotals = useMemo(() => {
    if (liveInsights?.totals) {
      return {
        spend: liveInsights.totals.spend || 0,
        impressions: liveInsights.totals.impressions || 0,
        clicks: liveInsights.totals.clicks || 0,
        ctr: liveInsights.totals.ctr || 0,
        cpc: liveInsights.totals.cpc || 0,
        cpa: liveInsights.totals.cpa || 0,
        roas: liveInsights.totals.roas || 0,
        purchases: liveInsights.totals.purchases || 0,
        purchaseValue: liveInsights.totals.purchaseValue || 0,
        frequency: liveInsights.totals.frequency || 0,
      };
    }
    return (
      performance || {
        spend: 0,
        impressions: 0,
        clicks: 0,
        ctr: 0,
        cpc: 0,
        cpa: 0,
        roas: 0,
        purchases: 0,
        purchaseValue: 0,
        frequency: 0,
      }
    );
  }, [liveInsights?.totals, performance]);

  const deliveryBadgeClass = activeCampaign ? getCampaignDeliveryBadge(activeCampaign) : "";
  const deliveryLabel = activeCampaign ? getCampaignDeliveryLabel(activeCampaign) : "";
  const isDelivering = activeCampaign ? isCampaignDelivering(activeCampaign) : false;

  const handleCopyMetaId = () => {
    if (!activeCampaign?.facebookCampaignId) return;
    navigator.clipboard.writeText(activeCampaign.facebookCampaignId);
    setCopiedId(true);
    toast.success(isEn ? "Meta Campaign ID copied" : "تم نسخ معرّف الحملة على Meta");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleToggleStatus = async () => {
    if (!activeCampaign) return;
    const isCurrentlyActive = campaignStatus === "ACTIVE";
    const nextStatus = isCurrentlyActive ? "PAUSED" : "ACTIVE";
    setTogglingStatus(true);
    setCampaignStatus(nextStatus);

    try {
      if (isCurrentlyActive) {
        await facebookAdsService.pauseCampaign(activeCampaign.id);
        toast.success(
          isEn
            ? `Campaign "${activeCampaign.name}" paused`
            : `تم إيقاف حملة "${activeCampaign.name}" بنجاح`,
        );
      } else {
        await facebookAdsService.resumeCampaign(activeCampaign.id);
        toast.success(
          isEn
            ? `Campaign "${activeCampaign.name}" activated`
            : `تم تنشيط حملة "${activeCampaign.name}" بنجاح`,
        );
      }
      const updated = {
        ...activeCampaign,
        status: nextStatus as any,
        effectiveStatus: nextStatus,
        configuredStatus: nextStatus,
      };
      setFullCampaign(updated);
      onCampaignUpdated?.(updated);
    } catch {
      setCampaignStatus(isCurrentlyActive ? "ACTIVE" : "PAUSED");
      toast.error(isEn ? "Failed to update campaign status" : "فشل تغيير حالة الحملة على Meta");
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!activeCampaign) return;
    if (!campaignName.trim()) {
      toast.error(isEn ? "Campaign name cannot be empty" : "اسم الحملة لا يمكن أن يكون فارغاً");
      return;
    }
    if (budgetAmount <= 0) {
      toast.error(isEn ? "Please enter a valid budget" : "يرجى تحديد ميزانية صالحة أكبر من صفر");
      return;
    }

    setSaving(true);
    try {
      const updatedData = await facebookAdsService.updateCampaign(activeCampaign.id, {
        name: campaignName.trim(),
        budgetType,
        budgetAmount,
      });

      const updated = {
        ...activeCampaign,
        name: campaignName.trim(),
        budgetType,
        budgetAmount,
        ...(updatedData || {}),
      };

      setFullCampaign(updated);
      onCampaignUpdated?.(updated);
      toast.success(isEn ? "Campaign updated successfully" : "تم حفظ تعديلات الحملة بنجاح ومزامنتها");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error ||
          (isEn ? "Failed to save campaign updates" : "حدث خطأ أثناء حفظ تعديلات الحملة"),
      );
    } finally {
      setSaving(false);
    }
  };

  const applyBudgetPercent = (percent: number) => {
    const current = budgetAmount || 100;
    const next = Math.max(10, Math.round(current * (1 + percent / 100)));
    setBudgetAmount(next);
  };

  const handleStartEditAdSet = (adSet: any) => {
    setEditingAdSetId(adSet.id);
    setAdSetName(adSet.name || "");
    setAdSetBudget(adSet.budgetAmount || 0);
    setAdSetAgeMin(adSet.ageMin || 18);
    setAdSetAgeMax(adSet.ageMax || 65);
    setAdSetGenders(parseGenders(adSet.genders));
    setAdSetLocations(parseLocationsArray(adSet.locations || adSet.targeting?.geo_locations));
  };

  const handleCancelEditAdSet = () => {
    setEditingAdSetId(null);
  };

  const handleToggleLocation = (locKey: string) => {
    setAdSetLocations((prev) =>
      prev.includes(locKey) ? prev.filter((k) => k !== locKey) : [...prev, locKey]
    );
  };

  const handleSelectAllEgypt = () => {
    setAdSetLocations(EGYPT_GOVERNORATES.map((g) => g.key));
  };

  const handleSelectGreaterCairo = () => {
    setAdSetLocations(["Cairo", "Giza", "Qalyubia"]);
  };

  const handleClearLocations = () => {
    setAdSetLocations([]);
  };

  const handleSaveAdSetTargeting = async (adSetId: string) => {
    if (!adSetName.trim()) {
      toast.error(isEn ? "Ad set name cannot be empty" : "اسم المجموعة لا يمكن أن يكون فارغاً");
      return;
    }
    if (adSetAgeMin > adSetAgeMax) {
      toast.error(isEn ? "Minimum age cannot exceed maximum age" : "الحد الأدنى للعمر يجب أن يكون أصغر من الأقصى");
      return;
    }

    setSavingAdSet(true);
    try {
      await facebookAdsService.updateAdSet(adSetId, {
        name: adSetName.trim(),
        budgetAmount: adSetBudget > 0 ? adSetBudget : undefined,
        ageMin: adSetAgeMin,
        ageMax: adSetAgeMax,
        genders: adSetGenders,
        locations: adSetLocations,
      });

      setFullCampaign((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          adSets: prev.adSets?.map((s) =>
            s.id === adSetId
              ? {
                  ...s,
                  name: adSetName.trim(),
                  budgetAmount: adSetBudget,
                  ageMin: adSetAgeMin,
                  ageMax: adSetAgeMax,
                  genders: adSetGenders,
                  locations: adSetLocations,
                }
              : s
          ),
        };
      });

      setEditingAdSetId(null);
      toast.success(
        isEn
          ? "Targeting and ad set updated successfully on Meta"
          : "تم حفظ الاستهداف وتفاصيل المجموعة بنجاح ومزامنتها مع Meta"
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error ||
          (isEn ? "Failed to update ad set targeting" : "فشل تحديث الاستهداف")
      );
    } finally {
      setSavingAdSet(false);
    }
  };

  const handleToggleAdSetStatus = async (adSet: any) => {
    const isCurrentlyActive = adSet.status === "ACTIVE";
    const nextStatus = isCurrentlyActive ? "PAUSED" : "ACTIVE";
    try {
      setTogglingAdSetId(adSet.id);
      if (isCurrentlyActive) {
        await facebookAdsService.pauseAdSet(adSet.id);
      } else {
        await facebookAdsService.resumeAdSet(adSet.id);
      }
      setFullCampaign((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          adSets: prev.adSets?.map((s: any) =>
            s.id === adSet.id ? { ...s, status: nextStatus } : s
          ),
        };
      });
      toast.success(
        isCurrentlyActive
          ? isEn ? "Ad set paused" : `تم إيقاف المجموعة الإعلانية "${adSet.name}"`
          : isEn ? "Ad set activated" : `تم تنشيط المجموعة الإعلانية "${adSet.name}"`
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error ||
          (isEn ? "Failed to update ad set status" : "فشل تغيير حالة المجموعة الإعلانية")
      );
    } finally {
      setTogglingAdSetId(null);
    }
  };

  const handleToggleAdStatus = async (ad: any, adSetId: string) => {
    const isCurrentlyActive = ad.status === "ACTIVE";
    const nextStatus = isCurrentlyActive ? "PAUSED" : "ACTIVE";
    try {
      setTogglingAdId(ad.id);
      if (isCurrentlyActive) {
        await facebookAdsService.pauseAd(ad.id);
      } else {
        await facebookAdsService.resumeAd(ad.id);
      }
      setFullCampaign((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          adSets: prev.adSets?.map((s: any) =>
            s.id === adSetId
              ? {
                  ...s,
                  ads: s.ads?.map((a: any) => (a.id === ad.id ? { ...a, status: nextStatus } : a)),
                }
              : s
          ),
        };
      });
      toast.success(
        isCurrentlyActive
          ? isEn ? "Ad creative paused" : `تم إيقاف الإعلان "${ad.name}"`
          : isEn ? "Ad creative activated" : `تم تنشيط الإعلان "${ad.name}"`
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error ||
          (isEn ? "Failed to update ad status" : "فشل تغيير حالة الإعلان")
      );
    } finally {
      setTogglingAdId(null);
    }
  };

  const weaknesses: DiagnosedWeakness[] = useMemo(() => {
    if (!activeCampaign) return [];
    const list: DiagnosedWeakness[] = [];
    const adSetsCount =
      activeCampaign.adSets?.length ??
      activeCampaign.deliveryReadiness?.counts?.adSetsTotal ??
      0;

    if (metrics.spend >= 120 && metrics.purchases === 0) {
      list.push({
        id: "spend-without-purchases",
        severity: "critical",
        title: "نزيف ميزانية حرج (إنفاق بدون مبيعات)",
        titleEn: "Critical Budget Bleed (Spend without Purchases)",
        description:
          "تم إنفاق ميزانية معتبرة دون تسجيل أي طلب شراء. افحص تتبع حدث الشراء في البيكسل، سرعة صفحة الهبوط، وتناسق العرض التسويقي.",
        descriptionEn:
          "Significant ad spend recorded with zero purchases. Verify Purchase Pixel tracking, page load speed, and checkout flow.",
        metricLabel: isEn ? "Spent" : "الإنفاق المهدور",
        metricValue: formatCurrency(metrics.spend, selectedCurrency),
        actionLabel: isEn ? "Pause Campaign" : "إيقاف الحملة مؤقتاً للحد من الخسارة",
        actionLabelEn: "Pause Campaign",
        action: () => handleToggleStatus(),
      });
    }

    if (getCampaignEffectiveStatus(activeCampaign) === "ACTIVE" && !isDelivering) {
      const blockerDetail =
        activeCampaign.deliveryReadiness?.reasonText ||
        activeCampaign.deliveryReadiness?.reasons?.[0]?.label ||
        (adSetsCount === 0
          ? isEn
            ? "No Ad Sets created inside this campaign container."
            : "الحملة فارغة ولا تحتوي على أي مجموعات إعلانية."
          : isEn
          ? "No active ads delivering in active ad sets."
          : "لا توجد إعلانات نشطة مؤهلة للتسليم داخل المجموعات.");

      list.push({
        id: "active-not-delivering",
        severity: "critical",
        title: "الحملة نشطة ولكن لا تسلم إعلانات على Meta",
        titleEn: "Campaign Active but Not Delivering on Meta",
        description: blockerDetail,
        descriptionEn: blockerDetail,
        actionLabel: isEn ? "Create Ad Set" : "إضافة مجموعة إعلانية",
        actionLabelEn: "Add Ad Set",
      });
    }

    if (!activeCampaign.facebookCampaignId) {
      list.push({
        id: "local-only",
        severity: "critical",
        title: "حملة مسودة محلية (غير منشورة على فيسبوك)",
        titleEn: "Local Draft Campaign (Not Published to Meta)",
        description:
          "هذه الحملة مسجلة فقط في النظام المحلي ولم يتم رفعها أو مزامنتها مع خوادم Meta Ads Manager.",
        descriptionEn:
          "This campaign is stored locally and has not been published or linked to Meta Ads Manager yet.",
      });
    }

    if (
      (activeCampaign.objective?.includes("CONVERSIONS") ||
        activeCampaign.objective?.includes("SALES") ||
        activeCampaign.objective?.includes("OUTCOME_SALES")) &&
      !activeCampaign.pixelId
    ) {
      list.push({
        id: "missing-pixel",
        severity: "warning",
        title: "حملة مبيعات بدون ربط بيكسل تتبع (Pixel ID)",
        titleEn: "Sales Campaign Missing Conversion Pixel ID",
        description:
          "هدف الحملة تحويلات ومبيعات ولكن لم يتم ربطها بمعرّف بيكسل محدد، مما يمنع خوارزميات Meta من تحسين توجيه الإعلانات للمشترين الفعليين.",
        descriptionEn:
          "Targeting sales conversions without a linked Meta Pixel ID impedes machine learning optimization.",
      });
    }

    if (metrics.impressions > 500 && metrics.ctr > 0 && metrics.ctr < 1.0) {
      list.push({
        id: "weak-hook",
        severity: "warning",
        title: "ضعف الـ Hook والجاذبية الأولية (CTR أقل من 1%)",
        titleEn: "Weak Creative Hook (CTR below 1.0%)",
        description:
          "الإعلان يحصل على انطباعات ولكن نسبة النقر منخفضة جداً. هذا يعني أن أول 3 ثوانٍ في الفيديو أو الصورة الرئيسية لا تجذب الجمهور المستهدف.",
        descriptionEn:
          "Impressions are delivering but click-through rate is low. Consider revising the opening 3 seconds of the video or creative thumbnail.",
        metricLabel: "CTR",
        metricValue: formatPercentage(metrics.ctr),
      });
    }

    if (metrics.frequency >= 2.8) {
      list.push({
        id: "audience-fatigue",
        severity: "warning",
        title: "إرهاق الجمهور والتشبع الإعلاني (Frequency مرتفع)",
        titleEn: "Audience Fatigue & Saturation (High Frequency)",
        description:
          `معدل التكرار (${formatNumber(metrics.frequency, 1)}x) يشير إلى أن نفس الأشخاص يشاهدون الإعلان عدة مرات، مما يرفع تكلفة الـ CPA ويسبب تجاهل الإعلان. وسّع نطاق الجمهور أو اختبر زاوية تسويقية جديدة.`,
        descriptionEn:
          `Frequency (${formatNumber(metrics.frequency, 1)}x) indicates audience saturation. Broaden target audience or test fresh creatives.`,
        metricLabel: isEn ? "Frequency" : "معدل التكرار",
        metricValue: `${formatNumber(metrics.frequency, 1)}x`,
      });
    }

    if (metrics.spend >= 100 && metrics.purchases > 0 && metrics.roas > 0 && metrics.roas < 1.4) {
      list.push({
        id: "low-roas",
        severity: "warning",
        title: "عائد إعلاني منخفض أو قريب من الخسارة (ROAS < 1.4x)",
        titleEn: "Unprofitable or Thin ROAS (ROAS < 1.4x)",
        description:
          "العائد الإعلاني الحالي لا يغطي تكلفة المنتج والشحن والتشغيل. يجب إعادة مراجعة تسعير العرض أو خفض تكلفة الإجراء CPA.",
        descriptionEn:
          "Current ROAS is below healthy margin thresholds. Re-evaluate product pricing bundles or optimize conversion cost.",
        metricLabel: "ROAS",
        metricValue: `${formatNumber(metrics.roas, 2)}x`,
      });
    }

    if (metrics.roas >= 2.0 && metrics.purchases >= 2) {
      list.push({
        id: "scale-opportunity",
        severity: "opportunity",
        title: "فرصة توسيع ممتازة (ROAS استثنائي >= 2.0x)",
        titleEn: "Scaling Opportunity (High ROAS >= 2.0x)",
        description:
          "الحملة تحقق أرباحاً ممتازة وتكلفة اكتساب مستقرة. نوصي بزيادة الميزانية تدريجياً بنسبة 15% إلى 20% للاستفادة من الزخم دون إعادة تعلم الخوارزمية.",
        descriptionEn:
          "Strong performance and profitable acquisition. Scale budget vertically by +15-20% to capture volume without resetting learning phase.",
        metricLabel: "ROAS",
        metricValue: `${formatNumber(metrics.roas, 2)}x`,
        actionLabel: isEn ? "Increase Budget by +15%" : "رفع الميزانية +15% فوراً",
        actionLabelEn: "+15% Budget",
        action: () => applyBudgetPercent(15),
      });
    }

    return list;
  }, [activeCampaign, isDelivering, metrics, selectedCurrency, isEn]);

  const criticalWeaknessesCount = weaknesses.filter((w) => w.severity === "critical").length;
  const warningWeaknessesCount = weaknesses.filter((w) => w.severity === "warning").length;

  if (!isOpen || !activeCampaign) return null;

  const fullDetailsUrl = `/advertising/facebook-ads/campaigns/${activeCampaign.id}${
    selectedAdAccountId ? `?adAccountId=${encodeURIComponent(selectedAdAccountId)}` : ""
  }`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-5 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
        dir={isEn ? "ltr" : "rtl"}
      >
        <CampaignQuickViewHeader
          isEn={isEn}
          campaignStatus={campaignStatus}
          togglingStatus={togglingStatus}
          campaignName={campaignName}
          setCampaignName={setCampaignName}
          deliveryBadgeClass={deliveryBadgeClass}
          deliveryLabel={deliveryLabel}
          facebookCampaignId={activeCampaign.facebookCampaignId}
          copiedId={copiedId}
          loadingDetails={loadingDetails}
          metaAccountId={activeCampaign.metaAccountId}
          selectedAdAccountId={selectedAdAccountId}
          onToggleStatus={handleToggleStatus}
          onCopyMetaId={handleCopyMetaId}
          onRefresh={fetchDeepDetails}
          onClose={onClose}
        />

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 border-b border-slate-200/80 bg-white px-4 pt-2 dark:border-slate-800 dark:bg-slate-950 sm:px-6">
          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={`inline-flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-bold transition-all ${
              activeTab === "summary"
                ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>{isEn ? "Overview & Telemetry" : "الملخص والمؤشرات المالية"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("weaknesses")}
            className={`inline-flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-bold transition-all ${
              activeTab === "weaknesses"
                ? "border-amber-600 text-amber-600 dark:border-amber-500 dark:text-amber-400"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>{isEn ? "Weakness & Audit" : "نقاط الضعف والتشخيص"}</span>
            {criticalWeaknessesCount > 0 ? (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
                {criticalWeaknessesCount}
              </span>
            ) : warningWeaknessesCount > 0 ? (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-white">
                {warningWeaknessesCount}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("structure")}
            className={`inline-flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-bold transition-all ${
              activeTab === "structure"
                ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>{isEn ? "Ad Sets & Targeting" : "المجموعات وتعديل الاستهداف"}</span>
            <span className="rounded-md bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {activeCampaign.adSets?.length || 0}
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === "summary" && (
            <CampaignOverviewTab
              isEn={isEn}
              activeCampaign={activeCampaign}
              isCboCampaign={isCboCampaign}
              budgetType={budgetType}
              setBudgetType={setBudgetType}
              budgetAmount={budgetAmount}
              setBudgetAmount={setBudgetAmount}
              selectedCurrency={selectedCurrency}
              applyBudgetPercent={applyBudgetPercent}
              metrics={metrics}
            />
          )}

          {activeTab === "weaknesses" && (
            <CampaignWeaknessesTab
              isEn={isEn}
              weaknesses={weaknesses}
              criticalWeaknessesCount={criticalWeaknessesCount}
              warningWeaknessesCount={warningWeaknessesCount}
            />
          )}

          {activeTab === "structure" && (
            <CampaignAdSetsTab
              isEn={isEn}
              loadingDetails={loadingDetails}
              activeCampaign={activeCampaign}
              selectedAdAccountId={selectedAdAccountId}
              selectedCurrency={selectedCurrency}
              isCboCampaign={isCboCampaign}
              editingAdSetId={editingAdSetId}
              adSetName={adSetName}
              setAdSetName={setAdSetName}
              adSetBudget={adSetBudget}
              setAdSetBudget={setAdSetBudget}
              adSetAgeMin={adSetAgeMin}
              setAdSetAgeMin={setAdSetAgeMin}
              adSetAgeMax={adSetAgeMax}
              setAdSetAgeMax={setAdSetAgeMax}
              adSetGenders={adSetGenders}
              setAdSetGenders={setAdSetGenders}
              adSetLocations={adSetLocations}
              savingAdSet={savingAdSet}
              togglingAdSetId={togglingAdSetId}
              togglingAdId={togglingAdId}
              onStartEditAdSet={handleStartEditAdSet}
              onCancelEditAdSet={handleCancelEditAdSet}
              onSaveAdSetTargeting={handleSaveAdSetTargeting}
              onToggleAdSetStatus={handleToggleAdSetStatus}
              onToggleAdStatus={handleToggleAdStatus}
              onToggleLocation={handleToggleLocation}
              onSelectAllEgypt={handleSelectAllEgypt}
              onSelectGreaterCairo={handleSelectGreaterCairo}
              onClearLocations={handleClearLocations}
            />
          )}
        </div>

        <CampaignQuickViewFooter
          isEn={isEn}
          fullDetailsUrl={fullDetailsUrl}
          saving={saving}
          onClose={onClose}
          onSaveChanges={handleSaveChanges}
        />
      </div>
    </div>
  );
};

export default CampaignQuickViewModal;
