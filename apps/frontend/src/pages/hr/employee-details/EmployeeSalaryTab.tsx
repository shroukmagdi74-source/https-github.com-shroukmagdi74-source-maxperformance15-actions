import React from "react";
import { DollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

interface EmployeeSalaryTabProps {
  onViewSalaryHistory: () => void;
}

export const EmployeeSalaryTab: React.FC<EmployeeSalaryTabProps> = ({
  onViewSalaryHistory,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">سجل الرواتب</CardTitle>
          <Button onClick={onViewSalaryHistory}>
            <DollarSign className="h-4 w-4 ml-2" />
            عرض السجل الكامل
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            عرض سجل التغييرات في الراتب والبدلات
          </p>
          <Button onClick={onViewSalaryHistory}>
            <DollarSign className="h-4 w-4 ml-2" />
            عرض سجل الرواتب
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
