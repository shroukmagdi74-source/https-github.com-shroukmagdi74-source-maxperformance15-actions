export interface ConversationSummary {
  totalConversations: number;
  totalMessages: number;
  incomingMessages: number;
  outgoingMessages: number;
  manualOutgoing: number;
  broadcastOutgoing: number;
  autoOutgoing: number;
  avgMessagesPerConversation: number;
  assignedCount: number;
  unassignedCount: number;
  waitingForReply: number;
  awaitingCustomer: number;
  totalUnread: number;
  conversationsWithUnread: number;
  avgResponseTimeMs: number | null;
  avgResponseTimeMin: number | null;
}

export interface DailyEntry {
  date: string;
  incoming: number;
  outgoing: number;
  conversations: number;
}

export interface RecentConversation {
  id: string;
  status: string;
  assignedUserId: string | null;
  lastMessageAt: string | null;
  lastMessageIsFromCustomer: boolean;
  unreadCount: number;
  messageCount: number;
}

export interface AnalyticsResponse {
  success: boolean;
  period: { start: string; end: string };
  summary: ConversationSummary;
  statusDistribution: Record<string, number>;
  hourlyDistribution: number[];
  dailyDistribution: DailyEntry[];
  tagDistribution: { tag: string; count: number }[];
  recentConversations: RecentConversation[];
  userMap: Record<string, string>;
}

export type DatePreset = "today" | "yesterday" | "7days" | "30days" | "thisMonth" | "custom";

export const presetLabels: Record<DatePreset, string> = {
  today: "اليوم",
  yesterday: "أمس",
  "7days": "آخر ٧ أيام",
  "30days": "آخر ٣٠ يوم",
  thisMonth: "هذا الشهر",
  custom: "نطاق مخصص",
};

export const presetOrder: DatePreset[] = [
  "today",
  "yesterday",
  "7days",
  "30days",
  "thisMonth",
  "custom",
];

export function getPresetRange(preset: DatePreset): { start: string; end: string } {
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const fmt = (d: Date) => d.toISOString().substring(0, 10);
  switch (preset) {
    case "today":
      return { start: fmt(today), end: fmt(today) };
    case "yesterday": {
      const y = new Date(today);
      y.setUTCDate(y.getUTCDate() - 1);
      return { start: fmt(y), end: fmt(y) };
    }
    case "7days": {
      const s = new Date(today);
      s.setUTCDate(s.getUTCDate() - 6);
      return { start: fmt(s), end: fmt(today) };
    }
    case "30days": {
      const s = new Date(today);
      s.setUTCDate(s.getUTCDate() - 29);
      return { start: fmt(s), end: fmt(today) };
    }
    case "thisMonth": {
      const s = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
      return { start: fmt(s), end: fmt(today) };
    }
    default:
      return { start: "", end: "" };
  }
}

export const STATUS_LABELS: Record<string, string> = {
  NEW: "جديد",
  ASSIGNED: "معيّن",
  PENDING: "قيد الانتظار",
  CLOSED: "مغلق",
  ARCHIVED: "مؤرشفة",
};

export const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-500",
  ASSIGNED: "bg-indigo-500",
  PENDING: "bg-amber-500",
  CLOSED: "bg-emerald-500",
  ARCHIVED: "bg-slate-400",
};
