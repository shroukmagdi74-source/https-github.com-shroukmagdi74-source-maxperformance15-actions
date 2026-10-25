import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { AlertTriangle } from "lucide-react";

interface AssignShiftExistingAlertProps {
  assignmentDate: string;
  assignedEmployeeNames: string;
}

export const AssignShiftExistingAlert: React.FC<
  AssignShiftExistingAlertProps
> = ({ assignmentDate, assignedEmployeeNames }) => {
  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-orange-900 dark:text-orange-200">
              موظفين معينين بالفعل في {assignmentDate}
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
              {assignedEmployeeNames}
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
              هؤلاء الموظفين مخفيون من القائمة لتجنب التعيين المكرر
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
