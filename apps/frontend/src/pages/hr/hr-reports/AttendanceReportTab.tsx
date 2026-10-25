import React from "react";
import { Users, Clock, TrendingUp, TrendingDown } from "lucide-react";
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
} from "recharts";
import { AttendanceReport } from "./types";

interface AttendanceReportTabProps {
  loading: boolean;
  attendanceReport: AttendanceReport | null;
}

export const AttendanceReportTab: React.FC<AttendanceReportTabProps> = ({
  loading,
  attendanceReport,
}) => {
  return (
    <TabsContent value="attendance" className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        attendanceReport && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">
                        معدل الانضباط
                      </p>
                      <h3 className="text-3xl font-bold mt-1 font-mono tabular-nums">
                        {attendanceReport.attendanceRate}%
                      </h3>
                    </div>
                    <div className="p-3 bg-white/20 rounded-full text-white">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">
                        إجمالي الحضور
                      </p>
                      <h3 className="text-3xl font-bold mt-1 text-green-600 font-mono tabular-nums">
                        {attendanceReport.presentDays}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        يوم عمل مسجل
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">
                        حالات الغياب
                      </p>
                      <h3 className="text-3xl font-bold mt-1 text-red-600 font-mono tabular-nums">
                        {attendanceReport.absentDays}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">بدون عذر</p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full">
                      <TrendingDown className="h-6 w-6 text-red-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">
                        ساعات العمل
                      </p>
                      <h3 className="text-3xl font-bold mt-1 text-purple-600 font-mono tabular-nums">
                        {attendanceReport.averageWorkHours}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        متوسط يومي
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                      <Clock className="h-6 w-6 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Visual Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>الانضباط حسب القسم</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attendanceReport.byDepartment}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="department"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Bar
                          dataKey="rate"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                          barSize={30}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>توزيع القوى العاملة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "حاضر",
                              value: attendanceReport.presentDays,
                            },
                            {
                              name: "غائب",
                              value: attendanceReport.absentDays,
                            },
                            {
                              name: "متأخر",
                              value: attendanceReport.lateDays,
                            },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          <Cell fill="#10b981" />
                          <Cell fill="#ef4444" />
                          <Cell fill="#f59e0b" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
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
