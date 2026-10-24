import tokenManager from "@/utils/tokenManager";

export type AvailabilityValue = "available" | "busy" | "away" | "offline";

export type UserRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role?: string | null;
  skills?: string | string[] | null;
  department?: string | null;
  availability?: AvailabilityValue | string | null;
  isActive: boolean;
  isEmailVerified?: boolean;
  lastLoginAt?: string | null;
  avatar?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type FiltersState = {
  search: string;
  isActive: string;
};

export type UserFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  skills: string;
  department: string;
  availability: AvailabilityValue;
  isActive: boolean;
};

export type UserFormErrors = Partial<Record<keyof UserFormState, string>>;

export type UsersListResponse = {
  success?: boolean;
  message?: string;
  data?: UserRecord[];
  pagination?: {
    pages?: number;
    total?: number;
  };
};

export type UserMutationResponse = {
  success?: boolean;
  message?: string;
  data?: UserRecord;
};

export type SettingsResponse = {
  success?: boolean;
  message?: string;
  data?: {
    permissions?: Record<string, unknown>;
  };
};

export const FALLBACK_ROLES = ["SUPER_ADMIN", "COMPANY_ADMIN", "MANAGER", "AGENT"];
export const PAGE_SIZE_OPTIONS = ["10", "25", "50", "100"];

export const AVAILABILITY_OPTIONS: Array<{ value: AvailabilityValue; label: string }> = [
  { value: "available", label: "متاح" },
  { value: "busy", label: "مشغول" },
  { value: "away", label: "بعيد" },
  { value: "offline", label: "غير متصل" },
];

export const createInitialForm = (): UserFormState => ({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  role: "",
  skills: "",
  department: "",
  availability: "available",
  isActive: true,
});

export const getAuthHeaders = (): HeadersInit =>
  tokenManager.createAuthHeaders({
    "Content-Type": "application/json",
  });

export const getErrorMessage = (error: unknown, fallback: string): string => {
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

export const normalizeSkillsValue = (value?: string | string[] | null): string =>
  Array.isArray(value) ? value.join(", ") : value ?? "";

export const getInitials = (firstName?: string | null, lastName?: string | null): string =>
  `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim() || "SA";

export const formatDateTime = (value?: string | null): string => {
  if (!value) {
    return "لم يسجل دخول بعد";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "لم يسجل دخول بعد";
  }

  return date.toLocaleString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getRoleLabel = (role?: string | null): string => {
  switch (role) {
    case "SUPER_ADMIN":
      return "سوبر أدمن";
    case "COMPANY_ADMIN":
      return "مدير شركة";
    case "MANAGER":
      return "مدير";
    case "AGENT":
      return "موظف";
    default:
      return role?.replace(/_/g, " ") || "غير محدد";
  }
};

export const getAvailabilityLabel = (value?: string | null): string => {
  switch (value) {
    case "available":
      return "متاح";
    case "busy":
      return "مشغول";
    case "away":
      return "بعيد";
    case "offline":
      return "غير متصل";
    default:
      return "غير محدد";
  }
};

export const getRoleClassName = (role?: string | null): string => {
  switch (role) {
    case "SUPER_ADMIN":
      return "border-violet-200 bg-violet-500/10 text-violet-700";
    case "COMPANY_ADMIN":
      return "border-sky-200 bg-sky-500/10 text-sky-700";
    case "MANAGER":
      return "border-amber-200 bg-amber-500/10 text-amber-700";
    case "AGENT":
      return "border-emerald-200 bg-emerald-500/10 text-emerald-700";
    default:
      return "border-border bg-muted text-foreground";
  }
};

export const getAvailabilityClassName = (value?: string | null): string => {
  switch (value) {
    case "available":
      return "border-emerald-200 bg-emerald-500/10 text-emerald-700";
    case "busy":
      return "border-rose-200 bg-rose-500/10 text-rose-700";
    case "away":
      return "border-amber-200 bg-amber-500/10 text-amber-700";
    case "offline":
      return "border-slate-200 bg-slate-500/10 text-slate-700";
    default:
      return "border-border bg-muted text-foreground";
  }
};

export const getStatusClassName = (isActive: boolean): string =>
  isActive
    ? "border-emerald-200 bg-emerald-500/10 text-emerald-700"
    : "border-slate-200 bg-slate-500/10 text-slate-700";
