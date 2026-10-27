import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";
import { formatDateTime } from "../utils";
import type { FollowUpState, FollowUpAutomation } from "../types";

interface FollowUpAutomationCardProps {
  followUp: FollowUpState;
  automation: FollowUpAutomation | null;
  saving: boolean;
  onLogReminder: () => void;
  onLogEscalation: () => void;
}

export const FollowUpAutomationCard: React.FC<FollowUpAutomationCardProps> = ({
  followUp,
  automation,
  saving,
  onLogReminder,
  onLogEscalation,
}) => {
  if (!automation || !followUp.assignedOwner?.id || followUp.status === "resolved") {
    return null;
  }

  return (
    <div className="rounded-lg border-primary/20 bg-primary/5 p-4 shadow-sm">
      <div className="space-y-1.5">
        <h4 className="text-sm font-black text-foreground flex items-center gap-2">
          <Sparkles className="size-4 text-primary" /> أتمتة المتابعة الذكية
        </h4>
        <p className="text-xs font-medium leading-relaxed text-muted-foreground/80">
          {automation.description}
        </p>
      </div>
      <div className="flex flex-wrap gap-3 mt-3">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-9 rounded-lg border-primary/20 bg-white px-4 text-[13px] font-black shadow-sm"
          disabled={saving || !automation.needsReminder}
          onClick={onLogReminder}
        >
          تسجيل التذكير
        </Button>
        <Button
          type="button"
          size="sm"
          variant={automation.needsUrgentEscalation ? "default" : "outline"}
          className={cn(
            "h-9 rounded-lg px-4 text-[13px] font-black shadow-sm",
            automation.needsUrgentEscalation
              ? "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200"
              : "border-primary/20 bg-white"
          )}
          disabled={saving || (!automation.needsEscalation && !automation.needsUrgentEscalation)}
          onClick={onLogEscalation}
        >
          تسجيل التصعيد
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 mt-3">
        <div className="rounded-lg border-border/40 bg-white p-3 shadow-sm dark:bg-card">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
            آخر تذكير مسجل
          </p>
          <p className="mt-1 text-xs font-bold text-foreground/80">
            {formatDateTime(followUp.lastReminderSentAt)}
          </p>
        </div>
        <div className="rounded-lg border-border/40 bg-white p-3 shadow-sm dark:bg-card">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
            آخر تصعيد مسجل
          </p>
          <p className="mt-1 text-xs font-bold text-foreground/80">
            {formatDateTime(followUp.lastEscalatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
};
