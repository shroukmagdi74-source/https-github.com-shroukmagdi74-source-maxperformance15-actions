import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowPathIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  RectangleGroupIcon,
  BoltIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  CodeBracketIcon,
  PaintBrushIcon,
} from "@heroicons/react/24/outline";
import { getApiUrl } from "../../../config/environment";
import { getStorefrontSectionLabel } from "../../sections/manifest";
import {
  calculatePerformanceScore,
  formatBytes,
  type PerformanceScoreResult,
} from "../utils/performanceScore";

interface AnalyticsSummary {
  totals: {
    views: number;
    clicks: number;
    ctr: number;
  };
  pages: Array<{
    pageKey: string;
    views: number;
    clicks: number;
  }>;
  sections: Array<{
    sectionType: string;
    views: number;
    clicks: number;
  }>;
}

export interface StudioInspectorAnalyticsTabProps {
  companyId?: string;
  activePageKey?: string;
  sections?: any[];
  pageConfig?: any;
  theme?: any;
  customCss?: string;
  customJs?: string;
  fonts?: string[];
  initialSubView?: "speed" | "traffic";
}

export const StudioInspectorAnalyticsTab: React.FC<StudioInspectorAnalyticsTabProps> = ({
  companyId,
  activePageKey,
  sections,
  pageConfig,
  theme,
  customCss,
  customJs,
  fonts,
  initialSubView = "speed",
}) => {
  const [subView, setSubView] = useState<"speed" | "traffic">(initialSubView);
  const [days, setDays] = useState<7 | 14 | 30>(7);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Compute local performance score, weights, and top 3 recommendations (PERF-1)
  const perfResult: PerformanceScoreResult = useMemo(() => {
    const effectiveSections = sections || pageConfig?.sections || [];
    return calculatePerformanceScore({
      sections: effectiveSections,
      pageConfig,
      theme,
      customCss,
      customJs,
      fonts,
      pageKey: activePageKey,
    });
  }, [sections, pageConfig, theme, customCss, customJs, fonts, activePageKey]);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const base = getApiUrl().replace(/\/$/, "");
      const params = new URLSearchParams({ days: String(days) });
      if (companyId) {
        params.set("companyId", companyId);
      }

      const token =
        (typeof window !== "undefined" &&
          (window.localStorage.getItem("token") ||
            window.localStorage.getItem("accessToken"))) ||
        "";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      if (companyId) {
        headers["x-company-id"] = companyId;
      }

      const res = await fetch(`${base}/storefront-analytics/summary?${params.toString()}`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: AnalyticsSummary = await res.json();
      setSummary(data);
    } catch {
      setError("تعذر تحميل بيانات التحليلات");
    } finally {
      setLoading(false);
    }
  }, [days, companyId]);

  useEffect(() => {
    if (subView === "traffic") {
      fetchSummary();
    }
  }, [subView, fetchSummary]);

  const totals = summary?.totals || { views: 0, clicks: 0, ctr: 0 };
  const pages = summary?.pages || [];
  const trafficSections = summary?.sections || [];

  const formatCtr = (views: number, clicks: number): string => {
    if (!views || views <= 0) return "—";
    const ratio = (clicks / views) * 100;
    return `${ratio.toFixed(1)}%`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (score >= 75) return { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
    if (score >= 50) return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
    return { text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" };
  };

  const scoreTheme = getScoreColor(perfResult.score);

  return (
    <div
      className="flex flex-col gap-3.5 p-3.5 text-[#17181c] select-none text-[12px]"
      data-testid="studio-analytics-tab-content"
    >
      {/* 1. Sub-View Switcher: Speed vs Traffic */}
      <div className="flex items-center rounded-lg bg-[#f4f5f7] p-1 border border-[#e8eaed]">
        <button
          type="button"
          onClick={() => setSubView("speed")}
          data-testid="analytics-view-speed"
          className={`flex-1 flex items-center justify-center gap-1.5 rounded py-1.5 text-[11px] font-bold transition-all ${
            subView === "speed"
              ? "bg-white text-[#2b6cf6] shadow-xs"
              : "text-[#7a7f87] hover:text-[#17181c]"
          }`}
        >
          <BoltIcon className="h-3.5 w-3.5" />
          <span>سرعة وأوزان الصفحة</span>
        </button>
        <button
          type="button"
          onClick={() => setSubView("traffic")}
          data-testid="analytics-view-traffic"
          className={`flex-1 flex items-center justify-center gap-1.5 rounded py-1.5 text-[11px] font-bold transition-all ${
            subView === "traffic"
              ? "bg-white text-[#2b6cf6] shadow-xs"
              : "text-[#7a7f87] hover:text-[#17181c]"
          }`}
        >
          <ChartBarIcon className="h-3.5 w-3.5" />
          <span>تفاعل الزوار (AN-1)</span>
        </button>
      </div>

      {subView === "speed" ? (
        <div className="flex flex-col gap-3" data-testid="performance-score-section">
          {/* 2. Performance Score Badge */}
          <div
            data-testid="performance-score-card"
            className={`flex items-center justify-between rounded-xl border p-3.5 shadow-xs ${scoreTheme.bg} ${scoreTheme.border}`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <BoltIcon className={`h-4 w-4 ${scoreTheme.text}`} />
                <span className="text-xs font-bold text-[#17181c]">درجة الأداء المحلية</span>
              </div>
              <p className="mt-1 text-[10.5px] text-[#6b7280]">
                فحص فوري بدون استهلاك للشبكة وفق معايير Web Vitals
              </p>
            </div>
            <div className="text-end">
              <span
                data-testid="performance-score-value"
                className={`text-2xl font-black tabular-nums tracking-tight ${scoreTheme.text}`}
              >
                {perfResult.score}
              </span>
              <span className="text-[11px] font-bold text-[#8a8f96]"> / 100</span>
            </div>
          </div>

          {/* 3. Real Page Weights Breakdown */}
          <div
            data-testid="performance-weights-card"
            className="flex flex-col gap-2 rounded-xl border border-[#eeeef0] bg-[#fafbfc] p-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-[11.5px] text-[#17181c]">
                <DocumentTextIcon className="h-4 w-4 text-[#2b6cf6]" />
                <span>أوزان الصفحة الحقيقية</span>
              </div>
              <span
                data-testid="performance-total-weight"
                className="rounded-full bg-[#2b6cf6]/10 px-2 py-0.5 text-[10.5px] font-extrabold text-[#2b6cf6] font-mono"
              >
                {perfResult.weights.formattedTotal}
              </span>
            </div>

            <div className="mt-1 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg border border-[#eef0f2] bg-white p-2">
                <div className="flex items-center gap-1 text-[10px] text-[#7a7f87]">
                  <PhotoIcon className="h-3 w-3 text-emerald-500" />
                  <span>الصور</span>
                </div>
                <div
                  data-testid="performance-images-weight"
                  className="mt-1 font-bold text-[#17181c] font-mono"
                >
                  {formatBytes(perfResult.weights.imagesBytes)}
                </div>
              </div>

              <div className="rounded-lg border border-[#eef0f2] bg-white p-2">
                <div className="flex items-center gap-1 text-[10px] text-[#7a7f87]">
                  <CodeBracketIcon className="h-3 w-3 text-purple-500" />
                  <span>السكربتات</span>
                </div>
                <div
                  data-testid="performance-scripts-weight"
                  className="mt-1 font-bold text-[#17181c] font-mono"
                >
                  {formatBytes(perfResult.weights.scriptsBytes)}
                </div>
              </div>

              <div className="rounded-lg border border-[#eef0f2] bg-white p-2">
                <div className="flex items-center gap-1 text-[10px] text-[#7a7f87]">
                  <PaintBrushIcon className="h-3 w-3 text-blue-500" />
                  <span>أنماط CSS</span>
                </div>
                <div
                  data-testid="performance-styles-weight"
                  className="mt-1 font-bold text-[#17181c] font-mono"
                >
                  {formatBytes(perfResult.weights.stylesBytes)}
                </div>
              </div>

              <div className="rounded-lg border border-[#eef0f2] bg-white p-2">
                <div className="flex items-center gap-1 text-[10px] text-[#7a7f87]">
                  <RectangleGroupIcon className="h-3 w-3 text-amber-500" />
                  <span>بنية البيانات</span>
                </div>
                <div
                  data-testid="performance-data-weight"
                  className="mt-1 font-bold text-[#17181c] font-mono"
                >
                  {formatBytes(perfResult.weights.dataBytes)}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Top 3 Recommendations */}
          <div
            data-testid="performance-recommendations-card"
            className="flex flex-col gap-2 rounded-xl border border-[#eeeef0] bg-white p-3 shadow-xs"
          >
            <div className="flex items-center gap-1.5 font-bold text-[11.5px] text-[#17181c]">
              <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
              <span>أهم التوصيات</span>
            </div>

            {perfResult.recommendations.length === 0 ? (
              <div
                data-testid="performance-no-recommendations"
                className="flex items-center gap-2 py-3 text-center text-[11px] text-emerald-600 font-semibold"
              >
                <CheckCircleIcon className="h-4 w-4" />
                <span>الصفحة مهيأة بأعلى معايير السرعة وخالية من الملاحظات الحرجة!</span>
              </div>
            ) : (
              <ul data-testid="performance-recommendations-list" className="mt-1 space-y-2">
                {perfResult.recommendations.map((rec, i) => (
                  <li
                    key={i}
                    data-testid={`performance-recommendation-${i}`}
                    className="flex items-start gap-2 rounded-lg bg-amber-50/70 border border-amber-200/60 p-2 text-[10.5px] leading-relaxed text-amber-900"
                  >
                    <span className="shrink-0 rounded-full bg-amber-200 text-amber-800 text-[9px] font-extrabold w-4 h-4 flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        /* Traffic AN-1 Analytics Section */
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#eeeef0] pb-2.5">
            <div className="flex items-center gap-1 rounded-lg bg-[#f4f5f7] p-1">
              {([7, 14, 30] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  data-testid={`analytics-days-${d}`}
                  className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-all ${
                    days === d
                      ? "bg-white text-[#2b6cf6] shadow-xs font-bold"
                      : "text-[#7a7f87] hover:text-[#17181c]"
                  }`}
                >
                  {d === 7 ? "7 أيام" : d === 14 ? "14 يوم" : "30 يوم"}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={fetchSummary}
              disabled={loading}
              data-testid="analytics-refresh-button"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e2e4e8] text-[#7a7f87] hover:bg-[#f6f7f8] hover:text-[#17181c] transition-colors disabled:opacity-50"
              title="تحديث البيانات"
            >
              <ArrowPathIcon className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-[11px] text-red-600 flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={fetchSummary}
                className="font-bold underline hover:no-underline"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-[#eeeef0] bg-[#fdfdfd] p-2.5 shadow-xs">
              <div className="flex items-center gap-1 text-[10.5px] font-medium text-[#7a7f87]">
                <EyeIcon className="h-3 w-3 text-[#2b6cf6]" />
                <span>مشاهدات</span>
              </div>
              <div
                className="mt-1 text-base font-extrabold text-[#17181c] tabular-nums"
                data-testid="analytics-total-views"
              >
                {loading ? "..." : totals.views.toLocaleString()}
              </div>
            </div>

            <div className="rounded-xl border border-[#eeeef0] bg-[#fdfdfd] p-2.5 shadow-xs">
              <div className="flex items-center gap-1 text-[10.5px] font-medium text-[#7a7f87]">
                <CursorArrowRaysIcon className="h-3 w-3 text-[#10b981]" />
                <span>نقرات</span>
              </div>
              <div
                className="mt-1 text-base font-extrabold text-[#17181c] tabular-nums"
                data-testid="analytics-total-clicks"
              >
                {loading ? "..." : totals.clicks.toLocaleString()}
              </div>
            </div>

            <div className="rounded-xl border border-[#eeeef0] bg-[#fdfdfd] p-2.5 shadow-xs">
              <div className="flex items-center gap-1 text-[10.5px] font-medium text-[#7a7f87]">
                <ArrowTrendingUpIcon className="h-3 w-3 text-[#8b5cf6]" />
                <span>CTR</span>
              </div>
              <div
                className="mt-1 text-base font-extrabold text-[#17181c] tabular-nums"
                data-testid="analytics-total-ctr"
              >
                {loading ? "..." : formatCtr(totals.views, totals.clicks)}
              </div>
            </div>
          </div>

          {/* Top Pages Breakdown */}
          <div className="flex flex-col gap-2 rounded-xl border border-[#eeeef0] bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-[11.5px] text-[#17181c]">
                <DocumentTextIcon className="h-4 w-4 text-[#2b6cf6]" />
                <span>أعلى الصفحات</span>
              </div>
              <span className="text-[10px] text-[#8a8f96] font-semibold">{pages.length} صفحة</span>
            </div>
            {pages.length === 0 ? (
              <div className="py-3 text-center text-[11px] text-[#8a8f96]" data-testid="analytics-empty-pages">
                مفيش بيانات بعد
              </div>
            ) : (
              <div className="mt-1 divide-y divide-[#f2f3f5] overflow-hidden rounded-lg border border-[#eeeef0]">
                {pages.map((p) => (
                  <div
                    key={p.pageKey}
                    className="grid grid-cols-12 items-center px-2.5 py-1.5 text-[11px]"
                    data-testid={`analytics-page-row-${p.pageKey}`}
                  >
                    <span className="col-span-5 font-mono text-[10px] truncate font-semibold">
                      {p.pageKey}
                    </span>
                    <span className="col-span-4 text-center tabular-nums text-[#17181c]">
                      {p.views.toLocaleString()}
                    </span>
                    <span className="col-span-3 text-end tabular-nums text-[#10b981] font-semibold">
                      {p.clicks.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Sections Breakdown */}
          <div className="flex flex-col gap-2 rounded-xl border border-[#eeeef0] bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-[11.5px] text-[#17181c]">
                <RectangleGroupIcon className="h-4 w-4 text-[#10b981]" />
                <span>أعلى الأقسام</span>
              </div>
              <span className="text-[10px] text-[#8a8f96] font-semibold">
                {trafficSections.length} قسم
              </span>
            </div>
            {trafficSections.length === 0 ? (
              <div className="py-3 text-center text-[11px] text-[#8a8f96]" data-testid="analytics-empty-sections">
                مفيش بيانات بعد
              </div>
            ) : (
              <div className="mt-1 divide-y divide-[#f2f3f5] overflow-hidden rounded-lg border border-[#eeeef0]">
                {trafficSections.map((s) => (
                  <div
                    key={s.sectionType}
                    className="grid grid-cols-12 items-center px-2.5 py-1.5 text-[11px]"
                    data-testid={`analytics-section-row-${s.sectionType}`}
                  >
                    <span className="col-span-6 truncate font-semibold text-[#17181c]">
                      {getStorefrontSectionLabel(s.sectionType)}
                    </span>
                    <span className="col-span-3 text-center tabular-nums text-[#17181c]">
                      {s.views.toLocaleString()}
                    </span>
                    <span className="col-span-3 text-end tabular-nums text-[#10b981]">
                      {s.clicks.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudioInspectorAnalyticsTab;
