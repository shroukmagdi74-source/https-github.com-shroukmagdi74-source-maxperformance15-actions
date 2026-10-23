import React from "react";
import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { WhatsAppSurfaceCard } from "../../components/WhatsAppPageShell";
import type { DailyEntry } from "../types";

interface DailyTrafficChartCardProps {
  dailyDist: DailyEntry[];
}

export const DailyTrafficChartCard: React.FC<DailyTrafficChartCardProps> = ({ dailyDist }) => {
  return (
    <WhatsAppSurfaceCard
      title="حركة الرسائل اليومية"
      description="الرسائل الواردة والصادرة يومياً"
      className="lg:col-span-3"
    >
      {dailyDist.length > 0 ? (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={dailyDist} margin={{ top: 8, bottom: 0, left: -10, right: 0 }}>
            <defs>
              <linearGradient id="gradIncoming" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradOutgoing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-muted)" opacity={0.3} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: string) => v.substring(5)}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <RechartsTooltip
              cursor={{ stroke: "var(--color-muted)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--color-border)",
                background: "var(--color-card)",
                fontSize: 12,
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              }}
            />
            <Area
              type="monotone"
              dataKey="incoming"
              name="واردة"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#gradIncoming)"
              animationDuration={500}
            />
            <Area
              type="monotone"
              dataKey="outgoing"
              name="صادرة"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#gradOutgoing)"
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[260px] flex-col items-center justify-center text-center">
          <TrendingUp className="mb-2 size-8 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground">لا توجد بيانات حركة يومية للفترة المحددة</p>
        </div>
      )}
    </WhatsAppSurfaceCard>
  );
};
