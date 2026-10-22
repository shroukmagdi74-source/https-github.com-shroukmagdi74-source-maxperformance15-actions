import React from "react";
import { useTranslation } from "react-i18next";
import { Bell, Smartphone, Layers, ShieldCheck } from "lucide-react";
import type { Session } from "./types";

interface WhatsAppNotificationsKPIsProps {
  isEnabled: boolean;
  enabledModules: number;
  connectedSessions: number;
  totalSessions: number;
  currentSession?: Session;
}

export const WhatsAppNotificationsKPIs: React.FC<WhatsAppNotificationsKPIsProps> = ({
  isEnabled,
  enabledModules,
  connectedSessions,
  totalSessions,
  currentSession,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {/* 1. Master Status */}
      <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-sm">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
            isEnabled
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Bell className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-muted-foreground">
            {t("whatsappNotifications.general.enableNotifications", "الإشعارات التلقائية")}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-xs font-semibold ${
                isEnabled
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              }`}
            >
              {isEnabled
                ? t("common.active", "مفعلة")
                : t("common.disabled", "معطلة")}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Active Modules */}
      <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Layers className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-muted-foreground">
            {t("whatsappNotifications.kpi.activeModules", "الموديولات النشطة")}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
              {enabledModules}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {t("whatsappNotifications.kpi.sections", "أقسام")}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Connected Sessions */}
      <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-sm">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
            connectedSessions > 0
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
          }`}
        >
          <Smartphone className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-muted-foreground">
            {t("whatsappNotifications.general.sessions", "جلسات الإرسال")}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
              {connectedSessions}
            </span>
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
              / {totalSessions} {t("common.connected", "متصلة")}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Active Default Session */}
      <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-muted-foreground truncate">
            {t("whatsappNotifications.general.defaultSession", "الجلسة الافتراضية")}
          </p>
          <p className="font-mono text-xs font-semibold tabular-nums text-foreground truncate">
            {currentSession?.phoneNumber || currentSession?.name || t("common.unassigned", "غير محددة")}
          </p>
        </div>
      </div>
    </div>
  );
};
