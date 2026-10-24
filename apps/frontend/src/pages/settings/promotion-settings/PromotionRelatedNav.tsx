import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PackageCheck, Percent, Sparkles } from "lucide-react";

export function PromotionRelatedNav() {
  const { t } = useTranslation();

  const relatedTools = [
    {
      to: "/settings/store-promotion",
      icon: Percent,
      label: t("promotionSettings.relatedVolume"),
      desc: t("promotionSettings.relatedVolumeDesc"),
    },
    {
      to: "/settings/delivery-options",
      icon: PackageCheck,
      label: t("promotionSettings.relatedDelivery"),
      desc: t("promotionSettings.relatedDeliveryDesc"),
    },
    {
      to: "/settings/recommendations",
      icon: Sparkles,
      label: t("promotionSettings.relatedRecommend"),
      desc: t("promotionSettings.relatedRecommendDesc"),
    },
  ];

  return (
    <nav
      aria-label={t("promotionSettings.relatedToolsLabel")}
      className="flex gap-2.5 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 xl:grid-cols-3"
    >
      {relatedTools.map((tool) => {
        const Icon = tool.icon;
        return (
          <Link
            key={tool.to}
            to={tool.to}
            className="group flex min-w-[240px] shrink-0 items-start gap-2.5 rounded-2xl border border-slate-200/70 bg-white/85 px-3.5 py-3 transition hover:-translate-y-px hover:border-slate-300 hover:shadow-xs sm:min-w-0 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200/70 transition group-hover:bg-white dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:group-hover:bg-slate-700">
              <Icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-slate-950 dark:text-slate-100">
                {tool.label}
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                {tool.desc}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
