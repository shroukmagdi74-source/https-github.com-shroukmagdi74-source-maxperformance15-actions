export const getTierColorClass = (tier: string): string => {
  switch (tier) {
    case "TIER_S":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    case "TIER_A":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "TIER_B":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case "TIER_C":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "TIER_D":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    default:
      return "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20";
  }
};

export const getScoreColor = (score: number, isEvaluated = true): string => {
  if (!isEvaluated) return "text-muted-foreground";
  if (score >= 90) return "text-purple-600 dark:text-purple-400";
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 70) return "text-blue-600 dark:text-blue-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
};
