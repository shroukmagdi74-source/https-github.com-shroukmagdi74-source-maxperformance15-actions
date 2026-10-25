import React from "react";
import {
  useAuditLogsController,
  AuditLogsHeader,
  AuditLogsStats,
  AuditLogsFilters,
  AuditLogsTable,
  AuditLogDetailsDialog,
} from "./audit-logs/index";

const AuditLogs: React.FC = () => {
  const {
    logs,
    stats,
    loading,
    pagination,
    filters,
    selectedLog,
    setFilters,
    setSelectedLog,
    handleExport,
    handlePageChange,
  } = useAuditLogsController();

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <AuditLogsHeader
        onExport={handleExport}
        disabled={logs.length === 0}
      />

      {/* Stats Cards */}
      <AuditLogsStats stats={stats} />

      {/* Filters Bar */}
      <AuditLogsFilters
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* Data Table */}
      <AuditLogsTable
        logs={logs}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSelectLog={setSelectedLog}
      />

      {/* Details Dialog */}
      <AuditLogDetailsDialog
        selectedLog={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
};

export default AuditLogs;
