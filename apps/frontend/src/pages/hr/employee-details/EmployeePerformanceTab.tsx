import React from "react";
import { Award } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

interface EmployeePerformanceTabProps {
  onViewPerformance: () => void;
}

export const EmployeePerformanceTab: React.FC<EmployeePerformanceTabProps> = ({
  onViewPerformance,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">تقييمات الأداء</CardTitle>
          <Button onClick={onViewPerformance}>
            <Award className="h-4 w-4 ml-2" />
            عرض جميع التقييمات
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">عرض تقييمات الأداء ومؤشرات النجاح للموظف</p>
          <Button onClick={onViewPerformance}>
            <Award className="h-4 w-4 ml-2" />
            عرض التقييمات
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
