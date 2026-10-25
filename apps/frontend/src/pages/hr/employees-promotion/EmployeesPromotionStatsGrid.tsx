import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { PromotionStats } from "./types";

interface EmployeesPromotionStatsGridProps {
  stats: PromotionStats;
}

export const EmployeesPromotionStatsGrid: React.FC<
  EmployeesPromotionStatsGridProps
> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 font-mono tabular-nums">
            {stats.total}
          </div>
          <div className="text-sm text-gray-500">إجمالي الترقيات</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600 font-mono tabular-nums">
            {stats.pending}
          </div>
          <div className="text-sm text-gray-500">قيد المراجعة</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600 font-mono tabular-nums">
            {stats.approved}
          </div>
          <div className="text-sm text-gray-500">موافق عليها</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600 font-mono tabular-nums">
            {stats.rejected}
          </div>
          <div className="text-sm text-gray-500">مرفوضة</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 font-mono tabular-nums">
            {stats.completed}
          </div>
          <div className="text-sm text-gray-500">مكتملة</div>
        </CardContent>
      </Card>
    </div>
  );
};
