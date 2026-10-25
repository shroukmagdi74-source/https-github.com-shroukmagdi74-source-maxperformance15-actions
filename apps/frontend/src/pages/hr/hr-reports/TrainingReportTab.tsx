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
import { TrainingReport } from "./types";

interface TrainingReportTabProps {
  loading: boolean;
  trainingReport: TrainingReport | null;
}

export const TrainingReportTab: React.FC<TrainingReportTabProps> = ({
  loading,
  trainingReport,
}) => {
  return (
    <TabsContent value="training" className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        trainingReport && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <p className="text-indigo-100 text-sm">معدل الإنجاز</p>
                  <h3 className="text-3xl font-bold mt-1 font-mono tabular-nums">
                    {trainingReport.completionRate}%
                  </h3>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-500 text-sm">برامج مكتملة</p>
                  <h3 className="text-2xl font-bold text-green-600 font-mono tabular-nums">
                    {trainingReport.completed}
                  </h3>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>توزيع البرامج التدريبية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={trainingReport.byCategory}
                      layout="vertical"
                    >
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        fill="#8b5cf6"
                        radius={[0, 4, 4, 0]}
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
