import React from "react";
import { Clock, History, Download, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  usePermissionsController,
  PermissionStatsCards,
  PermissionFilters,
  PermissionTable,
  AddPermissionDialog,
  PermissionDetailsDialog,
  PermissionRejectDialog,
  PermissionDeleteDialog,
} from "./permissions/index";

export const Permissions: React.FC = () => {
  const { t } = useTranslation();
  const {
    isMyPermissions,
    loading,
    requests,
    employees,
    stats,
    pagination,
    setPagination,
    typeFilter,
    setTypeFilter,
    activeTab,
    setActiveTab,
    showAddDialog,
    setShowAddDialog,
    showDetailsDialog,
    setShowDetailsDialog,
    showRejectDialog,
    setShowRejectDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    selectedRequest,
    setSelectedRequest,
    rejectionReason,
    setRejectionReason,
    submitting,
    formData,
    setFormData,
    resetForm,
    handleCreate,
    handleApprove,
    handleReject,
    handleDelete,
    confirmDelete,
  } = usePermissionsController();

  const pendingCount = stats?.pendingCount || 0;

  return (
    <div
      className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 shrink-0">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white truncate sm:overflow-visible">
              {t("employee.permissions.title")}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 flex items-center gap-1.5 text-xs sm:text-sm">
              <History className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span>
                {t("employee.permissions.totalRecords", {
                  count: pagination.total,
                })}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            className="flex-1 sm:flex-initial bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5" />
            {t("employee.permissions.export")}
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setShowAddDialog(true);
            }}
            className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-none text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5" />
            {t("employee.permissions.newPermission")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <PermissionStatsCards stats={stats} />

      {/* Main Content: Filters and Table */}
      <Card className="border-none shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
        <CardContent className="p-0">
          <PermissionFilters
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            pendingCount={pendingCount}
          />
          <PermissionTable
            loading={loading}
            requests={requests}
            isMyPermissions={isMyPermissions}
            pagination={pagination}
            setPagination={setPagination}
            onApprove={handleApprove}
            onRejectClick={(request) => {
              setSelectedRequest(request);
              setShowRejectDialog(true);
            }}
            onDetailsClick={(request) => {
              setSelectedRequest(request);
              setShowDetailsDialog(true);
            }}
            onDeleteClick={handleDelete}
            onOpenAddDialog={() => {
              resetForm();
              setShowAddDialog(true);
            }}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddPermissionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        formData={formData}
        setFormData={setFormData}
        employees={employees}
        isMyPermissions={isMyPermissions}
        submitting={submitting}
        onSubmit={handleCreate}
        onCancel={() => setShowAddDialog(false)}
      />

      <PermissionDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        selectedRequest={selectedRequest}
        isMyPermissions={isMyPermissions}
        onApprove={handleApprove}
        onRejectClick={(request) => {
          setSelectedRequest(request);
          setShowRejectDialog(true);
        }}
      />

      <PermissionRejectDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        onConfirmReject={handleReject}
      />

      <PermissionDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        submitting={submitting}
        onConfirmDelete={confirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setSelectedRequest(null);
        }}
      />
    </div>
  );
};

export default Permissions;
