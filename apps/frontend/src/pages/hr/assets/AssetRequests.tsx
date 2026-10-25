import React from "react";
import {
  useAssetRequestsController,
  AssetRequestsTableAndFilters,
  AssetRequestsActionModals,
} from "./requests-list";

const AssetRequests: React.FC = () => {
  const {
    isLoading,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    showApproveModal,
    setShowApproveModal,
    showRejectModal,
    setShowRejectModal,
    showFulfillModal,
    setShowFulfillModal,
    selectedRequest,
    setSelectedRequest,
    rejectionReason,
    setRejectionReason,
    approvalNotes,
    setApprovalNotes,
    selectedAssetId,
    setSelectedAssetId,
    filteredRequests,
    handleApprove,
    handleReject,
    handleFulfill,
  } = useAssetRequestsController();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AssetRequestsTableAndFilters
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        filteredRequests={filteredRequests}
        onApproveClick={(request) => {
          setSelectedRequest(request);
          setShowApproveModal(true);
        }}
        onRejectClick={(request) => {
          setSelectedRequest(request);
          setShowRejectModal(true);
        }}
        onFulfillClick={(request) => {
          setSelectedRequest(request);
          setShowFulfillModal(true);
        }}
      />

      <AssetRequestsActionModals
        selectedRequest={selectedRequest}
        showApproveModal={showApproveModal}
        onCloseApprove={() => {
          setShowApproveModal(false);
          setApprovalNotes("");
          setSelectedRequest(null);
        }}
        approvalNotes={approvalNotes}
        onApprovalNotesChange={setApprovalNotes}
        onConfirmApprove={handleApprove}
        showRejectModal={showRejectModal}
        onCloseReject={() => {
          setShowRejectModal(false);
          setRejectionReason("");
          setSelectedRequest(null);
        }}
        rejectionReason={rejectionReason}
        onRejectionReasonChange={setRejectionReason}
        onConfirmReject={handleReject}
        showFulfillModal={showFulfillModal}
        onCloseFulfill={() => {
          setShowFulfillModal(false);
          setSelectedAssetId("");
          setSelectedRequest(null);
        }}
        selectedAssetId={selectedAssetId}
        onSelectedAssetIdChange={setSelectedAssetId}
        onConfirmFulfill={handleFulfill}
      />
    </div>
  );
};

export default AssetRequests;
