import React from "react";
import { useTranslation } from "react-i18next";
import DataTable from "../../../../components/tables/DataTable";
import ExportButtons from "../../../../components/export/ExportButtons";
import { ExportColumn } from "../../../../utils/exportHelpers";

interface SentMessagesTablesTabProps {
  dailyTableData: any[];
  dailyTableColumns: ExportColumn[];
  pageTableData: any[];
  pageTableColumns: ExportColumn[];
}

export const SentMessagesTablesTab: React.FC<SentMessagesTablesTabProps> = ({
  dailyTableData,
  dailyTableColumns,
  pageTableData,
  pageTableColumns,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Daily Stats Table */}
      <div className="business-bg-panel rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold business-text-strong">
            {t("sentMessagesStats.dailyStats")}
          </h3>
          <ExportButtons
            data={dailyTableData}
            columns={dailyTableColumns}
            filename="daily-stats"
            title={t("sentMessagesStats.dailyStats")}
          />
        </div>
        <DataTable
          data={dailyTableData}
          columns={[
            { key: "date", label: t("sentMessagesStats.date"), sortable: true },
            {
              key: "total",
              label: t("sentMessagesStats.totalAttempts"),
              sortable: true,
            },
            {
              key: "savedReach",
              label: t("sentMessagesStats.reachedConversations"),
              sortable: true,
            },
            {
              key: "ignoredReach",
              label: t("sentMessagesStats.ignoredConversationsShort"),
              sortable: true,
            },
            {
              key: "conversationsCreated",
              label: t("sentMessagesStats.new"),
              sortable: true,
            },
            {
              key: "conversationsExisted",
              label: t("sentMessagesStats.existing"),
              sortable: true,
            },
            { key: "revenue", label: t("sentMessagesStats.revenue"), sortable: true },
          ]}
          pageSize={10}
        />
      </div>

      {/* Page Stats Table */}
      <div className="business-bg-panel rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold business-text-strong">
            {t("sentMessagesStats.statsByPage")}
          </h3>
          <ExportButtons
            data={pageTableData}
            columns={pageTableColumns}
            filename="page-stats"
            title={t("sentMessagesStats.statsByPage")}
          />
        </div>
        <DataTable
          data={pageTableData}
          columns={[
            { key: "pageName", label: t("sentMessagesStats.pageName"), sortable: true },
            { key: "count", label: t("sentMessagesStats.messageCount"), sortable: true },
            {
              key: "percentage",
              label: t("sentMessagesStats.percentage"),
              sortable: true,
            },
          ]}
          pageSize={10}
        />
      </div>
    </div>
  );
};
