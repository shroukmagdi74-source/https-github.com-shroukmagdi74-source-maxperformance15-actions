import React from "react";
import { CheckCircle, FileText } from "lucide-react";

import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { DailyReport, getPriorityColor } from "./types";

interface ReportsRecommendationsCardProps {
  recommendations: DailyReport["recommendations"];
}

export const ReportsRecommendationsCard: React.FC<ReportsRecommendationsCardProps> = ({
  recommendations,
}) => {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse text-gray-900 dark:text-white">
          <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span>التوصيات</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((rec, index) => (
              <div
                key={index}
                className={`border rounded-lg p-3 ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                    {rec.title}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {rec.priority === "critical" && "حرج"}
                    {rec.priority === "high" && "عالي"}
                    {rec.priority === "medium" && "متوسط"}
                    {rec.priority === "low" && "منخفض"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  {rec.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-green-500 dark:text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              لا توجد توصيات
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              النظام يعمل بشكل مثالي
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
