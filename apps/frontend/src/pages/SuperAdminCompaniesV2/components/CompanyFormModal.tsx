import React from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { ResponsiveOverlay, FormField } from "./ResponsiveOverlay";
import { CURRENCY_OPTIONS } from "../constants";
import type { CompanyFormData } from "../types";
import type { BusinessSpecialty } from "../../../services/businessSpecialtyService";

interface CompanyFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  isMobile: boolean;
  companyForm: CompanyFormData;
  companyFormErrors: Record<string, string>;
  specialties: BusinessSpecialty[];
  saving: boolean;
  onClose: () => void;
  onChangeForm: React.Dispatch<React.SetStateAction<CompanyFormData>>;
  onSave: () => void;
}

export const CompanyFormModal: React.FC<CompanyFormModalProps> = ({
  isOpen,
  mode,
  isMobile,
  companyForm,
  companyFormErrors,
  specialties,
  saving,
  onClose,
  onChangeForm,
  onSave,
}) => {
  return (
    <ResponsiveOverlay
      mobile={isMobile}
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      title={mode === "create" ? "إضافة شركة جديدة" : "تعديل الشركة"}
      description={
        mode === "create"
          ? "أنشئ الشركة وحساب المدير في خطوة واحدة."
          : "حدّث بيانات الشركة."
      }
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
            onClick={onSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin ml-2" />
            ) : (
              <CheckCircle2 className="size-4 ml-2" />
            )}
            {mode === "create" ? "إنشاء الشركة" : "حفظ التعديلات"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="اسم الشركة" error={companyFormErrors.name} required>
            <input
              aria-label="اسم الشركة"
              name="company-name"
              autoComplete="organization"
              className="h-12 w-full rounded-lg border-border/60 bg-background px-5 text-sm font-bold shadow-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
              value={companyForm.name}
              onChange={(e) => onChangeForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="شركة التقنية"
            />
          </FormField>

          <FormField label="البريد الإلكتروني" error={companyFormErrors.email} required>
            <input
              aria-label="البريد الإلكتروني للشركة"
              name="company-email"
              autoComplete="email"
              type="email"
              dir="ltr"
              className="h-12 w-full rounded-lg border-border/60 bg-background px-5 text-sm font-bold shadow-sm transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-right"
              value={companyForm.email}
              onChange={(e) => onChangeForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="company@example.com"
            />
          </FormField>

          <FormField label="الهاتف" error={companyFormErrors.phone}>
            <input
              aria-label="هاتف الشركة"
              name="company-phone"
              autoComplete="tel"
              dir="ltr"
              className="h-12 w-full rounded-lg border-border/60 bg-background px-5 text-sm font-bold shadow-sm transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-right"
              value={companyForm.phone}
              onChange={(e) => onChangeForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="01000000000"
            />
          </FormField>

          <FormField label="الموقع الإلكتروني" error={companyFormErrors.website}>
            <input
              aria-label="الموقع الإلكتروني للشركة"
              name="company-website"
              autoComplete="url"
              dir="ltr"
              className="h-12 w-full rounded-lg border-border/60 bg-background px-5 text-sm font-bold shadow-sm transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-right"
              value={companyForm.website}
              onChange={(e) => onChangeForm((prev) => ({ ...prev, website: e.target.value }))}
              placeholder="company.com"
            />
          </FormField>

          <FormField label="العملة" error={companyFormErrors.currency} required>
            <Select
              value={companyForm.currency}
              onValueChange={(v) => onChangeForm((prev) => ({ ...prev, currency: v }))}
            >
              <SelectTrigger aria-label="عملة الشركة" className="h-12 w-full rounded-lg border-border/60 bg-background px-5 text-sm font-black shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                {CURRENCY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label={
              mode === "create"
                ? "تخصص الشركة (تثبيت التطبيقات تلقائياً)"
                : "نوع الشركة / تخصص النشاط"
            }
          >
            <Select
              value={companyForm.businessSpecialtyId || "none"}
              onValueChange={(v) =>
                onChangeForm((prev) => ({
                  ...prev,
                  businessSpecialtyId: v === "none" ? "" : v,
                }))
              }
            >
              <SelectTrigger aria-label="تخصص الشركة" className="h-12 w-full rounded-lg border-border/60 bg-background px-5 text-sm font-black shadow-sm">
                <SelectValue placeholder="اختر مجال الشركة..." />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="none">بدون تخصص محدد (تخصيص عام)</SelectItem>
                {specialties.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nameAr || s.nameEn} ({s.appSlugs.length} تطبيق)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        {mode === "create" ? (
          <div className="space-y-5 rounded-lg border border-border/60 bg-muted/20 p-6 shadow-inner">
            <p className="text-[13px] font-black uppercase tracking-widest text-primary">
              بيانات مدير الشركة
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="الاسم الأول" error={companyFormErrors.adminFirstName} required>
                <input
                  aria-label="الاسم الأول لمدير الشركة"
                  name="admin-first-name"
                  autoComplete="given-name"
                  className="h-12 w-full rounded-lg border-border/60 bg-background px-5 text-sm font-bold shadow-sm transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                  value={companyForm.adminFirstName}
                  onChange={(e) =>
                    onChangeForm((prev) => ({ ...prev, adminFirstName: e.target.value }))
                  }
                />
              </FormField>

              <FormField label="الاسم الأخير" error={companyFormErrors.adminLastName} required>
                <input
                  aria-label="الاسم الأخير لمدير الشركة"
                  name="admin-last-name"
                  autoComplete="family-name"
                  className="h-12 w-full rounded-lg border-border/60 bg-background px-5 text-sm font-bold shadow-sm transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                  value={companyForm.adminLastName}
                  onChange={(e) =>
                    onChangeForm((prev) => ({ ...prev, adminLastName: e.target.value }))
                  }
                />
              </FormField>

              <FormField label="بريد المدير" error={companyFormErrors.adminEmail} required>
                <input
                  aria-label="بريد مدير الشركة"
                  name="admin-email"
                  autoComplete="email"
                  type="email"
                  dir="ltr"
                  className="h-12 w-full rounded-lg border-border/60 bg-background px-5 text-sm font-bold shadow-sm transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-right"
                  value={companyForm.adminEmail}
                  onChange={(e) =>
                    onChangeForm((prev) => ({ ...prev, adminEmail: e.target.value }))
                  }
                />
              </FormField>

              <FormField label="كلمة المرور" error={companyFormErrors.adminPassword} required>
                <input
                  aria-label="كلمة مرور مدير الشركة"
                  name="admin-password"
                  autoComplete="new-password"
                  type="password"
                  dir="ltr"
                  className="h-12 w-full rounded-lg border-border/60 bg-background px-5 text-sm font-bold shadow-sm transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-right"
                  value={companyForm.adminPassword}
                  onChange={(e) =>
                    onChangeForm((prev) => ({ ...prev, adminPassword: e.target.value }))
                  }
                />
              </FormField>
            </div>
          </div>
        ) : null}
      </div>
    </ResponsiveOverlay>
  );
};
