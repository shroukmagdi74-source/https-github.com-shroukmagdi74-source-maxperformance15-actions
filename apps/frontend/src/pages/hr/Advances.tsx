import React from "react";
import { useNavigate } from "react-router-dom";
import {
  useAdvancesController,
  AdvancesHeader,
  AdvancesStatsGrid,
  AdvancesFiltersCard,
  AdvancesTable,
  AdvanceRejectDialog,
  AdvanceDetailsDialog,
  AdvanceUpdateStatusDialog,
} from "./advances/index";

export const Advances: React.FC = () => {
  const navigate = useNavigate();
  const {
    loading,
    requests,
    rawTotalCount,
    pagination,
    handlePageChange,
    statusFilter,
    setStatusFilter,
    payStatusFilter,
    setPayStatusFilter,
    searchTerm,
    setSearchTerm,
    selectedRequest,
    isRejectDialogOpen,
    setIsRejectDialogOpen,
    rejectionReason,
    setRejectionReason,
    isDetailsOpen,
    setIsDetailsOpen,
    isUpdateStatusDialogOpen,
    setIsUpdateStatusDialogOpen,
    handleApprove,
    confirmReject,
    openRejectDialog,
    openDetailsDialog,
    openUpdateStatusDialog,
    handleUpdateStatus,
    handleDelete,
    markAsPaid,
    stats,
  } = useAdvancesController();

  return (
    <div
      className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-[#f9fbff] via-[#f2f6ff] to-[#fff7fc] text-slate-900 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-white"
      dir="rtl"
    >
      {/* Header */}
      <AdvancesHeader onCreateNew={() => navigate("/hr/advances/new")} />

      {/* Summary Stats Cards */}
      <AdvancesStatsGrid stats={stats} />

      {/* Filters & Search Card */}
      <AdvancesFiltersCard
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        payStatusFilter={payStatusFilter}
        onPayStatusFilterChange={setPayStatusFilter}
      />

      {/* Main Advances Table */}
      <AdvancesTable
        loading={loading}
        requests={requests}
        rawTotalCount={rawTotalCount}
        pagination={pagination}
        onPageChange={handlePageChange}
        onApprove={handleApprove}
        onOpenReject={openRejectDialog}
        onOpenDetails={openDetailsDialog}
        onOpenUpdateStatus={openUpdateStatusDialog}
        onDelete={handleDelete}
        onMarkAsPaid={markAsPaid}
      />

      {/* Reject Reason Dialog */}
      <AdvanceRejectDialog
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        rejectionReason={rejectionReason}
        onReasonChange={setRejectionReason}
        onConfirmReject={confirmReject}
      />

      {/* Details & Installments Schedule Dialog */}
      <AdvanceDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        request={selectedRequest}
      />

      {/* Update Status Dialog */}
      <AdvanceUpdateStatusDialog
        open={isUpdateStatusDialogOpen}
        onOpenChange={setIsUpdateStatusDialogOpen}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default Advances;
