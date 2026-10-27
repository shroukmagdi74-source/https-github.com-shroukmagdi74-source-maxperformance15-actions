import React from "react";
import { Plus, BarChart3, Pencil, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { KeyResult } from "./types";

interface DevGoalKeyResultsTabProps {
  keyResults: KeyResult[];
  onOpenNewKRModal: () => void;
  onOpenEditKRModal: (kr: KeyResult) => void;
  onDeleteKR: (krId: string) => void;
}

export const DevGoalKeyResultsTab: React.FC<DevGoalKeyResultsTabProps> = ({
  keyResults,
  onOpenNewKRModal,
  onOpenEditKRModal,
  onDeleteKR,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          النتائج القابلة للقياس التي تحدد نجاح هذا الهدف
        </span>
        <Button
          onClick={onOpenNewKRModal}
          size="sm"
          className="h-8 text-xs font-medium gap-1.5 shadow-2xs cursor-pointer"
        >
          <Plus className="size-3.5" />
          <span>نتيجة رئيسية جديدة</span>
        </Button>
      </div>

      {keyResults.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-border/80 rounded-lg">
          <BarChart3 className="size-8 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">
            لا توجد نتائج رئيسية مضافة بعد
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/60 border border-border/60 rounded-lg overflow-hidden">
          {keyResults.map((kr) => {
            const krProgress =
              kr.targetValue > 0
                ? Math.min((kr.currentValue / kr.targetValue) * 100, 100)
                : 0;

            return (
              <div
                key={kr.id}
                className="p-3.5 bg-card hover:bg-muted/20 transition-colors flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-xs text-foreground truncate">
                      {kr.title}
                    </h4>
                    <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.2 rounded border border-border/40">
                      وزن: {kr.weight}
                    </span>
                  </div>
                  {kr.description && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                      {kr.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-36">
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-muted-foreground tabular-nums">
                        {kr.currentValue}/{kr.targetValue}
                        {kr.unit ? ` ${kr.unit}` : ""}
                      </span>
                      <span className="font-bold text-foreground tabular-nums">
                        {Math.round(krProgress)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          krProgress >= 80
                            ? "bg-emerald-500"
                            : krProgress >= 50
                            ? "bg-primary"
                            : "bg-amber-500"
                        }`}
                        style={{ width: `${krProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onOpenEditKRModal(kr)}
                      className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                      title="تعديل"
                    >
                      <Pencil className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteKR(kr.id)}
                      className="size-7 text-muted-foreground hover:text-destructive cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
