import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { MessageSquare, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { Session } from "./types";

interface CustomerWhatsAppNotifyHeaderProps {
  connectedSession?: Session;
  sessionsLoading: boolean;
  onRefreshSessions: () => void;
}

export const CustomerWhatsAppNotifyHeader: React.FC<CustomerWhatsAppNotifyHeaderProps> = ({
  connectedSession,
  sessionsLoading,
  onRefreshSessions,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {t("whatsappNotify.title", "إرسال إشعارات واتساب للعملاء")}
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {t(
              "whatsappNotify.subtitle",
              "إرسال رسائل جماعية ذكية ومستهدفة لشرائح العملاء مع تخصيص الروابط والصور",
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {sessionsLoading ? (
          <div className="h-8 w-32 bg-muted/60 rounded-full animate-pulse" />
        ) : connectedSession ? (
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono tabular-nums font-semibold">
              {connectedSession.phoneNumber}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{t("whatsappNotify.sessionDisconnected", "لا توجد جلسة متصلة")}</span>
            <Link
              to="/whatsapp/settings"
              className="underline text-[11px] font-semibold hover:opacity-80"
            >
              {t("common.settings", "الإعدادات")}
            </Link>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onRefreshSessions}
          disabled={sessionsLoading}
          className="h-8 w-8 p-0"
          title={t("whatsappNotify.refreshSession", "تحديث الجلسات")}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${sessionsLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </div>
  );
};
