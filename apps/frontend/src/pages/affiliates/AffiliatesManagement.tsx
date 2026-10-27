import React from "react";
import {
  AffiliatesHeader,
  AffiliatesStatsGrid,
  AffiliatesFiltersRow,
  AffiliatesTable,
  AffiliatePolicyModal,
  AffiliateReviewHistoryModal,
  useAffiliatesManagementData,
} from "./affiliates-management";

export const AffiliatesManagement: React.FC = () => {
  const {
    isDark,
    filteredAffiliates,
    stats,
    loading,
    searchTerm,
    filterStatus,
    editingCommission,
    newCommission,
    editingPolicyAffiliate,
    policyForm,
    savingPolicy,
    updatingDocumentAffiliateId,
    historyAffiliate,
    reviewHistory,
    documentHistory,
    loadingReviewHistory,
    setSearchTerm,
    setFilterStatus,
    setEditingCommission,
    setNewCommission,
    setEditingPolicyAffiliate,
    setPolicyForm,
    handleStatusUpdate,
    updateCommission,
    openPolicyEditor,
    updatePolicy,
    handleDocumentReviewUpdate,
    openReviewHistory,
    closeReviewHistory,
  } = useAffiliatesManagementData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div
      className={`p-3 sm:p-6 ${isDark ? "bg-gray-900" : "bg-gray-50"} min-h-screen`}
    >
      <div className="w-full">
        <AffiliatesHeader isDark={isDark} />

        <AffiliatesStatsGrid isDark={isDark} stats={stats} />

        <AffiliatesFiltersRow
          isDark={isDark}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />

        <AffiliatesTable
          isDark={isDark}
          filteredAffiliates={filteredAffiliates}
          editingCommission={editingCommission}
          newCommission={newCommission}
          updatingDocumentAffiliateId={updatingDocumentAffiliateId}
          setEditingCommission={setEditingCommission}
          setNewCommission={setNewCommission}
          updateCommission={updateCommission}
          handleStatusUpdate={handleStatusUpdate}
          openPolicyEditor={openPolicyEditor}
          openReviewHistory={openReviewHistory}
          handleDocumentReviewUpdate={handleDocumentReviewUpdate}
        />
      </div>

      <AffiliatePolicyModal
        isDark={isDark}
        affiliate={editingPolicyAffiliate}
        policyForm={policyForm}
        setPolicyForm={setPolicyForm}
        savingPolicy={savingPolicy}
        onClose={() => setEditingPolicyAffiliate(null)}
        onSave={updatePolicy}
      />

      <AffiliateReviewHistoryModal
        isDark={isDark}
        affiliate={historyAffiliate}
        loadingReviewHistory={loadingReviewHistory}
        reviewHistory={reviewHistory}
        documentHistory={documentHistory}
        onClose={closeReviewHistory}
      />
    </div>
  );
};

export default AffiliatesManagement;
