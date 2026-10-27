import React from "react";
import { Badge } from "../../../components/ui/badge";
import { formatDateTime } from "../utils";
import type { FollowUpState } from "../types";

interface FollowUpHistoryListProps {
  history: FollowUpState["history"];
}

export const FollowUpHistoryList: React.FC<FollowUpHistoryListProps> = ({ history }) => {
  if (!history?.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h4 className="text-sm font-black text-foreground">سجل نشاط المتابعة</h4>
        <Badge variant="secondary" className="rounded-full bg-muted/40 px-3 py-1 text-xs font-black">
          {history.length} سجل
        </Badge>
      </div>
      <div className="space-y-3">
        {history.slice(0, 4).map((entry) => (
          <div
            key={entry.id}
            className="rounded-lg border border-border/60 bg-white p-4 shadow-sm dark:bg-card"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge variant="outline" className="rounded-full border-border/60 px-2.5 py-0.5 text-xs font-black">
                {entry.status}
              </Badge>
              <p className="text-xs font-bold text-muted-foreground/70">
                {formatDateTime(entry.occurredAt)}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="size-2 rounded-full bg-primary/40" />
              <p className="text-xs font-black text-foreground">
                {entry.actor?.label || "عضو الفريق"}
              </p>
            </div>
            <div className="mt-2 space-y-1">
              {entry.assignedOwner?.label ? (
                <p className="text-[13px] font-bold text-muted-foreground/80">
                  المسؤول: {entry.assignedOwner.label}
                </p>
              ) : null}
              {entry.nextActionAt ? (
                <p className="text-[13px] font-bold text-muted-foreground/80">
                  المتابعة القادمة: {formatDateTime(entry.nextActionAt)}
                </p>
              ) : null}
            </div>
            {entry.note ? (
              <p className="mt-3 rounded-xl bg-muted/20 p-3 text-[13px] font-medium leading-relaxed text-muted-foreground/90">
                {entry.note}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};
