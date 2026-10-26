import { useState, useEffect, useCallback } from "react";
import { buildApiUrl } from "../../../utils/urlHelper";
import tokenManager from "../../../utils/tokenManager";
import i18n from "../../../i18n";
import {
  SettingsData,
  DevTeamMember,
  DevTaskSettingsTab,
  StatusItem,
  sanitizeStatusItems,
} from "./types";

export function useDevTaskSettingsController() {
  const [activeTab, setActiveTab] = useState<DevTaskSettingsTab>("general");
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teamMembers, setTeamMembers] = useState<DevTeamMember[]>([]);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(buildApiUrl("super-admin/dev/settings"), {
        headers: tokenManager.createAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setSettings({
          ...data.data,
          taskStatuses: sanitizeStatusItems(data.data.taskStatuses),
          taskPriorities: sanitizeStatusItems(data.data.taskPriorities),
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch(buildApiUrl("super-admin/dev/team"), {
        headers: tokenManager.createAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setTeamMembers(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch team", error);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchTeam();
  }, [fetchSettings, fetchTeam]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      // Ensure leaderboardSettings and automationSettings are complete before saving
      const settingsToSave = {
        ...settings,
        leaderboardSettings: settings.leaderboardSettings
          ? {
              baseXP: settings.leaderboardSettings.baseXP || 10,
              taskTypeScores: settings.leaderboardSettings.taskTypeScores || {},
              priorityScores: settings.leaderboardSettings.priorityScores || {},
              timeBasedScoring: settings.leaderboardSettings.timeBasedScoring || {
                enabled: true,
                earlyCompletionBonus: 20,
                onTimeBonus: 10,
                lateCompletionPenalty: 15,
                maxBonusPercent: 50,
                maxPenaltyPercent: 30,
              },
            }
          : undefined,
        automationSettings: settings.automationSettings
          ? {
              rules: settings.automationSettings.rules || [],
            }
          : undefined,
      };

      const res = await fetch(buildApiUrl("super-admin/dev/settings"), {
        method: "PUT",
        headers: tokenManager.createAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(settingsToSave),
      });
      const data = await res.json();
      if (data.success) {
        alert(i18n.t("DevTaskSettings.success_save_eb53"));
        await fetchSettings();
      } else {
        alert("فشل الحفظ: " + (data.message || i18n.t("DevTaskSettings.msg_74b2")));
      }
    } catch (error) {
      console.error("❌ Save error:", error);
      alert(i18n.t("DevTaskSettings.error_error_3bd3"));
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = (
    index: number,
    field: keyof StatusItem,
    value: string,
  ) => {
    if (!settings) return;
    const newStatuses = [...settings.taskStatuses];
    newStatuses[index] = {
      ...newStatuses[index],
      [field]: value,
    } as StatusItem;
    setSettings({ ...settings, taskStatuses: newStatuses });
  };

  const addStatus = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      taskStatuses: [
        ...settings.taskStatuses,
        { value: "NEW_STATUS", label: "New Status", color: "#cbd5e1" },
      ],
    });
  };

  const removeStatus = (index: number) => {
    if (!settings) return;
    const newStatuses = settings.taskStatuses.filter((_, i) => i !== index);
    setSettings({ ...settings, taskStatuses: newStatuses });
  };

  return {
    activeTab,
    setActiveTab,
    settings,
    setSettings,
    loading,
    saving,
    teamMembers,
    handleSave,
    updateStatus,
    addStatus,
    removeStatus,
    fetchSettings,
  };
}
