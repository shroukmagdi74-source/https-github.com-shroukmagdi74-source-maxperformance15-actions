import React from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { permissionTypeConfig } from "./helpers";
import { PermissionType } from "./types";

interface PermissionFiltersProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  pendingCount: number;
}

export const PermissionFilters: React.FC<PermissionFiltersProps> = ({
  activeTab,
  setActiveTab,
  typeFilter,
  setTypeFilter,
  pendingCount,
}) => {
  const { t } = useTranslation();

  const selectedTypeLabel =
    typeFilter === "all"
      ? t("employee.permissions.allTypes")
      : typeFilter in permissionTypeConfig
        ? t(
            `employee.permissions.${permissionTypeConfig[typeFilter as PermissionType].labelKey}`,
          )
        : undefined;

  return (
    <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full sm:w-auto"
      >
        <TabsList className="bg-gray-100/50 dark:bg-gray-800/50 p-1 w-full sm:w-auto grid grid-cols-4 sm:flex h-auto">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm text-xs sm:text-sm py-1.5 px-2 sm:px-3"
          >
            {t("employee.permissions.all")}
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="relative data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm text-xs sm:text-sm py-1.5 px-2 sm:px-3"
          >
            {t("employee.permissions.pendingTab")}
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white font-bold ring-2 ring-white dark:ring-gray-900 animate-pulse font-mono tabular-nums">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="text-xs sm:text-sm py-1.5 px-2 sm:px-3"
          >
            {t("employee.permissions.approvedTab")}
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="text-xs sm:text-sm py-1.5 px-2 sm:px-3"
          >
            {t("employee.permissions.rejectedTab")}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="w-full sm:w-auto flex items-center gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 h-9 sm:h-10 text-xs sm:text-sm">
            <SelectValue placeholder={t("employee.permissions.typePlaceholder")}>
              {selectedTypeLabel}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("employee.permissions.allTypes")}</SelectItem>
            {Object.entries(permissionTypeConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <config.icon className="h-4 w-4" />
                  <span>{t(`employee.permissions.${config.labelKey}`)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
