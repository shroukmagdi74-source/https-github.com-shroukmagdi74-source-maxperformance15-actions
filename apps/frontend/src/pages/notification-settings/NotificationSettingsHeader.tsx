import React from "react";
import {
  ArrowPathIcon,
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { type FeedbackState, type SettingsTab } from "./types";

interface NotificationSettingsHeaderProps {
  hasUnsavedChanges: boolean;
  saving: boolean;
  onSave: () => void;
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  feedback: FeedbackState;
}

export const NotificationSettingsHeader: React.FC<NotificationSettingsHeaderProps> = ({
  hasUnsavedChanges,
  saving,
  onSave,
  activeTab,
  onTabChange,
  feedback,
}) => {
  return (
    <div className="space-y-4">
      {/* Linear Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border/60">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CogIcon className="size-5 text-indigo-600 dark:text-indigo-400" />
            إعدادات التنبيهات والإشعارات
          </h1>
          <p className="text-xs text-muted-foreground">
            تخصيص قنوات التنبيه اللحظية وإشعارات المتصفح
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/40 border border-border/60 text-xs text-muted-foreground">
            <span
              className={`size-1.5 rounded-full ${
                hasUnsavedChanges ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
              }`}
            />
            <span className="text-[11px] font-medium font-mono tabular-nums">
              {hasUnsavedChanges ? "تغييرات غير محفوظة" : "الإعدادات متزامنة"}
            </span>
          </div>

          <button
            type="button"
            onClick={onSave}
            disabled={saving || !hasUnsavedChanges}
            className="h-8.5 px-3 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving ? (
              <ArrowPathIcon className="size-3.5 animate-spin" />
            ) : (
              <CheckCircleIcon className="size-3.5" />
            )}
            حفظ التغييرات
          </button>
        </div>
      </div>

      {feedback ? (
        <div
          className={`rounded-lg border px-3.5 py-2 text-xs font-medium flex items-center gap-2 ${
            feedback.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : feedback.type === "error"
                ? "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                : "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      {/* Segmented Control Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted/40 border border-border/60 rounded-lg w-fit">
        {[
          { id: "general", label: "الإعدادات العامة", icon: CogIcon },
          { id: "types", label: "أنواع الإشعارات", icon: BellIcon },
          { id: "stats", label: "الإحصائيات", icon: ClockIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id as SettingsTab)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
