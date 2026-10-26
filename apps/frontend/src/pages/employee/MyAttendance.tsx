import React from "react";
import { AlertCircle } from "lucide-react";
import {
  formatDate,
  MyAttendanceClockAndActionsCard,
  MyAttendanceModals,
  MyAttendanceStatsAndLogTable,
  useMyAttendanceController,
} from "./attendance";

const MyAttendance: React.FC = () => {
  const {
    t,
    user,
    timezone,
    loading,
    todayAttendance,
    stats,
    recentAttendance,
    hasMoreRecent,
    currentTime,
    checkingIn,
    checkingOut,
    errorMessages,
    duration,
    showMapModal,
    setShowMapModal,
    selectedLocation,
    workMode,
    setWorkMode,
    todayGoals,
    goalProgressDrafts,
    setGoalProgressDrafts,
    showGoalsReviewDialog,
    setShowGoalsReviewDialog,
    selectedMonth,
    setSelectedMonth,
    recentPage,
    setRecentPage,
    openLocationInMap,
    handleCheckIn,
    handleCheckOut,
    submitGoalUpdatesAndCheckOut,
    canCheckIn,
    canCheckOut,
    checkInDate,
    showOvernightWarning,
    recordDateLabel,
    formattedCheckIn,
    formattedCheckOut,
    staleHours,
    geofenceModalData,
    showGeofenceModal,
    setShowGeofenceModal,
  } = useMyAttendanceController();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full" dir="rtl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("employee.attendance.myAttendance")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("employee.attendance.myAttendanceDesc")}
          </p>
          {user && (
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-2">
              {t("employee.attendance.employee", {
                name: `${user.firstName} ${user.lastName}`,
              })}
            </p>
          )}
        </div>
        <p className="text-gray-500 dark:text-gray-400 sm:mt-0">
          {formatDate(currentTime)}
        </p>
      </div>

      {errorMessages.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div className="space-y-1">
              {errorMessages.map((message, idx) => (
                <p key={idx} className="text-sm">
                  {message}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      <MyAttendanceClockAndActionsCard
        t={t}
        timezone={timezone}
        currentTime={currentTime}
        todayAttendance={todayAttendance}
        showOvernightWarning={showOvernightWarning}
        recordDateLabel={recordDateLabel}
        formattedCheckIn={formattedCheckIn}
        formattedCheckOut={formattedCheckOut}
        duration={duration}
        checkInDate={checkInDate}
        staleHours={staleHours}
        canCheckIn={canCheckIn}
        canCheckOut={canCheckOut}
        checkingIn={checkingIn}
        checkingOut={checkingOut}
        workMode={workMode}
        onWorkModeChange={setWorkMode}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        todayGoals={todayGoals}
      />

      <MyAttendanceStatsAndLogTable
        t={t}
        timezone={timezone}
        stats={stats}
        recentAttendance={recentAttendance}
        selectedMonth={selectedMonth}
        onMonthChange={(month) => {
          setSelectedMonth(month);
          setRecentPage(1);
        }}
        recentPage={recentPage}
        onPageChange={setRecentPage}
        hasMoreRecent={hasMoreRecent}
        onOpenLocationInMap={openLocationInMap}
      />

      <MyAttendanceModals
        t={t}
        showGoalsReviewDialog={showGoalsReviewDialog}
        onGoalsDialogChange={setShowGoalsReviewDialog}
        checkingOut={checkingOut}
        todayGoals={todayGoals}
        goalProgressDrafts={goalProgressDrafts}
        onGoalDraftChange={(goalId, val) =>
          setGoalProgressDrafts((prev) => ({ ...prev, [goalId]: val }))
        }
        onSubmitGoalsAndCheckout={submitGoalUpdatesAndCheckOut}
        showMapModal={showMapModal}
        onMapModalChange={setShowMapModal}
        selectedLocation={selectedLocation}
        showGeofenceModal={showGeofenceModal}
        onGeofenceModalChange={setShowGeofenceModal}
        geofenceModalData={geofenceModalData}
      />
    </div>
  );
};

export default MyAttendance;
