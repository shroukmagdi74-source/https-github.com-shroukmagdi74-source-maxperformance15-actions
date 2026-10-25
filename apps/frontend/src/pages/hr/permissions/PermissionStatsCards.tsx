import React from "react";
import { Clock, AlertCircle, Timer, Receipt } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { PermissionStats } from "./types";

interface PermissionStatsCardsProps {
  stats: PermissionStats | null;
}

export const PermissionStatsCards: React.FC<PermissionStatsCardsProps> = ({
  stats,
}) => {
  const { t } = useTranslation();
  const pendingCount = stats?.pendingCount || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      <Card className="border-none shadow-sm bg-gradient-to-br from-amber-500 to-amber-600 text-white overflow-hidden relative group">
        <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
          <Clock className="h-20 w-20 sm:h-24 sm:w-24" />
        </div>
        <CardContent className="p-3.5 sm:p-6 relative">
          <p className="text-amber-100 text-xs sm:text-sm font-medium">
            {t("employee.permissions.pendingApproval")}
          </p>
          <div className="flex items-baseline gap-1.5 mt-1 sm:mt-2">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono tabular-nums">
              {pendingCount}
            </h3>
            <span className="text-amber-100 text-xs sm:text-sm mb-0.5">
              {t("employee.permissions.request")}
            </span>
          </div>
          <div className="mt-2 sm:mt-4 flex items-center gap-1.5 text-[10px] sm:text-xs text-amber-100 bg-white/10 w-fit px-2 py-0.5 sm:py-1 rounded-full">
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span className="truncate">{t("employee.permissions.respondQuickly")}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white dark:bg-gray-900 overflow-hidden relative group">
        <CardContent className="p-3.5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">
                {t("employee.permissions.totalHours")}
              </p>
              <div className="flex items-baseline gap-1.5 mt-1 sm:mt-2">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono tabular-nums text-gray-900 dark:text-white">
                  {stats?.totalHours || 0}
                </h3>
                <span className="text-gray-500 text-xs sm:text-sm mb-0.5">
                  {t("employee.permissions.hour")}
                </span>
              </div>
            </div>
            <div className="p-2.5 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl sm:rounded-2xl shrink-0">
              <Timer className="h-5 w-5 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-4 h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-[65%]" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white dark:bg-gray-900">
        <CardContent className="p-3.5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">
                {t("employee.permissions.deductedPermissions")}
              </p>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono tabular-nums mt-1 sm:mt-2 text-red-600 dark:text-red-400">
                {stats?.byType?.DEDUCTIBLE || 0}
              </h3>
            </div>
            <div className="p-2.5 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-xl sm:rounded-2xl shrink-0">
              <Receipt className="h-5 w-5 sm:h-8 sm:w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-2 sm:mt-4 truncate">
            {t("employee.permissions.deductedFromSalary")}
          </p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white dark:bg-gray-900">
        <CardContent className="p-3.5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">
                {t("employee.permissions.officialWorkHours")}
              </p>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono tabular-nums mt-1 sm:mt-2 text-purple-600 dark:text-purple-400">
                {stats?.byType?.FIXED_HOURS || 0}
              </h3>
            </div>
            <div className="p-2.5 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl sm:rounded-2xl shrink-0">
              <Timer className="h-5 w-5 sm:h-8 sm:w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-2 sm:mt-4 truncate">
            {t("employee.permissions.assignments")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
