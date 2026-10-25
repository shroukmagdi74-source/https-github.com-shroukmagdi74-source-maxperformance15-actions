import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { SortField, TeamMemberSummary } from "./types";
import { MonitorDesktopRow } from "./MonitorDesktopRow";

interface MonitorDesktopTableProps {
  sortedMembers: TeamMemberSummary[];
  sortField: SortField;
  sortDirection: "asc" | "desc";
  onSort: (field: SortField) => void;
  onSelectEmployee: (employeeId: string) => void;
}

export const MonitorDesktopTable: React.FC<MonitorDesktopTableProps> = ({
  sortedMembers,
  sortField,
  sortDirection,
  onSort,
  onSelectEmployee,
}) => {
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="h-3 w-3 opacity-40 group-hover:opacity-100" />
      );
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 text-sky-400" />
    ) : (
      <ArrowDown className="h-3 w-3 text-sky-400" />
    );
  };

  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-right text-xs">
        <thead className="border-b border-border/40 bg-muted/40 dark:bg-zinc-950/40 text-muted-foreground">
          <tr>
            <th
              onClick={() => onSort("employeeName")}
              className="group cursor-pointer px-4 py-3 font-semibold transition hover:text-foreground"
            >
              <div className="flex items-center gap-1.5">
                <span>الموظف / القسم</span>
                {renderSortIcon("employeeName")}
              </div>
            </th>
            <th className="px-4 py-3 font-semibold">الحالة والتشخيص</th>
            <th
              onClick={() => onSort("lateStartMinutes")}
              className="group cursor-pointer px-4 py-3 font-semibold transition hover:text-foreground"
            >
              <div className="flex items-center gap-1.5">
                <span>البصمة ووقت التسخين</span>
                {renderSortIcon("lateStartMinutes")}
              </div>
            </th>
            <th
              onClick={() => onSort("totalActiveSeconds")}
              className="group cursor-pointer px-4 py-3 font-semibold transition hover:text-foreground"
            >
              <div className="flex items-center gap-1.5">
                <span>العمل الفعلي ونسبة النشاط</span>
                {renderSortIcon("totalActiveSeconds")}
              </div>
            </th>
            <th
              onClick={() => onSort("totalIdleSeconds")}
              className="group cursor-pointer px-4 py-3 font-semibold transition hover:text-foreground"
            >
              <div className="flex items-center gap-1.5">
                <span>سكون الجهاز وفترات البريك</span>
                {renderSortIcon("totalIdleSeconds")}
              </div>
            </th>
            <th
              onClick={() => onSort("productivityScore")}
              className="group cursor-pointer px-4 py-3 font-semibold transition hover:text-foreground"
            >
              <div className="flex items-center gap-1.5">
                <span>الإنتاجية ومعدل المهام</span>
                {renderSortIcon("productivityScore")}
              </div>
            </th>
            <th
              onClick={() => onSort("completedTasksCount")}
              className="group cursor-pointer px-4 py-3 font-semibold transition hover:text-foreground"
            >
              <div className="flex items-center gap-1.5">
                <span>المهام (منجزة / متبقية)</span>
                {renderSortIcon("completedTasksCount")}
              </div>
            </th>
            <th className="px-4 py-3 font-semibold">البرنامج الأبرز</th>
            <th className="px-4 py-3 text-left font-semibold">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20">
          {sortedMembers.map((m) => (
            <MonitorDesktopRow
              key={m.employeeId}
              member={m}
              onSelectEmployee={onSelectEmployee}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
