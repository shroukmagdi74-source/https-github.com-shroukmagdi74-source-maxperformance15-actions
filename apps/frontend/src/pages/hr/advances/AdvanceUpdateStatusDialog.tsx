import React from "react";
import { Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";

interface AdvanceUpdateStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (status: "APPROVED" | "REJECTED") => void;
}

export const AdvanceUpdateStatusDialog: React.FC<
  AdvanceUpdateStatusDialogProps
> = ({ open, onOpenChange, onUpdateStatus }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل حالة السلفة</DialogTitle>
          <DialogDescription>
            يمكنك تغيير الحالة الحالية للسلفة. يرجى توخي الحذر عند تغيير
            الحالات المعتمدة مسبقاً.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row gap-3 justify-center py-5">
          <Button
            type="button"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            onClick={() => onUpdateStatus("APPROVED")}
          >
            <Check className="h-4 w-4 ml-2" />
            <span>اعتماد السلفة</span>
          </Button>
          <Button
            type="button"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
            onClick={() => onUpdateStatus("REJECTED")}
          >
            <X className="h-4 w-4 ml-2" />
            <span>رفض السلفة</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
