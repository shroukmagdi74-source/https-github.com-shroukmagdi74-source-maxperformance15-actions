import React from "react";
import { Plus, Users, X, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Employee } from "./types";

interface DepartmentAssignEmployeesFormProps {
  employees: Employee[];
  filteredEmployees: Employee[];
  employeeSearchQuery: string;
  setEmployeeSearchQuery: (query: string) => void;
  assignEmployeesSelection: string[];
  toggleAssignEmployeeSelection: (id: string) => void;
  isAssigningEmployees: boolean;
  onCancel: () => void;
  onAssign: () => void;
}

export const DepartmentAssignEmployeesForm: React.FC<DepartmentAssignEmployeesFormProps> = ({
  employees,
  filteredEmployees,
  employeeSearchQuery,
  setEmployeeSearchQuery,
  assignEmployeesSelection,
  toggleAssignEmployeeSelection,
  isAssigningEmployees,
  onCancel,
  onAssign,
}) => {
  return (
    <Card className="bg-white/90 dark:bg-gray-900/70">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">إضافة موظفين للقسم</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
                    assignEmployeesSelection.includes(emp.id)
                      ? "bg-blue-50 dark:bg-blue-900/30"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => toggleAssignEmployeeSelection(emp.id)}
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
                      assignEmployeesSelection.includes(emp.id)
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {assignEmployeesSelection.includes(emp.id) && (
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

        {assignEmployeesSelection.length > 0 && (
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300 text-sm">
              الموظفون المحددون:
            </Label>
            <div className="border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              <div className="divide-y dark:divide-gray-700">
                {assignEmployeesSelection.map((empId) => {
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
                        onClick={() => toggleAssignEmployeeSelection(empId)}
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

        <div className="flex flex-col sm:flex-row gap-2 justify-end pt-2">
          <Button variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button
            onClick={onAssign}
            className="gap-2"
            disabled={isAssigningEmployees}
          >
            {isAssigningEmployees ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                جاري الإضافة...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                إضافة الموظفين
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
