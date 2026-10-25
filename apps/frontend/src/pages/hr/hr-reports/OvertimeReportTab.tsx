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

const OVERTIME_DATA = [
  { name: "المبيعات", hours: 45 },
  { name: "التقنية", hours: 120 },
  { name: "العمليات", hours: 80 },
  { name: "الموارد البشرية", hours: 10 },
];

export const OvertimeReportTab: React.FC = () => {
  return (
    <TabsContent value="overtime" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>تكاليف وساعات العمل الإضافي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={OVERTIME_DATA}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};
