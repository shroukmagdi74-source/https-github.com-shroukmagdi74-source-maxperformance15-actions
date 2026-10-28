import React from "react";
import {
  RadiologyOrderStatusMap,
  RadiologyPaymentStatusMap,
  RadiologyReport,
  RadiologyReportStatusMap,
  RadiologyStatusMap,
} from "../shared";
import { StudyDetailsHistoryEntry } from "./types";

const MANAGER_ROLES = ["SUPER_ADMIN", "COMPANY_ADMIN", "OWNER", "MANAGER"];

export const canManageRadiology = (): boolean => {
  try {
    return MANAGER_ROLES.includes(
      (JSON.parse(localStorage.getItem("user") || "{}") as { role?: string }).role || "",
    );
  } catch {
    return false;
  }
};

export const fmtDate = (iso?: string): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
};

export const fmtDateTime = (iso?: string): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

export const fmtMoney = (n?: number, currency = "ج.م"): string =>
  `${Number(n || 0).toFixed(0)} ${currency}`;

export const signed = (n: number): string =>
  `${n >= 0 ? "+" : "-"}${Math.abs(Number(n)).toFixed(0)}`;

export const renderBadge = (
  map: Record<string, { label: string; color: string }>,
  value?: string,
  t: (k: string) => string = (k) => k,
) => {
  const meta = value ? map[value] : undefined;
  if (meta) {
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${meta.color}`}
      >
        {t(meta.label)}
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
      {value || "—"}
    </span>
  );
};

export const statusMetaFor = (
  dimension: string,
  status?: string,
): { label: string; color: string } | undefined => {
  if (!status) return undefined;
  if (dimension === "ORDER") return RadiologyOrderStatusMap[status];
  if (dimension === "REPORT") return RadiologyReportStatusMap[status];
  if (dimension === "PAYMENT") return RadiologyPaymentStatusMap[status];
  return RadiologyStatusMap[status];
};

export const statusText = (
  dimension: string,
  status?: string,
  t: (k: string) => string = (k) => k,
): string => {
  if (!status) return "—";
  const meta = statusMetaFor(dimension, status);
  return meta ? t(meta.label) : status;
};

export const transitionText = (
  h: StudyDetailsHistoryEntry,
  t: (k: string) => string = (k) => k,
): string =>
  h.oldStatus
    ? `${t("radiology.schedule.from")} ${statusText(h.dimension, h.oldStatus, t)} ${t(
        "radiology.schedule.to",
      )} ${statusText(h.dimension, h.status, t)}`
    : `${t("radiology.schedule.to")} ${statusText(h.dimension, h.status, t)}`;

export const genderText = (g?: string, t: (k: string) => string = (k) => k): string => {
  if (g === "male") return t("radiology.gender.male");
  if (g === "female") return t("radiology.gender.female");
  return t("radiology.gender.unspecified");
};

export const methodText = (method?: string, t: (k: string) => string = (k) => k): string => {
  if (!method) return "—";
  const key = `radiology.paymentMethod.${method}`;
  const translated = t(key);
  return translated !== key ? translated : method;
};

export const billingTypeText = (b?: string, t: (k: string) => string = (k) => k): string => {
  if (b === "INSURANCE") return t("radiology.details.billingType.INSURANCE");
  if (b === "PATIENT") return t("radiology.details.billingType.PATIENT");
  return b || "—";
};

export const turnaroundText = (report?: RadiologyReport | null): string => {
  if (!report || !report.createdAt) return "—";
  const from = new Date(report.createdAt);
  if (Number.isNaN(from.getTime())) return "—";
  const to = report.signedAt ? new Date(report.signedAt) : new Date(report.updatedAt);
  if (Number.isNaN(to.getTime())) return "—";
  const diffMin = Math.round((to.getTime() - from.getTime()) / 60000);
  if (diffMin < 0) return "—";
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return `${h}س ${m}د`;
};
