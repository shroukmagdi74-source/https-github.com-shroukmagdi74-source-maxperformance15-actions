import React from "react";
import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useTheme } from "../../hooks/useTheme";
import { DashboardData } from "./types";

interface SuperAdminTrendChartProps {
  data: DashboardData["trends"];
}

export const SuperAdminTrendChart: React.FC<SuperAdminTrendChartProps> = ({
  data,
}) => {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === "dark";
  const chartColors = {
    companies: "#6366f1",
    users: "#10b981",
    customers: "#3b82f6",
  };

  if (!data || data.length === 0) return null;

  const formatDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString("ar-EG", { day: "numeric", month: "short" });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const date = new Date(label + "T00:00:00");
    return (
      <div className="rounded-xl border border-border/80 bg-card p-3 shadow-md text-xs">
        <p className="mb-1.5 text-[10px] font-mono text-muted-foreground">
          {date.toLocaleDateString("ar-EG", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 py-0.5">
            <div
              className="size-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[11px] font-medium text-foreground">
              {entry.name === "companies"
                ? "شركات"
                : entry.name === "users"
                  ? "مستخدمين"
                  : "عملاء"}
              : {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-border/80 bg-card/40 p-4 shadow-xs">
      <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg border border-border/80 bg-muted/30 flex items-center justify-center text-primary">
            <TrendingUp className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground">
              النمو اليومي لمنظومة المنصة
            </h3>
            <p className="text-[10px] text-muted-foreground">
              الشركات · المستخدمين · العملاء (آخر 30 يوم)
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          معدل تصاعدي
        </span>
      </div>
      <div className="h-[280px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              {Object.entries(chartColors).map(([key, color]) => (
                <linearGradient
                  key={key}
                  id={`gradient_${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.01} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={
                isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"
              }
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 10 }}
              stroke={
                isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"
              }
            />
            <YAxis
              tick={{ fontSize: 10 }}
              stroke={
                isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) =>
                ({ companies: "شركات", users: "مستخدمين", customers: "عملاء" }[
                  value
                ] || value)
              }
              wrapperStyle={{ fontSize: "11px" }}
            />
            <Area
              type="monotone"
              dataKey="companies"
              stroke={chartColors.companies}
              fill="url(#gradient_companies)"
              strokeWidth={2}
              name="companies"
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke={chartColors.users}
              fill="url(#gradient_users)"
              strokeWidth={2}
              name="users"
            />
            <Area
              type="monotone"
              dataKey="customers"
              stroke={chartColors.customers}
              fill="url(#gradient_customers)"
              strokeWidth={2}
              name="customers"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
