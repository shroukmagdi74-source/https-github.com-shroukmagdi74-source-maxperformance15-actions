import { TFunction } from "i18next";

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  const maybeError = error as { response?: { data?: { error?: string } } };
  return maybeError.response?.data?.error || fallback;
};

export const calculateAge = (dob: string): number | string => {
  if (!dob) return "-";
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
};

export const calculateTenure = (date: string, t?: TFunction): string => {
  if (!date) return "-";
  const start = new Date(date);
  const now = new Date();
  const years = now.getFullYear() - start.getFullYear();
  const months = now.getMonth() - start.getMonth();
  if (years > 0) {
    if (months > 0) {
      return t ? t("employee.profile.tenureYearsMonths", { years, months }) : `${years}y ${months}m`;
    }
    return t ? t("employee.profile.tenureYears", { years }) : `${years}y`;
  }
  return t ? t("employee.profile.tenureMonths", { months }) : `${months}m`;
};

export const getNextOccasion = (dateStr: string) => {
  if (!dateStr) return null;
  const today = new Date();
  const nextDate = new Date(dateStr);
  nextDate.setFullYear(today.getFullYear());
  if (nextDate < today) nextDate.setFullYear(today.getFullYear() + 1);
  const diffDays = Math.ceil(Math.abs(nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return { date: nextDate, days: diffDays };
};

export const getInitials = (first?: string, last?: string) =>
  `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

export const getStatusConfig = (t: TFunction): Record<string, { label: string; color: string; dot: string; glow: string }> => ({
  ACTIVE: {
    label: t("employee.common.statusActive"),
    color: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
    dot: "bg-emerald-400",
    glow: "shadow-emerald-500/20",
  },
  ON_LEAVE: {
    label: t("employee.common.statusOnLeave"),
    color: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
    dot: "bg-amber-400",
    glow: "shadow-amber-500/20",
  },
  SUSPENDED: {
    label: t("employee.common.statusSuspended"),
    color: "bg-red-500/15 text-red-400 ring-red-500/30",
    dot: "bg-red-400",
    glow: "shadow-red-500/20",
  },
  TERMINATED: {
    label: t("employee.common.statusTerminated"),
    color: "bg-slate-500/15 text-slate-400 ring-slate-500/30",
    dot: "bg-slate-400",
    glow: "",
  },
});

export const getContractLabels = (t: TFunction): Record<string, string> => ({
  FULL_TIME: t("employee.common.contractFullTime"),
  PART_TIME: t("employee.common.contractPartTime"),
  CONTRACT: t("employee.common.contractContract"),
  TEMPORARY: t("employee.common.contractTemporary"),
  INTERNSHIP: t("employee.common.contractIntern"),
  FREELANCE: t("employee.common.contractFreelance"),
});

export const getMaritalLabels = (t: TFunction): Record<string, string> => ({
  SINGLE: t("employee.common.maritalSingle"),
  MARRIED: t("employee.common.maritalMarried"),
  DIVORCED: t("employee.common.maritalDivorced"),
  WIDOWED: t("employee.common.maritalWidowed"),
});

export const sectionAccents: Record<string, { bar: string; text: string; iconBg: string }> = {
  violet: { bar: "from-violet-500/20 to-violet-500/0", text: "text-violet-600 dark:text-violet-400", iconBg: "bg-violet-500/10 dark:bg-violet-500/15" },
  emerald: { bar: "from-emerald-500/20 to-emerald-500/0", text: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15" },
  rose: { bar: "from-rose-500/20 to-rose-500/0", text: "text-rose-600 dark:text-rose-400", iconBg: "bg-rose-500/10 dark:bg-rose-500/15" },
  indigo: { bar: "from-indigo-500/20 to-indigo-500/0", text: "text-indigo-600 dark:text-indigo-400", iconBg: "bg-indigo-500/10 dark:bg-indigo-500/15" },
  amber: { bar: "from-amber-500/20 to-amber-500/0", text: "text-amber-600 dark:text-amber-400", iconBg: "bg-amber-500/10 dark:bg-amber-500/15" },
};
