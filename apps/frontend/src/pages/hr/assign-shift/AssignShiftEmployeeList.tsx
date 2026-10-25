import React from "react";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Search, Briefcase, Check } from "lucide-react";
import { Employee } from "./types";

interface AssignShiftEmployeeListProps {
  employees: Employee[];
  selectedEmployeeIds: string[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onToggleEmployee: (id: string) => void;
}

export const AssignShiftEmployeeList: React.FC<
  AssignShiftEmployeeListProps
> = ({
  employees,
  selectedEmployeeIds,
  searchTerm,
  onSearchChange,
  onToggleEmployee,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">
          الموظفين{" "}
          {selectedEmployeeIds.length > 0 &&
            `(${selectedEmployeeIds.length} محدد)`}
        </Label>
        <Badge variant="secondary" className="font-mono tabular-nums">
          {employees.length} متاح
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="ابحث عن الموظف باسمه أو رقمه..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-10 bg-gray-50/50 focus:bg-white dark:bg-gray-800/50"
        />
      </div>

      <div className="border rounded-xl overflow-hidden bg-gray-50/30 dark:bg-gray-900/30 max-h-[350px] overflow-y-auto">
        {employees.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {employees.map((emp) => {
              const isSelected = selectedEmployeeIds.includes(emp.id);
              return (
                <div
                  key={emp.id}
                  onClick={() => onToggleEmployee(emp.id)}
                  className={`flex items-center justify-between p-3 cursor-pointer transition-all hover:bg-primary/5 ${
                    isSelected
                      ? "bg-primary/10 border-r-4 border-primary"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-sm">
                      <AvatarImage src={emp.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {emp.firstName?.[0] || ""}
                        {emp.lastName?.[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold">
                          {emp.firstName} {emp.lastName}
                        </p>
                        {emp.employeeNumber && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0 font-mono tabular-nums"
                          >
                            #{emp.employeeNumber}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {emp.department?.name || "بدون قسم"}
                        </span>
                        {emp.position?.title && (
                          <>
                            <span>•</span>
                            <span>{emp.position.title}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="bg-primary text-white p-1 rounded-full">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground italic text-sm">
            لا يوجد موظفين يطابقون البحث
          </div>
        )}
      </div>
    </div>
  );
};
