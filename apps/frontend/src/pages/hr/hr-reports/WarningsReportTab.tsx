import React from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { WarningReport } from "./types";

interface WarningsReportTabProps {
  loading: boolean;
  warningReport: WarningReport | null;
}

const WARNING_COLORS = ["#f59e0b", "#ef4444", "#3b82f6"];

export const WarningsReportTab: React.FC<WarningsReportTabProps> = ({
  loading,
  warningReport,
}) => {
  return (
    <TabsContent value="warnings" className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        warningReport && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-100 text-sm">
                        إجمالي الإنذارات
                      </p>
                      <h3 className="text-3xl font-bold mt-1 font-mono tabular-nums">
                        {warningReport.totalWarnings}
                      </h3>
                    </div>
                    <AlertTriangle className="h-10 w-10 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>توزيع الإنذارات حسب النوع</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={warningReport.byType}
                          dataKey="count"
                          nameKey="type"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {warningReport.byType.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                WARNING_COLORS[index % WARNING_COLORS.length]
                              }
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
                  <CardTitle>حسب درجة الخطورة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={warningReport.bySeverity}>
                        <XAxis dataKey="severity" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="count"
                          fill="#ef4444"
                          radius={[4, 4, 0, 0]}
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
