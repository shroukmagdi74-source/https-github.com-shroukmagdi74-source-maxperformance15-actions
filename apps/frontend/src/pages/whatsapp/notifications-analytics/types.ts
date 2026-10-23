export interface Stats {
  total: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  deliveryRate: string;
  readRate: string;
  byCategory: Record<string, number>;
  byEvent: Record<string, number>;
}

export interface NotificationLog {
  id: string;
  recipientPhone: string;
  recipientName: string;
  category: string;
  eventType: string;
  content: string;
  status: string;
  sentAt: string;
  createdAt: string;
  failureReason: string | null;
  template?: { name: string };
  order?: { orderNumber: string };
  customer?: { firstName: string; lastName: string };
}

export interface WhatsAppAnalyticsProps {
  companyId?: string;
  companyName?: string;
  superAdminMode?: boolean;
}

export const STATUS_BADGE_CLASSES: Record<string, string> = {
  PENDING:
    "border-amber-300/70 bg-amber-500/10 text-amber-800 dark:border-amber-500/40 dark:text-amber-200",
  QUEUED:
    "border-sky-300/70 bg-sky-500/10 text-sky-800 dark:border-sky-500/40 dark:text-sky-200",
  SENDING:
    "border-sky-300/70 bg-sky-500/10 text-sky-800 dark:border-sky-500/40 dark:text-sky-200",
  SENT:
    "border-emerald-300/70 bg-emerald-500/10 text-emerald-800 dark:border-emerald-500/40 dark:text-emerald-200",
  DELIVERED:
    "border-emerald-300/70 bg-emerald-500/10 text-emerald-800 dark:border-emerald-500/40 dark:text-emerald-200",
  READ: "border-blue-300/70 bg-blue-500/10 text-blue-800 dark:border-blue-500/40 dark:text-blue-200",
  FAILED:
    "border-rose-300/70 bg-rose-500/10 text-rose-800 dark:border-rose-500/40 dark:text-rose-200",
  CANCELLED:
    "border-slate-300/70 bg-slate-500/10 text-slate-700 dark:border-slate-500/40 dark:text-slate-200",
};
