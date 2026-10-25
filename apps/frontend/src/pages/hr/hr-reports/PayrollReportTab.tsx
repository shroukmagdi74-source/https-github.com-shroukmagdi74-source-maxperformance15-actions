import React from "react";
import { DollarSign, Users, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PayrollReport } from "./types";
import { formatCurrency } from "./helpers";

interface PayrollReportTabProps {
  loading: boolean;
  payrollReport: PayrollReport | null;
}

export const PayrollReportTab: React.FC<PayrollReportTabProps> = ({
  loading,
  payrollReport,
}) => {
  return (
    <TabsContent value="payroll" className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        payrollReport && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">
                        إجمالي الرواتب الصافية
                      </p>
                      <h3 className="text-2xl font-bold mt-2 font-mono tabular-nums">
                        {formatCurrency(payrollReport.totalPayroll)}
                      </h3>
                    </div>
                    <div className="p-3 bg-white/20 rounded-full">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">
                        الرواتب الأساسية
                      </p>
                      <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100 font-mono tabular-nums">
                        {formatCurrency(payrollReport.totalBaseSalary)}
                      </h3>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">
                        إجمالي البدلات
                      </p>
                      <h3 className="text-2xl font-bold mt-2 text-green-600 font-mono tabular-nums">
                        +{formatCurrency(payrollReport.totalAllowances)}
                      </h3>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">
                        إجمالي الخصومات
                      </p>
                      <h3 className="text-2xl font-bold mt-2 text-red-600 font-mono tabular-nums">
                        -{formatCurrency(payrollReport.totalDeductions)}
                      </h3>
                    </div>
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                      <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Visual Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>توزيع تكاليف الرواتب</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "الراتب الأساسي",
                              value: payrollReport.totalBaseSalary,
                            },
                            {
                              name: "البدلات",
                              value: payrollReport.totalAllowances,
                            },
                            {
                              name: "العمل الإضافي",
                              value: payrollReport.totalOvertime,
                            },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          <Cell fill="#3b82f6" />
                          <Cell fill="#10b981" />
                          <Cell fill="#f59e0b" />
                        </Pie>
                        <Tooltip
                          formatter={(value) =>
                            formatCurrency(Number(value))
                          }
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Department Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>تكاليف الرواتب حسب القسم</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={payrollReport.byDepartment}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                        />
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="department"
                          type="category"
                          width={100}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          formatter={(value) =>
                            formatCurrency(Number(value))
                          }
                          cursor={{ fill: "transparent" }}
                        />
                        <Bar
                          dataKey="total"
                          fill="#6366f1"
                          radius={[0, 4, 4, 0]}
                          barSize={20}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Table */}
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل الأقسام</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">القسم</TableHead>
                        <TableHead className="text-right">
                          عدد الموظفين
                        </TableHead>
                        <TableHead className="text-right">
                          إجمالي الرواتب
                        </TableHead>
                        <TableHead className="text-right">
                          نسبة من الإجمالي
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payrollReport.byDepartment.length > 0 ? (
                        payrollReport.byDepartment.map((dept, index) => {
                          const percent =
                            (dept.total / payrollReport.totalPayroll) * 100;
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {dept.department}
                              </TableCell>
                              <TableCell className="font-mono tabular-nums">
                                {dept.employees}
                              </TableCell>
                              <TableCell className="font-mono tabular-nums">
                                {formatCurrency(dept.total)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs w-10 font-mono tabular-nums">
                                    {percent.toFixed(1)}%
                                  </span>
                                  <Progress
                                    value={percent}
                                    className="h-2 w-24"
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-8 text-gray-500"
                          >
                            لا توجد بيانات متاحة لهذا الشهر
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )
      )}
    </TabsContent>
  );
};
