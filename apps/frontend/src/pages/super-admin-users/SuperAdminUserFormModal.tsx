import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  type AvailabilityValue,
  type UserFormErrors,
  type UserFormState,
  AVAILABILITY_OPTIONS,
  getRoleLabel,
} from "./types";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}) => (
  <div className={cn("space-y-2", className)}>
    <Label htmlFor={htmlFor}>{label}</Label>
    {children}
    {error ? (
      <p className="text-xs text-destructive">{error}</p>
    ) : hint ? (
      <p className="text-xs text-muted-foreground">{hint}</p>
    ) : null}
  </div>
);

interface SuperAdminUserFormModalProps {
  open: boolean;
  editorMode: "create" | "edit" | null;
  formData: UserFormState;
  formErrors: UserFormErrors;
  availableRoles: string[];
  rolesLoading: boolean;
  submitting: boolean;
  onClose: () => void;
  onUpdateForm: <Key extends keyof UserFormState>(
    field: Key,
    value: UserFormState[Key],
  ) => void;
  onSubmit: () => void;
}

export const SuperAdminUserFormModal: React.FC<SuperAdminUserFormModalProps> = ({
  open,
  editorMode,
  formData,
  formErrors,
  availableRoles,
  rolesLoading,
  submitting,
  onClose,
  onUpdateForm,
  onSubmit,
}) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {editorMode === "edit" ? "تعديل مستخدم" : "إضافة مستخدم جديد"}
          </DialogTitle>
          <DialogDescription>
            أنشئ أو عدّل الحساب الإداري مع الحفاظ على نفس الـ API الحالية.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="الاسم الأول"
            htmlFor="super-admin-user-first-name"
            error={formErrors.firstName}
          >
            <Input
              id="super-admin-user-first-name"
              value={formData.firstName}
              onChange={(event) => onUpdateForm("firstName", event.target.value)}
              className="h-11 rounded-2xl"
              maxLength={50}
            />
          </FormField>

          <FormField
            label="الاسم الأخير"
            htmlFor="super-admin-user-last-name"
            error={formErrors.lastName}
          >
            <Input
              id="super-admin-user-last-name"
              value={formData.lastName}
              onChange={(event) => onUpdateForm("lastName", event.target.value)}
              className="h-11 rounded-2xl"
              maxLength={50}
            />
          </FormField>

          <FormField
            label="البريد الإلكتروني"
            htmlFor="super-admin-user-email"
            error={formErrors.email}
            className="md:col-span-2"
          >
            <Input
              id="super-admin-user-email"
              type="email"
              value={formData.email}
              onChange={(event) => onUpdateForm("email", event.target.value)}
              className="h-11 rounded-2xl font-mono"
              maxLength={120}
            />
          </FormField>

          <FormField
            label={editorMode === "edit" ? "كلمة المرور الجديدة" : "كلمة المرور"}
            htmlFor="super-admin-user-password"
            error={formErrors.password}
            hint={
              editorMode === "edit"
                ? "اترك الحقل فارغًا إذا لم ترد تغيير كلمة المرور."
                : "8 أحرف على الأقل."
            }
          >
            <Input
              id="super-admin-user-password"
              type="password"
              value={formData.password}
              onChange={(event) => onUpdateForm("password", event.target.value)}
              className="h-11 rounded-2xl font-mono"
              maxLength={128}
            />
          </FormField>

          <FormField label="الدور" error={formErrors.role}>
            <Select
              name="super-admin-user-role"
              value={formData.role || null}
              onValueChange={(value) => onUpdateForm("role", value || "")}
            >
              <SelectLabel className="sr-only">الدور</SelectLabel>
              <SelectTrigger aria-label="الدور" className="h-11 rounded-2xl">
                <SelectValue
                  placeholder={rolesLoading ? "جاري تحميل الأدوار..." : "اختر الدور"}
                />
              </SelectTrigger>
              <SelectContent align="end">
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {getRoleLabel(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="الهاتف"
            htmlFor="super-admin-user-phone"
            error={formErrors.phone}
          >
            <Input
              id="super-admin-user-phone"
              value={formData.phone}
              onChange={(event) => onUpdateForm("phone", event.target.value)}
              className="h-11 rounded-2xl font-mono tabular-nums"
              placeholder="+20 1xx xxx xxxx"
            />
          </FormField>

          <FormField label="القسم" htmlFor="super-admin-user-department">
            <Input
              id="super-admin-user-department"
              value={formData.department}
              onChange={(event) => onUpdateForm("department", event.target.value)}
              className="h-11 rounded-2xl"
              placeholder="مثال: Platform Ops"
            />
          </FormField>

          <FormField label="الحالة التشغيلية">
            <Select
              name="super-admin-user-availability"
              value={formData.availability}
              onValueChange={(value) =>
                onUpdateForm("availability", (value as AvailabilityValue) || "available")
              }
            >
              <SelectLabel className="sr-only">الحالة التشغيلية</SelectLabel>
              <SelectTrigger aria-label="الحالة التشغيلية" className="h-11 rounded-2xl">
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent align="end">
                {AVAILABILITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="المهارات"
            htmlFor="super-admin-user-skills"
            hint="اكتب المهارات مفصولة بفواصل إذا احتجت."
            className="md:col-span-2"
          >
            <Input
              id="super-admin-user-skills"
              value={formData.skills}
              onChange={(event) => onUpdateForm("skills", event.target.value)}
              className="h-11 rounded-2xl"
              placeholder="React, Node.js, Security"
            />
          </FormField>

          <FormField label="تفعيل الحساب" className="md:col-span-2">
            <div className="flex min-h-12 items-center justify-between rounded-2xl border border-border bg-background px-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  السماح بتسجيل الدخول
                </p>
                <p className="text-xs text-muted-foreground">
                  أغلق المفتاح لتعطيل الحساب دون حذفه.
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => onUpdateForm("isActive", Boolean(checked))}
                aria-label="تفعيل المستخدم"
              />
            </div>
          </FormField>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-2xl"
          >
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            className="rounded-2xl"
            disabled={submitting}
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {editorMode === "edit" ? "حفظ التعديلات" : "إنشاء المستخدم"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
