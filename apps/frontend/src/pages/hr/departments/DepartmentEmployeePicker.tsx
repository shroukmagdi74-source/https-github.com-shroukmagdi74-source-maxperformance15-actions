import React from "react";
import { Plus, Users, X } from "lucide-react";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Employee } from "./types";

interface DepartmentEmployeePickerProps {
  employees: Employee[];
  filteredEmployees: Employee[];
  selectedEmployees: string[];
  toggleEmployeeSelection: (id: string) => void;
  employeeSearchQuery: string;
  setEmployeeSearchQuery: (query: string) => void;
  title?: string;
}

export const DepartmentEmployeePicker: React.FC<DepartmentEmployeePickerProps> = ({
  employees,
  filteredEmployees,
  selectedEmployees,
  toggleEmployeeSelection,
  employeeSearchQuery,
  setEmployeeSearchQuery,
  title = "إضافة موظفين (اختياري)",
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="h-4 w-4" />
          {title}
        </h3>
        {selectedEmployees.length > 0 && (
          <Badge
            variant="default"
            className="bg-blue-100 text-blue-800 font-mono tabular-nums"
          >
            {selectedEmployees.length} موظف محدد
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 dark:text-gray-300 text-sm">
          اختر الموظفين من القائمة
        </Label>
        <Input
          placeholder="ابحث عن موظف..."
          value={employeeSearchQuery}
          onChange={(e) => setEmployeeSearchQuery(e.target.value)}
          className="mb-2"
        />
        <div className="max-h-60 overflow-y-auto border rounded-xl p-2 bg-white dark:bg-gray-900 space-y-1">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                  selectedEmployees.includes(emp.id)
                    ? "bg-blue-50 dark:bg-blue-900/30"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                onClick={() => toggleEmployeeSelection(emp.id)}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={emp.avatar} />
                    <AvatarFallback>
                      {emp.firstName[0]}
                      {emp.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {emp.firstName} {emp.lastName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {emp.email || "لا يوجد بريد"}
                    </span>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    selectedEmployees.includes(emp.id)
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {selectedEmployees.includes(emp.id) && (
                    <Plus className="h-3 w-3" />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-400 text-sm">
              لا يوجد نتائج للبحث
            </div>
          )}
        </div>
      </div>

      {selectedEmployees.length > 0 && (
        <div className="space-y-2">
          <Label className="text-gray-700 dark:text-gray-300 text-sm">
            الموظفون المحددون:
          </Label>
          <div className="border rounded-lg overflow-hidden max-h-40 overflow-y-auto">
            <div className="divide-y dark:divide-gray-700">
              {selectedEmployees.map((empId) => {
                const emp = employees.find((e) => e.id === empId);
                if (!emp) return null;
                return (
                  <div
                    key={empId}
                    className="flex items-center justify-between p-2 bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={emp.avatar} />
                        <AvatarFallback className="text-xs bg-primary text-white">
                          {emp.firstName?.[0]}
                          {emp.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {emp.email}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                      onClick={() => toggleEmployeeSelection(empId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
