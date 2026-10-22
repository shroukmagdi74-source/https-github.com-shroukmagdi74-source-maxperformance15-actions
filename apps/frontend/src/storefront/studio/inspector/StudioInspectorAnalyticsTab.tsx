import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowPathIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  RectangleGroupIcon,
} from "@heroicons/react/24/outline";
import { getApiUrl } from "../../../config/environment";
import { getStorefrontSectionLabel } from "../../sections/manifest";

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

interface StudioInspectorAnalyticsTabProps {
  companyId?: string;
  activePageKey?: string;
}

export const StudioInspectorAnalyticsTab: React.FC<StudioInspectorAnalyticsTabProps> = ({
  companyId,
  activePageKey,
}) => {
  const [days, setDays] = useState<7 | 14 | 30>(7);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
      console.error("Failed to load storefront analytics:", err);
      setError("تعذر تحميل بيانات التحليلات");
    } finally {
      setLoading(false);
    }
  }, [days, companyId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const totals = summary?.totals || { views: 0, clicks: 0, ctr: 0 };
  const pages = summary?.pages || [];
  const sections = summary?.sections || [];

  const formatCtr = (views: number, clicks: number): string => {
    if (!views || views <= 0) return "—";
    const ratio = (clicks / views) * 100;
    return `${ratio.toFixed(1)}%`;
  };

  return (
    <div
      className="flex flex-col gap-4 p-3.5 text-[#17181c] select-none text-[12px]"
      data-testid="studio-analytics-tab-content"
    >
      {/* 1. Header Controls: Duration Picker & Refresh Button */}
      <div className="flex items-center justify-between gap-2 border-b border-[#eeeef0] pb-3">
        <div className="flex items-center gap-1 rounded-lg bg-[#f4f5f7] p-1">
          {([7, 14, 30] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              data-testid={`analytics-days-${d}`}
              className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-all ${
                days === d
                  ? "bg-white text-[#2b6cf6] shadow-sm font-bold"
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
        <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-[11px] text-red-600 flex items-center justify-between">
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

      {/* 2. Top Metric Cards: Views, Clicks, CTR */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-[#eeeef0] bg-[#fdfdfd] p-2.5 shadow-sm">
          <div className="flex items-center gap-1 text-[10.5px] font-medium text-[#7a7f87]">
            <EyeIcon className="h-3 w-3 text-[#2b6cf6]" />
            <span>مشاهدات</span>
          </div>
          <div
            className="mt-1.5 text-base font-extrabold text-[#17181c] tabular-nums"
            data-testid="analytics-total-views"
          >
            {loading ? "..." : totals.views.toLocaleString()}
          </div>
        </div>

        <div className="rounded-xl border border-[#eeeef0] bg-[#fdfdfd] p-2.5 shadow-sm">
          <div className="flex items-center gap-1 text-[10.5px] font-medium text-[#7a7f87]">
            <CursorArrowRaysIcon className="h-3 w-3 text-[#10b981]" />
            <span>نقرات</span>
          </div>
          <div
            className="mt-1.5 text-base font-extrabold text-[#17181c] tabular-nums"
            data-testid="analytics-total-clicks"
          >
            {loading ? "..." : totals.clicks.toLocaleString()}
          </div>
        </div>

        <div className="rounded-xl border border-[#eeeef0] bg-[#fdfdfd] p-2.5 shadow-sm">
          <div className="flex items-center gap-1 text-[10.5px] font-medium text-[#7a7f87]">
            <ArrowTrendingUpIcon className="h-3 w-3 text-[#8b5cf6]" />
            <span>CTR</span>
          </div>
          <div
            className="mt-1.5 text-base font-extrabold text-[#17181c] tabular-nums"
            data-testid="analytics-total-ctr"
          >
            {loading ? "..." : formatCtr(totals.views, totals.clicks)}
          </div>
        </div>
      </div>

      {/* 3. Top Pages Breakdown */}
      <div className="flex flex-col gap-2 rounded-xl border border-[#eeeef0] bg-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-[12px] text-[#17181c]">
            <DocumentTextIcon className="h-4 w-4 text-[#2b6cf6]" />
            <span>أعلى الصفحات</span>
          </div>
          <span className="text-[10px] text-[#8a8f96] font-semibold">
            {pages.length} صفحة
          </span>
        </div>

        {pages.length === 0 ? (
          <div
            className="py-4 text-center text-[11px] text-[#8a8f96]"
            data-testid="analytics-empty-pages"
          >
            مفيش بيانات بعد
          </div>
        ) : (
          <div className="mt-1 divide-y divide-[#f2f3f5] overflow-hidden rounded-lg border border-[#eeeef0]">
            <div className="grid grid-cols-12 bg-[#fafbfc] px-2.5 py-1.5 text-[10px] font-bold text-[#7a7f87]">
              <span className="col-span-5">الصفحة</span>
              <span className="col-span-3 text-center">مشاهدات</span>
              <span className="col-span-2 text-center">نقرات</span>
              <span className="col-span-2 text-end">CTR</span>
            </div>
            {pages.map((p) => {
              const isCurrent = activePageKey && p.pageKey === activePageKey;
              return (
                <div
                  key={p.pageKey}
                  className={`grid grid-cols-12 items-center px-2.5 py-1.5 text-[11px] transition-colors ${
                    isCurrent ? "bg-blue-50/50" : "hover:bg-[#fcfcfd]"
                  }`}
                  data-testid={`analytics-page-row-${p.pageKey}`}
                >
                  <span className="col-span-5 font-mono text-[10.5px] truncate font-semibold" title={p.pageKey}>
                    {p.pageKey}
                    {isCurrent && (
                      <span className="ms-1 rounded bg-blue-100 px-1 py-0.2 text-[9px] text-blue-700 font-sans">
                        الحالية
                      </span>
                    )}
                  </span>
                  <span className="col-span-3 text-center tabular-nums font-semibold text-[#17181c]">
                    {p.views.toLocaleString()}
                  </span>
                  <span className="col-span-2 text-center tabular-nums text-[#10b981] font-semibold">
                    {p.clicks.toLocaleString()}
                  </span>
                  <span className="col-span-2 text-end tabular-nums font-semibold text-[#7a7f87]">
                    {formatCtr(p.views, p.clicks)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Top Sections Breakdown */}
      <div className="flex flex-col gap-2 rounded-xl border border-[#eeeef0] bg-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-[12px] text-[#17181c]">
            <RectangleGroupIcon className="h-4 w-4 text-[#10b981]" />
            <span>أعلى الأقسام</span>
          </div>
          <span className="text-[10px] text-[#8a8f96] font-semibold">
            {sections.length} قسم
          </span>
        </div>

        {sections.length === 0 ? (
          <div
            className="py-4 text-center text-[11px] text-[#8a8f96]"
            data-testid="analytics-empty-sections"
          >
            مفيش بيانات بعد
          </div>
        ) : (
          <div className="mt-1 divide-y divide-[#f2f3f5] overflow-hidden rounded-lg border border-[#eeeef0]">
            <div className="grid grid-cols-12 bg-[#fafbfc] px-2.5 py-1.5 text-[10px] font-bold text-[#7a7f87]">
              <span className="col-span-6">القسم</span>
              <span className="col-span-3 text-center">مشاهدات</span>
              <span className="col-span-3 text-end">نقرات</span>
            </div>
            {sections.map((s) => (
              <div
                key={s.sectionType}
                className="grid grid-cols-12 items-center px-2.5 py-1.5 text-[11px] hover:bg-[#fcfcfd]"
                data-testid={`analytics-section-row-${s.sectionType}`}
              >
                <div className="col-span-6 flex flex-col overflow-hidden truncate">
                  <span className="truncate font-semibold text-[#17181c]">
                    {getStorefrontSectionLabel(s.sectionType)}
                  </span>
                  <span className="text-[9.5px] font-mono text-[#8a8f96] truncate">
                    {s.sectionType}
                  </span>
                </div>
                <span className="col-span-3 text-center tabular-nums font-semibold text-[#17181c]">
                  {s.views.toLocaleString()}
                </span>
                <span className="col-span-3 text-end tabular-nums font-semibold text-[#10b981]">
                  {s.clicks.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioInspectorAnalyticsTab;
