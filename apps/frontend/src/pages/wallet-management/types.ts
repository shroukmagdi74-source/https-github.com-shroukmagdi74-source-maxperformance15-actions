export type WalletTab = "wallets" | "receipts" | "companies";

export type NumericLike = number | string | null | undefined;

export type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export type WalletNumberRecord = {
  id: string;
  name: string;
  number: string;
  icon?: string | null;
  color?: string | null;
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type PendingReceiptRecord = {
  id: string;
  submittedAt?: string | null;
  receiptImage?: string | null;
  invoice: {
    invoiceNumber?: string | null;
    totalAmount?: NumericLike;
    company: {
      name?: string | null;
      email?: string | null;
    };
  };
  walletNumber: {
    name?: string | null;
    number?: string | null;
  };
};

export type CompanyWalletRecord = {
  companyId: string;
  companyName: string;
  companyEmail: string;
  phone?: string | null;
  walletId?: string | null;
  balance?: NumericLike;
  currency?: string | null;
  totalSpent?: NumericLike;
  totalDeposited?: NumericLike;
};

export type WalletFormState = {
  name: string;
  number: string;
  icon: string;
  color: string;
};

export type FundsFormState = {
  amount: string;
  bonus: string;
  notes: string;
};

export type SectionProps = {
  loading: boolean;
  error: string | null;
};

export const TAB_LABELS: Record<WalletTab, string> = {
  wallets: "أرقام المحافظ",
  receipts: "الإيصالات المعلقة",
  companies: "محافظ الشركات",
};

export const INITIAL_WALLET_FORM: WalletFormState = {
  name: "",
  number: "",
  icon: "",
  color: "#1d4ed8",
};

export const INITIAL_FUNDS_FORM: FundsFormState = {
  amount: "",
  bonus: "",
  notes: "",
};

export const getFullImageUrl = (path?: string | null): string => {
  if (!path) {
    return "";
  }

  const normalizedPath = path.replace(/\\/g, "/");
  if (normalizedPath.startsWith("uploads/")) {
    const apiUrl = import.meta.env["VITE_API_URL"] || "http://localhost:3007";
    return `${apiUrl.replace("/api/v1", "")}/${normalizedPath}`;
  }

  return normalizedPath;
};

export const toNumber = (value: NumericLike): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

export const formatCurrency = (amount: NumericLike): string =>
  new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
  }).format(toNumber(amount));

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as {
      response?: { data?: { message?: string; error?: string } };
    }).response;
    const message = response?.data?.message ?? response?.data?.error;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

export const getCompanyInitials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "CO";
