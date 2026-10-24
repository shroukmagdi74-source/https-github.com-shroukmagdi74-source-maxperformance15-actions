import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Department } from "./types";

interface DepartmentDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDepartment: Department | null;
  onDelete: () => void;
}

export const DepartmentDeleteDialog: React.FC<DepartmentDeleteDialogProps> = ({
  open,
  onOpenChange,
  selectedDepartment,
  onDelete,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">
            تأكيد الحذف
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="py-4 text-gray-700 dark:text-gray-300">
          هل أنت متأكد من حذف قسم "{selectedDepartment?.name}"؟
          {selectedDepartment?._count.users &&
            selectedDepartment._count.users > 0 && (
              <span className="block text-red-500 text-sm mt-2 font-mono tabular-nums">
                ⚠️ هذا القسم يحتوي على {selectedDepartment._count.users} موظف
              </span>
            )}
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            حذف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
