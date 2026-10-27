import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import {
  facebookAdsService,
  FacebookAdDetailResponse,
  FacebookAdPerformanceBreakdownReport,
  FacebookPerformanceBreakdown,
} from "../../../services/facebookAdsService";
import {
  STORAGE_KEY,
  getStoredDateRange,
  getApiErrorMessage,
  getSafeNumber,
  getCreativePayload,
  getPreviewHtml,
} from "./helpers";

export function useAdDetails() {
  const { adId } = useParams<{ adId: string }>();
  const { i18n } = useTranslation();
  const isEn = Boolean(i18n.language && i18n.language.startsWith("en"));

  const [dateRange, setDateRange] = useState(getStoredDateRange);
  const [details, setDetails] = useState<FacebookAdDetailResponse | null>(null);
  const [breakdowns, setBreakdowns] = useState<
    Partial<Record<FacebookPerformanceBreakdown, FacebookAdPerformanceBreakdownReport>>
  >({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<unknown[]>([]);
  const selectedCurrency = details?.adAccount?.currency || "EGP";

  const formatCurrency = useCallback(
    (value?: number) =>
      new Intl.NumberFormat(isEn ? "en-US" : "ar-EG", {
        style: "currency",
        currency: selectedCurrency,
        maximumFractionDigits: 2,
      }).format(getSafeNumber(value)),
    [isEn, selectedCurrency],
  );

  const formatNumber = useCallback(
    (value?: number) =>
      new Intl.NumberFormat(isEn ? "en-US" : "ar-EG", {
        maximumFractionDigits: 0,
      }).format(getSafeNumber(value)),
    [isEn],
  );

  const formatDecimal = useCallback(
    (value?: number, suffix = "") =>
      `${new Intl.NumberFormat(isEn ? "en-US" : "ar-EG", {
        maximumFractionDigits: 2,
      }).format(getSafeNumber(value))}${suffix}`,
    [isEn],
  );

  const formatPercent = useCallback(
    (value?: number) => formatDecimal(value, "%"),
    [formatDecimal],
  );

  const loadDetails = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!adId) return;

      try {
        if (!silent) setLoading(true);
        const detailResult = await facebookAdsService.getAdDetails(
          adId,
          dateRange.startDate,
          dateRange.endDate,
        );

        if (!detailResult?.ad) {
          throw new Error(isEn ? "Incomplete ad data" : "بيانات الإعلان غير مكتملة");
        }

        setDetails(detailResult);

        const breakdownTypes: FacebookPerformanceBreakdown[] = [
          "age_gender",
          "placement",
          "device",
        ];
        const breakdownResults = await Promise.allSettled(
          breakdownTypes.map((breakdown) =>
            facebookAdsService.getAdPerformanceBreakdown({
              adId,
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
              breakdown,
            }),
          ),
        );

        const nextBreakdowns: Partial<
          Record<FacebookPerformanceBreakdown, FacebookAdPerformanceBreakdownReport>
        > = {};
        breakdownResults.forEach((result, index) => {
          const breakdown = breakdownTypes[index];
          if (result.status === "fulfilled" && breakdown) {
            nextBreakdowns[breakdown] = result.value;
          }
        });
        setBreakdowns(nextBreakdowns);
      } catch (error: unknown) {
        console.error("Error loading ad details:", error);
        toast.error(
          getApiErrorMessage(
            error,
            isEn ? "Failed to load ad details" : "فشل في تحميل تفاصيل الإعلان",
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [adId, dateRange.endDate, dateRange.startDate, isEn],
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dateRange));
    loadDetails();
  }, [dateRange, loadDetails]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDetails({ silent: true });
    setRefreshing(false);
    tToast.success("AdDetails.success_update_b872");
  };

  const handleSync = async () => {
    if (!adId) return;

    try {
      setSyncing(true);
      await facebookAdsService.syncAdInsights(
        adId,
        dateRange.startDate,
        dateRange.endDate,
      );
      await loadDetails({ silent: true });
      tToast.success("AdDetails.msg_39be");
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(
          error,
          isEn ? "Failed to sync ad" : "فشل في مزامنة الإعلان",
        ),
      );
    } finally {
      setSyncing(false);
    }
  };

  const handlePreview = async () => {
    if (!details?.ad.facebookAdId) {
      tToast.error("AdDetails.msg_d051");
      return;
    }

    try {
      setPreviewLoading(true);
      const result = await facebookAdsService.getAdPreview(
        details.ad.facebookAdId,
        "MOBILE_FEED_STANDARD",
      );
      setPreviewData(result);
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(
          error,
          isEn ? "Failed to load ad preview" : "فشل في تحميل معاينة الإعلان",
        ),
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  const creativePayload = useMemo(
    () => getCreativePayload(details?.ad?.creative),
    [details?.ad?.creative],
  );

  const previewHtml = useMemo(() => getPreviewHtml(previewData), [previewData]);

  const dashboardUrl = details?.campaign?.id
    ? `/advertising/facebook-ads/campaigns/${details.campaign.id}`
    : "/advertising/facebook-ads";

  const performanceSourceLabel =
    details?.meta?.performanceSource === "META"
      ? (isEn ? "Meta Direct" : "Meta مباشر")
      : (isEn ? "Local" : "محلي");

  const performanceSourceClass =
    details?.meta?.performanceSource === "META"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-slate-200 bg-slate-50 text-slate-700";

  const bestSibling = useMemo(() => {
    const siblings = details?.siblingAds || [];
    return [...siblings].sort((a, b) => b.metrics.roas - a.metrics.roas)[0];
  }, [details?.siblingAds]);

  const metricSummary = details?.summary;
  const metricCards = useMemo(
    () => [
      {
        label: isEn ? "Spend" : "الإنفاق",
        value: formatCurrency(metricSummary?.spend),
        comparison: details?.comparisons.previousPeriod["spend"],
      },
      {
        label: isEn ? "Purchases" : "المشتريات",
        value: formatNumber(metricSummary?.purchases),
        comparison: details?.comparisons.previousPeriod["purchases"],
      },
      {
        label: "ROAS",
        value: `${formatDecimal(metricSummary?.roas)}x`,
        comparison: details?.comparisons.previousPeriod["roas"],
      },
      {
        label: "CPA",
        value: formatCurrency(metricSummary?.cpa),
        comparison: details?.comparisons.previousPeriod["cpa"],
        inverse: true,
      },
      {
        label: "CTR",
        value: formatPercent(metricSummary?.ctr),
        comparison: details?.comparisons.previousPeriod["ctr"],
      },
      {
        label: "Frequency",
        value: formatDecimal(metricSummary?.frequency),
        comparison: details?.comparisons.previousPeriod["frequency"],
        inverse: true,
      },
    ],
    [
      details?.comparisons.previousPeriod,
      formatCurrency,
      formatDecimal,
      formatNumber,
      formatPercent,
      isEn,
      metricSummary?.cpa,
      metricSummary?.ctr,
      metricSummary?.frequency,
      metricSummary?.purchases,
      metricSummary?.roas,
      metricSummary?.spend,
    ],
  );

  return {
    isEn,
    dateRange,
    setDateRange,
    details,
    breakdowns,
    loading,
    refreshing,
    syncing,
    previewLoading,
    handleRefresh,
    handleSync,
    handlePreview,
    creativePayload,
    previewHtml,
    dashboardUrl,
    performanceSourceLabel,
    performanceSourceClass,
    bestSibling,
    metricCards,
    formatCurrency,
    formatNumber,
    formatDecimal,
    formatPercent,
  };
}
