import React, { useEffect, useRef } from "react";
import { Inbox, MessageSquare, Minus, Send, TrendingDown, TrendingUp, UserX } from "lucide-react";
import {
  motion,
  useMotionValue,
  animate as fmAnimate,
  useTransform,
} from "framer-motion";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { AnalyticsSummary, DeltaMetrics, SparkMetrics } from "./types";

const itemSlide = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 24 },
  },
} as const;

export const CountUp: React.FC<{
  value: number;
  duration?: number;
  reducedMotion?: boolean;
  format?: (v: number) => string;
}> = ({ value, duration = 0.8, reducedMotion = false, format }) => {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) =>
    format ? format(v) : Math.round(v).toLocaleString("en-US"),
  );
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reducedMotion) {
      mv.set(value);
      if (ref.current) {
        ref.current.textContent = format
          ? format(value)
          : Math.round(value).toLocaleString("en-US");
      }
      return;
    }
    const controls = fmAnimate(mv, value, { duration, ease: "easeOut" });
    const unsub = rounded.on("change", (text) => {
      if (ref.current) ref.current.textContent = text;
    });
    return () => {
      controls.stop();
      unsub();
    };
  }, [value, duration, reducedMotion, mv, rounded, format]);

  return <span ref={ref} className="font-mono tabular-nums">{format ? format(0) : "0"}</span>;
};

export const DeltaChip: React.FC<{ delta: number | null }> = ({ delta }) => {
  if (delta == null) return null;
  const isUp = delta > 0;
  const isFlat = delta === 0;
  const Icon = isUp ? TrendingUp : isFlat ? Minus : TrendingDown;
  const colorClass = isUp
    ? "text-[color:var(--color-success)] bg-success/10"
    : isFlat
      ? "text-muted-foreground bg-muted/50"
      : "text-[color:var(--color-destructive)] bg-destructive/10";

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold font-mono tabular-nums ${colorClass}`}
    >
      <Icon className="size-2.5" />
      {isUp ? "+" : ""}
      {delta.toFixed(1)}%
    </span>
  );
};

export const Sparkline: React.FC<{ data: number[]; color: string }> = ({
  data,
  color,
}) => {
  if (!data.length) return null;
  const chartData = data.map((v, i) => ({ x: i, y: v }));
  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart data={chartData} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
        <Line
          type="monotone"
          dataKey="y"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={true}
          animationDuration={400}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const GlassMetric: React.FC<{
  label: string;
  value: number;
  hint?: string;
  icon: React.ElementType;
  gradient: string;
  delay?: number;
  delta?: number | null;
  sparkData?: number[];
  sparkColor?: string;
  reducedMotion?: boolean;
}> = ({
  label,
  value,
  hint,
  icon: Icon,
  gradient,
  delay = 0,
  delta = null,
  sparkData,
  sparkColor = "#6366f1",
  reducedMotion = false,
}) => (
  <motion.div
    variants={itemSlide}
    whileHover={reducedMotion ? undefined : { y: -3 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
    className="relative overflow-hidden rounded-2xl border border-[color:var(--shell-control-border)] bg-[color:var(--color-card)]/80 p-4 shadow-sm backdrop-blur-xl sm:rounded-3xl sm:p-5"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div
      className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full opacity-[0.07] blur-2xl"
      style={{ background: gradient }}
    />
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground sm:text-[11px]">
            {label}
          </p>
          <DeltaChip delta={delta} />
        </div>
        <p className="text-2xl font-bold tracking-tight font-mono tabular-nums sm:text-3xl">
          <CountUp value={value} reducedMotion={reducedMotion} />
        </p>
        {hint && (
          <p className="text-[11px] text-muted-foreground sm:text-xs">{hint}</p>
        )}
        {sparkData && sparkData.length > 1 && (
          <div className="mt-1 -mb-1">
            <Sparkline data={sparkData} color={sparkColor} />
          </div>
        )}
      </div>
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] sm:size-11 sm:rounded-2xl"
        style={{ background: gradient }}
      >
        <Icon className="size-5 text-white sm:size-5.5" />
      </div>
    </div>
  </motion.div>
);

export interface EmployeeAnalyticsHeroCardsProps {
  summary: AnalyticsSummary;
  deltas: DeltaMetrics | null;
  sparkData: SparkMetrics | null;
  reducedMotion?: boolean;
}

export const EmployeeAnalyticsHeroCards: React.FC<EmployeeAnalyticsHeroCardsProps> = ({
  summary,
  deltas,
  sparkData,
  reducedMotion = false,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <GlassMetric
        label="محادثات واردة"
        value={summary.totalIncomingConversations}
        hint="العميل بدأها"
        icon={Inbox}
        gradient="linear-gradient(135deg, #6366f1, #4f46e5)"
        delay={0}
        delta={deltas?.incoming ?? null}
        sparkData={sparkData?.incoming}
        sparkColor="#6366f1"
        reducedMotion={reducedMotion}
      />
      <GlassMetric
        label="مردود عليها"
        value={summary.totalReplied}
        hint={`من ${summary.totalIncomingConversations} واردة`}
        icon={MessageSquare}
        gradient="linear-gradient(135deg, #10b981, #059669)"
        delay={60}
        delta={deltas?.replied ?? null}
        sparkData={sparkData?.replied}
        sparkColor="#10b981"
        reducedMotion={reducedMotion}
      />
      <GlassMetric
        label="غير مردود عليها"
        value={summary.totalUnreplied}
        hint="بحاجة لمتابعة"
        icon={UserX}
        gradient="linear-gradient(135deg, #f43f5e, #e11d48)"
        delay={120}
        delta={deltas?.unreplied ?? null}
        sparkData={sparkData?.unreplied}
        sparkColor="#f43f5e"
        reducedMotion={reducedMotion}
      />
      <GlassMetric
        label="رسائل صادرة"
        value={summary.totalOutgoingMessages}
        hint="من الموظفين"
        icon={Send}
        gradient="linear-gradient(135deg, #06b6d4, #0891b2)"
        delay={180}
        delta={deltas?.outgoing ?? null}
        sparkData={sparkData?.outgoing}
        sparkColor="#06b6d4"
        reducedMotion={reducedMotion}
      />
    </div>
  );
};
