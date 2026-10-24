import React, { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmployeeInviteModal } from "@/components/hr/EmployeeInviteModal";
import {
  useUsersManagementController,
  UsersManagementHeader,
  UsersMetricsCards,
  UsersTabsHeader,
  UsersBulkActionBar,
  UsersFilterToolbar,
  UsersTable,
  UsersInvitationsTable,
  UserFormModal,
  UserInviteDialog,
  UserDetailsDialog,
  UsersConfirmDialog,
} from "./users-management";

const UsersManagement: React.FC = () => {
  const {
    t,
    user,
    companyApps,
    users,
    roles,
    invitations,
    departments,
    positions,
    loading,
    invitationsLoading,
    error,
    searchInput,
    setSearchInput,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    totalCount,
    filters,
    selectedUsers,
    activeTab,
    statusCounts,
    filterSheetOpen,
    setFilterSheetOpen,
    editorMode,
    editingUser,
    detailsUser,
    setDetailsUser,
    inviteDialogOpen,
    setInviteDialogOpen,
    employeeInviteModalOpen,
    setEmployeeInviteModalOpen,
    showPassword,
    setShowPassword,
    userForm,
    inviteForm,
    setInviteForm,
    formErrors,
    inviteErrors,
    submitting,
    inviteSubmitting,
    pendingAction,
    setPendingAction,
    actionLoading,
    isAllSelected,
    isSomeSelected,
    fetchUsers,
    fetchInvitations,
    toggleUserSelection,
    handleToggleSelectAll,
    getRoleDisplayName,
    openAddUser,
    openInviteDialog,
    openEditUser,
    closeEditor,
    updateUserForm,
    saveUser,
    sendInvitation,
    applySearch,
    handleTabChange,
    updateFilter,
    clearFilters,
    copyInvitationLink,
    resendInvitation,
    exportCurrentUsers,
    handleBulkToggle,
    handleQuickToggleStatus,
    runPendingAction,
  } = useUsersManagementController();

  const metrics = useMemo(
    () => [
      {
        id: "all" as const,
        title: "إجمالي المستخدمين",
        value: statusCounts.total || (filters.isActive === "" ? totalCount : 0),
        subtitle: "جميع حسابات الفريق بالشركة",
        tone: "primary" as const,
      },
      {
        id: "active" as const,
        title: "النشطون فعلياً",
        value: statusCounts.active,
        subtitle: "سجلوا دخول ويستخدمون النظام",
        tone: "success" as const,
      },
      {
        id: "never_logged_in" as const,
        title: "لم يسجلوا الدخول",
        value: statusCounts.neverLoggedIn,
        subtitle: "حسابات مضافة لم تسجل دخول بعد",
        tone: "warning" as const,
      },
      {
        id: "inactive" as const,
        title: "غير النشطين",
        value: statusCounts.inactive,
        subtitle: "حسابات معطلة أو مستقيلة",
        tone: "danger" as const,
      },
      {
        id: "invitations" as const,
        title: "الدعوات المعلقة",
        value: invitations.length,
        subtitle: "دعوات بانتظار القبول أو الإلغاء",
        tone: "secondary" as const,
      },
    ],
    [filters.isActive, invitations.length, statusCounts, totalCount],
  );

  if (!user?.companyId) {
    return (
      <div className="p-4 md:p-6 lg:p-8 w-full">
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>هذه الصفحة غير متاحة</AlertTitle>
          <AlertDescription>
            لا يوجد `companyId` مرتبط بالحساب الحالي، لذلك لا يمكن تحميل إدارة المستخدمين.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 space-y-4 w-full max-w-7xl mx-auto">
        <UsersManagementHeader
          onOpenEmployeeInviteModal={() => setEmployeeInviteModalOpen(true)}
          onOpenAddUser={openAddUser}
          onOpenInviteDialog={openInviteDialog}
          onExportCsv={exportCurrentUsers}
          hasUsers={users.length > 0}
        />

        {error ? (
          <Alert variant="destructive">
            <AlertTriangle />
            <AlertTitle>تنبيه</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <UsersMetricsCards
          metrics={metrics}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <UsersTabsHeader
            activeTab={activeTab}
            statusCounts={statusCounts}
            totalCount={totalCount}
            invitationsCount={invitations.length}
          />

          <TabsContent value={activeTab} className="space-y-4 mt-0">
            {activeTab !== "invitations" ? (
              <>
                <UsersBulkActionBar
                  selectedCount={selectedUsers.length}
                  onActivate={() => void handleBulkToggle(true)}
                  onDeactivate={() => void handleBulkToggle(false)}
                  onDelete={() =>
                    setPendingAction({ kind: "bulk-delete", count: selectedUsers.length })
                  }
                  onClear={() => handleToggleSelectAll()}
                />

                <UsersFilterToolbar
                  searchInput={searchInput}
                  onSearchInputChange={setSearchInput}
                  onSearchSubmit={applySearch}
                  filters={filters}
                  onFilterChange={updateFilter}
                  onClearFilters={clearFilters}
                  roles={roles}
                  limit={limit}
                  onLimitChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                  }}
                  filterSheetOpen={filterSheetOpen}
                  onFilterSheetOpenChange={setFilterSheetOpen}
                  totalCount={totalCount}
                />

                <UsersTable
                  users={users}
                  loading={loading}
                  totalCount={totalCount}
                  activeTab={activeTab}
                  selectedUsers={selectedUsers}
                  isAllSelected={isAllSelected}
                  isSomeSelected={isSomeSelected}
                  onToggleSelectAll={handleToggleSelectAll}
                  onToggleSelectUser={toggleUserSelection}
                  onRefresh={() => void fetchUsers()}
                  getRoleDisplayName={getRoleDisplayName}
                  onViewDetails={setDetailsUser}
                  onEditUser={openEditUser}
                  onQuickToggleStatus={handleQuickToggleStatus}
                  onRequestResetPassword={(target) =>
                    setPendingAction({ kind: "reset-password", user: target })
                  }
                  onRequestDeleteUser={(target) =>
                    setPendingAction({ kind: "delete-user", user: target })
                  }
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  currentUserId={user?.id}
                />
              </>
            ) : (
              <UsersInvitationsTable
                invitations={invitations}
                invitationsLoading={invitationsLoading}
                onRefresh={() => void fetchInvitations()}
                getRoleDisplayName={getRoleDisplayName}
                onCopyInvitationLink={copyInvitationLink}
                onResendInvitation={resendInvitation}
                onRequestCancelInvitation={(target) =>
                  setPendingAction({ kind: "cancel-invitation", invitation: target })
                }
              />
            )}
          </TabsContent>
        </Tabs>

        <UserFormModal
          open={editorMode !== null}
          editorMode={editorMode}
          editingUser={editingUser}
          userForm={userForm}
          formErrors={formErrors}
          showPassword={showPassword}
          onShowPasswordToggle={() => setShowPassword((prev) => !prev)}
          onUpdateForm={updateUserForm}
          onClose={closeEditor}
          onSave={() => void saveUser()}
          submitting={submitting}
          roles={roles}
          departments={departments}
          positions={positions}
          companyApps={companyApps}
        />

        <UserInviteDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          inviteForm={inviteForm}
          onInviteFormChange={setInviteForm}
          inviteErrors={inviteErrors}
          onSendInvitation={() => void sendInvitation()}
          inviteSubmitting={inviteSubmitting}
          roles={roles}
        />

        <UserDetailsDialog
          user={detailsUser}
          onClose={() => setDetailsUser(null)}
          onEdit={openEditUser}
          getRoleDisplayName={getRoleDisplayName}
        />

        <UsersConfirmDialog
          pendingAction={pendingAction}
          onOpenChange={(open) => (!open ? setPendingAction(null) : undefined)}
          onConfirm={() => void runPendingAction()}
          actionLoading={actionLoading}
        />

        <EmployeeInviteModal
          open={employeeInviteModalOpen}
          onOpenChange={setEmployeeInviteModalOpen}
          onInvitationCreated={() => {
            void fetchUsers();
            void fetchInvitations();
          }}
        />
      </div>
    </TooltipProvider>
  );
};

export default UsersManagement;
