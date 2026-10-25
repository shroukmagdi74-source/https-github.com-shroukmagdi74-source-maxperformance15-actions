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

const LATE_DATA = [
  { name: "المبيعات", minutes: 25 },
  { name: "التسويق", minutes: 15 },
  { name: "العمليات", minutes: 30 },
  { name: "التقنية", minutes: 5 },
];

export const LateAbsenceReportTab: React.FC = () => {
  return (
    <TabsContent value="late-absence" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white">
          <CardContent className="p-6">
            <p className="text-red-100 text-sm">متوسط دقائق التأخير</p>
            <h3 className="text-3xl font-bold mt-1 font-mono tabular-nums">18 دقيقة</h3>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">
          <CardContent className="p-6">
            <p className="text-orange-100 text-sm">إجمالي أيام الغياب</p>
            <h3 className="text-3xl font-bold mt-1 font-mono tabular-nums">42 يوم</h3>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>دقائق التأخير حسب القسم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={LATE_DATA}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="minutes"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                  barSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};
