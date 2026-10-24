import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RelatedToolItem {
  to: string;
  icon: LucideIcon;
  label: string;
  desc: string;
  isCurrent: boolean;
}

interface StorePromotionRelatedNavProps {
  tools: RelatedToolItem[];
}

export const StorePromotionRelatedNav: React.FC<StorePromotionRelatedNavProps> = ({ tools }) => {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t("promotionSettings.relatedToolsLabel", "أدوات مرتبطة")}
      className="flex gap-2.5 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 xl:grid-cols-4"
    >
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isCurrent = tool.isCurrent;
        return (
          <Link
            key={tool.to}
            to={tool.to}
            className={cn(
              "group flex min-w-[240px] shrink-0 items-start gap-2.5 rounded-2xl border px-3.5 py-3 transition hover:-translate-y-px sm:min-w-0",
              isCurrent
                ? "border-amber-400/80 bg-amber-50/70 shadow-xs dark:border-amber-600/70 dark:bg-amber-950/30"
                : "border-slate-200/70 bg-white/85 hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700"
            )}
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition",
                isCurrent
                  ? "bg-amber-100 text-amber-800 ring-amber-300/80 dark:bg-amber-900/50 dark:text-amber-200 dark:ring-amber-700"
                  : "bg-slate-50 text-slate-600 ring-slate-200/70 group-hover:bg-white dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:group-hover:bg-slate-700"
              )}
            >
              <Icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-slate-950 dark:text-slate-100">
                {tool.label}
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">{tool.desc}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
