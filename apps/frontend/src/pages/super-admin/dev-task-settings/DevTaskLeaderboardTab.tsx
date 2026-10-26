import React from "react";
import { SettingsData } from "./types";
import { DevTaskTimeScoringSection } from "./DevTaskTimeScoringSection";

interface DevTaskLeaderboardTabProps {
  settings: SettingsData;
  setSettings: React.Dispatch<React.SetStateAction<SettingsData | null>>;
}

const TASK_TYPE_ITEMS = [
  {
    key: "BUG",
    label: "إصلاح خطأ (Bug)",
    description: "إصلاح مشكلة في الكود",
  },
  {
    key: "FEATURE",
    label: "ميزة جديدة (Feature)",
    description: "إضافة وظيفة جديدة",
  },
  {
    key: "ENHANCEMENT",
    label: "تحسين (Enhancement)",
    description: "تحسين ميزة موجودة",
  },
  {
    key: "HOTFIX",
    label: "إصلاح عاجل (Hotfix)",
    description: "إصلاح مشكلة حرجة",
  },
  {
    key: "REFACTOR",
    label: "إعادة هيكلة (Refactor)",
    description: "تحسين بنية الكود",
  },
  {
    key: "SECURITY",
    label: "أمان (Security)",
    description: "تحسينات أمنية",
  },
  {
    key: "DOCUMENTATION",
    label: "توثيق (Documentation)",
    description: "كتابة أو تحديث الوثائق",
  },
  {
    key: "TESTING",
    label: "اختبار (Testing)",
    description: "كتابة أو تحديث الاختبارات",
  },
  {
    key: "PERFORMANCE",
    label: "أداء (Performance)",
    description: "تحسين الأداء",
  },
  {
    key: "MAINTENANCE",
    label: "صيانة (Maintenance)",
    description: "صيانة دورية",
  },
];

const PRIORITY_ITEMS = [
  {
    key: "CRITICAL",
    label: "حرجة (Critical)",
    badgeColor: "bg-destructive/10 text-destructive border-destructive/20",
  },
  {
    key: "URGENT",
    label: "عاجلة (Urgent)",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  {
    key: "HIGH",
    label: "عالية (High)",
    badgeColor: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  },
  {
    key: "MEDIUM",
    label: "متوسطة (Medium)",
    badgeColor: "bg-primary/10 text-primary border-primary/20",
  },
  {
    key: "LOW",
    label: "منخفضة (Low)",
    badgeColor: "bg-muted text-muted-foreground border-border",
  },
];

export const DevTaskLeaderboardTab: React.FC<DevTaskLeaderboardTabProps> = ({
  settings,
  setSettings,
}) => {
  const currentBaseXP = settings.leaderboardSettings?.baseXP || 10;
  const currentTaskTypeScores = settings.leaderboardSettings?.taskTypeScores || {};
  const currentPriorityScores = settings.leaderboardSettings?.priorityScores || {};
  const timeScoring = settings.leaderboardSettings?.timeBasedScoring;

  const updateBaseXP = (value: number) => {
    setSettings({
      ...settings,
      leaderboardSettings: {
        baseXP: value,
        taskTypeScores: currentTaskTypeScores,
        priorityScores: currentPriorityScores,
        timeBasedScoring: timeScoring,
      },
    });
  };

  const updateTaskTypeScore = (key: string, value: number) => {
    setSettings({
      ...settings,
      leaderboardSettings: {
        baseXP: currentBaseXP,
        taskTypeScores: {
          ...currentTaskTypeScores,
          [key]: value,
        },
        priorityScores: currentPriorityScores,
        timeBasedScoring: timeScoring,
      },
    });
  };

  const updatePriorityScore = (key: string, value: number) => {
    setSettings({
      ...settings,
      leaderboardSettings: {
        baseXP: currentBaseXP,
        taskTypeScores: currentTaskTypeScores,
        priorityScores: {
          ...currentPriorityScores,
          [key]: value,
        },
        timeBasedScoring: timeScoring,
      },
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          إعدادات لوحة الأبطال
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          حدد نقاط الخبرة (XP) التي يحصل عليها المطور عند إكمال كل نوع من المهام.
        </p>
      </div>

      {/* Base XP */}
      <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          النقاط الأساسية (Base XP)
        </label>
        <input
          type="number"
          min="0"
          value={currentBaseXP}
          onChange={(e) => updateBaseXP(parseInt(e.target.value) || 0)}
          className="w-32 border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 font-mono text-sm"
        />
        <p className="text-xs text-gray-400 mt-2">
          النقاط الأساسية التي تُضاف لأي مهمة مكتملة
        </p>
      </div>

      {/* Task Type Scores */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-4">
          نقاط حسب نوع المهمة
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TASK_TYPE_ITEMS.map(({ key, label, description }) => (
            <div
              key={key}
              className="bg-card p-4 rounded-lg border border-border shadow-xs"
            >
              <label className="block text-sm font-medium text-foreground mb-1">
                {label}
              </label>
              <p className="text-xs text-muted-foreground mb-2">{description}</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={currentTaskTypeScores[key] || 0}
                  onChange={(e) =>
                    updateTaskTypeScore(key, parseInt(e.target.value) || 0)
                  }
                  className="w-20 border rounded px-2 py-1 text-sm bg-background border-input text-foreground focus:ring-1 focus:ring-primary font-mono tabular-nums"
                />
                <span className="text-xs text-muted-foreground">نقطة</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Scores */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-4">
          نقاط إضافية حسب الأولوية
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRIORITY_ITEMS.map(({ key, label, badgeColor }) => (
            <div
              key={key}
              className="p-4 rounded-lg border border-border bg-card shadow-xs"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${badgeColor}`}>
                  {label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={currentPriorityScores[key] || 0}
                  onChange={(e) =>
                    updatePriorityScore(key, parseInt(e.target.value) || 0)
                  }
                  className="w-20 border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 font-mono tabular-nums"
                />
                <span className="text-xs text-gray-500">نقطة إضافية</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time-Based Scoring & Examples */}
      <DevTaskTimeScoringSection
        settings={settings}
        setSettings={setSettings}
      />
    </div>
  );
};
