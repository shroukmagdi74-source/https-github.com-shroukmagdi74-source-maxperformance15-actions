import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Building2, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { DepartmentOverview } from "./types";

interface DepartmentsOverviewCardProps {
  departments?: DepartmentOverview[];
}

export const DepartmentsOverviewCard: React.FC<DepartmentsOverviewCardProps> = ({
  departments = [],
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-gray-800/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50 dark:bg-gray-900/20 px-6 py-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Building2 className="h-5 w-5 text-purple-600" />
          </div>
          {t("hrDashboard.departments")}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-colors gap-2"
          onClick={() => navigate("/hr/departments")}
        >
          {t("hrDashboard.viewAll")}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="flex flex-col p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:shadow-lg transition-all group overflow-hidden relative"
            >
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div
                  className="w-1.5 h-6 rounded-full"
                  style={{ backgroundColor: dept.color || "#3B82F6" }}
                />
                <span className="font-bold text-gray-900 dark:text-white truncate">
                  {dept.name}
                </span>
              </div>
              <div className="flex items-end justify-between relative z-10">
                <div className="flex flex-row items-baseline gap-1">
                  <p className="text-3xl font-black text-gray-900 dark:text-white font-mono tabular-nums">
                    {dept.employeeCount || 0}
                  </p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {t("hrDashboard.employeesCount")}
                  </p>
                </div>
              </div>
              {/* Subtle background decoration */}
              <div
                className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity"
                style={{ backgroundColor: dept.color || "#3B82F6" }}
              />
            </div>
          ))}
          {departments.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-6 col-span-2">
              {t("hrDashboard.noDepartments") || "لا توجد أقسام"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
