import React from "react";
import {
  useCommissionsManagement,
  CommissionsHeader,
  CommissionsStatsCards,
  CommissionsFiltersBar,
  PayoutRequestsTable,
  CommissionsListTable,
} from "./commissions-management";

export const CommissionsManagement: React.FC = () => {
  const {
    formatPrice,
    isDark,
    commissions,
    payouts,
    stats,
    loading,
    processingPayoutId,
    proofInputRef,
    filters,
    setFilters,
    pendingPayouts,
    pendingPayoutAmount,
    updateCommissionStatus,
    recordExternalPayout,
    cancelPayoutRequest,
    openProofUploadDialog,
    uploadPayoutProof,
  } = useCommissionsManagement();

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"} p-6`}
    >
      <input
        ref={proofInputRef}
        type="file"
        accept="image/*,.pdf,application/pdf"
        className="hidden"
        onChange={uploadPayoutProof}
      />
      <div className="w-full">
        <CommissionsHeader isDark={isDark} />

        <CommissionsStatsCards
          stats={stats}
          pendingPayoutsCount={pendingPayouts.length}
          pendingPayoutAmount={pendingPayoutAmount}
          formatPrice={formatPrice}
          isDark={isDark}
        />

        <CommissionsFiltersBar
          filters={filters}
          setFilters={setFilters}
          isDark={isDark}
        />

        <PayoutRequestsTable
          payouts={payouts}
          processingPayoutId={processingPayoutId}
          formatPrice={formatPrice}
          isDark={isDark}
          onRecordExternalPayout={recordExternalPayout}
          onCancelPayoutRequest={cancelPayoutRequest}
          onOpenProofUploadDialog={openProofUploadDialog}
        />

        <CommissionsListTable
          commissions={commissions}
          formatPrice={formatPrice}
          isDark={isDark}
          onUpdateCommissionStatus={updateCommissionStatus}
        />
      </div>
    </div>
  );
};

export default CommissionsManagement;
