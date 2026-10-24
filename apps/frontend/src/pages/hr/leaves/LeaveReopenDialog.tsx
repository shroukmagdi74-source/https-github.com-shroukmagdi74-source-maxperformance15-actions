import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { LeaveRequest, leaveTypeConfig } from "./types";

interface LeaveReopenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: LeaveRequest | null;
  onConfirmReopen: () => void;
  t: (key: string, options?: any) => string;
}

export const LeaveReopenDialog: React.FC<LeaveReopenDialogProps> = ({
  open,
  onOpenChange,
  selectedRequest,
  onConfirmReopen,
  t,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("employee.leaves.reopenTitle")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="font-medium text-amber-800">
                {t("employee.leaves.reopenRejectedTitle")}
              </h3>
            </div>
            <p className="mt-2 text-amber-700 text-sm">
              {t("employee.leaves.reopenConfirm")}
            </p>
          </div>

          {selectedRequest && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">{t("employee.leaves.employee")}:</span>
                <span className="font-medium">
                  {selectedRequest.employee?.firstName}{" "}
                  {selectedRequest.employee?.lastName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">{t("employee.leaves.leaveType")}:</span>
                <span>
                  {leaveTypeConfig[selectedRequest.type]?.labelKey
                    ? t(leaveTypeConfig[selectedRequest.type].labelKey)
                    : selectedRequest.type}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">{t("employee.leaves.duration")}:</span>
                <span className="font-mono tabular-nums">
                  {selectedRequest.totalDays} {t("employee.leaves.day")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">{t("employee.leaves.rejectReasonLabel")}:</span>
                <span className="text-red-600">
                  {selectedRequest.rejectionReason}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t("employee.leaves.cancelButton")}
          </Button>
          <Button
            variant="default"
            onClick={onConfirmReopen}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {t("employee.leaves.reopenButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
