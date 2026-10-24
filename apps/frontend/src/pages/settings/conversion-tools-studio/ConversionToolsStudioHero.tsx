import { Link } from "react-router-dom";
import {
  Sparkles,
  CheckCircle2,
  Store,
  ExternalLink,
  TrendingUp,
  ChevronLeft,
} from "lucide-react";

export interface ConversionToolsStudioHeroProps {
  title: string;
  description: string;
  activeToolsCount: number;
  totalTools: number;
  activeAppsCount: number;
  totalApps: number;
  storePreviewPath: string | null;
}

export function ConversionToolsStudioHero({
  title,
  description,
  activeToolsCount,
  totalTools,
  activeAppsCount,
  totalApps,
  storePreviewPath,
}: ConversionToolsStudioHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/80 via-white to-sky-50/50 p-5 shadow-xs dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 sm:p-8">
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/90 px-3 py-1 text-xs font-bold text-indigo-700 shadow-xs dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>استوديو أدوات التحويل للمتجر</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
            {title}
          </h1>

          <p className="text-xs leading-6 text-slate-600 dark:text-slate-300 sm:text-sm sm:leading-7">
            {description}
          </p>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span>
                الأدوات النشطة:{" "}
                <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {activeToolsCount}
                </span>{" "}
                من <span className="font-mono tabular-nums">{totalTools}</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>
                تطبيقات متصلة: <span className="font-mono tabular-nums">{activeAppsCount}</span> من <span className="font-mono tabular-nums">{totalApps}</span>
              </span>
            </div>

            {storePreviewPath && (
              <a
                href={storePreviewPath}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Store className="h-3.5 w-3.5 text-slate-500" />
                <span>معاينة متجرك</span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </a>
            )}
          </div>
        </div>

        {/* Upsell & Cross-sell Hub CTA */}
        <div className="shrink-0">
          <Link
            to="/settings/upsell"
            className="group flex items-center gap-3.5 rounded-2xl border border-blue-200/90 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-blue-50/90 p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-blue-900/50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-blue-950/40"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25 transition-transform group-hover:scale-105">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-blue-950 dark:text-blue-200 sm:text-sm">
                  عروض الـ Upsell & Cross-sell
                </span>
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-black text-white">
                  Hub
                </span>
              </div>
              <p className="text-[11px] text-blue-700 dark:text-blue-300">
                إدارة عروض الترقية والمكملات لرفع قيمة السلة
              </p>
            </div>
            <ChevronLeft className="h-4 w-4 text-blue-600 transition-transform group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[-2px] dark:text-blue-400" />
          </Link>
        </div>
      </div>
    </section>
  );
}
