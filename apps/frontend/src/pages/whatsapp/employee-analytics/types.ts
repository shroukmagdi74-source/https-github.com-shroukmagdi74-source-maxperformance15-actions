export interface EmployeeStat {
  userId: string;
  userName: string;
  userEmail: string;
  userImage: string | null;
  assignedConversations: number;
  repliedConversations: number;
  unrepliedConversations: number;
  incomingMessages: number;
  outgoingMessages: number;
  responseRate: number;
  avgResponseTimeMs: number | null;
  avgResponseTimeMin: number | null;
}

export interface AnalyticsSummary {
  totalIncomingConversations: number;
  totalAssigned: number;
  totalReplied: number;
  totalUnreplied: number;
  totalIncomingMessages: number;
  totalOutgoingMessages: number;
  overallResponseRate: number;
  overallAvgResponseTimeMs: number | null;
  overallAvgResponseTimeMin: number | null;
  activeEmployees: number;
}

export interface AnalyticsResponse {
  success: boolean;
  period: { start: string; end: string };
  summary: AnalyticsSummary;
  employees: EmployeeStat[];
}

export type DatePreset = "today" | "yesterday" | "7days" | "30days" | "thisMonth" | "custom";

export const PRESET_LABELS: Record<DatePreset, string> = {
  today: "اليوم",
  yesterday: "أمس",
  "7days": "آخر ٧ أيام",
  "30days": "آخر ٣٠ يوم",
  thisMonth: "هذا الشهر",
  custom: "نطاق مخصص",
};

export const PRESET_ORDER: DatePreset[] = ["today", "yesterday", "7days", "30days", "thisMonth", "custom"];

export function getPresetRange(preset: DatePreset): { start: string; end: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const fmt = (d: Date) => d.toISOString().substring(0, 10);
  switch (preset) {
    case "today":
      return { start: fmt(today), end: fmt(today) };
    case "yesterday": {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      return { start: fmt(y), end: fmt(y) };
    }
    case "7days": {
      const s = new Date(today);
      s.setDate(s.getDate() - 6);
      return { start: fmt(s), end: fmt(today) };
    }
    case "30days": {
      const s = new Date(today);
      s.setDate(s.getDate() - 29);
      return { start: fmt(s), end: fmt(today) };
    }
    case "thisMonth": {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: fmt(s), end: fmt(today) };
    }
    default:
      return { start: "", end: "" };
  }
}

export interface DeltaMetrics {
  incoming: number | null;
  replied: number | null;
  unreplied: number | null;
  outgoing: number | null;
}

export interface SparkMetrics {
  incoming: number[];
  replied: number[];
  unreplied: number[];
  outgoing: number[];
}

export interface EmployeeChartItem {
  name: string;
  صادرة: number;
  واردة: number;
  محادثات: number;
}
