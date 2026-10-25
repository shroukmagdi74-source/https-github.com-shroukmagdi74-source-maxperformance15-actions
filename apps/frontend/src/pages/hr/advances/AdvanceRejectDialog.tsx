import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";

interface AdvanceRejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rejectionReason: string;
  onReasonChange: (reason: string) => void;
  onConfirmReject: () => void;
}

export const AdvanceRejectDialog: React.FC<AdvanceRejectDialogProps> = ({
  open,
  onOpenChange,
  rejectionReason,
  onReasonChange,
  onConfirmReject,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>رفض طلب السلفة</DialogTitle>
          <DialogDescription>
            الرجاء إدخال سبب الرفض ليتم إرساله للموظف.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="سبب الرفض..."
            value={rejectionReason}
            onChange={(e) => onReasonChange(e.target.value)}
            className="min-h-[100px] text-sm"
          />
        </div>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirmReject}
            className="font-bold"
          >
            تأكيد الرفض
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
