import React from "react";
import { Control, Controller } from "react-hook-form";
import { DollarSign } from "lucide-react";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { PromotionFormData, SalaryIncreaseStats } from "./types";

interface EditPromotionEmployeeSidebarProps {
  control: Control<PromotionFormData>;
  employees: any[];
  selectedEmployee: any;
  increaseStats: SalaryIncreaseStats | null;
}

export const EditPromotionEmployeeSidebar: React.FC<
  EditPromotionEmployeeSidebarProps
> = ({ control, employees, selectedEmployee, increaseStats }) => {
  return (
    <div className="space-y-6">
      <Card className="border-t-4 border-t-blue-500 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle>الموظف المعني</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>اختر الموظف</Label>
              <Controller
                name="employeeId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الموظف" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {selectedEmployee && (
              <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4 mt-4 border border-gray-100">
                <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                  <AvatarImage src={selectedEmployee.avatar} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-bold">
                    {selectedEmployee.firstName?.[0]}
                    {selectedEmployee.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 font-mono tabular-nums">
                    {selectedEmployee.employeeNumber}
                  </p>
                  <Badge variant="outline" className="mt-1 bg-white">
                    {selectedEmployee.position?.title || "بدون منصب"}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {increaseStats && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <h3 className="text-green-800 font-semibold mb-2 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              تحليل الراتب
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">الزيادة المقترحة:</span>
                <span className="font-bold text-green-700 font-mono tabular-nums dir-ltr">
                  +{increaseStats.diff.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">نسبة الزيادة:</span>
                <span className="font-bold text-green-700 font-mono tabular-nums dir-ltr">
                  {increaseStats.percent.toFixed(2)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
