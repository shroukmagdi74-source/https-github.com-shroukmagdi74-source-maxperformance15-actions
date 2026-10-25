import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AttendanceDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

export const AttendanceDeleteDialog: React.FC<AttendanceDeleteDialogProps> = ({
  open,
  onOpenChange,
  onConfirmDelete,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-right">حذف سجل حضور</DialogTitle>
        </DialogHeader>
        <div className="py-6 text-right text-gray-600 dark:text-gray-300">
          هل أنت متأكد من حذف هذا السجل بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء.
        </div>
        <DialogFooter className="flex gap-3 justify-start rtl:flex-row-reverse">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button variant="destructive" onClick={onConfirmDelete}>
            تأكيد الحذف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
