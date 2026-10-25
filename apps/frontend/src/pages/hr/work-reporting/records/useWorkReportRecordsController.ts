import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { companyAwareApi } from "../../../../services/companyAwareApi";
import { tToast } from "../../../../utils/i18n-toast";
import { WorkReportRecordsResponse } from "../types";
import {
  formatArabicDate,
  formatArabicDateTime,
  getRelativeIsoDate,
  getTodayIsoDate,
} from "../utils";

export const useWorkReportRecordsController = () => {
  const { formId } = useParams<{ formId: string }>();
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(getRelativeIsoDate(-6));
  const [endDate, setEndDate] = useState(getTodayIsoDate());
  const [selectedUserId, setSelectedUserId] = useState("");
  const [payload, setPayload] = useState<WorkReportRecordsResponse | null>(
    null,
  );

  const fetchRecords = async () => {
    if (!formId) return;

    try {
      setLoading(true);
      const response = await companyAwareApi.get<{
        data: WorkReportRecordsResponse;
      }>(`/hr/reporting/forms/${formId}/records`, {
        params: {
          startDate,
          endDate,
          ...(selectedUserId ? { userId: selectedUserId } : {}),
        },
      });

      if (response.data?.data) {
        setPayload(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching work report records:", error);
      tToast.error("WorkReportRecordsPage.unable_load_ea41");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRecords();
  }, [formId, startDate, endDate, selectedUserId]);

  const visibleFields = useMemo(
    () => (payload?.form.fields || []).filter((field) => field.isVisible),
    [payload],
  );

  const primaryMetric = payload?.analytics.metricCards[0];
  const secondaryMetric = payload?.analytics.metricCards[1];

  const chartData = useMemo(() => {
    if (!payload) return [];

    return payload.analytics.dailyTrend.map((row) => ({
      date: row.date,
      submissions: row.submissions,
      ...(primaryMetric
        ? {
            [primaryMetric.key]: Number(row.metrics[primaryMetric.key] || 0),
          }
        : {}),
      ...(secondaryMetric
        ? {
            [secondaryMetric.key]: Number(
              row.metrics[secondaryMetric.key] || 0,
            ),
          }
        : {}),
    }));
  }, [payload, primaryMetric, secondaryMetric]);

  const employeeChartData = useMemo(() => {
    if (!payload || !primaryMetric) return [];

    return payload.analytics.employeeBreakdown.map((row) => {
      const primarySnapshot = row.metrics.find(
        (metric) => metric.key === primaryMetric.key,
      );
      return {
        name: row.userDisplayName,
        submissions: row.submissionsCount,
        metric: primarySnapshot?.total || 0,
      };
    });
  }, [payload, primaryMetric]);

  const exportCsv = () => {
    if (!payload) return;

    const columns = [
      "الموظف",
      "تاريخ التقرير",
      "وقت الحفظ",
      ...visibleFields.slice(0, 6).map((field) => field.label),
    ];

    const rows = payload.records.map((record) => [
      record.userDisplayName,
      formatArabicDate(record.reportDate),
      formatArabicDateTime(record.submittedAt),
      ...visibleFields
        .slice(0, 6)
        .map(
          (field) => record.valuesByFieldKey[field.key]?.displayValue || "—",
        ),
    ]);

    const csvContent =
      "\uFEFF" + [columns, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `work-report-records-${formId}-${startDate}-${endDate}.csv`;
    link.click();
  };

  return {
    loading,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedUserId,
    setSelectedUserId,
    payload,
    fetchRecords,
    visibleFields,
    primaryMetric,
    secondaryMetric,
    chartData,
    employeeChartData,
    exportCsv,
  };
};
