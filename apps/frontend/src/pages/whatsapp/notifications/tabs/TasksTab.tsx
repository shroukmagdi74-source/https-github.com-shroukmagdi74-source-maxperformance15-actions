import React from "react";
import {
  CheckSquare,
  PlusCircle,
  RefreshCw,
  MessageSquare,
  Paperclip,
  Clock,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Switch } from "../../../../components/ui/switch";
import { Label } from "../../../../components/ui/label";
import type { NotificationSettings } from "../types";

interface TasksTabProps {
  settings: NotificationSettings;
  updateSetting: <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K],
  ) => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({ settings, updateSetting }) => {
  const taskItems = [
    {
      key: "taskCreatedEnabled" as const,
      label: "إنشاء مهمة جديدة للمنفذ",
      icon: PlusCircle,
    },
    {
      key: "taskStatusChangedEnabled" as const,
      label: "تغيير حالة المهمة (مكتملة / قيد التنفيذ)",
      icon: RefreshCw,
    },
    {
      key: "taskCommentedEnabled" as const,
      label: "تعليق جديد على المهمة",
      icon: MessageSquare,
    },
    {
      key: "taskDeadlineReminderEnabled" as const,
      label: "تذكير باقتراب موعد التسليم",
      icon: Clock,
    },
    {
      key: "taskOverdueEnabled" as const,
      label: "تنبيه تأخر المهمة عن موعدها",
      icon: AlertCircle,
    },
    {
      key: "taskWatcherAddedEnabled" as const,
      label: "إضافة مراقب للمهمة",
      icon: Eye,
    },
    {
      key: "taskAttachmentAddedEnabled" as const,
      label: "إضافة ملف أو مرفق جديد",
      icon: Paperclip,
    },
  ];

  return (
    <div className="space-y-4 rounded-lg border border-border/60 bg-card p-4 shadow-sm max-w-4xl">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-foreground">
            إشعارات المهام وإدارة المشاريع
          </h3>
        </div>
        <Switch
          checked={settings.taskNotificationsEnabled}
          onCheckedChange={(checked) =>
            updateSetting("taskNotificationsEnabled", checked)
          }
        />
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {taskItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className="flex items-center justify-between gap-3 rounded-md border border-border/40 p-2.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <Label className="text-xs font-medium text-foreground truncate">
                  {item.label}
                </Label>
              </div>
              <Switch
                disabled={!settings.taskNotificationsEnabled}
                checked={settings[item.key]}
                onCheckedChange={(checked) => updateSetting(item.key, checked)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
