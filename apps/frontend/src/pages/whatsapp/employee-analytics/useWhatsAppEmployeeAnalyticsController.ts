import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient, type ApiRequestConfig } from "../../../services/apiClient";
import { tToast } from "../../../utils/i18n-toast";
import {
  AnalyticsResponse,
  AnalyticsSummary,
  DatePreset,
  DeltaMetrics,
  EmployeeChartItem,
  EmployeeStat,
  getPresetRange,
  SparkMetrics,
} from "./types";

export interface UseWhatsAppEmployeeAnalyticsControllerOptions {
  companyId?: string;
}

export function useWhatsAppEmployeeAnalyticsController({
  companyId,
}: UseWhatsAppEmployeeAnalyticsControllerOptions = {}) {
  const withCompanyConfig = useCallback(
    (config: ApiRequestConfig = {}) =>
      companyId ? { ...config, _companyId: companyId } : config,
    [companyId],
  );

  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [prevData, setPrevData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [preset, setPreset] = useState<DatePreset>("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const activeRange = useMemo(() => {
    if (preset === "custom") return { start: startDate, end: endDate };
    return getPresetRange(preset);
  }, [preset, startDate, endDate]);

  const prevRange = useMemo(() => {
    const s = new Date(activeRange.start);
    const e = new Date(activeRange.end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
    const diffMs = e.getTime() - s.getTime();
    const oneDay = 86400000;
    const prevEnd = new Date(s.getTime() - oneDay);
    const prevStart = new Date(prevEnd.getTime() - diffMs);
    return {
      start: prevStart.toISOString().substring(0, 10),
      end: prevEnd.toISOString().substring(0, 10),
    };
  }, [activeRange.start, activeRange.end]);

  const loadData = useCallback(
    async (silent = false) => {
      if (!activeRange.start || !activeRange.end) return;
      if (new Date(activeRange.end) < new Date(activeRange.start)) {
        tToast.error("WhatsAppEmployeeAnalytics.msg_2f97");
        return;
      }
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const params: Record<string, string> = {
          startDate: activeRange.start,
          endDate: activeRange.end,
        };
        const [currRes, prevRes] = await Promise.all([
          apiClient.get(
            "/whatsapp-inbox/employee-analytics",
            withCompanyConfig({ params }),
          ),
          prevRange
            ? apiClient.get(
                "/whatsapp-inbox/employee-analytics",
                withCompanyConfig({
                  params: {
                    startDate: prevRange.start,
                    endDate: prevRange.end,
                  },
                }),
              )
            : Promise.resolve(null),
        ]);
        setData(currRes.data as AnalyticsResponse);
        setPrevData(prevRes ? (prevRes as unknown as AnalyticsResponse) : null);
      } catch {
        tToast.error("WhatsAppEmployeeAnalytics.failed_load_61c5");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeRange.start, activeRange.end, prevRange, withCompanyConfig],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary: AnalyticsSummary | undefined = data?.summary;
  const employees: EmployeeStat[] = useMemo(() => data?.employees || [], [data?.employees]);
  const prevSummary: AnalyticsSummary | undefined = prevData?.summary;

  const computeDelta = (
    curr: number | null | undefined,
    prev: number | null | undefined,
  ): number | null => {
    if (curr == null || prev == null || prev === 0) return null;
    return ((curr - prev) / Math.abs(prev)) * 100;
  };

  const deltas: DeltaMetrics | null = useMemo(() => {
    if (!summary || !prevSummary) return null;
    return {
      incoming: computeDelta(
        summary.totalIncomingConversations,
        prevSummary.totalIncomingConversations,
      ),
      replied: computeDelta(
        summary.totalReplied,
        prevSummary.totalReplied,
      ),
      unreplied: computeDelta(
        summary.totalUnreplied,
        prevSummary.totalUnreplied,
      ),
      outgoing: computeDelta(
        summary.totalOutgoingMessages,
        prevSummary.totalOutgoingMessages,
      ),
    };
  }, [summary, prevSummary]);

  const sparkData: SparkMetrics | null = useMemo(() => {
    if (!summary || !prevSummary) return null;
    return {
      incoming: [
        prevSummary.totalIncomingConversations,
        summary.totalIncomingConversations,
      ],
      replied: [prevSummary.totalReplied, summary.totalReplied],
      unreplied: [prevSummary.totalUnreplied, summary.totalUnreplied],
      outgoing: [
        prevSummary.totalOutgoingMessages,
        summary.totalOutgoingMessages,
      ],
    };
  }, [summary, prevSummary]);

  const sortedEmployees = useMemo(
    () =>
      [...employees].sort(
        (a, b) => b.assignedConversations - a.assignedConversations,
      ),
    [employees],
  );

  const topActive = useMemo(
    () =>
      [...employees]
        .sort((a, b) => b.outgoingMessages - a.outgoingMessages)
        .slice(0, 5),
    [employees],
  );

  const leastActive = useMemo(
    () =>
      [...employees]
        .sort((a, b) => a.outgoingMessages - b.outgoingMessages)
        .slice(0, 5),
    [employees],
  );

  const maxMessages = topActive[0]?.outgoingMessages || 1;
  const avgAssignedConv = useMemo(
    () =>
      employees.reduce((s, e) => s + e.assignedConversations, 0) /
      Math.max(1, employees.length),
    [employees],
  );

  const chartData: EmployeeChartItem[] = useMemo(
    () =>
      employees
        .slice()
        .sort((a, b) => b.outgoingMessages - a.outgoingMessages)
        .slice(0, 10)
        .map((e) => ({
          name: e.userName?.split(" ")[0] || "?",
          صادرة: e.outgoingMessages,
          واردة: e.incomingMessages,
          محادثات: e.assignedConversations,
        })),
    [employees],
  );

  const handleSelectPreset = useCallback((p: DatePreset) => {
    setPreset(p);
    if (p !== "custom") {
      const r = getPresetRange(p);
      setStartDate(r.start);
      setEndDate(r.end);
    }
  }, []);

  return {
    data,
    prevData,
    loading,
    refreshing,
    preset,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleSelectPreset,
    loadData,
    summary,
    employees,
    deltas,
    sparkData,
    sortedEmployees,
    topActive,
    leastActive,
    maxMessages,
    avgAssignedConv,
    chartData,
  };
}
