import { TFunction } from "i18next";
import { PaginationInfo } from "./types";

export const calcHasMore = (
  info?: PaginationInfo,
  pageDataLength = 0,
): boolean => {
  if (!info) return false;
  if (typeof info.total === "number" && info.total > 0) {
    return info.page * info.pageSize < info.total;
  }
  return pageDataLength === info.pageSize;
};

export const calcTrendPercent = (
  current?: number,
  previous?: number,
): number | undefined => {
  if (previous === undefined || previous === null) return undefined;
  if (previous === 0) return current && current > 0 ? 100 : 0;
  return Math.round(
    ((Number(current || 0) - Number(previous)) / Number(previous)) * 100,
  );
};

export const getStatusLabel = (status: string, t: TFunction): string => {
  const map: Record<string, string> = {
    PAID: t("platformPartner.dashboard.status.paid") || "مدفوعة",
    CONFIRMED: t("platformPartner.dashboard.status.confirmed") || "مؤكدة",
    PENDING: t("platformPartner.dashboard.status.pending") || "معلّقة",
    PROCESSED: t("platformPartner.dashboard.status.processed") || "مُعالَجة",
    FAILED: t("platformPartner.dashboard.status.failed") || "فشلت",
    CANCELLED: t("platformPartner.dashboard.status.cancelled") || "مُلغاة",
    ACTIVE: t("platformPartner.dashboard.status.active") || "نشط",
    INACTIVE: t("platformPartner.dashboard.status.inactive") || "غير نشط",
  };
  return map[status] || status || "—";
};

export const getStatusTone = (status: string): string => {
  const key = status?.toUpperCase();
  if (["PAID", "CONFIRMED", "PROCESSED", "ACTIVE"].includes(key)) {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 border border-emerald-200/60 dark:border-emerald-800/60";
  }
  if (["PENDING"].includes(key)) {
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200 border border-amber-200/60 dark:border-amber-800/60";
  }
  return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 border border-red-200/60 dark:border-red-800/60";
};

export const getTrendTone = (value?: number | null): string => {
  if (value === null || value === undefined) {
    return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300";
  }
  if (value > 0) {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200";
  }
  if (value < 0) {
    return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200";
  }
  return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200";
};

export const getMethodLabel = (method: string, t: TFunction): string => {
  const map: Record<string, string> = {
    VODAFONE_CASH:
      t("platformPartner.dashboard.payout.methods.vodafoneCash") ||
      "فودافون كاش",
    INSTAPAY:
      t("platformPartner.dashboard.payout.methods.instapay") || "إنستاباي",
    BANK_TRANSFER:
      t("platformPartner.dashboard.payout.methods.bankTransfer") ||
      "حوالة بنكية",
    CASH: t("platformPartner.dashboard.payout.methods.cash") || "نقدي",
    WALLET: t("platformPartner.dashboard.payout.methods.wallet") || "محفظة",
  };
  return map[method] || method || "—";
};

export const RANK_ORDER = [
  "PARTNER",
  "SENIOR_PARTNER",
  "MASTER_PARTNER",
  "EXECUTIVE_PARTNER",
] as const;

export const getRankProgress = (title: string) => {
  const currentRankIndex = Math.max(0, RANK_ORDER.indexOf(title as any));
  const progressToTop = Math.min(
    100,
    Math.round(((currentRankIndex + 1) / RANK_ORDER.length) * 100),
  );
  const nextRankKey = RANK_ORDER[currentRankIndex + 1];
  return { currentRankIndex, progressToTop, nextRankKey };
};
