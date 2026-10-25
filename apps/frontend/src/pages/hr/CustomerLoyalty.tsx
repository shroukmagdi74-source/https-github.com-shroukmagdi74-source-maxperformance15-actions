import React from "react";
import {
  useCustomerLoyaltyController,
  CustomerLoyaltyHeader,
  CustomerLoyaltyStats,
  CustomerLoyaltyTabsBar,
  LoyaltyProgramsTab,
  LoyaltyCustomersTab,
  LoyaltyTiersTab,
  LoyaltyAnalyticsTab,
  LoyaltyCashbackTab,
} from "./customer-loyalty/index";

export const CustomerLoyalty: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    programs,
    customers,
    rawCustomersCount,
    tiers,
    isLoading,
    searchQuery,
    setSearchQuery,
    setShowCreateForm,
    cashbackSettings,
    cashbackDraft,
    isSavingCashback,
    walletStats,
    fetchLoyaltyData,
    saveCashbackSettings,
    updateCashbackField,
    updateTierOverride,
  } = useCustomerLoyaltyController();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <CustomerLoyaltyHeader
        onRefresh={fetchLoyaltyData}
        onCreateProgram={() => setShowCreateForm(true)}
      />

      {/* KPI Stats Grid */}
      <CustomerLoyaltyStats
        programs={programs}
        customers={customers}
        tiers={tiers}
      />

      {/* Unified Tabs Container */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <CustomerLoyaltyTabsBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="p-6">
          {activeTab === "programs" && (
            <LoyaltyProgramsTab
              programs={programs}
              onCreateProgram={() => setShowCreateForm(true)}
            />
          )}

          {activeTab === "customers" && (
            <LoyaltyCustomersTab
              customers={customers}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              rawCustomersCount={rawCustomersCount}
            />
          )}

          {activeTab === "tiers" && <LoyaltyTiersTab tiers={tiers} />}

          {activeTab === "analytics" && (
            <LoyaltyAnalyticsTab
              programs={programs}
              walletStats={walletStats}
            />
          )}

          {activeTab === "cashback" && (
            <LoyaltyCashbackTab
              cashbackSettings={cashbackSettings}
              cashbackDraft={cashbackDraft}
              tiers={tiers}
              isSaving={isSavingCashback}
              onSave={saveCashbackSettings}
              onUpdateField={updateCashbackField}
              onUpdateTierOverride={updateTierOverride}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerLoyalty;
