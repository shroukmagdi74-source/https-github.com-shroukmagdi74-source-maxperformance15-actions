import React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  useSuperAdminUsersController,
  SuperAdminUsersHeader,
  SuperAdminUsersTelemetry,
  SuperAdminUsersFilterBar,
  SuperAdminUsersTable,
  SuperAdminUserFormModal,
  SuperAdminUserDetailsModal,
  SuperAdminUserDeleteDialog,
} from "./super-admin-users";

const SuperAdminUsersManagement: React.FC = () => {
  const {
    users,
    availableRoles,
    loading,
    rolesLoading,
    error,
    page,
    setPage,
    limit,
    totalPages,
    totalCount,
    filters,
    setFilters,
    searchInput,
    setSearchInput,
    editorMode,
    editingUser,
    detailsUser,
    setDetailsUser,
    pendingDeleteUser,
    setPendingDeleteUser,
    submitting,
    deleteLoading,
    formData,
    formErrors,
    filterCount,
    visibleFrom,
    visibleTo,
    userStats,
    fetchUsers,
    updateForm,
    openCreateDialog,
    openEditDialog,
    closeEditor,
    applySearch,
    clearFilters,
    handleSubmit,
    handleDelete,
  } = useSuperAdminUsersController();

  return (
    <div className="w-full space-y-4" dir="rtl">
      {/* Linear Top Header */}
      <SuperAdminUsersHeader
        totalCount={totalCount}
        page={page}
        totalPages={totalPages}
        loading={loading}
        onRefresh={() => void fetchUsers()}
        onCreateUser={openCreateDialog}
      />

      {error ? (
        <Alert variant="destructive" className="py-2.5">
          <AlertTriangle className="size-4" />
          <AlertTitle className="text-xs font-bold">تعذر تحميل البيانات</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      ) : null}

      {/* Telemetry Strip */}
      <SuperAdminUsersTelemetry
        totalCount={totalCount}
        activeCount={userStats.active}
        superAdminsCount={userStats.superAdmins}
        limit={limit}
      />

      {/* Table Chassis Container */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        {/* Filter Toolbar */}
        <SuperAdminUsersFilterBar
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          onSearch={applySearch}
          filters={filters}
          onStatusChange={(status) => {
            setPage(1);
            setFilters((current) => ({
              ...current,
              isActive: status,
            }));
          }}
          filterCount={filterCount}
          onClearFilters={clearFilters}
        />

        {/* Table & Mobile Cards */}
        <div className="p-3 sm:p-4">
          <SuperAdminUsersTable
            users={users}
            loading={loading}
            totalCount={totalCount}
            page={page}
            totalPages={totalPages}
            limit={limit}
            visibleFrom={visibleFrom}
            visibleTo={visibleTo}
            onPageChange={setPage}
            onViewDetails={setDetailsUser}
            onEdit={openEditDialog}
            onDelete={setPendingDeleteUser}
          />
        </div>
      </div>

      {/* Create / Edit User Modal */}
      <SuperAdminUserFormModal
        open={editorMode !== null}
        editorMode={editorMode}
        formData={formData}
        formErrors={formErrors}
        availableRoles={availableRoles}
        rolesLoading={rolesLoading}
        submitting={submitting}
        onClose={closeEditor}
        onUpdateForm={updateForm}
        onSubmit={() => void handleSubmit()}
      />

      {/* User Details Modal */}
      <SuperAdminUserDetailsModal
        user={detailsUser}
        onClose={() => setDetailsUser(null)}
      />

      {/* Delete User Confirmation Alert */}
      <SuperAdminUserDeleteDialog
        user={pendingDeleteUser}
        deleting={deleteLoading}
        onClose={() => setPendingDeleteUser(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
};

export default SuperAdminUsersManagement;
