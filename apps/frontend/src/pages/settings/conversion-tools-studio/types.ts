import type { ReactNode } from "react";
import type { ConversionToolEntry } from "../conversionToolMeta";

export type StatusFilter = "all" | "active" | "inactive";

export interface CategoryStyle {
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  label: string;
}

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  "product-conversion": {
    iconBg: "bg-sky-50 dark:bg-sky-950/40",
    iconColor: "text-sky-600 dark:text-sky-400",
    badgeBg: "bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300",
    label: "صفحة المنتج",
  },
  "offers-bundles": {
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300",
    label: "العروض والحزم",
  },
  "growth-widgets": {
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300",
    label: "محفزات الشراء",
  },
  "selling-modes": {
    iconBg: "bg-purple-50 dark:bg-purple-950/40",
    iconColor: "text-purple-600 dark:text-purple-400",
    badgeBg: "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300",
    label: "أنماط البيع",
  },
  "reviews-social-proof": {
    iconBg: "bg-rose-50 dark:bg-rose-950/40",
    iconColor: "text-rose-600 dark:text-rose-400",
    badgeBg: "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300",
    label: "التقييمات والثقة",
  },
};

export interface CategoryTabItem {
  id: string;
  label: string;
  count: number;
}

export interface ToolCardProps {
  entry: ConversionToolEntry;
  toolLabel: string;
  toolBenefit: string;
  enabled: boolean;
  available: boolean;
  isSaving: boolean;
  onToggle: (nextValue: boolean) => void;
  preview: ReactNode;
}
