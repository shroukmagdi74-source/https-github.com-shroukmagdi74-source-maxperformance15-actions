import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiClient, type ApiRequestConfig } from "../../../services/apiClient";
import type { PeriodRange } from "../../../components/common/PeriodSelector";
import type { NotificationLog, Stats, WhatsAppAnalyticsProps } from "./types";

export const useWhatsAppAnalyticsController = ({
  companyId,
  companyName,
  superAdminMode = false,
}: WhatsAppAnalyticsProps = {}) => {
  const { t, i18n } = useTranslation();

  const pageTitle = companyName
    ? `${t("whatsappAnalytics.title")} · ${companyName}`
    : t("whatsappAnalytics.title");

  const backHref =
    superAdminMode && companyId
      ? `/super-admin/whatsapp/companies/${companyId}`
      : "/whatsapp/notifications";

  const eyebrow =
    superAdminMode && companyName
      ? i18n.language === "ar"
        ? `شركة: ${companyName}`
        : `Company: ${companyName}`
      : undefined;

  const STATUS_LABELS: Record<string, string> = useMemo(
    () => ({
      PENDING: t("whatsappNotifications.status.pending"),
      QUEUED: t("whatsappNotifications.status.queued"),
      SENDING: t("whatsappNotifications.status.sending"),
      SENT: t("whatsappNotifications.status.sent"),
      DELIVERED: t("whatsappNotifications.status.delivered"),
      READ: t("whatsappNotifications.status.read"),
      FAILED: t("whatsappNotifications.status.failed"),
      CANCELLED: t("whatsappNotifications.status.cancelled"),
    }),
    [t]
  );

  const CATEGORY_LABELS: Record<string, string> = useMemo(
    () => ({
      ORDERS: t("whatsappNotifications.tabs.orders"),
      PRODUCTS: t("whatsappNotifications.tabs.products"),
      MARKETING: t("whatsappNotifications.tabs.marketing"),
      ABANDONED_CART: t("whatsappNotifications.tabs.abandonedCart"),
      HR: t("whatsappNotifications.tabs.hr"),
      SYSTEM: t("common.system"),
    }),
    [t]
  );

  const EVENT_LABELS: Record<string, string> = useMemo(
    () => ({
      ORDER_CREATED: t("whatsappNotifications.orders.orderCreated"),
      ORDER_CONFIRMED: t("whatsappNotifications.orders.orderConfirmed"),
      ORDER_PROCESSING: t("whatsappNotifications.orders.orderProcessing"),
      ORDER_SHIPPED: t("whatsappNotifications.orders.orderShipped"),
      ORDER_OUT_FOR_DELIVERY: t("whatsappNotifications.orders.orderShipped"),
      ORDER_DELIVERED: t("whatsappNotifications.orders.orderDelivered"),
      ORDER_CANCELLED: t("whatsappNotifications.orders.orderCancelled"),
      PAYMENT_REMINDER: t("whatsappNotifications.orders.paymentReminder"),
      BACK_IN_STOCK: t("whatsappNotifications.products.backInStock"),
      PRICE_DROP: t("whatsappNotifications.products.priceDrop"),
      CART_ABANDONED_1H: t("whatsappNotifications.abandonedCart.firstReminder"),
      CART_ABANDONED_24H: t("whatsappNotifications.abandonedCart.secondReminder"),
      CART_ABANDONED_WITH_DISCOUNT: t(
        "whatsappNotifications.abandonedCart.incentiveDiscount"
      ),
      PROMOTIONAL: t("whatsappNotifications.marketing.promotional"),
      COUPON_SENT: t("whatsappNotifications.marketing.coupons"),
      BIRTHDAY_WISH: t("whatsappNotifications.marketing.birthday"),
      ATTENDANCE_REMINDER: t("whatsappNotifications.hr.attendance"),
      LEAVE_APPROVED: t("whatsappNotifications.hr.leave"),
      PAYROLL_READY: t("whatsappNotifications.hr.payroll"),
    }),
    [t]
  );

  const fallbackError =
    i18n.language === "ar"
      ? "تعذر تحميل بيانات التحليلات حالياً."
      : "Unable to load analytics data right now.";

  const unknownRecipient =
    i18n.language === "ar" ? "غير معروف" : "Unknown";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalLogs, setTotalLogs] = useState(0);
  const [range, setRange] = useState<PeriodRange | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const withCompanyConfig = useCallback(
    (config: ApiRequestConfig = {}) =>
      companyId ? { ...config, _companyId: companyId } : config,
    [companyId]
  );

  const fetchStats = useCallback(async () => {
    const response = await apiClient.get(
      "/whatsapp-notifications/stats",
      withCompanyConfig({
        params: range
          ? { startDate: range.startDate, endDate: range.endDate }
          : { days: 30 },
      })
    );
    setStats((response as any).data?.stats || null);
  }, [range, withCompanyConfig]);

  const fetchLogs = useCallback(async () => {
    const response = await apiClient.get(
      "/whatsapp-notifications/logs",
      withCompanyConfig({
        params: {
          page: page + 1,
          limit: rowsPerPage,
          category: categoryFilter || undefined,
          status: statusFilter || undefined,
        },
      })
    );
    setLogs((response as any).data?.logs || []);
    setTotalLogs((response as any).data?.pagination?.total || 0);
  }, [categoryFilter, page, rowsPerPage, statusFilter, withCompanyConfig]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }
        await Promise.all([fetchStats(), fetchLogs()]);
      } catch (loadError) {
        console.error("Error fetching WhatsApp analytics:", loadError);
        if (isMounted) {
          setError(fallbackError);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fallbackError, fetchLogs, fetchStats]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      await Promise.all([fetchStats(), fetchLogs()]);
    } catch (refreshError) {
      console.error("Error refreshing WhatsApp analytics:", refreshError);
      setError(fallbackError);
    } finally {
      setRefreshing(false);
    }
  };

  const formatLocaleDate = useCallback(
    (value: string) =>
      new Date(value).toLocaleString(i18n.language === "ar" ? "ar-EG" : "en-US"),
    [i18n.language]
  );

  const formatPercent = useCallback((value: string | number | undefined) => {
    const parsed =
      typeof value === "string" ? parseFloat(value) : Number(value || 0);

    if (!Number.isFinite(parsed)) {
      return "0";
    }

    return parsed.toFixed(parsed % 1 === 0 ? 0 : 1);
  }, []);

  const summaryHint = `${t("whatsappAnalytics.timeRange.label")}: ${
    range?.period === "7"
      ? t("whatsappAnalytics.timeRange.last7Days")
      : range?.period === "90"
      ? t("whatsappAnalytics.timeRange.last90Days")
      : range?.period === "365"
      ? t("whatsappAnalytics.timeRange.lastYear")
      : range?.period === "180"
      ? t("periodSelector.last6Months")
      : range?.period === "today" || range?.period === "yesterday"
      ? t("periodSelector.today")
      : t("whatsappAnalytics.timeRange.last30Days")
  }`;

  const categorySeries = useMemo(
    () => Object.entries(stats?.byCategory ?? {}),
    [stats?.byCategory]
  );

  const topEvents = useMemo(
    () =>
      Object.entries(stats?.byEvent ?? {})
        .sort(([, left], [, right]) => right - left)
        .slice(0, 5),
    [stats?.byEvent]
  );

  const totalPages = Math.max(1, Math.ceil(totalLogs / rowsPerPage));
  const from = totalLogs === 0 ? 0 : page * rowsPerPage + 1;
  const to = totalLogs === 0 ? 0 : Math.min(totalLogs, (page + 1) * rowsPerPage);
  const canGoPrevious = page > 0;
  const canGoNext = page + 1 < totalPages;

  return {
    t,
    i18n,
    pageTitle,
    backHref,
    eyebrow,
    summaryHint,
    unknownRecipient,
    loading,
    refreshing,
    error,
    stats,
    logs,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalLogs,
    range,
    setRange,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    fetchStats,
    fetchLogs,
    handleRefresh,
    formatLocaleDate,
    formatPercent,
    categorySeries,
    topEvents,
    totalPages,
    from,
    to,
    canGoPrevious,
    canGoNext,
    STATUS_LABELS,
    CATEGORY_LABELS,
    EVENT_LABELS,
  };
};

export type WhatsAppAnalyticsController = ReturnType<
  typeof useWhatsAppAnalyticsController
>;
