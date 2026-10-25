import React from "react";
import { ASSET_REPORT_CARDS } from "./helpers";

interface AssetsOverviewReportsGridProps {
  loadingReport: string | null;
  onDownloadReport: (reportType: string, format: "excel" | "pdf") => void;
}

export const AssetsOverviewReportsGrid: React.FC<
  AssetsOverviewReportsGridProps
> = ({ loadingReport, onDownloadReport }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ASSET_REPORT_CARDS.map((card) => {
          const CardIcon = card.icon;
          const excelKey = `${card.reportType}-excel`;
          const pdfKey = `${card.reportType}-pdf`;

          return (
            <div
              key={card.reportType}
              className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border ${card.borderClass} hover:shadow-xl transition-all`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 ${card.iconWrapperClass} rounded-xl`}>
                  <CardIcon className={`h-6 w-6 ${card.iconClass}`} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {card.title}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {card.description}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onDownloadReport(card.reportType, "excel")}
                  disabled={loadingReport === excelKey}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingReport === excelKey ? "جاري التحميل..." : "Excel"}
                </button>
                <button
                  onClick={() => onDownloadReport(card.reportType, "pdf")}
                  disabled={loadingReport === pdfKey}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingReport === pdfKey ? "جاري التحميل..." : "PDF"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
