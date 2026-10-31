import React from "react";
import { getStatusDisplay } from "../../../../utils/statusRegistry";

export const sectionSurfaceStyle: React.CSSProperties = {
  background: "var(--business-surface-subtle)",
  border: "1px solid var(--business-card-border)",
  boxShadow: "var(--business-card-shadow)",
};

export const mutedHeadingStyle: React.CSSProperties = {
  color: "var(--color-muted-foreground)",
};

export const getOrderStatusTheme = (status?: string) => {
  if (!status) return { background: "#f3f4f6", color: "#374151" };
  const info = getStatusDisplay(status);
  const colorMatch = info.colorClass.match(/text-([a-z]+)-(\d+)/);
  const colorMap: Record<string, string> = {
    green: "#16a34a",
    red: "#dc2626",
    yellow: "#ca8a04",
    blue: "#2563eb",
    indigo: "#4f46e5",
    purple: "#9333ea",
    orange: "#ea580c",
    amber: "#d97706",
    gray: "#6b7280",
    cyan: "#06b6d4",
    teal: "#0d9488",
    rose: "#e11d48",
    sky: "#0284c7",
    emerald: "#059669",
    pink: "#db2777",
    stone: "#78716c",
  };
  const colorName = colorMatch ? colorMatch[1] : "gray";
  const color = colorMap[colorName] || "#6b7280";
  return {
    background: `color-mix(in srgb, ${color} 12%, var(--color-card, #ffffff))`,
    color,
  };
};
