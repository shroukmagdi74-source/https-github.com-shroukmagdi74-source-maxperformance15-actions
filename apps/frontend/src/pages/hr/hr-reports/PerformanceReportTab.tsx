import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { PerformanceReport } from "./types";

interface PerformanceReportTabProps {
  loading: boolean;
  performanceReport: PerformanceReport | null;
}

export const PerformanceReportTab: React.FC<PerformanceReportTabProps> = ({
  loading,
  performanceReport,
}) => {
  return (
    <TabsContent value="performance" className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        performanceReport && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <CardContent className="p-6">
                  <p className="text-emerald-100 text-sm">
                    متوسط التقييم العام
                  </p>
                  <h3 className="text-3xl font-bold mt-1 font-mono tabular-nums">
                    {performanceReport.averageRating} / 5
                  </h3>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>توزيع مستويات الأداء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceReport.distribution}>
                      <XAxis dataKey="rating" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        barSize={50}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )
      )}
    </TabsContent>
  );
};
