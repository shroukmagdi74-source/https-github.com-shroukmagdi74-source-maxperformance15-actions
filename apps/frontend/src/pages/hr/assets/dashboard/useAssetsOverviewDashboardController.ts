import { useState, useEffect } from "react";
import i18n from "../../../../i18n";
import { companyAwareApi } from "../../../../services/companyAwareApi";
import { AssetDashboardSectionId } from "./types";

export const useAssetsOverviewDashboardController = () => {
  const [activeSection, setActiveSection] =
    useState<AssetDashboardSectionId>("overview");
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loadingReport, setLoadingReport] = useState<string | null>(null);

  const handleRefresh = () => setRefreshTrigger((prev) => prev + 1);

  useEffect(() => {
    if (activeSection !== "manage" && showAddModal) {
      setShowAddModal(false);
    }
  }, [activeSection, showAddModal]);

  const handleDownloadReport = async (
    reportType: string,
    format: "excel" | "pdf",
  ) => {
    const reportKey = `${reportType}-${format}`;
    setLoadingReport(reportKey);

    try {
      const response = await companyAwareApi.get(
        `/hr/assets/reports/${reportType}`,
        {
          params: { format },
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type:
          format === "excel"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const extension = format === "excel" ? "xlsx" : "pdf";
      const fileName = `${reportType}_report_${new Date().toISOString().split("T")[0]}.${extension}`;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report:", error);
      alert(i18n.t("AssetsOverviewDashboard.error_error_3ff5"));
    } finally {
      setLoadingReport(null);
    }
  };

  return {
    activeSection,
    setActiveSection,
    showAddModal,
    setShowAddModal,
    refreshTrigger,
    handleRefresh,
    loadingReport,
    handleDownloadReport,
  };
};
