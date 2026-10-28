import type { ComponentType } from "react";

export interface TimeEntry {
  id: string;
  taskId: string;
  taskTitle: string;
  projectName: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  description: string;
  createdAt: string;
}

export interface UserTimeStats {
  userId: string;
  userName: string;
  totalMinutes: number;
  tasksCount: number;
}

export interface ProjectTimeStats {
  projectId: string;
  projectName: string;
  totalMinutes: number;
  tasksCount: number;
}

export interface DailyStats {
  date: string;
  totalMinutes: number;
  entriesCount: number;
}

export interface TimeEvaluationTask {
  taskId: string;
  title: string;
  status: string;
  assignedTo: string | null;
  assigneeName: string | null;
  projectName: string | null;
  estimatedMinutes: number;
  estimatedHours: number;
  actualMinutes: number;
  actualHours: number;
  diffMinutes: number;
  diffHours: number;
  diffPct: number;
  accuracyPct: number;
  sessionsCount: number;
  firstSession: string | null;
  lastSession: string | null;
  reworkMinutes: number;
  returnReasonType: string | null;
  returnSeverity: number | null;
}

export interface TimeEvaluationSummary {
  totalTasks: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  overallAccuracyPct: number;
  totalReworkMinutes: number;
}

export type TimeReportsTab =
  | "entries"
  | "users"
  | "projects"
  | "daily"
  | "evaluation";

export interface TabItem {
  id: TimeReportsTab;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export const RETURN_REASON_LABELS: Record<string, string> = {
  MISSING_EVIDENCE: "نقص في أدلة الإنجاز",
  WRONG_EXECUTION: "خطأ في التنفيذ",
  CRITERIA_VIOLATION: "مخالفة معايير القبول",
  QUALITY: "جودة دون المستوى المطلوب",
  LATE: "تأخير في التسليم",
};

export const RETURN_SEVERITY_LABELS: Record<number, string> = {
  1: "بسيط",
  2: "متوسط",
  3: "جسيم",
};
