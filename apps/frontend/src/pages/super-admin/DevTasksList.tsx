import React from "react";
import i18n from "../../i18n";
import {
  useDevTasksListController,
  DevTasksHeader,
  DevTasksStatsRibbon,
  DevTasksFilterBar,
  DevTasksBulkBar,
  DevTasksTable,
  DevTasksPagination,
  DevTasksFilterDrawer,
  DevTasksConfirmModal,
} from "./dev-tasks-list";

const DevTasksList: React.FC = () => {
  const {
    tasks,
    settings,
    userPermissions,
    pagination,
    setPagination,
    loading,
    error,
    showFiltersSidebar,
    setShowFiltersSidebar,
    selectedTasks,
    setSelectedTasks,
    projects,
    teamMembers,
    releases,
    sortBy,
    sortOrder,
    bulkAction,
    setBulkAction,
    stats,
    confirmModal,
    setConfirmModal,
    filters,
    setFilters,
    pendingFilters,
    hideCompleted,
    setHideCompleted,
    showMyTasksOnly,
    setShowMyTasksOnly,
    fetchTasks,
    handleSearch,
    handleFilterChange,
    handlePendingFilterChange,
    applyPendingFilters,
    addTag,
    removeTag,
    clearFilters,
    handleSort,
    handleBulkAction,
    handleExport,
    toggleSelectAll,
    toggleSelectTask,
    handleDeleteTask,
  } = useDevTasksListController();

  return (
    <div className="space-y-4" dir={i18n.dir()}>
      {/* Header */}
      <DevTasksHeader
        total={pagination.total}
        onExport={handleExport}
      />

      {/* Quick Stats Telemetry Ribbon */}
      <DevTasksStatsRibbon stats={stats} />

      {/* Search & Filters Bar */}
      <DevTasksFilterBar
        filters={filters}
        setFilters={setFilters}
        settings={settings}
        hideCompleted={hideCompleted}
        setHideCompleted={setHideCompleted}
        showMyTasksOnly={showMyTasksOnly}
        setShowMyTasksOnly={setShowMyTasksOnly}
        handleSearch={handleSearch}
        handleFilterChange={handleFilterChange}
        clearFilters={clearFilters}
        onOpenSidebar={() => setShowFiltersSidebar(true)}
      />

      {/* Bulk Actions Toolbar */}
      <DevTasksBulkBar
        selectedCount={selectedTasks.length}
        bulkAction={bulkAction}
        setBulkAction={setBulkAction}
        teamMembers={teamMembers}
        onDeselectAll={() => setSelectedTasks([])}
        onExecute={handleBulkAction}
      />

      {/* Tasks Table */}
      <DevTasksTable
        tasks={tasks}
        loading={loading}
        error={error}
        selectedTasks={selectedTasks}
        sortBy={sortBy}
        sortOrder={sortOrder}
        settings={settings}
        userPermissions={userPermissions}
        onSort={handleSort}
        onToggleSelectAll={toggleSelectAll}
        onToggleSelectTask={toggleSelectTask}
        onDeleteTask={handleDeleteTask}
        onRetry={fetchTasks}
      />

      {/* Pagination Controls */}
      <DevTasksPagination
        pagination={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        onLimitChange={(limit) =>
          setPagination((prev) => ({ ...prev, limit, page: 1 }))
        }
      />

      {/* Advanced Filters Drawer */}
      <DevTasksFilterDrawer
        show={showFiltersSidebar}
        onClose={() => setShowFiltersSidebar(false)}
        pendingFilters={pendingFilters}
        onFilterChange={handlePendingFilterChange}
        onAddTag={addTag}
        onRemoveTag={removeTag}
        onClearFilters={clearFilters}
        onApply={applyPendingFilters}
        settings={settings}
        projects={projects}
        teamMembers={teamMembers}
        releases={releases}
      />

      {/* Delete Confirmation Modal */}
      <DevTasksConfirmModal
        modal={confirmModal}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default DevTasksList;
