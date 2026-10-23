import { useCallback, useEffect, useMemo, useState } from "react";
import { tToast } from "../../../utils/i18n-toast";
import { apiClient, type ApiRequestConfig } from "../../../services/apiClient";
import {
  getPresetRange,
  STATUS_LABELS,
  type AnalyticsResponse,
  type DatePreset,
} from "./types";

interface UseWhatsAppConversationAnalyticsControllerOptions {
  companyId?: string;
}

export const useWhatsAppConversationAnalyticsController = ({
  companyId,
}: UseWhatsAppConversationAnalyticsControllerOptions = {}) => {
  const withCompanyConfig = useCallback(
    (config: ApiRequestConfig = {}) =>
      companyId ? { ...config, _companyId: companyId } : config,
    [companyId]
  );

  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [preset, setPreset] = useState<DatePreset>("30days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const activeRange = useMemo(() => {
    if (preset === "custom") return { start: startDate, end: endDate };
    return getPresetRange(preset);
  }, [preset, startDate, endDate]);

  const loadData = useCallback(
    async (silent = false) => {
      if (!activeRange.start || !activeRange.end) return;
      if (new Date(activeRange.end) < new Date(activeRange.start)) {
        tToast.error("WhatsAppConversationAnalytics.msg_6297");
        return;
      }
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const res = await apiClient.get(
          "/whatsapp-inbox/conversation-analytics",
          withCompanyConfig({
            params: { startDate: activeRange.start, endDate: activeRange.end },
          })
        );
        setData(res.data as AnalyticsResponse);
      } catch {
        tToast.error("WhatsAppConversationAnalytics.failed_load_eab0");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeRange.start, activeRange.end, withCompanyConfig]
  );

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRange.start, activeRange.end]);

  const handlePresetChange = useCallback((p: DatePreset) => {
    setPreset(p);
    if (p !== "custom") {
      const r = getPresetRange(p);
      setStartDate(r.start);
      setEndDate(r.end);
    }
  }, []);

  const summary = data?.summary;
  const statusDist = data?.statusDistribution || {};
  const hourlyDist = data?.hourlyDistribution || [];
  const dailyDist = data?.dailyDistribution || [];
  const tagDist = data?.tagDistribution || [];
  const recentConvs = data?.recentConversations || [];
  const userMap = data?.userMap || {};

  const totalStatusCount = useMemo(
    () => Object.values(statusDist).reduce((s, v) => s + v, 0) || 1,
    [statusDist]
  );

  const hourlyChartData = useMemo(
    () =>
      hourlyDist.map((count, hour) => ({
        hour: `${hour}:00`,
        رسائل: count,
      })),
    [hourlyDist]
  );

  const statusChartData = useMemo(
    () =>
      Object.entries(statusDist)
        .sort(([, a], [, b]) => b - a)
        .map(([status, count]) => ({
          name: STATUS_LABELS[status] || status,
          count,
          pct: ((count / totalStatusCount) * 100).toFixed(1),
        })),
    [statusDist, totalStatusCount]
  );

  const formatTime = useCallback((dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("ar-EG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  return {
    data,
    loading,
    refreshing,
    preset,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handlePresetChange,
    loadData,
    summary,
    statusDist,
    hourlyDist,
    dailyDist,
    tagDist,
    recentConvs,
    userMap,
    hourlyChartData,
    statusChartData,
    formatTime,
  };
};

export type WhatsAppConversationAnalyticsController = ReturnType<
  typeof useWhatsAppConversationAnalyticsController
>;
