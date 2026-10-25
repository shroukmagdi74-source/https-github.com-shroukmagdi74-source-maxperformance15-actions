import React from "react";
import { Calendar, FileText, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { LeaveReport } from "./types";

interface LeavesReportTabProps {
  loading: boolean;
  leaveReport: LeaveReport | null;
}

const LEAVE_PIE_COLORS = [
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#06b6d4",
  "#10b981",
];

export const LeavesReportTab: React.FC<LeavesReportTabProps> = ({
  loading,
  leaveReport,
}) => {
  return (
    <TabsContent value="leaves" className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        leaveReport && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-purple-600 to-fuchsia-700 text-white shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">
                        طلبات الإجازة
                      </p>
                      <h3 className="text-3xl font-bold mt-1 font-mono tabular-nums">
                        {leaveReport.totalRequests}
                      </h3>
                    </div>
                    <div className="p-3 bg-white/20 rounded-full">
                      <FileText className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">
                        الأيام المستهلكة
                      </p>
                      <h3 className="text-3xl font-bold mt-1 text-blue-600 font-mono tabular-nums">
                        {leaveReport.totalDaysTaken}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        يوم إجازة إجمالي
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                      <Calendar className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">
                        نسبة القبول
                      </p>
                      <h3 className="text-3xl font-bold mt-1 text-green-600 font-mono tabular-nums">
                        {Math.round(
                          (leaveReport.approved /
                            (leaveReport.totalRequests || 1)) *
                            100,
                        )}
                        %
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {leaveReport.approved} طلب مقبول
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
                      <Check className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">
                        طلبات مرفوضة
                      </p>
                      <h3 className="text-3xl font-bold mt-1 text-red-600 font-mono tabular-nums">
                        {leaveReport.rejected}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {Math.round(
                          (leaveReport.rejected /
                            (leaveReport.totalRequests || 1)) *
                            100,
                        )}
                        % من الإجمالي
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full">
                      <X className="h-6 w-6 text-red-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Leaves Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>تحليل أنواع الإجازات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={leaveReport.byType}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="days"
                          nameKey="type"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {leaveReport.byType.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={LEAVE_PIE_COLORS[index % LEAVE_PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>أيام الإجازات حسب النوع</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={leaveReport.byType}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                        />
                        <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="days"
                          fill="#ec4899"
                          radius={[4, 4, 0, 0]}
                          barSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )
      )}
    </TabsContent>
  );
};
