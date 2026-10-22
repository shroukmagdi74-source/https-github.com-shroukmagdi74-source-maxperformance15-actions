import React from "react";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  Calendar,
  FileCheck,
  CreditCard,
  Gift,
  AlertTriangle,
} from "lucide-react";
import { Switch } from "../../../../components/ui/switch";
import { Label } from "../../../../components/ui/label";
import type { NotificationSettings } from "../types";

interface HRTabProps {
  settings: NotificationSettings;
  updateSetting: <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K],
  ) => void;
}

export const HRTab: React.FC<HRTabProps> = ({ settings, updateSetting }) => {
  const { t } = useTranslation();

  const hrItems = [
    {
      key: "attendanceReminderEnabled" as const,
      label: t("whatsappNotifications.hr.attendance", "تذكير الحضور الصباحي"),
      icon: Clock,
    },
    {
      key: "attendanceConfirmedEnabled" as const,
      label: t("whatsappNotifications.hr.attendanceConfirmed", "تأكيد تسجيل الحضور"),
      icon: CheckCircle2,
    },
    {
      key: "checkoutConfirmedEnabled" as const,
      label: t("whatsappNotifications.hr.checkoutConfirmed", "تأكيد تسجيل الانصراف"),
      icon: CheckCircle2,
    },
    {
      key: "leaveApprovalEnabled" as const,
      label: t("whatsappNotifications.hr.leave", "قرارات طلبات الإجازات"),
      icon: Calendar,
    },
    {
      key: "permissionApprovalEnabled" as const,
      label: t("whatsappNotifications.hr.permission", "قرارات طلبات الأذونات"),
      icon: FileCheck,
    },
    {
      key: "payrollEnabled" as const,
      label: t("whatsappNotifications.hr.payroll", "إشعار إصدار الراتب الشهري"),
      icon: CreditCard,
    },
    {
      key: "birthdayWishEnabled" as const,
      label: t("whatsappNotifications.hr.birthday", "تهنئة يوم ميلاد الموظف"),
      icon: Gift,
    },
    {
      key: "warningNotificationEnabled" as const,
      label: t("whatsappNotifications.hr.warnings", "تنبيهات الحضور ولفت النظر"),
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-4 rounded-lg border border-border/60 bg-card p-4 shadow-sm max-w-4xl">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-semibold text-foreground">
            {t("whatsappNotifications.tabs.hr", "إشعارات الموارد البشرية وشؤون الموظفين")}
          </h3>
        </div>
        <Switch
          checked={settings.hrNotificationsEnabled}
          onCheckedChange={(checked) =>
            updateSetting("hrNotificationsEnabled", checked)
          }
        />
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {hrItems.map((item) => {
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
                disabled={!settings.hrNotificationsEnabled}
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
