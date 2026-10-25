import React from "react";
import { WorkReportField, WorkReportRecordsResponse } from "../types";
import {
  formatArabicDate,
  formatArabicDateTime,
  formatMetricValue,
  truncateText,
} from "../utils";

interface WorkReportRecordsTablesSectionProps {
  payload: WorkReportRecordsResponse;
  visibleFields: WorkReportField[];
}

export const WorkReportRecordsTablesSection: React.FC<
  WorkReportRecordsTablesSectionProps
> = ({ payload, visibleFields }) => {
  return (
    <>
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">ملخص الموظفين</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            إجمالي كل موظف خلال الفترة المحددة مع متوسط المؤشرات.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-right text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="px-3 py-3 font-medium">الموظف</th>
                <th className="px-3 py-3 font-medium">عدد السجلات</th>
                {payload.analytics.metricCards.slice(0, 3).map((metric) => (
                  <th key={metric.key} className="px-3 py-3 font-medium">
                    {metric.label}
                  </th>
                ))}
                <th className="px-3 py-3 font-medium">آخر إرسال</th>
              </tr>
            </thead>
            <tbody>
              {payload.analytics.employeeBreakdown.map((row) => (
                <tr
                  key={row.userId}
                  className="border-b border-slate-100 dark:border-slate-900"
                >
                  <td className="px-3 py-3 font-medium">
                    {row.userDisplayName}
                  </td>
                  <td className="px-3 py-3 font-mono tabular-nums">
                    {row.submissionsCount}
                  </td>
                  {payload.analytics.metricCards.slice(0, 3).map((metric) => {
                    const snapshot = row.metrics.find(
                      (item) => item.key === metric.key,
                    );
                    const value =
                      metric.dataType === "PERCENT"
                        ? snapshot?.average
                        : snapshot?.total;
                    return (
                      <td
                        key={metric.key}
                        className="px-3 py-3 font-mono tabular-nums"
                      >
                        {formatMetricValue(value, metric.dataType)}
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    {formatArabicDateTime(row.lastSubmittedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">سجلات الفورم</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            عرض مباشر لكل إرسال مع أهم الحقول الظاهرة.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-right text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="px-3 py-3 font-medium">الموظف</th>
                <th className="px-3 py-3 font-medium">تاريخ التقرير</th>
                <th className="px-3 py-3 font-medium">وقت الحفظ</th>
                {visibleFields.slice(0, 6).map((field: WorkReportField) => (
                  <th key={field.key} className="px-3 py-3 font-medium">
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payload.records.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-slate-100 dark:border-slate-900"
                >
                  <td className="px-3 py-3 font-medium">
                    {record.userDisplayName}
                  </td>
                  <td className="px-3 py-3 font-mono tabular-nums">
                    {formatArabicDate(record.reportDate)}
                  </td>
                  <td className="px-3 py-3 text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    {formatArabicDateTime(record.submittedAt)}
                  </td>
                  {visibleFields.slice(0, 6).map((field) => {
                    const value = record.valuesByFieldKey[field.key];
                    return (
                      <td key={field.key} className="px-3 py-3">
                        {field.dataType === "LONG_TEXT"
                          ? truncateText(value?.displayValue, 72)
                          : value?.displayValue || "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
