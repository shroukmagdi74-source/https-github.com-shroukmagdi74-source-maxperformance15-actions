import React from "react";
import { Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useAttendanceController,
  formatAttendanceDate,
  AttendanceStatsCards,
  AttendanceAutoCloseBanner,
  AttendanceFilters,
  AttendanceTable,
  ManualAttendanceDialog,
  AutoCloseReviewDialog,
  AttendanceDeleteDialog,
  AttendanceNotesDialog,
  AttendanceMapDialog,
} from "./attendance/index";

export const Attendance: React.FC = () => {
  const {
    loading,
    todayStats,
    records,
    attendanceTimezone,
    pagination,
    setPagination,
    autoCloseSummary,
    selectedDate,
    setSelectedDate,
    endDate,
    setEndDate,
    useDateRange,
    setUseDateRange,
    statusFilter,
    setStatusFilter,
    employeeId,
    setEmployeeId,
    autoClosedOnly,
    setAutoClosedOnly,
    autoCloseReviewStatus,
    setAutoCloseReviewStatus,
    employees,
    showManualDialog,
    setShowManualDialog,
    showMapModal,
    setShowMapModal,
    selectedLocation,
    manualForm,
    setManualForm,
    manualOverrides,
    setManualOverrides,
    isEditMode,
    showNotesDialog,
    setShowNotesDialog,
    selectedNotes,
    setSelectedNotes,
    showAutoCloseReviewDialog,
    setShowAutoCloseReviewDialog,
    selectedAutoCloseRecord,
    autoCloseReviewForm,
    setAutoCloseReviewForm,
    deleteDialogOpen,
    setDeleteDialogOpen,
    confirmDelete,
    executeDelete,
    openAutoCloseReview,
    submitAutoCloseReview,
    handleCheckIn,
    handleCheckOut,
    handleManualAttendance,
    resetManualForm,
    handleEditClick,
    openLocationInMap,
    handleExport,
  } = useAttendanceController();

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen" dir="rtl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">الحضور والانصراف</h1>
          <p className="text-gray-500 mt-1">
            {formatAttendanceDate(
              selectedDate,
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              },
              "-",
              attendanceTimezone,
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              resetManualForm();
              setShowManualDialog(true);
            }}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Clock className="h-4 w-4 ml-2" /> تسجيل يدوي
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 ml-2" /> تصدير
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <AttendanceStatsCards todayStats={todayStats} />

      {/* Auto-Close Review Summary Banner */}
      <AttendanceAutoCloseBanner
        autoCloseSummary={autoCloseSummary}
        autoClosedOnly={autoClosedOnly}
        setAutoClosedOnly={setAutoClosedOnly}
        autoCloseReviewStatus={autoCloseReviewStatus}
        setAutoCloseReviewStatus={setAutoCloseReviewStatus}
      />

      {/* Search & Filter Controls */}
      <AttendanceFilters
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        endDate={endDate}
        setEndDate={setEndDate}
        useDateRange={useDateRange}
        setUseDateRange={setUseDateRange}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        employeeId={employeeId}
        setEmployeeId={setEmployeeId}
        employees={employees}
        autoClosedOnly={autoClosedOnly}
        setAutoClosedOnly={setAutoClosedOnly}
        autoCloseReviewStatus={autoCloseReviewStatus}
        setAutoCloseReviewStatus={setAutoCloseReviewStatus}
      />

      {/* Main Attendance Table */}
      <AttendanceTable
        loading={loading}
        records={records}
        attendanceTimezone={attendanceTimezone}
        pagination={pagination}
        setPagination={setPagination}
        handleCheckIn={handleCheckIn}
        handleCheckOut={handleCheckOut}
        handleEditClick={handleEditClick}
        confirmDelete={confirmDelete}
        openAutoCloseReview={openAutoCloseReview}
        setSelectedNotes={setSelectedNotes}
        setShowNotesDialog={setShowNotesDialog}
        openLocationInMap={openLocationInMap}
      />

      {/* Manual / Edit Attendance Dialog */}
      <ManualAttendanceDialog
        open={showManualDialog}
        onOpenChange={setShowManualDialog}
        isEditMode={isEditMode}
        manualForm={manualForm}
        setManualForm={setManualForm}
        manualOverrides={manualOverrides}
        setManualOverrides={setManualOverrides}
        employees={employees}
        attendanceTimezone={attendanceTimezone}
        onSubmit={handleManualAttendance}
        onReset={resetManualForm}
      />

      {/* Auto-Close Review Dialog */}
      <AutoCloseReviewDialog
        open={showAutoCloseReviewDialog}
        onOpenChange={setShowAutoCloseReviewDialog}
        selectedAutoCloseRecord={selectedAutoCloseRecord}
        attendanceTimezone={attendanceTimezone}
        autoCloseReviewForm={autoCloseReviewForm}
        setAutoCloseReviewForm={setAutoCloseReviewForm}
        onSubmitReview={submitAutoCloseReview}
        onOpenEdit={handleEditClick}
      />

      {/* Delete Confirmation Dialog */}
      <AttendanceDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirmDelete={executeDelete}
      />

      {/* Notes Dialog */}
      <AttendanceNotesDialog
        open={showNotesDialog}
        onOpenChange={setShowNotesDialog}
        notes={selectedNotes}
      />

      {/* Map Dialog */}
      <AttendanceMapDialog
        open={showMapModal}
        onOpenChange={setShowMapModal}
        selectedLocation={selectedLocation}
      />
    </div>
  );
};

export default Attendance;
