import tokenManager from "../../../utils/tokenManager";

export const getAuthHeaders = (additionalHeaders: Record<string, string> = {}) =>
  tokenManager.createAuthHeaders(additionalHeaders);

export const statusConfig: Record<
  string,
  { label: string; color: string; border: string }
> = {
  ACTIVE: {
    label: "نشط",
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/20",
  },
  COMPLETED: {
    label: "مكتمل",
    color: "bg-primary/10 text-primary",
    border: "border-primary/20",
  },
  ON_HOLD: {
    label: "معلق",
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    border: "border-amber-500/20",
  },
  CANCELLED: {
    label: "ملغي",
    color: "bg-destructive/10 text-destructive",
    border: "border-destructive/20",
  },
};

export const confidenceConfig: Record<string, { label: string; dot: string }> = {
  ON_TRACK: { label: "على المسار", dot: "bg-emerald-500" },
  AT_RISK: { label: "في خطر", dot: "bg-amber-500" },
  OFF_TRACK: { label: "خارج المسار", dot: "bg-destructive" },
};

export interface KeyResult {
  id: string;
  title: string;
  description: string | null;
  targetType: string;
  targetValue: number;
  currentValue: number;
  unit: string | null;
  weight: number;
  confidence: string | null;
  status: string;
}

export interface CheckIn {
  id: string;
  content: string;
  confidence: string | null;
  progressValue: number | null;
  blockers: string | null;
  createdAt: string;
  member: { id: string; name: string; userId: string };
}

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  priority: string;
  targetType: string;
  targetValue: number;
  currentValue: number;
  unit: string | null;
  progress: number;
  confidence: string | null;
  startDate: string;
  endDate: string;
  quarter: string | null;
  tags: string[];
  owner: { id: string; name: string; userId: string } | null;
  project: { id: string; name: string; color: string } | null;
  parentGoal: { id: string; title: string } | null;
  childGoals: Array<{
    id: string;
    title: string;
    status: string;
    progress: number;
    priority: string;
    type: string;
  }>;
  keyResults: KeyResult[];
  linkedTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    assigneeId: string | null;
  }>;
  _count: { keyResults: number; linkedTasks: number; childGoals: number };
}
