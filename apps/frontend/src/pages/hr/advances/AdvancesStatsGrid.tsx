import React from "react";
import { DollarSign, Calendar, Check, TrendingUp } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { formatCurrency } from "./helpers";
import type { AdvanceStats } from "./types";

interface AdvancesStatsGridProps {
  stats: AdvanceStats;
}

export const AdvancesStatsGrid: React.FC<AdvancesStatsGridProps> = ({
  stats,
}) => {
  const cards = [
    {
      title: "إجمالي الطلبات",
      value: stats.total.toString(),
      icon: <DollarSign className="h-7 w-7" />,
      tint: "from-sky-100 via-sky-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900",
      accent: "bg-sky-500",
      text: "text-slate-900",
    },
    {
      title: "بانتظار الموافقة",
      value: stats.pending.toString(),
      icon: <Calendar className="h-7 w-7" />,
      tint: "from-amber-100 via-amber-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900",
      accent: "bg-amber-500",
      text: "text-slate-900",
    },
    {
      title: "معتمد",
      value: stats.approved.toString(),
      icon: <Check className="h-7 w-7" />,
      tint: "from-emerald-100 via-emerald-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900",
      accent: "bg-emerald-500",
      text: "text-slate-900",
    },
    {
      title: "إجمالي المبالغ",
      value: formatCurrency(stats.totalAmount),
      icon: <TrendingUp className="h-7 w-7" />,
      tint: "from-indigo-100 via-indigo-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900",
      accent: "bg-indigo-500",
      text: "text-slate-900",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="relative overflow-hidden border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-white/5 backdrop-blur shadow-sm rounded-2xl"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${card.tint}`} />
          <div className="absolute inset-0 bg-white/30 pointer-events-none" />
          <CardContent className="relative p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-slate-600 dark:text-slate-300 uppercase tracking-wider font-medium">
                {card.title}
              </p>
              <h3
                className={`text-2xl sm:text-3xl font-black tracking-tight ${card.text} dark:text-white font-mono tabular-nums`}
              >
                {card.value}
              </h3>
            </div>
            <div
              className={`h-11 w-11 rounded-xl ${card.accent} bg-opacity-90 text-white shadow-sm flex items-center justify-center shrink-0`}
            >
              {card.icon}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
