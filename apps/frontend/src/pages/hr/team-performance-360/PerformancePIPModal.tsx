import React from "react";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import type { LeaderboardEmployee } from "./types";

interface PerformancePIPModalProps {
  employee: LeaderboardEmployee | null;
  onClose: () => void;
  onConfirmPIP: (emp: LeaderboardEmployee) => void;
}

export const PerformancePIPModal: React.FC<PerformancePIPModalProps> = ({
  employee,
  onClose,
  onConfirmPIP,
}) => {
  return (
    <Dialog
      open={Boolean(employee)}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            <span>توليد خطة تحسين الأداء (PIP) المؤتمتة</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            توثيق رسمي آلي لملاحظات الأداء المستندة إلى وقائع البصمة وجودة المهام
            في النظام.
          </DialogDescription>
        </DialogHeader>

        {employee && (
          <div className="space-y-4 py-2 text-xs">
            <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
              <div className="font-bold text-sm text-foreground">
                {employee.name}
              </div>
              <div className="text-muted-foreground mt-0.5 font-mono">
                {employee.positionTitle} • {employee.departmentName} (الدرجة:{" "}
                <span className="tabular-nums font-bold">
                  {employee.compositeScore}
                </span>
                /100)
              </div>
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1.5">
                الوقائع المرصودة تلقائياً من النظام:
              </label>
              <div className="space-y-1.5">
                {employee.riskFlags.map((flag, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>{flag}</span>
                  </div>
                ))}
                {employee.riskFlags.length === 0 && (
                  <div className="text-muted-foreground">
                    تراجع عام في معدل إنجاز المهام المسندة.
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">
                فترة المهلة المقترحة:
              </label>
              <div className="p-2.5 rounded bg-muted/20 border border-border/40 font-mono text-muted-foreground">
                30 يوماً من تاريخ التوجيه (تنتهي في{" "}
                {new Date(Date.now() + 30 * 86400000).toLocaleDateString(
                  "ar-EG",
                )}
                )
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            إلغاء
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (employee) onConfirmPIP(employee);
            }}
            className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold"
          >
            اعتماد وإرسال الخطة للموظف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
