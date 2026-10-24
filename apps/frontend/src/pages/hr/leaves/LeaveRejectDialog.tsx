import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface LeaveRejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rejectionReason: string;
  onRejectionReasonChange: (reason: string) => void;
  onConfirmReject: () => void;
  t: (key: string, options?: any) => string;
}

export const LeaveRejectDialog: React.FC<LeaveRejectDialogProps> = ({
  open,
  onOpenChange,
  rejectionReason,
  onRejectionReasonChange,
  onConfirmReject,
  t,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("employee.leaves.rejectTitle")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p>{t("employee.leaves.rejectConfirm")}</p>
          <div className="space-y-2">
            <Label>{t("employee.leaves.rejectReasonLabel")}</Label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => onRejectionReasonChange(e.target.value)}
              placeholder={t("employee.leaves.rejectReasonPlaceholder")}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t("employee.leaves.cancelButton")}
          </Button>
          <Button variant="destructive" onClick={onConfirmReject}>
            {t("employee.leaves.rejectButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
