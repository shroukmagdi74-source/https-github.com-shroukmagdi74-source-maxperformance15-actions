import React from "react";
import { Clock } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { WhatsAppSurfaceCard } from "../../components/WhatsAppPageShell";

interface HourlyDistributionCardProps {
  hourlyChartData: { hour: string; رسائل: number }[];
  hourlyDist: number[];
}

export const HourlyDistributionCard: React.FC<HourlyDistributionCardProps> = ({
  hourlyChartData,
  hourlyDist,
}) => {
  const hasData = hourlyDist.some((h) => h > 0);

  return (
    <WhatsAppSurfaceCard
      title="التوزيع حسب الساعة"
      description="حركة الرسائل خلال ساعات اليوم"
    >
      {hasData ? (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={hourlyChartData} margin={{ top: 8, bottom: 0, left: -10, right: 0 }}>
            <defs>
              <linearGradient id="gradHourly" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-muted)" opacity={0.3} />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <RechartsTooltip
              cursor={{ fill: "var(--color-muted)", opacity: 0.2 }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--color-border)",
                background: "var(--color-card)",
                fontSize: 12,
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              }}
            />
            <Bar dataKey="رسائل" fill="url(#gradHourly)" radius={[4, 4, 0, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[260px] flex-col items-center justify-center text-center">
          <Clock className="mb-2 size-8 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground">لا توجد بيانات حركة بالساعة للفترة المحددة</p>
        </div>
      )}
    </WhatsAppSurfaceCard>
  );
};
