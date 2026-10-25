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

const KPI_DATA = [
  { name: "الإنتاجية", value: 92 },
  { name: "الجودة", value: 85 },
  { name: "الالتزام", value: 95 },
  { name: "التعاون", value: 80 },
];

export const KpiReportTab: React.FC = () => {
  return (
    <TabsContent value="kpis" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <CardContent className="p-6">
            <p className="text-blue-100 text-sm">معدل تحقيق الأهداف</p>
            <h3 className="text-3xl font-bold mt-1 font-mono tabular-nums">87%</h3>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تطور مؤشرات الأداء الرئيسية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={KPI_DATA}>
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};
