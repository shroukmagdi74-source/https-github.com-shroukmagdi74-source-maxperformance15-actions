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
import { type UserRecord } from "./types";

interface SuperAdminUserDeleteDialogProps {
  user: UserRecord | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const SuperAdminUserDeleteDialog: React.FC<SuperAdminUserDeleteDialogProps> = ({
  user,
  deleting,
  onClose,
  onConfirm,
}) => {
  return (
    <AlertDialog open={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2 className="size-5" />
          </AlertDialogMedia>
          <AlertDialogTitle>حذف المستخدم</AlertDialogTitle>
          <AlertDialogDescription>
            {user
              ? `سيتم حذف ${user.firstName} ${user.lastName} نهائيًا من لوحة السوبر أدمن.`
              : "سيتم حذف المستخدم نهائيًا."}
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
