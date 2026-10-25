import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const DEMOGRAPHIC_TRACKS = [
  { name: "إداري", count: 12 },
  { name: "فني", count: 25 },
  { name: "خدمات", count: 8 },
  { name: "قيادي", count: 5 },
];

export const EmployeeDemographicsTab: React.FC = () => {
  return (
    <TabsContent value="employee" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-gray-500 text-sm">متوسط العمر</p>
          <p className="text-3xl font-bold mt-1 font-mono tabular-nums">29 عام</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-500 text-sm">التوازن الجندري</p>
          <p className="text-3xl font-bold mt-1 font-mono tabular-nums">
            65% ذكور / 35% إناث
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-500 text-sm">متوسط الأقدمية</p>
          <p className="text-3xl font-bold mt-1 font-mono tabular-nums">1.8 عام</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>توزيع المسارات الوظيفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMOGRAPHIC_TRACKS}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#4f46e5"
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
