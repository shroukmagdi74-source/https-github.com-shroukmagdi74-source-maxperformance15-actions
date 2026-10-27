import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../../hooks/useCurrency";
import { apiClient } from "../../../services/apiClient";
import {
  PresetRange,
  ReportData,
} from "./types";
import { calculateDerivedMetrics } from "./reportsDerivations";

const toDateInputValue = (date: Date) => date.toISOString().split("T")[0];

export function useReportsDashboard() {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(true);
  const [partialErrors, setPartialErrors] = useState<string[]>([]);
  const [funnelData, setFunnelData] = useState<any | null>(null);

  const presets: PresetRange[] = useMemo(() => {
    const now = new Date();
    const today = toDateInputValue(now);
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = toDateInputValue(yesterdayDate);

    const last7Start = new Date(now);
    last7Start.setDate(last7Start.getDate() - 6);
    const last30Start = new Date(now);
    last30Start.setDate(last30Start.getDate() - 29);

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    return [
      {
        id: "today",
        label: t("reports.presets.today", "اليوم"),
        range: { start: today, end: today },
      },
      {
        id: "yesterday",
        label: t("reports.presets.yesterday", "أمس"),
        range: { start: yesterday, end: yesterday },
      },
      {
        id: "last7",
        label: t("reports.presets.last7Days", "آخر 7 أيام"),
        range: { start: toDateInputValue(last7Start), end: today },
      },
      {
        id: "last30",
        label: t("reports.presets.last30Days", "آخر 30 يوم"),
        range: { start: toDateInputValue(last30Start), end: today },
      },
      {
        id: "thisMonth",
        label: t("reports.presets.thisMonth", "هذا الشهر"),
        range: { start: toDateInputValue(thisMonthStart), end: today },
      },
      {
        id: "lastMonth",
        label: t("reports.presets.lastMonth", "الشهر الماضي"),
        range: {
          start: toDateInputValue(lastMonthStart),
          end: toDateInputValue(lastMonthEnd),
        },
      },
    ];
  }, [t]);

  const activePresetId = useMemo(() => {
    const match = presets.find(
      (preset) =>
        preset.range.start === dateRange.start &&
        preset.range.end === dateRange.end,
    );
    return match ? match.id : null;
  }, [presets, dateRange]);

  const handleStartDateChange = (value: string) => {
    setDateRange((prev) => ({
      start: value,
      end: prev.end && value > prev.end ? value : prev.end,
    }));
  };

  const handleEndDateChange = (value: string) => {
    setDateRange((prev) => ({
      start: prev.start && value < prev.start ? value : prev.start,
      end: value,
    }));
  };

  const isTodayRange = useMemo(() => {
    const today = toDateInputValue(new Date());
    return dateRange.start === today && dateRange.end === today;
  }, [dateRange]);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setPartialErrors([]);

      const buildEndpoint = (path: string, query?: string) => {
        const base = query ? `${path}?${query}` : path;
        return base;
      };

      const params = new URLSearchParams();
      if (dateRange.start) params.append("startDate", dateRange.start);
      if (dateRange.end) params.append("endDate", dateRange.end);
      const query = params.toString();

      const [
        salesRes,
        customersRes,
        conversationsRes,
        productsRes,
        performanceRes,
        moderatorsRes,
        funnelRes,
      ] = await Promise.allSettled([
        apiClient.get(buildEndpoint("/reports/sales", query)),
        apiClient.get(buildEndpoint("/reports/customers", query)),
        apiClient.get(buildEndpoint("/reports/conversations", query)),
        apiClient.get(buildEndpoint("/reports/products", query)),
        apiClient.get(buildEndpoint("/reports/performance", query)),
        apiClient.get(buildEndpoint("/reports/moderators", query)),
        apiClient.get(
          buildEndpoint("/analytics/sales-funnel", query ? `${query}&source=all` : "source=all"),
        ),
      ]);

      const reportsData: ReportData[] = [];
      const failedLabels: string[] = [];
      let nextFunnelData: any | null = null;

      const getPayload = (result: PromiseSettledResult<any>) => {
        if (result.status !== "fulfilled") return null;
        const val = result.value;
        if (val && typeof val === "object" && "data" in val && "success" in val) {
          return val.data;
        }
        return val;
      };

      if (salesRes.status === "fulfilled" && salesRes.value) {
        const payload = getPayload(salesRes);
        const dataRows = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.sales)
            ? payload.sales
            : Array.isArray(payload?.dailySales)
              ? payload.dailySales
              : Array.isArray(payload?.data)
                ? payload.data
                : [];

        reportsData.push({
          id: "1",
          name: "تقرير المبيعات",
          description: "تحليل شامل للمبيعات والإيرادات",
          type: "sales",
          period: "daily",
          data: dataRows,
          lastUpdated: new Date().toISOString(),
        });
      } else {
        failedLabels.push("تقرير المبيعات");
      }

      if (customersRes.status === "fulfilled" && customersRes.value) {
        const payload = getPayload(customersRes);
        const dataRows = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.customers)
            ? payload.customers
            : Array.isArray(payload?.data)
              ? payload.data
              : [];

        reportsData.push({
          id: "2",
          name: "تقرير العملاء",
          description: "إحصائيات العملاء وسلوك الشراء",
          type: "customers",
          period: "weekly",
          data: dataRows,
          lastUpdated: new Date().toISOString(),
        });
      } else {
        failedLabels.push("تقرير العملاء");
      }

      if (conversationsRes.status === "fulfilled" && conversationsRes.value) {
        const payload = getPayload(conversationsRes);
        const dataRows = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.conversations)
            ? payload.conversations
            : Array.isArray(payload?.data)
              ? payload.data
              : [];

        reportsData.push({
          id: "3",
          name: "تقرير المحادثات",
          description: "أداء خدمة العملاء والمحادثات",
          type: "conversations",
          period: "daily",
          data: dataRows,
          lastUpdated: new Date().toISOString(),
        });
      } else {
        failedLabels.push("تقرير المحادثات");
      }

      if (productsRes.status === "fulfilled" && productsRes.value) {
        const payload = getPayload(productsRes);
        const dataRows = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.products)
            ? payload.products
            : Array.isArray(payload?.topProducts)
              ? payload.topProducts
              : Array.isArray(payload?.data)
                ? payload.data
                : [];

        reportsData.push({
          id: "4",
          name: "تقرير المنتجات",
          description: "المنتجات الأكثر مبيعاً والأعلى ربحاً",
          type: "products",
          period: "monthly",
          data: dataRows,
          lastUpdated: new Date().toISOString(),
        });
      } else {
        failedLabels.push("تقرير المنتجات");
      }

      if (performanceRes.status === "fulfilled" && performanceRes.value) {
        const payload = getPayload(performanceRes);
        const dataRows = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.performance)
            ? payload.performance
            : Array.isArray(payload?.metrics)
              ? payload.metrics
              : Array.isArray(payload?.data)
                ? payload.data
                : [];

        reportsData.push({
          id: "5",
          name: "تقرير الأداء",
          description: "مؤشرات الأداء الرئيسية والتحويلات",
          type: "performance",
          period: "daily",
          data: dataRows,
          lastUpdated: new Date().toISOString(),
        });
      } else {
        failedLabels.push("تقرير الأداء");
      }

      if (moderatorsRes.status === "fulfilled" && moderatorsRes.value) {
        const payload = getPayload(moderatorsRes);
        const dataRows = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.moderators)
            ? payload.moderators
            : Array.isArray(payload?.data)
              ? payload.data
              : [];

        reportsData.push({
          id: "6",
          name: "تقرير المودريتورز",
          description: "أداء المودريتورز في المحادثات والرسائل",
          type: "moderators",
          period: "daily",
          data: dataRows,
          lastUpdated: new Date().toISOString(),
        });
      } else {
        failedLabels.push("تقرير المودريتورز");
      }

      if (funnelRes.status === "fulfilled" && funnelRes.value) {
        const payload = getPayload(funnelRes);
        if (payload) {
          nextFunnelData = payload;
        }
      }

      if (failedLabels.length > 0) {
        setPartialErrors(failedLabels);
      }
      setFunnelData(nextFunnelData);

      setReports(reportsData);
      setSelectedReport((prev) => {
        if (!reportsData.length) return null;
        if (!prev) return reportsData[0];
        const match = reportsData.find(
          (report) => report.id === prev.id || report.type === prev.type,
        );
        return match || reportsData[0];
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange.start, dateRange.end]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const derivedMetrics = useMemo(() => {
    return calculateDerivedMetrics(
      reports,
      formatPrice,
      isTodayRange,
      funnelData,
    );
  }, [reports, formatPrice, isTodayRange, funnelData]);

  return {
    t,
    reports,
    selectedReport,
    setSelectedReport,
    dateRange,
    setDateRange,
    loading,
    partialErrors,
    presets,
    activePresetId,
    handleStartDateChange,
    handleEndDateChange,
    fetchReports,
    summaryCards: derivedMetrics.summaryCards,
    topProducts: derivedMetrics.topProducts,
  };
}
