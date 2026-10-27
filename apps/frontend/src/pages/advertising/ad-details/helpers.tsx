import React from "react";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { toFacebookAdsDateInput } from "../../../utils/facebookAdsReportFilters";

export const STORAGE_KEY = "facebook-ad-details-date-range";

export const getDefaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 29);

  return {
    startDate: toFacebookAdsDateInput(start),
    endDate: toFacebookAdsDateInput(end),
  };
};

export const getStoredDateRange = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultDateRange();
    const parsed = JSON.parse(stored) as {
      startDate?: string;
      endDate?: string;
    };
    return {
      startDate: parsed.startDate || getDefaultDateRange().startDate,
      endDate: parsed.endDate || getDefaultDateRange().endDate,
    };
  } catch {
    return getDefaultDateRange();
  }
};

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "response" in error) {
    const response = error.response as {
      data?: { error?: string };
    };

    if (typeof response.data?.error === "string") {
      return response.data.error;
    }
  }

  return fallback;
};

export const getSafeNumber = (value?: number) =>
  Number.isFinite(Number(value)) ? Number(value) : 0;

export const getCreativePayload = (creative: unknown): Record<string, unknown> => {
  if (!creative) return {};
  if (typeof creative === "object") return creative as Record<string, unknown>;

  if (typeof creative === "string") {
    try {
      const parsed = JSON.parse(creative);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  return {};
};

export const getStatusLabel = (status?: string, isEn = false) => {
  const labels: Record<string, string> = {
    ACTIVE: isEn ? "Active" : "نشط",
    PAUSED: isEn ? "Paused" : "متوقف",
    ARCHIVED: isEn ? "Archived" : "مؤرشف",
    DELETED: isEn ? "Deleted" : "محذوف",
    IN_PROCESS: isEn ? "In Process" : "قيد المعالجة",
    WITH_ISSUES: isEn ? "With Issues" : "به مشاكل",
    DISAPPROVED: isEn ? "Disapproved" : "مرفوض",
  };

  return labels[status || ""] || status || (isEn ? "Unspecified" : "غير محدد");
};

export const getStatusBadge = (status?: string) => {
  const normalized = status || "";
  if (normalized === "ACTIVE") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (normalized === "PAUSED") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  if (["DISAPPROVED", "WITH_ISSUES", "DELETED"].includes(normalized)) {
    return "border-red-200 bg-red-50 text-red-700";
  }
  return "border-slate-200 bg-slate-50 text-slate-700";
};

export const getVerdictClass = (tone?: string) => {
  const classes: Record<string, string> = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
    red: "border-red-200 bg-red-50 text-red-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    slate: "border-slate-200 bg-slate-50 text-slate-800",
  };

  return classes[tone || "slate"] || classes["slate"];
};

export const getPriorityClass = (priority?: string) => {
  if (priority === "HIGH") return "border-red-200 bg-red-50 text-red-800";
  if (priority === "MEDIUM") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  return "border-slate-200 bg-slate-50 text-slate-700";
};

export const getPreviewHtml = (preview: unknown[]) => {
  const first = preview?.[0];
  if (first && typeof first === "object" && "body" in first) {
    return String((first as { body?: string }).body || "");
  }

  return "";
};

export const InfoLine = ({
  label,
  value,
  notAvailableText = "غير متاح",
}: {
  label: string;
  value?: string;
  notAvailableText?: string;
}) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
    <p className="text-[11px] font-bold text-slate-500">{label}</p>
    <p className="mt-1 truncate text-sm font-bold text-slate-900">
      {value || notAvailableText}
    </p>
  </div>
);

export const QualityLine = ({
  label,
  value,
  notAvailableText = "غير متاح",
}: {
  label: string;
  value?: string;
  notAvailableText?: string;
}) => (
  <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
    <span className="text-xs font-bold text-slate-500">{label}</span>
    <span className="text-sm font-black text-slate-900">{value || notAvailableText}</span>
  </div>
);

export const HealthLine = ({
  ok,
  label,
  value,
}: {
  ok: boolean;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
    {ok ? (
      <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
    ) : (
      <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
    )}
    <div className="min-w-0">
      <p className="text-[11px] font-bold text-slate-500">{label}</p>
      <p className="truncate text-sm font-bold text-slate-900">{value}</p>
    </div>
  </div>
);
