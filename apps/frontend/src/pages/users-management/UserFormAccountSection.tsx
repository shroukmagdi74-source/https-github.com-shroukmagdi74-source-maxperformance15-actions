import React from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DefaultPageSelector } from "@/components/settings/DefaultPageSelector";

interface UserFormAccountSectionProps {
  defaultPage: string;
  onDefaultPageChange: (value: string) => void;
  assignedApps: string[];
  onAssignedAppsChange: (apps: string[]) => void;
  companyApps: Array<{ slug: string; label: string }>;
}

export const UserFormAccountSection: React.FC<UserFormAccountSectionProps> = ({
  defaultPage,
  onDefaultPageChange,
  assignedApps,
  onAssignedAppsChange,
  companyApps,
}) => {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-sm text-foreground">إعدادات الحساب</p>
          <p className="text-xs text-muted-foreground">
            تحكم في سلوك الحساب وتجربة المستخدم.
          </p>
        </div>
        <Badge variant="outline" className="rounded-full text-xs">
          الإعدادات
        </Badge>
      </div>

      <DefaultPageSelector
        value={defaultPage}
        onChange={onDefaultPageChange}
      />

      <div className="mt-5 border-t border-border/60 pt-4">
        <p className="text-xs font-semibold text-foreground">
          التطبيقات المتاحة لهذا المستخدم
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          اختر التطبيقات المسموح له بفتحها. التطبيقات غير المحددة ستختفي تمامًا من صفحة التطبيقات والقائمة الجانبية.
        </p>
        {companyApps.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-border/70 bg-card/60 p-3 text-xs text-muted-foreground">
            لا توجد تطبيقات مفعّلة في هذه الشركة لتحديدها.
          </p>
        ) : (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {companyApps.map((app) => {
              const checked = assignedApps.some(
                (a) => a.toLowerCase() === app.slug.toLowerCase(),
              );
              return (
                <label
                  key={app.slug}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/70 bg-card/60 px-3 py-2 text-xs transition-colors hover:bg-muted/40"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(val) => {
                      const current = assignedApps.map((a) => a.toLowerCase());
                      const next =
                        val === true
                          ? [...new Set([...current, app.slug.toLowerCase()])]
                          : current.filter((a) => a !== app.slug.toLowerCase());
                      onAssignedAppsChange(next);
                    }}
                  />
                  <span className="font-medium text-foreground">{app.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
