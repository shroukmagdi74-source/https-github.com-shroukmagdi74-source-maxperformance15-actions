import React from "react";
import { User } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Employee, PerformanceReviewFormData } from "./types";

interface CreatePerformanceReviewPartiesCardProps {
  employees: Employee[];
  formData: PerformanceReviewFormData;
  onChange: (next: PerformanceReviewFormData) => void;
}

export const CreatePerformanceReviewPartiesCard: React.FC<
  CreatePerformanceReviewPartiesCardProps
> = ({ employees, formData, onChange }) => {
  const activeEmployees = employees.filter((emp) => emp.hasEmployeeRecord);

  return (
    <div className="lg:col-span-1 space-y-6">
      <Card className="border-none shadow-xl ring-1 ring-gray-200 dark:ring-gray-800">
        <CardHeader className="bg-primary/5 rounded-t-xl">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            الأطراف المعنية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <Label className="font-bold">الموظف المراد تقييمه</Label>
            <Select
              onValueChange={(val) =>
                onChange({ ...formData, employeeId: val })
              }
              value={formData.employeeId}
            >
              <SelectTrigger className="h-12 rounded-xl bg-gray-50/50">
                <SelectValue placeholder="اختر الموظف" />
              </SelectTrigger>
              <SelectContent>
                {activeEmployees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="font-bold">المقيّم (Reviewer)</Label>
            <Select
              onValueChange={(val) =>
                onChange({ ...formData, reviewerId: val })
              }
              value={formData.reviewerId}
            >
              <SelectTrigger className="h-12 rounded-xl bg-gray-50/50">
                <SelectValue placeholder="اختر المسئول عن التقييم" />
              </SelectTrigger>
              <SelectContent>
                {activeEmployees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
