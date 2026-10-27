import React from "react";
import { useTranslation } from "react-i18next";
import {
  Activity as ChartBarIcon,
  Circle as DocumentChartBarIcon,
  Eye as EyeIcon,
} from "lucide-react";
import { ReportData } from "./types";

interface AvailableReportsGridProps {
  reports: ReportData[];
  selectedReportId?: string;
  onSelectReport: (report: ReportData) => void;
}

export const AvailableReportsGrid: React.FC<AvailableReportsGridProps> = ({
  reports,
  selectedReportId,
  onSelectReport,
}) => {
  const { t } = useTranslation();

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "sales":
        return (
          <ChartBarIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
        );
      case "customers":
        return (
          <DocumentChartBarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        );
      case "conversations":
        return (
          <ChartBarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        );
      case "products":
        return (
          <DocumentChartBarIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        );
      case "performance":
        return (
          <ChartBarIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        );
      case "moderators":
        return <EyeIcon className="h-5 w-5 text-pink-600 dark:text-pink-400" />;
      default:
        return (
          <DocumentChartBarIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        );
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case "sales":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "customers":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case "conversations":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300";
      case "products":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300";
      case "performance":
        return "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300";
      case "moderators":
        return "bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "daily":
        return t("reports.periods.daily", "يومي");
      case "weekly":
        return t("reports.periods.weekly", "أسبوعي");
      case "monthly":
        return t("reports.periods.monthly", "شهري");
      default:
        return t("reports.periods.custom", "مخصص");
    }
  };

  return (
    <div className="bg-white shadow rounded-lg dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-5 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {t("reports.availableReports", "التقارير المتاحة")}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("reports.availableReportsHint", "اختر تقريراً لعرض تفاصيله وإحصائياته الكاملة")}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 2xl:grid-cols-3">
        {reports.map((report) => {
          const isSelected = selectedReportId === report.id;

          return (
            <button
              key={report.id}
              type="button"
              onClick={() => onSelectReport(report)}
              className={`rounded-2xl border p-4 text-right transition-all active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                isSelected
                  ? "border-indigo-500 bg-indigo-50 shadow-sm ring-2 ring-indigo-100 dark:border-indigo-400 dark:bg-indigo-900/20 dark:ring-indigo-900/40"
                  : "border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/60 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-500/50 dark:hover:bg-gray-700/70"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0 rounded-xl bg-gray-50 p-2 dark:bg-gray-700/70">
                  {getReportTypeIcon(report.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {report.name}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getReportTypeColor(report.type)}`}
                    >
                      {getPeriodLabel(report.period)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                    {report.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
