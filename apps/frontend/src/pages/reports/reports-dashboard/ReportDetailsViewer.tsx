import React from "react";
import { useTranslation } from "react-i18next";
import { Download as ArrowDownTrayIcon } from "lucide-react";
import { useDateFormat } from "../../../hooks/useDateFormat";
import { useCurrency } from "../../../hooks/useCurrency";
import { ReportData } from "./types";

interface ReportDetailsViewerProps {
  selectedReport: ReportData | null;
}

export const ReportDetailsViewer: React.FC<ReportDetailsViewerProps> = ({
  selectedReport,
}) => {
  const { t } = useTranslation();
  const { formatDate } = useDateFormat();
  const { formatPrice } = useCurrency();

  if (!selectedReport) return null;

  const renderReportData = (report: ReportData) => {
    switch (report.type) {
      case "sales":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    المبيعات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    الطلبات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    متوسط الطلب
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {report.data.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white tabular-nums">
                      {formatDate(row.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400 tabular-nums">
                      {formatPrice(row.sales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white tabular-nums">
                      {row.orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white tabular-nums">
                      {formatPrice(row.avgOrder)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "customers":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {report.data.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700/60"
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {item.week}
                </h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      عملاء جدد:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white tabular-nums">
                      {item.newCustomers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      تحويلات:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white tabular-nums">
                      {item.conversions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      معدل التحويل:
                    </span>
                    <span className="font-medium text-green-600 dark:text-green-400 tabular-nums">
                      {item.rate}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "moderators":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    الموظف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    الرسائل المرسلة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    المحادثات المكتملة
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {report.data.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {row.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-bold tabular-nums">
                      {row.messagesCount} رسالة
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white tabular-nums">
                      {row.conversationsCount} محادثة
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t("reports.noDataAvailable", "لا توجد بيانات متاحة لهذا التقرير")}
          </div>
        );
    }
  };

  return (
    <div className="bg-white shadow rounded-lg dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">
              {t("reports.selectedReport", "التقرير المحدد")}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
              {selectedReport.name}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {t(
                "reports.selectedReportHint",
                "تفاصيل وسجلات التقرير للفترة الزمنية المحددة",
              )}
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 tabular-nums">
              آخر تحديث: {formatDate(selectedReport.lastUpdated)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              disabled
              title={t("reports.exportSoonHint", "التصدير متاح قريباً")}
              className="inline-flex items-center rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium leading-4 text-gray-500 shadow-sm cursor-not-allowed dark:border-gray-600 dark:bg-gray-700/60 dark:text-gray-400"
            >
              <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
              {t("reports.exportPdfSoon", "تصدير PDF")}
            </button>
            <button
              disabled
              title={t("reports.exportSoonHint", "التصدير متاح قريباً")}
              className="inline-flex items-center rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium leading-4 text-gray-500 shadow-sm cursor-not-allowed dark:border-gray-600 dark:bg-gray-700/60 dark:text-gray-400"
            >
              <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
              {t("reports.exportExcelSoon", "تصدير Excel")}
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">{renderReportData(selectedReport)}</div>
    </div>
  );
};
