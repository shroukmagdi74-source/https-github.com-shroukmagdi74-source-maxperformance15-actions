import React from "react";
import { AlertTriangle } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

interface ReportsConcernsCardProps {
  concerns: string[];
}

export const ReportsConcernsCard: React.FC<ReportsConcernsCardProps> = ({ concerns }) => {
  if (!concerns || concerns.length === 0 || concerns[0] === "لا توجد مخاوف رئيسية") {
    return null;
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse text-gray-900 dark:text-white">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span>المخاوف الرئيسية</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {concerns.map((concern, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 space-x-reverse"
            >
              <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 ml-2" />
              <span className="text-sm text-red-700 dark:text-red-300">
                {concern}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
