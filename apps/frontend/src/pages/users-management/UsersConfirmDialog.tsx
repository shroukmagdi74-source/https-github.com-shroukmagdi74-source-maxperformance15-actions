import React from "react";
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
import { KeyRound, Loader2, Mail, Trash2 } from "lucide-react";
import type { PendingAction } from "./types";

interface UsersConfirmDialogProps {
  pendingAction: PendingAction;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  actionLoading: boolean;
}

export const UsersConfirmDialog: React.FC<UsersConfirmDialogProps> = ({
  pendingAction,
  onOpenChange,
  onConfirm,
  actionLoading,
}) => {
  if (!pendingAction) return null;

  const currentActionTitle = (() => {
    switch (pendingAction.kind) {
      case "delete-user":
        return "تأكيد حذف المستخدم";
      case "bulk-delete":
        return "حذف المستخدمين المحددين";
      case "cancel-invitation":
        return "إلغاء الدعوة";
      case "reset-password":
        return "إعادة تعيين كلمة المرور";
    }
  })();

  const currentActionDescription = (() => {
    switch (pendingAction.kind) {
      case "delete-user":
        return `سيتم حذف ${pendingAction.user.firstName} ${pendingAction.user.lastName} نهائيًا من الشركة.`;
      case "bulk-delete":
        return `سيتم حذف ${pendingAction.count} مستخدم من القائمة الحالية.`;
      case "cancel-invitation":
        return `سيتم إلغاء الدعوة المرسلة إلى ${pendingAction.invitation.email}.`;
      case "reset-password":
        return `سيتم إرسال رابط إعادة تعيين كلمة المرور إلى ${pendingAction.user.email}.`;
    }
  })();

  return (
    <AlertDialog
      open={pendingAction !== null}
      onOpenChange={(open) => (!open ? onOpenChange(false) : undefined)}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            {pendingAction.kind === "reset-password" ? (
              <KeyRound className="size-5" />
            ) : pendingAction.kind === "cancel-invitation" ? (
              <Mail className="size-5" />
            ) : (
              <Trash2 className="size-5" />
            )}
          </AlertDialogMedia>
          <AlertDialogTitle>{currentActionTitle}</AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            {currentActionDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={actionLoading}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            variant={
              pendingAction.kind === "reset-password" ? "default" : "destructive"
            }
            disabled={actionLoading}
            onClick={onConfirm}
            className="gap-1.5"
          >
            {actionLoading ? <Loader2 className="size-3.5 animate-spin" /> : null}
            تأكيد
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
