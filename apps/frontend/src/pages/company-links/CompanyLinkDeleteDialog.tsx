import React from "react";
import { useTranslation } from "react-i18next";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { CompanyLink } from "./types";

interface CompanyLinkDeleteDialogProps {
  linkPendingDelete: CompanyLink | null;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

export const CompanyLinkDeleteDialog: React.FC<CompanyLinkDeleteDialogProps> = ({
  linkPendingDelete,
  onOpenChange,
  onConfirmDelete,
}) => {
  const { t } = useTranslation();

  return (
    <AlertDialog
      open={Boolean(linkPendingDelete)}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("companyLinks.deleteConfirm")}</AlertDialogTitle>
          <AlertDialogDescription>
            سيتم حذف الرابط
            {linkPendingDelete ? ` "${linkPendingDelete.name}" ` : " "}
            بشكل نهائي من قائمة الشركة.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            className="bg-rose-600 hover:bg-rose-700"
            onClick={onConfirmDelete}
          >
            {t("common.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
