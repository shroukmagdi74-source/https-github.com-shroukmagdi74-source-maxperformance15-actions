import React from "react";
import { TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { DailyReport } from "./types";

interface ReportsPerformanceCardProps {
  performance: DailyReport["performance"];
}

export const ReportsPerformanceCard: React.FC<ReportsPerformanceCardProps> = ({
  performance,
}) => {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse text-gray-900 dark:text-white">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>ملخص الأداء</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              معدل النجاح:
            </span>
            <span className="font-medium font-mono tabular-nums text-green-600 dark:text-green-400">
              {performance.successRate}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              معدل الأخطاء:
            </span>
            <span className="font-medium font-mono tabular-nums text-red-600 dark:text-red-400">
              {performance.errorRate}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              الردود البطيئة:
            </span>
            <span className="font-medium font-mono tabular-nums text-yellow-600 dark:text-yellow-400">
              {performance.slowRate}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              الردود الفارغة:
            </span>
            <span className="font-medium font-mono tabular-nums text-gray-600 dark:text-gray-400">
              {performance.emptyRate}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
