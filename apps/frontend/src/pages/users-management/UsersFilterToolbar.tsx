import React from "react";
import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BusinessFilterSheet,
  BusinessMobileSearchPanel,
} from "@/components/business/BusinessFilters";
import {
  type FiltersState,
  type RoleRecord,
  PAGE_SIZE_OPTIONS,
  EMPLOYEE_STATUS_OPTIONS,
} from "./types";

interface UsersFilterToolbarProps {
  searchInput: string;
  onSearchInputChange: (val: string) => void;
  onSearchSubmit: () => void;
  filters: FiltersState;
  onFilterChange: (field: keyof FiltersState, value: string) => void;
  onClearFilters: () => void;
  roles: RoleRecord;
  limit: number;
  onLimitChange: (limit: number) => void;
  filterSheetOpen: boolean;
  onFilterSheetOpenChange: (open: boolean) => void;
  totalCount: number;
}

export const UsersFilterToolbar: React.FC<UsersFilterToolbarProps> = ({
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  filters,
  onFilterChange,
  onClearFilters,
  roles,
  limit,
  onLimitChange,
  filterSheetOpen,
  onFilterSheetOpenChange,
  totalCount,
}) => {
  const { t } = useTranslation();

  const activeFilterLabels: string[] = [];
  if (filters.role) {
    activeFilterLabels.push(`الدور: ${roles[filters.role]?.name || filters.role}`);
  }
  if (filters.isActive) {
    if (filters.isActive === "active") activeFilterLabels.push("النشطون فعلياً");
    else if (filters.isActive === "never_logged_in") activeFilterLabels.push("لم يسجلوا الدخول");
    else if (filters.isActive === "inactive" || filters.isActive === "false") activeFilterLabels.push("غير النشطين فقط");
    else activeFilterLabels.push(filters.isActive === "true" ? "نشط فقط" : "غير نشط فقط");
  }
  if (filters.employeeStatus) {
    const foundStatus = EMPLOYEE_STATUS_OPTIONS.find(
      (opt) => opt.value === filters.employeeStatus,
    );
    activeFilterLabels.push(`الموظف: ${foundStatus?.label || filters.employeeStatus}`);
  }

  return (
    <>
      <BusinessMobileSearchPanel
        searchId="users-mobile-search"
        searchName="usersMobileSearch"
        searchLabel={t("users.filters.search", "بحث في المستخدمين")}
        searchPlaceholder={t("users.filters.searchPlaceholder", "بحث بالاسم أو البريد أو الهاتف…")}
        searchValue={searchInput}
        searchAriaLabel={String(t("users.filters.search", "بحث في المستخدمين"))}
        onSearchChange={onSearchInputChange}
        onSearchSubmit={onSearchSubmit}
        onOpenFilters={() => onFilterSheetOpenChange(true)}
        filterCount={activeFilterLabels.length}
        summaryIcon={<Users className="size-3.5" />}
        summary={`${totalCount} مستخدم بعد الفلاتر الحالية`}
        activeFilters={activeFilterLabels}
      />

      <BusinessFilterSheet
        open={filterSheetOpen}
        onOpenChange={onFilterSheetOpenChange}
        title="فلاتر المستخدمين"
        description="عدّل التصفية قبل استعراض القائمة على الموبايل."
        onClear={() => {
          onClearFilters();
          onFilterSheetOpenChange(false);
        }}
        onApply={() => onFilterSheetOpenChange(false)}
      >
        <div className="space-y-2">
          <Label>{t("users.filters.role", "الدور الوظيفي")}</Label>
          <Select
            value={filters.role || null}
            onValueChange={(value) => onFilterChange("role", value || "")}
          >
            <SelectTrigger className="h-11 rounded-2xl">
              <SelectValue placeholder={t("users.filters.role", "الدور الوظيفي")} />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value={null}> {t("users.filters.all", "الكل")} </SelectItem>
              {Object.entries(roles).map(([roleKey, roleData]) => (
                <SelectItem key={roleKey} value={roleKey}>
                  {roleData.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("users.filters.status", "حالة النشاط")}</Label>
          <Select
            value={filters.isActive || null}
            onValueChange={(value) => onFilterChange("isActive", value || "")}
          >
            <SelectTrigger className="h-11 rounded-2xl">
              <SelectValue placeholder={t("users.filters.status", "حالة النشاط")} />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value={null}> {t("users.filters.all", "الكل")} </SelectItem>
              <SelectItem value="active">النشطون فعلياً</SelectItem>
              <SelectItem value="never_logged_in">لم يسجلوا الدخول بعد</SelectItem>
              <SelectItem value="inactive">غير النشطين / المعطلين</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>حالة الموظف</Label>
          <Select
            value={filters.employeeStatus || null}
            onValueChange={(value) => onFilterChange("employeeStatus", value || "")}
          >
            <SelectTrigger className="h-11 rounded-2xl">
              <SelectValue placeholder="حالة الموظف" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value={null}> الكل </SelectItem>
              {EMPLOYEE_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("users.filters.limit", "عدد العناصر بالصفحة")}</Label>
          <Select
            value={String(limit)}
            onValueChange={(value) => onLimitChange(Number(value || "25"))}
          >
            <SelectTrigger className="h-11 rounded-2xl">
              <SelectValue placeholder={t("users.filters.limit", "عدد العناصر")} />
            </SelectTrigger>
            <SelectContent align="end">
              {PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </BusinessFilterSheet>
    </>
  );
};
