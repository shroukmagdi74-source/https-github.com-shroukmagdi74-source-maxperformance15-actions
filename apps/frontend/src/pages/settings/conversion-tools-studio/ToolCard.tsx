import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { getDirection } from "../../../i18n";
import { STORE_CONVERSION_APP_LABELS } from "../storeConversionSettingsConfig";
import { CATEGORY_STYLES, type ToolCardProps } from "./types";

export function ToolCard({
  entry,
  toolLabel,
  toolBenefit,
  enabled,
  available,
  isSaving,
  onToggle,
  preview,
}: ToolCardProps) {
  const { tool, page, meta } = entry;
  const isRtl = getDirection() === "rtl";
  const ForwardChevron = isRtl ? ChevronLeft : ChevronRight;
  const ToolIcon = meta?.icon || Sparkles;
  const displayKind = meta?.displayKind || "pdp";
  const placementText = displayKind === "pdp" ? "صفحة المنتج (PDP)" : "كامل المتجر (Global)";
  const categoryStyle = CATEGORY_STYLES[page.id] || CATEGORY_STYLES["product-conversion"];

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/95 dark:hover:border-indigo-700/80">
      {/* Header: Icon + Title + Quick Toggle */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200/60 shadow-xs dark:border-slate-700/50 ${categoryStyle.iconBg} ${categoryStyle.iconColor}`}
            >
              <ToolIcon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <Link
                to={`/settings/store/tools/${tool.key}`}
                className="font-bold text-slate-900 transition-colors hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
              >
                <h3 className="text-sm font-extrabold tracking-tight sm:text-base">
                  {toolLabel}
                </h3>
              </Link>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
                  {placementText}
                </span>
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${categoryStyle.badgeBg}`}
                >
                  {categoryStyle.label}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Toggle Switch */}
          <div className="shrink-0 pt-0.5">
            <button
              type="button"
              role="switch"
              aria-label={`تفعيل ${toolLabel}`}
              aria-checked={enabled}
              disabled={!available || isSaving}
              title={
                !available
                  ? `يتطلب تطبيق ${STORE_CONVERSION_APP_LABELS[tool.appSlug]}`
                  : enabled
                  ? "الأداة مفعلة - انقر للتعطيل"
                  : "الأداة معطلة - انقر للتفعيل"
              }
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!available || isSaving) return;
                onToggle(!enabled);
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 ${
                !available
                  ? "cursor-not-allowed bg-slate-200 opacity-60 dark:bg-slate-800"
                  : enabled
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600"
              }`}
            >
              {isSaving ? (
                <span className="mx-auto flex items-center justify-center">
                  <Loader2 className="h-3 w-3 animate-spin text-white" />
                </span>
              ) : (
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow-xs transition-all duration-200 ${
                    enabled ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0"
                  }`}
                />
              )}
            </button>
          </div>
        </div>

        {/* Marketing Benefit Description */}
        <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {toolBenefit}
        </p>
      </div>

      {/* Mini Live Storefront Preview */}
      <Link
        to={`/settings/store/tools/${tool.key}`}
        className="block px-4 pb-3 sm:px-5"
      >
        <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-950/70">
          <div className="flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-2.5 py-1.5 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>
            <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">
              معاينة حية للمتجر
            </span>
            <div className="w-6" />
          </div>

          <div className="relative flex h-28 items-center justify-center overflow-hidden bg-white p-2.5 sm:h-32">
            <div className="pointer-events-none w-[130%] origin-center scale-[0.74]">
              {preview}
            </div>

            {!available && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 p-2 text-center backdrop-blur-xs dark:bg-slate-950/80">
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                  يتطلب {STORE_CONVERSION_APP_LABELS[tool.appSlug]}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Card Footer: Status & Customization CTA */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800/80 dark:bg-slate-900/40 sm:px-5">
        <div className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              !available
                ? "bg-amber-400"
                : enabled
                ? "bg-emerald-500 shadow-xs shadow-emerald-500/50"
                : "bg-slate-300 dark:bg-slate-700"
            }`}
          />
          <span
            className={`text-xs font-bold ${
              !available
                ? "text-amber-700 dark:text-amber-300"
                : enabled
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {!available ? "غير متوفرة" : enabled ? "نشطة بالمتجر" : "معطّلة"}
          </span>
        </div>

        <Link
          to={`/settings/store/tools/${tool.key}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 transition-transform group-hover:text-indigo-700 dark:text-indigo-400 dark:group-hover:text-indigo-300"
        >
          <span>تخصيص وإعدادات</span>
          <ForwardChevron className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[-2px]" />
        </Link>
      </div>
    </div>
  );
}
