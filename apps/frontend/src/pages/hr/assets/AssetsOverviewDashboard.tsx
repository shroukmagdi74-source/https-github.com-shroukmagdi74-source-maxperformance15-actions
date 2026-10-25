import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon } from "@heroicons/react/24/outline";

import OverviewSection from "./sections/OverviewSection";
import WhyAssetsSection from "./sections/WhyAssetsSection";
import BenefitsSection from "./sections/BenefitsSection";
import HowItWorksSection from "./sections/HowItWorksSection";
import KPIsSection from "./sections/KPIsSection";
import ComplianceSection from "./sections/ComplianceSection";
import DocumentsSection from "./sections/DocumentsSection";
import ReceiptFormSection from "./sections/ReceiptFormSection";
import AssetRequestsSection from "./sections/AssetRequestsSection";
import AssetMaintenanceSection from "./sections/AssetMaintenanceSection";
import AssetList from "./AssetList";
import AssetCategories from "./AssetCategories";
import AssetSuppliers from "./AssetSuppliers";
import CustodyHistory from "./CustodyHistory";
import AssetForm from "./AssetForm";

import {
  useAssetsOverviewDashboardController,
  AssetsOverviewSidebar,
  AssetsOverviewTopHeader,
  AssetsOverviewReportsGrid,
} from "./dashboard";

const AssetsOverviewDashboard: React.FC = () => {
  const {
    activeSection,
    setActiveSection,
    showAddModal,
    setShowAddModal,
    refreshTrigger,
    handleRefresh,
    loadingReport,
    handleDownloadReport,
  } = useAssetsOverviewDashboardController();

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection />;
      case "manage":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                سجل الأصول
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <PlusIcon className="h-5 w-5" />
                إضافة أصل جديد
              </button>
            </div>

            {showAddModal && (
              <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-700 rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    نموذج إضافة أصل
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                  >
                    إغلاق
                  </button>
                </div>
                <AssetForm
                  usePortal={false}
                  onClose={() => setShowAddModal(false)}
                  onSuccess={() => {
                    setShowAddModal(false);
                    handleRefresh();
                  }}
                />
              </div>
            )}

            <AssetList refreshTrigger={refreshTrigger} />
          </div>
        );
      case "categories":
        return <AssetCategories />;
      case "suppliers":
        return <AssetSuppliers />;
      case "custody":
        return <CustodyHistory />;
      case "documents":
        return <DocumentsSection />;
      case "receipts":
        return <ReceiptFormSection />;
      case "requests":
        return <AssetRequestsSection />;
      case "maintenance":
        return <AssetMaintenanceSection />;
      case "reports":
        return (
          <AssetsOverviewReportsGrid
            loadingReport={loadingReport}
            onDownloadReport={handleDownloadReport}
          />
        );
      case "why":
        return <WhyAssetsSection />;
      case "benefits":
        return <BenefitsSection />;
      case "how":
        return <HowItWorksSection />;
      case "kpis":
        return <KPIsSection />;
      case "compliance":
        return <ComplianceSection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/30 via-purple-50/20 to-fuchsia-50/20 dark:bg-gradient-to-br dark:from-[#1a1040] dark:via-[#1e1248] dark:to-[#231250] flex">
      {/* Sidebar Navigation */}
      <AssetsOverviewSidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-violet-200/30 dark:bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-80 h-80 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-fuchsia-200/20 dark:bg-fuchsia-500/5 rounded-full blur-3xl" />
        </div>

        {/* Top Header */}
        <AssetsOverviewTopHeader
          activeSection={activeSection}
          onSelectSection={setActiveSection}
        />

        {/* Content with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="p-6 relative z-10"
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AssetsOverviewDashboard;
