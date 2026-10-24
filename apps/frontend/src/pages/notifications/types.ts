export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  silent?: boolean;
  customerId?: string;
  errorType?: string;
  metadata?: Record<string, unknown>;
  data?: Record<string, unknown>;
  severity?: "low" | "medium" | "high" | "critical";
  source?: "system";
}

export type NotificationReadFilter = "all" | "unread" | "read";

export const normalizeNotification = (n: any): NotificationItem => {
  const rawDate = n.createdAt || n.timestamp || n.date;
  const parsedDate = rawDate ? new Date(rawDate) : new Date();
  const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  let parsedData = n.data;
  if (typeof parsedData === "string") {
    try {
      parsedData = JSON.parse(parsedData);
    } catch {
      parsedData = { raw: parsedData };
    }
  }

  const rawType = String(n.type || "info").toLowerCase();

  return {
    id: String(n.id || Math.random().toString(36).substring(2, 9)),
    type: rawType,
    title: n.title || "إشعار جديد",
    message: n.message || "",
    timestamp: validDate,
    isRead: Boolean(n.isRead ?? n.read),
    silent: Boolean(n.silent),
    customerId: n.customerId,
    errorType: n.errorType,
    metadata: n.metadata,
    data: parsedData,
    severity: n.severity,
    source: "system" as const,
  };
};

export const formatNotificationTime = (date: Date): string => {
  if (!date || isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "الآن";
  if (diffMins === 1) return "منذ دقيقة";
  if (diffMins === 2) return "منذ دقيقتين";
  if (diffMins >= 3 && diffMins <= 10) return `منذ ${diffMins} دقائق`;
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours === 1) return "منذ ساعة";
  if (diffHours === 2) return "منذ ساعتين";
  if (diffHours >= 3 && diffHours <= 10) return `منذ ${diffHours} ساعات`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays === 1) {
    return `أمس ${date.toLocaleTimeString("ar-EG", { hour: "numeric", minute: "2-digit" })}`;
  }
  if (diffDays === 2) return "منذ يومين";
  if (diffDays >= 3 && diffDays <= 10) return `منذ ${diffDays} أيام`;

  return date.toLocaleDateString("ar-EG", {
    month: "short",
    day: "numeric",
  });
};

export const resolveTargetUrl = (notification: NotificationItem): string | null => {
  const data = (notification.data || notification.metadata || {}) as Record<string, any>;
  if (typeof data.url === "string" && data.url.trim().length > 0) {
    return data.url.trim();
  }
  if (data.orderId) {
    return `/orders?orderId=${encodeURIComponent(String(data.orderId))}`;
  }
  if (data.conversationId) {
    return `/whatsapp-inbox?conversationId=${encodeURIComponent(String(data.conversationId))}`;
  }
  if (data.taskId) {
    return `/tasks/${encodeURIComponent(String(data.taskId))}`;
  }
  if (data.customerId) {
    return `/customers/${encodeURIComponent(String(data.customerId))}`;
  }
  return null;
};

export interface TypeBadgeInfo {
  label: string;
  className: string;
}

export const getTypeBadge = (type: string): TypeBadgeInfo => {
  const normalized = type.toLowerCase();
  if (normalized.includes("stoppage") || normalized.includes("order_sync")) {
    return {
      label: "توقف أوردرات",
      className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-medium",
    };
  }
  if (normalized.includes("ad_campaign") || normalized.includes("ads_stopped")) {
    return {
      label: "توقف إعلانات",
      className: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 font-medium",
    };
  }
  if (normalized.includes("automation")) {
    return {
      label: "أتمتة",
      className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30 font-medium",
    };
  }
  if (normalized.includes("incident") || normalized.includes("disconnect")) {
    return {
      label: "عطل سيستم",
      className: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 font-medium",
    };
  }
  if (normalized.includes("order")) {
    return {
      label: "طلب بيع",
      className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-medium",
    };
  }
  if (normalized.includes("error")) {
    return {
      label: "خطأ",
      className: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 font-medium",
    };
  }
  if (normalized.includes("warning")) {
    return {
      label: "تحذير",
      className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-medium",
    };
  }
  if (normalized.includes("success")) {
    return {
      label: "نجاح",
      className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-medium",
    };
  }
  return {
    label: "معلومات",
    className: "bg-muted text-muted-foreground border-border/60 font-medium",
  };
};
