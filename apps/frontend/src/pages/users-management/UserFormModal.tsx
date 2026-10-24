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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  type RoleRecord,
  type UserRecord,
  type UserFormState,
  type UserFormErrors,
} from "./types";
import { UserFormAccountSection } from "./UserFormAccountSection";
import { UserFormHrSection } from "./UserFormHrSection";

interface UserFormModalProps {
  open: boolean;
  editorMode: "create" | "edit" | null;
  editingUser: UserRecord | null;
  userForm: UserFormState;
  formErrors: UserFormErrors;
  showPassword: boolean;
  onShowPasswordToggle: () => void;
  onUpdateForm: (field: keyof UserFormState, value: string | boolean | string[]) => void;
  onClose: () => void;
  onSave: () => void;
  submitting: boolean;
  roles: RoleRecord;
  departments: Array<{ id: string; name: string; color?: string | null }>;
  positions: Array<{ id: string; title: string }>;
  companyApps: Array<{ slug: string; label: string }>;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  open,
  editorMode,
  editingUser,
  userForm,
  formErrors,
  showPassword,
  onShowPasswordToggle,
  onUpdateForm,
  onClose,
  onSave,
  submitting,
  roles,
  departments,
  positions,
  companyApps,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (!isOpen ? onClose() : undefined)}>
      <DialogContent className="max-w-[calc(100%-1.5rem)] gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-border/70 px-5 py-4">
          <DialogTitle>
            {editorMode === "edit"
              ? t("users.editUser", "تعديل المستخدم")
              : t("users.addNewUser", "إضافة مستخدم جديد")}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {editorMode === "edit"
              ? "حدّث بيانات الحساب وملف الموظف من نفس النافذة."
              : "أضف مستخدمًا جديدًا مع بيانات الحساب والموارد البشرية في خطوة واحدة."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[72vh]">
          <div className="space-y-6 px-5 py-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="user-first-name">{t("users.form.firstName", "الاسم الأول")}</Label>
                <Input
                  id="user-first-name"
                  value={userForm.firstName}
                  onChange={(e) => onUpdateForm("firstName", e.target.value)}
                  className="h-10 rounded-xl"
                  maxLength={50}
                />
                {formErrors.firstName ? (
                  <p className="text-xs text-destructive">{formErrors.firstName}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-last-name">{t("users.form.lastName", "اسم العائلة")}</Label>
                <Input
                  id="user-last-name"
                  value={userForm.lastName}
                  onChange={(e) => onUpdateForm("lastName", e.target.value)}
                  className="h-10 rounded-xl"
                  maxLength={50}
                />
                {formErrors.lastName ? (
                  <p className="text-xs text-destructive">{formErrors.lastName}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-email">{t("users.form.email", "البريد الإلكتروني")}</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => onUpdateForm("email", e.target.value)}
                  className="h-10 rounded-xl font-mono"
                  maxLength={100}
                />
                {formErrors.email ? (
                  <p className="text-xs text-destructive">{formErrors.email}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-password">
                  {editorMode === "edit"
                    ? t("users.form.passwordEdit", "كلمة المرور الجديدة (اختياري)")
                    : t("users.form.password", "كلمة المرور")}
                </Label>
                <div className="relative">
                  <Input
                    id="user-password"
                    type={showPassword ? "text" : "password"}
                    value={userForm.password}
                    onChange={(e) => onUpdateForm("password", e.target.value)}
                    className="h-10 rounded-xl pl-10"
                    maxLength={128}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-1/2 left-1 -translate-y-1/2"
                    onClick={onShowPasswordToggle}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <Eye className="size-4" />
                  </Button>
                </div>
                {formErrors.password ? (
                  <p className="text-xs text-destructive">{formErrors.password}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-phone">{t("users.form.phone", "الهاتف")}</Label>
                <Input
                  id="user-phone"
                  value={userForm.phone}
                  onChange={(e) => onUpdateForm("phone", e.target.value)}
                  className="h-10 rounded-xl font-mono"
                  placeholder="+20 1xx xxx xxxx"
                />
                {formErrors.phone ? (
                  <p className="text-xs text-destructive">{formErrors.phone}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>{t("users.form.role", "الدور الوظيفي")}</Label>
                <Select
                  value={userForm.role}
                  onValueChange={(val) => {
                    const nextVal = val || "AGENT";
                    if (nextVal !== userForm.role) {
                      onUpdateForm("role", nextVal);
                    }
                  }}
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
                {formErrors.role ? (
                  <p className="text-xs text-destructive">{formErrors.role}</p>
                ) : null}
              </div>
            </div>

            {editorMode === "edit" ? (
              <UserFormAccountSection
                defaultPage={userForm.defaultPage}
                onDefaultPageChange={(val) => onUpdateForm("defaultPage", val)}
                assignedApps={userForm.assignedApps}
                onAssignedAppsChange={(val) => onUpdateForm("assignedApps", val)}
                companyApps={companyApps}
              />
            ) : null}

            <UserFormHrSection
              userForm={userForm}
              formErrors={formErrors}
              onUpdateForm={onUpdateForm}
              departments={departments}
              positions={positions}
              editingUser={editingUser}
            />
          </div>
        </ScrollArea>

        <DialogFooter className="border-t border-border/70 p-3 bg-muted/20">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            {t("users.actions.cancel", "إلغاء")}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onSave}
            disabled={submitting}
            className="gap-1.5"
          >
            {submitting ? <Loader2 className="size-3.5 animate-spin" /> : null}
            {submitting
              ? t("users.actions.saving", "جاري الحفظ…")
              : editorMode === "edit"
                ? t("users.actions.update", "تحديث البيانات")
                : t("users.actions.create", "إنشاء الحساب")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
