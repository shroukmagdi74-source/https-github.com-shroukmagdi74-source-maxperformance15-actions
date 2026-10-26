import { ServiceMediaFile } from "../../../components/services/MediaUploadZone";

export type { ServiceMediaFile };

export const STATUS_MAP: Record<string, { label: string; color: string; badge: string }> = {
  NEW: {
    label: "جديد",
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
    badge: "bg-blue-500",
  },
  IN_PROGRESS: {
    label: "قيد التنفيذ",
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    badge: "bg-amber-500",
  },
  COMPLETED: {
    label: "مكتمل",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    badge: "bg-emerald-500",
  },
  CANCELLED: {
    label: "ملغي",
    color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    badge: "bg-rose-500",
  },
};

export const PAYMENT_STATUS_MAP: Record<string, { label: string; color: string; badge: string }> = {
  UNPAID: {
    label: "غير مدفوع",
    color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    badge: "bg-rose-500",
  },
  PARTIALLY_PAID: {
    label: "مدفوع جزئياً (عربون)",
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    badge: "bg-amber-500",
  },
  PAID: {
    label: "مدفوع بالكامل",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    badge: "bg-emerald-500",
  },
  REFUNDED: {
    label: "مسترد",
    color: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    badge: "bg-gray-400",
  },
};

export const PAYMENT_METHOD_NAMES: Record<string, string> = {
  CASH: "نقداً (كاش)",
  VODAFONE_CASH: "فودافون كاش / محافظ",
  INSTAPAY: "إنستاباي (InstaPay)",
  BANK_TRANSFER: "تحويل بنكي",
  CARD: "بطاقة دفع إلكتروني",
  OTHER: "أخرى",
};

export interface PaymentFormState {
  totalAmount: number;
  newPaymentAmount: string;
  paymentMethod: string;
  newPaymentNote: string;
}

export const formatFileSize = (bytes?: number) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});
