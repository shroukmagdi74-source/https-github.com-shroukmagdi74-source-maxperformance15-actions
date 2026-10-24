import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import {
  INITIAL_REMINDER_FORM,
  Reminder,
  ReminderFormState,
  ReminderStats,
} from "./types";

export const useRemindersController = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [stats, setStats] = useState<ReminderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "stats">("active");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<ReminderFormState>(INITIAL_REMINDER_FORM);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [remindersRes, statsRes] = await Promise.allSettled([
        api.get("/reminders?companyId=1"),
        api.get("/reminders/stats?companyId=1"),
      ]);

      if (remindersRes.status === "fulfilled" && remindersRes.value.data?.success) {
        setReminders(remindersRes.value.data.data?.reminders || []);
      }

      if (statsRes.status === "fulfilled" && statsRes.value.data?.success) {
        setStats(statsRes.value.data.data || null);
      }
    } catch (error) {
      console.error("Error loading reminders data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
    const interval = setInterval(() => {
      void loadData();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleCreateReminder = useCallback(async () => {
    if (!createForm.title.trim() || !createForm.scheduledTime) return;

    try {
      const response = await api.post("/reminders", {
        ...createForm,
        companyId: "1",
        userId: "1",
        relatedEntity: createForm.customerId
          ? {
              type: "customer",
              id: createForm.customerId,
            }
          : null,
      });

      if (response.data?.success) {
        await loadData();
        setShowCreateForm(false);
        setCreateForm(INITIAL_REMINDER_FORM);
      }
    } catch (error) {
      console.error("Error creating reminder:", error);
    }
  }, [createForm, loadData]);

  const handleUpdateStatus = useCallback(
    async (reminderId: string, status: string, notes = "") => {
      try {
        await api.put(`/reminders/${reminderId}/status`, { status, notes });
        await loadData();
      } catch (error) {
        console.error("Error updating reminder status:", error);
      }
    },
    [loadData],
  );

  const handleSnoozeReminder = useCallback(
    async (reminderId: string, minutes: number) => {
      try {
        await api.post(`/reminders/${reminderId}/snooze`, {
          snoozeMinutes: minutes,
        });
        await loadData();
      } catch (error) {
        console.error("Error snoozing reminder:", error);
      }
    },
    [loadData],
  );

  const activeReminders = useMemo(
    () => reminders.filter((r) => r.status === "pending" || r.status === "triggered"),
    [reminders],
  );

  const completedReminders = useMemo(
    () => reminders.filter((r) => r.status === "completed" || r.status === "dismissed"),
    [reminders],
  );

  return {
    reminders,
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
  };
};

export type RemindersController = ReturnType<typeof useRemindersController>;
