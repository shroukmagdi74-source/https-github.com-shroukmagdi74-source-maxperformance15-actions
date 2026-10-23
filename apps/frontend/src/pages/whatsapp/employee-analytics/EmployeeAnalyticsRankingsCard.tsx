import React from "react";
import { ArrowDown, Trophy, Zap, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { EmployeeStat } from "./types";

const itemSlide = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 24 },
  },
} as const;

const containerStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
} as const;

const noMotion = {
  hidden: { opacity: 1 },
  show: { opacity: 1 },
} as const;

export const RankingRow: React.FC<{
  emp: EmployeeStat;
  idx: number;
  max: number;
  variant: "top" | "low";
  reducedMotion?: boolean;
}> = ({ emp, idx, max, variant, reducedMotion = false }) => {
  const isTop = variant === "top";
  const medalColors = isTop
    ? [
        "bg-amber-500/20 text-amber-600",
        "bg-slate-400/20 text-slate-600",
        "bg-orange-700/20 text-orange-700",
      ]
    : [];
  const barColor = isTop
    ? "from-indigo-500 to-violet-500"
    : "from-rose-400 to-rose-500/60";
  const barWidth = Math.max(4, (emp.outgoingMessages / max) * 100);

  return (
    <motion.div
      variants={reducedMotion ? noMotion : itemSlide}
      className="flex items-center gap-3"
    >
      <div
        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold font-mono tabular-nums ${
          isTop && idx < 3 ? medalColors[idx] : "bg-muted text-muted-foreground"
        }`}
      >
        {isTop && idx < 3 ? <Trophy className="size-3.5" /> : idx + 1}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">{emp.userName}</span>
          <span className="shrink-0 text-xs font-semibold font-mono tabular-nums text-muted-foreground">
            {emp.outgoingMessages} رسالة
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-muted/60">
          <motion.div
            initial={reducedMotion ? { width: `${barWidth}%` } : { width: 0 }}
            animate={{ width: `${barWidth}%` }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 18,
              delay: reducedMotion ? 0 : 0.1 * idx,
            }}
            className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
          />
        </div>
      </div>
    </motion.div>
  );
};

export interface EmployeeAnalyticsRankingsCardProps {
  topActive: EmployeeStat[];
  leastActive: EmployeeStat[];
  maxMessages: number;
  reducedMotion?: boolean;
}

export const EmployeeAnalyticsRankingsCard: React.FC<EmployeeAnalyticsRankingsCardProps> = ({
  topActive,
  leastActive,
  maxMessages,
  reducedMotion = false,
}) => {
  if (topActive.length === 0 && leastActive.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Most Active */}
      <motion.div
        variants={reducedMotion ? noMotion : itemSlide}
        className="relative overflow-hidden rounded-2xl border border-[color:var(--shell-control-border)] bg-[color:var(--color-card)]/80 p-5 shadow-sm backdrop-blur-xl sm:rounded-3xl"
      >
        <div className="pointer-events-none absolute -left-8 -top-8 size-32 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
              <Trophy className="size-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">الأكثر نشاطاً</h3>
              <p className="text-[11px] text-muted-foreground">أعلى رسائل صادرة</p>
            </div>
          </div>
          <Badge className="bg-success/15 font-mono tabular-nums text-[color:var(--color-success)]">
            <Zap className="size-3" />
            Top {topActive.length}
          </Badge>
        </div>
        <motion.div
          initial="hidden"
          animate="show"
          variants={reducedMotion ? noMotion : containerStagger}
          className="space-y-3"
        >
          {topActive.map((emp, idx) => (
            <RankingRow
              key={emp.userId}
              emp={emp}
              idx={idx}
              max={maxMessages}
              variant="top"
              reducedMotion={reducedMotion}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Least Active */}
      <motion.div
        variants={reducedMotion ? noMotion : itemSlide}
        className="relative overflow-hidden rounded-2xl border border-[color:var(--shell-control-border)] bg-[color:var(--color-card)]/80 p-5 shadow-sm backdrop-blur-xl sm:rounded-3xl"
      >
        <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-rose-500/5 blur-3xl" />
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 to-rose-600 shadow-sm">
              <ArrowDown className="size-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">الأقل نشاطاً</h3>
              <p className="text-[11px] text-muted-foreground">أقل رسائل صادرة</p>
            </div>
          </div>
          <Badge className="bg-destructive/15 font-mono tabular-nums text-[color:var(--color-destructive)]">
            <Activity className="size-3" />
            Low {leastActive.length}
          </Badge>
        </div>
        <motion.div
          initial="hidden"
          animate="show"
          variants={reducedMotion ? noMotion : containerStagger}
          className="space-y-3"
        >
          {leastActive.map((emp, idx) => (
            <RankingRow
              key={emp.userId}
              emp={emp}
              idx={idx}
              max={maxMessages}
              variant="low"
              reducedMotion={reducedMotion}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};
