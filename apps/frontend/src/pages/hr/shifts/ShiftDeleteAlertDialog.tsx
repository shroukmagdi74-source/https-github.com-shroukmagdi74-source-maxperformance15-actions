import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";

interface ShiftDeleteAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isBulk: boolean;
  bulkCount: number;
  onConfirmDelete: () => void;
}

export const ShiftDeleteAlertDialog: React.FC<ShiftDeleteAlertDialogProps> = ({
  open,
  onOpenChange,
  isBulk,
  bulkCount,
  onConfirmDelete,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
          <AlertDialogDescription>
            {isBulk
              ? `سيتم حذف ${bulkCount} مناوبة. لا يمكن التراجع عن هذا الإجراء.`
              : "سيتم حذف هذه المناوبة بشكل نهائي. لا يمكن التراجع عن هذا الإجراء."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmDelete}
            className="bg-red-500 hover:bg-red-600 text-white font-bold"
          >
            حذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
