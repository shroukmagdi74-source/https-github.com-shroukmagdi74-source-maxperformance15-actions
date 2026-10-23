import React from "react";
import { useTranslation } from "react-i18next";
import { Activity, Pause, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { CampaignStatus } from "./types";

interface CustomerWhatsAppCampaignProgressProps {
  campaign: CampaignStatus;
  onStop: () => void;
}

export const CustomerWhatsAppCampaignProgress: React.FC<CustomerWhatsAppCampaignProgressProps> = ({
  campaign,
  onStop,
}) => {
  const { t } = useTranslation();

  const isRunning = campaign.status === "running";
  const isCompleted = campaign.status === "completed";
  const isCancelled = campaign.status === "cancelled";

  const percent =
    campaign.total > 0
      ? Math.min(100, Math.round(((campaign.sent + campaign.failed) / campaign.total) * 100))
      : 0;

  return (
    <div className="space-y-4 rounded-lg border border-border/60 bg-card p-4 shadow-sm animate-in fade-in">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          {isRunning ? (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Activity className="h-3.5 w-3.5 animate-spin" />
            </div>
          ) : isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          )}

          <h3 className="text-sm font-semibold text-foreground">
            {isRunning
              ? t("whatsappNotify.sending", "حملة الإرسال قيد التشغيل")
              : isCompleted
                ? t("whatsappNotify.completed", "اكتمل إرسال الحملة بنجاح")
                : t("whatsappNotify.paused", "تم إيقاف الحملة مؤقتاً")}
          </h3>
        </div>

        {isRunning && (
          <Button
            variant="outline"
            size="sm"
            onClick={onStop}
            className="h-7 gap-1 border-destructive/30 text-[11px] font-medium text-destructive hover:bg-destructive/10"
          >
            <Pause className="h-3 w-3" />
            {t("whatsappNotify.pause", "إيقاف مؤقت")}
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground font-mono tabular-nums">
          <span>التقدم الإجمالي</span>
          <span className="font-semibold text-foreground">{percent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all duration-500 ${
              isCompleted ? "bg-emerald-500" : "bg-blue-600"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* 3 Telemetry Counters */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        <div className="rounded-md border border-border/50 bg-muted/20 p-2.5 text-center">
          <span className="font-mono text-base font-bold tabular-nums text-foreground">
            {campaign.total}
          </span>
          <span className="block text-[10px] text-muted-foreground">
            {t("whatsappNotify.audience", "إجمالي الجمهور")}
          </span>
        </div>

        <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-center">
          <span className="font-mono text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {campaign.sent}
          </span>
          <span className="block text-[10px] text-muted-foreground">
            {t("whatsappNotify.done", "تم الإرسال")}
          </span>
        </div>

        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-2.5 text-center">
          <span className="font-mono text-base font-bold tabular-nums text-destructive">
            {campaign.failed}
          </span>
          <span className="block text-[10px] text-muted-foreground">
            {t("whatsappNotify.failed", "فشل")}
          </span>
        </div>
      </div>

      {/* Errors list */}
      {campaign.errors && campaign.errors.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-border/40">
          <p className="text-[11px] font-semibold text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>سجل أخطاء الإرسال ({campaign.errors.length})</span>
          </p>
          <div className="max-h-28 overflow-y-auto space-y-1 no-scrollbar">
            {campaign.errors.map((err, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded border border-destructive/20 bg-destructive/5 p-1.5 text-[10px]"
              >
                <span className="font-mono tabular-nums text-foreground">
                  {err.phone || err.formattedPhone || err.customerId}
                </span>
                <span className="text-destructive truncate max-w-[180px]">
                  {err.error}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
