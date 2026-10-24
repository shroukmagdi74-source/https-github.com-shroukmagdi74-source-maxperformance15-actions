import React from "react";
import { Badge } from "@/components/ui/badge";

export type RoleRecord = Record<string, { name: string; id?: string }>;

export type UserRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role: string;
  roleId?: string | null;
  roleName?: string | null;
  isActive: boolean;
  accountIsActive?: boolean;
  activityStatus?: string | null;
  isEmailVerified?: boolean;
  avatar?: string | null;
  lastLoginAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  employee?: {
    employeeNumber?: string | null;
    status?: string | null;
    hireDate?: string | null;
    contractType?: string | null;
    baseSalary?: number | string | null;
    department?: { id: string; name: string; color?: string | null } | null;
    position?: { id: string; title: string } | null;
  } | null;
  defaultPage?: string;
  assignedApps?: string[];
};

export type InvitationRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  token: string;
  createdAt: string;
  expiresAt: string;
};

export type FiltersState = {
  search: string;
  role: string;
  isActive: string;
  employeeStatus: string;
};

export type UserFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  isActive: boolean;
  departmentId: string;
  positionId: string;
  hireDate: string;
  contractType: string;
  baseSalary: string;
  defaultPage: string;
  assignedApps: string[];
};

export type InviteFormState = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

export type UserFormErrors = Partial<Record<keyof UserFormState, string>>;
export type InviteFormErrors = Partial<Record<keyof InviteFormState, string>>;

export type PendingAction =
  | { kind: "delete-user"; user: UserRecord }
  | { kind: "bulk-delete"; count: number }
  | { kind: "cancel-invitation"; invitation: InvitationRecord }
  | { kind: "reset-password"; user: UserRecord }
  | null;

export type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
  details?: { current: number; limit: number };
  departments?: Array<{ id: string; name: string; color?: string | null }>;
  positions?: Array<{ id: string; title: string }>;
};

export const PAGE_SIZE_OPTIONS = ["10", "25", "50", "100"];

export const EMPLOYEE_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "نشط" },
  { value: "ON_LEAVE", label: "في إجازة" },
  { value: "SUSPENDED", label: "موقوف" },
  { value: "TERMINATED", label: "منتهي" },
  { value: "RESIGNED", label: "مستقيل" },
  { value: "NO_EMPLOYEE", label: "بدون ملف موظف" },
];

export const CONTRACT_OPTIONS = [
  { value: "FULL_TIME", label: "دوام كامل" },
  { value: "PART_TIME", label: "دوام جزئي" },
  { value: "CONTRACT", label: "عقد" },
  { value: "TEMPORARY", label: "مؤقت" },
  { value: "INTERNSHIP", label: "تدريب" },
];

export const createInitialUserForm = (): UserFormState => ({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  role: "AGENT",
  isActive: true,
  departmentId: "",
  positionId: "",
  hireDate: new Date().toISOString().split("T")[0] ?? "",
  contractType: "FULL_TIME",
  baseSalary: "",
  defaultPage: "/apps",
  assignedApps: [],
});

export const createInitialInviteForm = (): InviteFormState => ({
  firstName: "",
  lastName: "",
  email: "",
  role: "AGENT",
});

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: string }).message === "string" &&
    (error as { message?: string }).message?.trim()
  ) {
    return (error as { message: string }).message;
  }
  return fallback;
};

export const getInitials = (firstName?: string, lastName?: string) =>
  `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim() || "U";

export const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (value?: string | null) => {
  if (!value) return "لم يسجل دخول بعد";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "لم يسجل دخول بعد";
  return date.toLocaleString("ar-EG");
};

export const isInvitationExpired = (expiresAt?: string | null) =>
  Boolean(expiresAt && new Date(expiresAt).getTime() < Date.now());

export const getRoleBadgeClassName = (role: string) => {
  switch (role) {
    case "COMPANY_ADMIN":
      return "border-rose-200 bg-rose-500/10 text-rose-700";
    case "MANAGER":
      return "border-amber-200 bg-amber-500/10 text-amber-700";
    case "AGENT":
      return "border-sky-200 bg-sky-500/10 text-sky-700";
    case "SUPER_ADMIN":
      return "border-violet-200 bg-violet-500/10 text-violet-700";
    default:
      return "border-border bg-muted text-foreground";
  }
};

export const getAccountStatusClassName = (isActive: boolean) =>
  isActive
    ? "border-emerald-200 bg-emerald-500/10 text-emerald-700"
    : "border-slate-200 bg-slate-500/10 text-slate-700";

export const getEmployeeStatusClassName = (status?: string | null) => {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300";
    case "ON_LEAVE":
      return "border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-700 dark:text-amber-300";
    case "SUSPENDED":
      return "border-rose-200 bg-rose-500/10 text-rose-700 dark:border-rose-900/40 dark:text-rose-400";
    case "TERMINATED":
    case "RESIGNED":
      return "border-slate-300 bg-slate-500/10 text-slate-700 dark:border-slate-700 dark:text-slate-300";
    default:
      return "border-border bg-muted text-foreground";
  }
};

export const getEmployeeStatusLabel = (status?: string | null) => {
  switch (status) {
    case "ACTIVE":
      return "نشط";
    case "ON_LEAVE":
      return "في إجازة";
    case "SUSPENDED":
      return "موقوف";
    case "TERMINATED":
      return "منتهي";
    case "RESIGNED":
      return "مستقيل";
    default:
      return status || "-";
  }
};

export const formatRelativeLoginTime = (value?: string | null) => {
  if (!value) return "لم يسجل الدخول بعد";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "لم يسجل الدخول بعد";
    const diffMs = Math.max(0, Date.now() - date.getTime());
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 5) return "متصل الآن أو مؤخراً";
    if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays === 1) return "أمس";
    if (diffDays < 30) return `منذ ${diffDays} يوم`;

    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "لم يسجل الدخول بعد";
  }
};

export const renderUserActivityBadge = (entry?: UserRecord | null) => {
  if (!entry) return null;
  const hrStatus = entry.employee?.status;

  if (hrStatus === "RESIGNED") {
    return (
      <Badge variant="outline" className="gap-1.5 rounded-full border-slate-300 bg-slate-500/10 text-slate-700 dark:border-slate-700 dark:text-slate-300">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        مستقيل
      </Badge>
    );
  }
  if (hrStatus === "TERMINATED") {
    return (
      <Badge variant="outline" className="gap-1.5 rounded-full border-rose-200 bg-rose-500/10 text-rose-700 dark:border-rose-900/40 dark:text-rose-400">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        منتهي الخدمة
      </Badge>
    );
  }
  if (hrStatus === "SUSPENDED") {
    return (
      <Badge variant="outline" className="gap-1.5 rounded-full border-rose-200 bg-rose-500/10 text-rose-700 dark:border-rose-900/40 dark:text-rose-400">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        موقوف
      </Badge>
    );
  }
  if (!entry.isActive) {
    return (
      <Badge variant="outline" className="gap-1.5 rounded-full border-slate-300 bg-slate-500/10 text-slate-700 dark:border-slate-700 dark:text-slate-300">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        غير نشط (معطل)
      </Badge>
    );
  }
  if (!entry.lastLoginAt) {
    return (
      <Badge variant="outline" className="gap-1.5 rounded-full border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-700 dark:text-amber-300">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        لم يسجل دخول بعد
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1.5 rounded-full border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      نشط
    </Badge>
  );
};
