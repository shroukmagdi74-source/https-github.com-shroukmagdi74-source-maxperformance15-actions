import React from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Department } from "./types";

interface EmployeeFiltersProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (value: string) => void;
  contractFilter: string;
  setContractFilter: (value: string) => void;
  userStatusFilter: string;
  setUserStatusFilter: (value: string) => void;
  departments: Department[];
}

export const EmployeeFilters: React.FC<EmployeeFiltersProps> = ({
  searchInput,
  setSearchInput,
  statusFilter,
  setStatusFilter,
  departmentFilter,
  setDepartmentFilter,
  contractFilter,
  setContractFilter,
  userStatusFilter,
  setUserStatusFilter,
  departments,
}) => {
  const { t } = useTranslation();

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
            <Input
              placeholder={t("employees.searchPlaceholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
              <SelectValue placeholder={t("employees.statusFilter")} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectItem
                value="all"
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t("employees.allStatuses")}
              </SelectItem>
              <SelectItem
                value="ACTIVE"
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t("employees.active")}
              </SelectItem>
              <SelectItem
                value="INACTIVE"
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t("employees.inactive")}
              </SelectItem>
              <SelectItem
                value="TERMINATED"
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t("employees.terminated")}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={departmentFilter}
            onValueChange={setDepartmentFilter}
          >
            <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
              <SelectValue placeholder={t("employees.departmentFilter")} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectItem
                value="all"
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t("employees.allDepartments")}
              </SelectItem>
              {departments.map((dept) => (
                <SelectItem
                  key={dept.id}
                  value={dept.id}
                  className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={contractFilter} onValueChange={setContractFilter}>
            <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
              <SelectValue placeholder={t("employees.contractFilter")} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectItem
                value="all"
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t("employees.allContracts")}
              </SelectItem>
              <SelectItem
                value="FULL_TIME"
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t("employees.fullTime")}
              </SelectItem>
              <SelectItem
                value="PART_TIME"
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t("employees.partTime")}
              </SelectItem>
              <SelectItem
                value="CONTRACTOR"
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t("employees.contractor")}
              </SelectItem>
              <SelectItem
                value="INTERN"
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t("employees.intern")}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* User Status Filter */}
          <Select
            value={userStatusFilter}
            onValueChange={setUserStatusFilter}
          >
            <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
              <SelectValue placeholder={t("employees.accountStatusFilter")} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectItem
                value="all"
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t("employees.allAccounts")}
              </SelectItem>
              <SelectItem
                value="HAS_USER"
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t("employees.hasAccount")}
              </SelectItem>
              <SelectItem
                value="NO_USER"
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t("employees.noAccount")}
              </SelectItem>
              <SelectItem
                value="ACTIVE_USER"
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t("employees.activeAccount")}
              </SelectItem>
              <SelectItem
                value="INACTIVE_USER"
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t("employees.inactiveAccount")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
