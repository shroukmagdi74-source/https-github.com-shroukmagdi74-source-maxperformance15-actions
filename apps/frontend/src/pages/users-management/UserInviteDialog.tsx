import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, MailPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { InviteFormState, InviteFormErrors, RoleRecord } from "./types";

interface UserInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inviteForm: InviteFormState;
  onInviteFormChange: React.Dispatch<React.SetStateAction<InviteFormState>>;
  inviteErrors: InviteFormErrors;
  onSendInvitation: () => void;
  inviteSubmitting: boolean;
  roles: RoleRecord;
}

export const UserInviteDialog: React.FC<UserInviteDialogProps> = ({
  open,
  onOpenChange,
  inviteForm,
  onInviteFormChange,
  inviteErrors,
  onSendInvitation,
  inviteSubmitting,
  roles,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-1.5rem)] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("users.inviteNewUser", "دعوة مستخدم جديد")}</DialogTitle>
          <DialogDescription className="text-xs">
            أرسل دعوة مباشرة بالبريد الإلكتروني بدل إنشاء كلمة مرور يدويًا.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2 py-2">
          <div className="space-y-2">
            <Label htmlFor="invite-first-name">{t("users.form.firstName", "الاسم الأول")}</Label>
            <Input
              id="invite-first-name"
              value={inviteForm.firstName}
              onChange={(e) =>
                onInviteFormChange((prev) => ({ ...prev, firstName: e.target.value }))
              }
              className="h-10 rounded-xl"
            />
            {inviteErrors.firstName ? (
              <p className="text-xs text-destructive">{inviteErrors.firstName}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-last-name">{t("users.form.lastName", "اسم العائلة")}</Label>
            <Input
              id="invite-last-name"
              value={inviteForm.lastName}
              onChange={(e) =>
                onInviteFormChange((prev) => ({ ...prev, lastName: e.target.value }))
              }
              className="h-10 rounded-xl"
            />
            {inviteErrors.lastName ? (
              <p className="text-xs text-destructive">{inviteErrors.lastName}</p>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="invite-email">{t("users.form.email", "البريد الإلكتروني")}</Label>
            <Input
              id="invite-email"
              type="email"
              value={inviteForm.email}
              onChange={(e) =>
                onInviteFormChange((prev) => ({ ...prev, email: e.target.value }))
              }
              className="h-10 rounded-xl font-mono"
            />
            {inviteErrors.email ? (
              <p className="text-xs text-destructive">{inviteErrors.email}</p>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>{t("users.form.role", "الدور الوظيفي")}</Label>
            <Select
              value={inviteForm.role}
              onValueChange={(val) =>
                onInviteFormChange((prev) => ({ ...prev, role: val || "AGENT" }))
              }
            >
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder={t("users.form.role", "اختر الدور")} />
              </SelectTrigger>
              <SelectContent align="end">
                {Object.entries(roles).map(([roleKey, roleData]) => (
                  <SelectItem key={roleKey} value={roleKey}>
                    {roleData.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {inviteErrors.role ? (
              <p className="text-xs text-destructive">{inviteErrors.role}</p>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            {t("users.actions.cancel", "إلغاء")}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onSendInvitation}
            disabled={inviteSubmitting}
            className="gap-1.5"
          >
            {inviteSubmitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <MailPlus className="size-3.5" />
            )}
            {inviteSubmitting
              ? t("users.actions.saving", "جاري الإرسال…")
              : t("users.actions.sendInvite", "إرسال الدعوة")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
