import React from "react";
import { Activity, Layers, Target } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Brush,
} from "recharts";
import { AnalyticsSummary, EmployeeChartItem } from "./types";

const itemSlide = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 24 },
  },
} as const;

const noMotion = {
  hidden: { opacity: 1 },
  show: { opacity: 1 },
} as const;

export const RadialProgress: React.FC<{
  value: number;
  label: string;
  size?: number;
}> = ({ value, label, size = 120 }) => {
  const chartData = [
    { name: label, value: Math.min(100, value), fill: "url(#gradRing)" },
  ];
  return (
    <div className="relative flex flex-col items-center">
      <ResponsiveContainer width={size} height={size}>
        <RadialBarChart
          innerRadius="72%"
          outerRadius="100%"
          data={chartData}
          startAngle={90}
          endAngle={-270}
        >
          <defs>
            <linearGradient id="gradRing" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            background={{ fill: "var(--color-muted)" }}
            dataKey="value"
            cornerRadius={12}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold font-mono tabular-nums sm:text-2xl">
          {value}%
        </span>
        <span className="text-[10px] text-muted-foreground sm:text-xs">
          {label}
        </span>
      </div>
    </div>
  );
};

export interface EmployeeAnalyticsResponseChartsCardProps {
  summary: AnalyticsSummary;
  chartData: EmployeeChartItem[];
  reducedMotion?: boolean;
}

export const EmployeeAnalyticsResponseChartsCard: React.FC<EmployeeAnalyticsResponseChartsCardProps> = ({
  summary,
  chartData,
  reducedMotion = false,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Response Rate Radial */}
      <motion.div
        variants={reducedMotion ? noMotion : itemSlide}
        className="relative overflow-hidden rounded-2xl border border-[color:var(--shell-control-border)] bg-[color:var(--color-card)]/80 p-5 shadow-sm backdrop-blur-xl sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">نسبة الرد الكلية</h3>
            </div>
            <p className="text-xs text-muted-foreground">من المحادثات الواردة</p>
          </div>
        </div>
        <div className="flex flex-col items-center pb-2">
          <RadialProgress
            value={Math.round(summary.overallResponseRate)}
            label="نسبة الرد"
            size={140}
          />
          <div className="mt-3 grid w-full grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold font-mono tabular-nums text-[color:var(--color-success)]">
                {summary.totalReplied}
              </p>
              <p className="text-[10px] text-muted-foreground">مردود</p>
            </div>
            <div>
              <p className="text-lg font-bold font-mono tabular-nums text-[color:var(--color-destructive)]">
                {summary.totalUnreplied}
              </p>
              <p className="text-[10px] text-muted-foreground">غير مردود</p>
            </div>
            <div>
              <p className="text-lg font-bold font-mono tabular-nums text-primary">
                {summary.overallAvgResponseTimeMin ?? "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">دقيقة رد</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Per-Employee Bar Chart */}
      <motion.div
        variants={reducedMotion ? noMotion : itemSlide}
        className="relative overflow-hidden rounded-2xl border border-[color:var(--shell-control-border)] bg-[color:var(--color-card)]/80 p-5 shadow-sm backdrop-blur-xl sm:rounded-3xl lg:col-span-2"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">
              مقارنة الرسائل والمحادثات (أعلى 10)
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="size-2.5 rounded-full bg-indigo-500" />
              صادرة
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2.5 rounded-full bg-cyan-400" />
              واردة
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2.5 rounded-full bg-violet-400" />
              محادثات
            </span>
          </div>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barGap={4}>
              <defs>
                <linearGradient id="barOutgoing" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="barIncoming" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#0891b2" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="barConvos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-muted)"
                opacity={0.3}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <RechartsTooltip
                cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-card)",
                  fontSize: 12,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                }}
              />
              <Bar
                dataKey="محادثات"
                fill="url(#barConvos)"
                radius={[6, 6, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="واردة"
                fill="url(#barIncoming)"
                radius={[6, 6, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="صادرة"
                fill="url(#barOutgoing)"
                radius={[6, 6, 0, 0]}
                maxBarSize={28}
              />
              <Brush
                dataKey="name"
                height={20}
                stroke="var(--color-primary)"
                fill="var(--color-muted)"
                travellerWidth={8}
                className="mt-2"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[240px] flex-col items-center justify-center text-center">
            <Activity className="mb-2 size-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">لا توجد بيانات للعرض</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
