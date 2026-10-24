import React from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";

import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { ReportSummary, getStatusColor } from "./types";

interface ReportsSummaryCardsProps {
  summary: ReportSummary;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "excellent":
      return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
    case "good":
      return <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    case "fair":
      return <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
    case "poor":
      return <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />;
    default:
      return <AlertTriangle className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
  }
};

export const ReportsSummaryCards: React.FC<ReportsSummaryCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
            {getStatusIcon(summary.status)}
            <span className="mr-2">نقاط الصحة</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
            {summary.healthScore}/100
          </div>
          <Badge className={`mt-1 ${getStatusColor(summary.status)}`}>
            {summary.status === "excellent" && "ممتاز"}
            {summary.status === "good" && "جيد"}
            {summary.status === "fair" && "مقبول"}
            {summary.status === "poor" && "ضعيف"}
          </Badge>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            إجمالي الردود
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono tabular-nums text-green-600 dark:text-green-400">
            {summary.keyMetrics.totalResponses}
          </div>
          <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-1">
            معدل النجاح: {summary.keyMetrics.successRate}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            وقت الاستجابة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono tabular-nums text-orange-600 dark:text-orange-400">
            {summary.keyMetrics.averageResponseTime}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            متوسط الوقت
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            التوصيات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono tabular-nums text-purple-600 dark:text-purple-400">
            {summary.recommendationsCount}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            توصية متاحة
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
