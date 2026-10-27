import React from "react";
import { MerchantUser, MoneyValue } from "./types";

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  return fallback;
};

export const toNumber = (value: MoneyValue) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatInteger = (value: MoneyValue) =>
  toNumber(value).toLocaleString("ar-EG", {
    maximumFractionDigits: 0,
  });

export const formatDate = (date?: string | null) => {
  if (!date) return "غير محدد";
  return new Date(date).toLocaleString("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export const getDisplayName = (user?: MerchantUser | null, fallback?: string) => {
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  return fullName || fallback || user?.email || "تاجر بدون اسم";
};

export const parsePaymentDetails = (value?: string | null) => {
  const text = String(value || "").trim();
  if (!text) return "غير محدد";

  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    return Object.entries(parsed)
      .map(([key, item]) => `${key}: ${String(item)}`)
      .join("، ");
  } catch (_) {
    return text;
  }
};

export const statusLabels: Record<string, string> = {
  ACTIVE: "نشط",
  INACTIVE: "غير نشط",
  PENDING: "قيد الانتظار",
  CONFIRMED: "مؤكدة",
  PAID: "تم السداد",
  PROCESSED: "تم التحويل",
  CANCELLED: "ملغية",
  FAILED: "فشل",
  DELIVERED: "تم التسليم",
  PROCESSING: "قيد التنفيذ",
  SHIPPED: "تم الشحن",
  FULFILLED: "تم التنفيذ",
  PREPARATION: "قيد التجهيز",
  IN_SHIPPING: "في الشحن",
  NOT_DELIVERED: "مرتجع أو لم يسلم",
  MERCHANT: "عند التاجر",
  COMPANY_WAREHOUSE: "مخزن الشركة",
};

export const fulfillmentModeLabels: Record<string, string> = {
  MERCHANT: "التاجر يشحن من عنده",
  COMPANY_WAREHOUSE: "التاجر يسلم لمخزن الشركة",
};

export const statusTone = (status?: string | null) => {
  switch (String(status || "").toUpperCase()) {
    case "ACTIVE":
    case "CONFIRMED":
    case "DELIVERED":
    case "PAID":
    case "PROCESSED":
    case "FULFILLED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200";
    case "PENDING":
    case "PROCESSING":
    case "SHIPPED":
    case "PREPARATION":
    case "IN_SHIPPING":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200";
    case "CANCELLED":
    case "FAILED":
    case "NOT_DELIVERED":
    case "INACTIVE":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";
  }
};

export const Badge: React.FC<{ label: React.ReactNode; tone?: string }> = ({
  label,
  tone,
}) => (
  <span
    className={`inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-xs font-bold ${tone || statusTone()}`}
  >
    {label}
  </span>
);

export const MetricCard: React.FC<{
  icon: React.ElementType;
  label: string;
  sub?: string;
  value: React.ReactNode;
}> = ({ icon: Icon, label, sub, value }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <div className="mt-2 text-xl font-bold text-slate-950 dark:text-white tabular-nums">
          {value}
        </div>
      </div>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
    </div>
    {sub ? <p className="mt-3 text-xs text-slate-500">{sub}</p> : null}
  </div>
);

export const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-0 dark:border-slate-800">
    <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
    <span className="max-w-[65%] text-left text-sm font-semibold text-slate-900 dark:text-white">
      {value || "غير محدد"}
    </span>
  </div>
);

export const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
    {text}
  </div>
);
