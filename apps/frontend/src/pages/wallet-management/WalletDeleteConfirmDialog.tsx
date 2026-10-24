import React from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type WalletNumberRecord } from "./types";

interface WalletDeleteConfirmDialogProps {
  wallet: WalletNumberRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  deleting: boolean;
}

export const WalletDeleteConfirmDialog: React.FC<WalletDeleteConfirmDialogProps> = ({
  wallet,
  open,
  onOpenChange,
  onConfirm,
  deleting,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2 className="size-5" />
          </AlertDialogMedia>
          <AlertDialogTitle>حذف المحفظة</AlertDialogTitle>
          <AlertDialogDescription>
            {wallet
              ? `سيتم حذف ${wallet.name} نهائيًا من قائمة المحافظ المعتمدة.`
              : "سيتم حذف هذه المحفظة نهائيًا."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleting}
            onClick={onConfirm}
          >
            {deleting ? <Loader2 className="size-4 animate-spin" /> : null}
            تأكيد الحذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
