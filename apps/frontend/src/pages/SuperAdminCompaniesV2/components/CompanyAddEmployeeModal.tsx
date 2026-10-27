import React from "react";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { ResponsiveOverlay, FormField } from "./ResponsiveOverlay";
import type { Company, EmployeeFormData } from "../types";

interface CompanyAddEmployeeModalProps {
  isOpen: boolean;
  isMobile: boolean;
  company: Company | null;
  employeeForm: EmployeeFormData;
  employeeErrors: Record<string, string>;
  saving: boolean;
  onClose: () => void;
  onChangeForm: React.Dispatch<React.SetStateAction<EmployeeFormData>>;
  onSubmit: () => void;
}

export const CompanyAddEmployeeModal: React.FC<CompanyAddEmployeeModalProps> = ({
  isOpen,
  isMobile,
  company,
  employeeForm,
  employeeErrors,
  saving,
  onClose,
  onChangeForm,
  onSubmit,
}) => {
  return (
    <ResponsiveOverlay
      mobile={isMobile}
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      title={`إضافة موظف إلى ${company?.name || ""}`}
      bodyClassName="space-y-4"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-2xl"
            onClick={onClose}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            className="h-11 rounded-2xl"
            onClick={onSubmit}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin ml-2" />
            ) : (
              <UserPlus className="size-4 ml-2" />
            )}
            إضافة الموظف
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="الاسم الأول" error={employeeErrors.firstName} required>
          <input
            aria-label="الاسم الأول للموظف"
            name="employee-first-name"
            autoComplete="given-name"
            className="h-12 w-full rounded-lg border-border/60 bg-background px-5 text-sm font-bold shadow-sm transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
            value={employeeForm.firstName}
            onChange={(e) => onChangeForm((prev) => ({ ...prev, firstName: e.target.value }))}
          />
        </FormField>
        <FormField label="الاسم الأخير" error={employeeErrors.lastName} required>
          <input
            aria-label="الاسم الأخير للموظف"
            name="employee-last-name"
            autoComplete="family-name"
            className="h-12 w-full rounded-lg border-border/60 bg-background px-5 text-sm font-bold shadow-sm transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
            value={employeeForm.lastName}
            onChange={(e) => onChangeForm((prev) => ({ ...prev, lastName: e.target.value }))}
          />
        </FormField>
        <FormField label="البريد الإلكتروني" error={employeeErrors.email} required>
          <input
            aria-label="البريد الإلكتروني للموظف"
            name="employee-email"
            autoComplete="email"
            type="email"
            dir="ltr"
            className="h-12 w-full rounded-lg border-border/60 bg-background px-5 text-sm font-bold shadow-sm transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-right"
            value={employeeForm.email}
            onChange={(e) => onChangeForm((prev) => ({ ...prev, email: e.target.value }))}
          />
        </FormField>
        <FormField label="كلمة المرور" error={employeeErrors.password} required>
          <input
            aria-label="كلمة مرور للموظف"
            name="employee-password"
            autoComplete="new-password"
            type="password"
            dir="ltr"
            className="h-12 w-full rounded-lg border-border/60 bg-background px-5 text-sm font-bold shadow-sm transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-right"
            value={employeeForm.password}
            onChange={(e) => onChangeForm((prev) => ({ ...prev, password: e.target.value }))}
          />
        </FormField>
        <FormField label="الدور الوظيفي" required>
          <Select
            value={employeeForm.role}
            onValueChange={(v) => onChangeForm((prev) => ({ ...prev, role: v }))}
          >
            <SelectTrigger
              aria-label="الدور الوظيفي للموظف"
              className="h-12 w-full rounded-lg border-border/60 bg-background px-5 text-sm font-black shadow-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectItem value="COMPANY_ADMIN">مدير شركة (كامل الصلاحيات)</SelectItem>
              <SelectItem value="MANAGER">مدير قسم</SelectItem>
              <SelectItem value="AGENT">موظف عادي</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>
    </ResponsiveOverlay>
  );
};
