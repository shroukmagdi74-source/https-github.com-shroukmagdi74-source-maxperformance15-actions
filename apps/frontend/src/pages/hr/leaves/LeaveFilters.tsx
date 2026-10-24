import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Badge } from "../../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { leaveTypeConfig, statusConfig } from "./types";

interface LeaveFiltersProps {
  t: (key: string) => string;
  activeTab: string;
  setActiveTab: (val: string) => void;
  pendingCount: number;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}

export const LeaveFilters: React.FC<LeaveFiltersProps> = ({
  t,
  activeTab,
  setActiveTab,
  pendingCount,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <TabsList>
              <TabsTrigger value="all">{t("employee.leaves.all")}</TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                {t("employee.leaves.pending")}
                {pendingCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 font-mono tabular-nums">
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t("employee.leaves.leaveType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("employee.leaves.all")}</SelectItem>
                  {Object.entries(leaveTypeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {t(config.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {activeTab === "all" && (
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={t("employee.leaves.status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("employee.leaves.all")}</SelectItem>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {t(config.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};
