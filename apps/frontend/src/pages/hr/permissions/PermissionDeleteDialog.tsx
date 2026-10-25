import React from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PermissionDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submitting: boolean;
  onConfirmDelete: () => void;
  onCancel: () => void;
}

export const PermissionDeleteDialog: React.FC<PermissionDeleteDialogProps> = ({
  open,
  onOpenChange,
  submitting,
  onConfirmDelete,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[400px] rounded-2xl bg-white dark:bg-gray-950 p-4 sm:p-6">
        <DialogHeader className="text-right">
          <div className="mx-auto bg-red-100 dark:bg-red-900/20 p-2.5 sm:p-3 rounded-full w-fit mb-3 sm:mb-4">
            <Trash2 className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle className="text-center font-bold text-lg sm:text-xl">
            {t("employee.permissions.deleteTitle")}
          </DialogTitle>
          <DialogDescription className="text-center text-xs sm:text-sm">
            {t("employee.permissions.deleteConfirm")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row-reverse gap-2 sm:gap-3 mt-3 sm:mt-4">
          <Button
            variant="destructive"
            className="flex-1 h-10 sm:h-11 rounded-xl font-bold text-xs sm:text-sm"
            onClick={onConfirmDelete}
            disabled={submitting}
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("employee.permissions.deleting")}</span>
              </div>
            ) : (
              t("employee.permissions.confirmDelete")
            )}
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-10 sm:h-11 rounded-xl text-xs sm:text-sm"
            onClick={onCancel}
            disabled={submitting}
          >
            {t("employee.permissions.cancelDelete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
