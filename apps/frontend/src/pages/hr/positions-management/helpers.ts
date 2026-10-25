export const getLevelBadge = (
  level: number,
): { color: string; label: string } => {
  const colors = [
    "bg-blue-100 text-blue-800",
    "bg-green-100 text-green-800",
    "bg-purple-100 text-purple-800",
    "bg-orange-100 text-orange-800",
  ];
  const labels = ["مبتدئ", "متوسط", "خبير", "إداري"];
  return {
    color: colors[Math.min(level - 1, colors.length - 1)],
    label: labels[Math.min(level - 1, labels.length - 1)],
  };
};
