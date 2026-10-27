import React from "react";
import { AffiliateUser, MoneyValue } from "./types";

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

export const formatPrice = (amount: number, _currency = "EGP") => {
  return `${amount.toLocaleString("ar-EG")} ج.م`;
};

export const formatDate = (date?: string | null) => {
  if (!date) return "غير محدد";
  return new Date(date).toLocaleString("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export const getDisplayName = (user?: AffiliateUser | null) => {
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  return fullName || user?.email || "مسوق بدون اسم";
};

export const statusLabels: Record<string, string> = {
  ACTIVE: "نشط",
  PENDING: "قيد المراجعة",
  SUSPENDED: "موقوف",
  CONFIRMED: "مؤكدة",
  PAID: "تم السداد",
  PROCESSED: "تم التحويل",
  CANCELLED: "ملغية",
  FAILED: "فشل",
  DELIVERED: "تم التسليم",
  PROCESSING: "قيد التجهيز",
  SHIPPED: "تم الشحن",
};

export const statusTone = (status?: string | null) => {
  switch (String(status || "").toUpperCase()) {
    case "ACTIVE":
    case "CONFIRMED":
    case "DELIVERED":
    case "PAID":
    case "PROCESSED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200";
    case "PENDING":
    case "PROCESSING":
    case "SHIPPED":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200";
    case "SUSPENDED":
    case "CANCELLED":
    case "FAILED":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";
  }
};

export const getDocumentStatusLabel = (status?: string | null) => {
  switch (status) {
    case "APPROVED":
      return "المستند معتمد";
    case "REJECTED":
      return "المستند مرفوض";
    case "PENDING_REVIEW":
      return "المستند قيد المراجعة";
    default:
      return "لا يوجد مستند";
  }
};

export const parsePaymentDetails = (value?: unknown) => {
  if (!value) return "غير محدد";
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${key}: ${String(item)}`)
      .join("، ");
  }
  const text = String(value).trim();
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

export const MetricCard: React.FC<{
  icon: React.ElementType;
  label: string;
  sub?: string;
  value: React.ReactNode;
}> = ({ icon: Icon, label, sub, value }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <div className="mt-2 text-xl font-bold text-slate-950 dark:text-white tabular-nums">
          {value}
        </div>
      </div>
      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
    </div>
    {sub ? <p className="mt-3 text-xs text-slate-500">{sub}</p> : null}
  </div>
);
