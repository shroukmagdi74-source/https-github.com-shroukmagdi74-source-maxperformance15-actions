import React from "react";
import { AlertCircle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

interface PermissionRejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  onConfirmReject: () => void;
}

export const PermissionRejectDialog: React.FC<PermissionRejectDialogProps> = ({
  open,
  onOpenChange,
  rejectionReason,
  setRejectionReason,
  onConfirmReject,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[400px] rounded-2xl bg-white dark:bg-gray-950 p-4 sm:p-6">
        <DialogHeader className="text-right">
          <div className="mx-auto bg-red-100 dark:bg-red-900/20 p-2.5 sm:p-3 rounded-full w-fit mb-3 sm:mb-4">
            <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle className="text-center font-bold text-lg sm:text-xl">
            {t("employee.permissions.rejectDialogTitle")}
          </DialogTitle>
          <DialogDescription className="text-center text-xs sm:text-sm">
            {t("employee.permissions.rejectDialogDesc")}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Textarea
            placeholder={t("employee.permissions.rejectPlaceholder")}
            className="text-right h-28 sm:h-32 rounded-xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-xs sm:text-sm"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </div>
        <DialogFooter className="flex-row-reverse gap-2 sm:gap-3 mt-3 sm:mt-4">
          <Button
            variant="destructive"
            className="flex-1 h-10 sm:h-11 rounded-xl text-xs sm:text-sm"
            onClick={onConfirmReject}
          >
            {t("employee.permissions.confirmReject")}
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-10 sm:h-11 rounded-xl text-xs sm:text-sm"
            onClick={() => onOpenChange(false)}
          >
            {t("employee.permissions.backButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
