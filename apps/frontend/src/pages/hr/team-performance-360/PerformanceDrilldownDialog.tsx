import React from "react";
import { FileText, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { getScoreColor } from "./helpers";
import type { LeaderboardEmployee } from "./types";

interface PerformanceDrilldownDialogProps {
  employee: LeaderboardEmployee | null;
  onClose: () => void;
}

export const PerformanceDrilldownDialog: React.FC<
  PerformanceDrilldownDialogProps
> = ({ employee, onClose }) => {
  return (
    <Dialog
      open={Boolean(employee)}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground text-base">
            <FileText className="h-5 w-5 text-primary" />
            <span>سجل التدقيق والمطابقة التشغيلية الشامل</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            تفاصيل الوقائع وسجلات المهام والبصمة للموظف:{" "}
            <strong>{employee?.name}</strong>
          </DialogDescription>
        </DialogHeader>

        {employee && (
          <div className="space-y-4 py-2 text-xs">
            {/* Employee Overview Card */}
            <div className="p-3 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-foreground">
                  {employee.name}
                </div>
                <div className="text-muted-foreground text-xs mt-0.5">
                  {employee.positionTitle} • {employee.departmentName}
                </div>
              </div>
              <div className="text-left">
                <div
                  className={`text-xl font-black font-mono tabular-nums ${getScoreColor(
                    employee.compositeScore,
                    employee.isEvaluated,
                  )}`}
                >
                  {employee.isEvaluated
                    ? `${employee.compositeScore} / 100`
                    : "قيد التقييم"}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {employee.tierLabel}
                </div>
              </div>
            </div>

            {/* 5 Pillars with Dynamic Weights */}
            <div>
              <div className="font-bold text-foreground mb-2">
                المحاور الخمسة وتوزيع الأوزان الفعلي:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(employee.pillars).map(([k, p]) => (
                  <div
                    key={k}
                    className="p-2.5 rounded bg-card border border-border/50 flex flex-col justify-between gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {p.label || k}
                      </span>
                      <span className="text-[10px] font-mono tabular-nums text-muted-foreground">
                        الوزن: {p.weight}%
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="font-bold text-sm text-primary font-mono tabular-nums">
                        {p.isApplicable !== false
                          ? `${p.score} / 100`
                          : "غير متاح"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {p.details}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Telemetry Numbers Breakdown */}
            <div>
              <div className="font-bold text-foreground mb-2">
                ملخص الدوام وإنجاز المهام:
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-[10px] text-muted-foreground">
                    حضور فعلي
                  </div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                    {employee.telemetryStats.presentDays ?? 0} يوم
                  </div>
                </div>
                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                  <div className="text-[10px] text-muted-foreground">
                    تأخير صباحي
                  </div>
                  <div className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                    {employee.telemetryStats.lateDays ?? 0} يوم
                  </div>
                </div>
                <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20">
                  <div className="text-[10px] text-muted-foreground">
                    غياب غير مبرر
                  </div>
                  <div className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
                    {employee.telemetryStats.absentDays ?? 0} يوم
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Flags if any */}
            {employee.riskFlags.length > 0 && (
              <div>
                <div className="font-bold text-rose-500 mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>ملاحظات تشغيلية حرجة:</span>
                </div>
                <div className="space-y-1">
                  {employee.riskFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs"
                    >
                      • {flag}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button size="sm" onClick={onClose} className="text-xs">
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
