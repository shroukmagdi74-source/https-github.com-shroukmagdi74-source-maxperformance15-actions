import React from "react";
import {
  CreateReminderModal,
  RemindersActiveTab,
  RemindersCompletedTab,
  RemindersHeader,
  RemindersSkeleton,
  RemindersStatsTab,
  RemindersTabs,
  RemindersTelemetry,
  useRemindersController,
} from "./reminders/index";

export { Reminder, ReminderStats } from "./reminders/types";

const Reminders: React.FC = () => {
  const {
    stats,
    loading,
    activeTab,
    setActiveTab,
    showCreateForm,
    setShowCreateForm,
    createForm,
    setCreateForm,
    loadData,
    handleCreateReminder,
    handleUpdateStatus,
    handleSnoozeReminder,
    activeReminders,
    completedReminders,
  } = useRemindersController();

  if (loading && !stats) {
    return <RemindersSkeleton />;
  }

  return (
    <div className="w-full space-y-4" dir="rtl">
      <RemindersHeader
        loading={loading}
        onOpenCreate={() => setShowCreateForm(true)}
        onRefresh={loadData}
      />

      <RemindersTelemetry
        stats={stats}
        activeCount={activeReminders.length}
        completedCount={completedReminders.length}
      />

      <RemindersTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeCount={activeReminders.length}
        completedCount={completedReminders.length}
      />

      {activeTab === "active" && (
        <RemindersActiveTab
          reminders={activeReminders}
          onUpdateStatus={handleUpdateStatus}
          onSnooze={handleSnoozeReminder}
        />
      )}

      {activeTab === "completed" && (
        <RemindersCompletedTab reminders={completedReminders} />
      )}

      {activeTab === "stats" && <RemindersStatsTab stats={stats} />}

      <CreateReminderModal
        open={showCreateForm}
        form={createForm}
        onFormChange={setCreateForm}
        onSave={handleCreateReminder}
        onClose={() => setShowCreateForm(false)}
      />
    </div>
  );
};

export default Reminders;
