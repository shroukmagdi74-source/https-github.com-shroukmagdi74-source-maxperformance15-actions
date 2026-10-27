import React from "react";
import { Plus, MessageSquare } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { CheckIn, confidenceConfig } from "./types";

interface DevGoalCheckInsTabProps {
  checkIns: CheckIn[];
  onOpenCheckInModal: () => void;
}

export const DevGoalCheckInsTab: React.FC<DevGoalCheckInsTabProps> = ({
  checkIns,
  onOpenCheckInModal,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          سجل التحديثات الدورية وملاحظات التقدم
        </span>
        <Button
          onClick={onOpenCheckInModal}
          size="sm"
          className="h-8 text-xs font-medium gap-1.5 shadow-2xs cursor-pointer"
        >
          <Plus className="size-3.5" />
          <span>مراجعة جديدة</span>
        </Button>
      </div>

      {checkIns.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-border/80 rounded-lg">
          <MessageSquare className="size-8 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">
            لا توجد مراجعات مسجلة بعد
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {checkIns.map((ci) => (
            <div
              key={ci.id}
              className="p-3.5 rounded-lg border border-border/60 bg-muted/10 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-bold">
                    {ci.member?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <span className="font-medium text-xs text-foreground block">
                      {ci.member?.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                      {new Date(ci.createdAt).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                </div>

                {ci.confidence && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-card border border-border/60 text-muted-foreground font-mono">
                    <span
                      className={`size-1.5 rounded-full ${
                        confidenceConfig[ci.confidence]?.dot || "bg-primary"
                      }`}
                    />
                    {confidenceConfig[ci.confidence]?.label || ci.confidence}
                  </span>
                )}
              </div>

              <p className="text-xs text-foreground leading-relaxed">
                {ci.content}
              </p>

              {ci.blockers && (
                <div className="p-2 rounded bg-destructive/5 border border-destructive/20 text-destructive text-[11px]">
                  <strong>معوقات:</strong> {ci.blockers}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
