export interface PillarInfo {
  score: number;
  weight: number;
  baseWeight?: number;
  label?: string;
  details?: string;
  isApplicable?: boolean;
}

export interface PillarScores {
  delivery: PillarInfo;
  quality: PillarInfo;
  punctuality: PillarInfo;
  focus: PillarInfo;
  goals: PillarInfo;
}

export interface TelemetryStats {
  tasksCompleted: number;
  totalTasks: number;
  onTimeTasks?: number;
  lateTasksCount?: number;
  returns: number;
  missingEvidenceCount?: number;
  presentDays?: number;
  lateDays: number;
  absentDays?: number;
  workDaysScheduled?: number;
  monitoredDays: number;
  activeGoals: number;
}

export interface LateTaskItem {
  id: string;
  title: string;
  dueDate?: string;
  status: string;
}

export interface ReturnedTaskItem {
  id: string;
  title: string;
  returnCount: number;
  lastReturnReason?: string;
}

export interface DrilldownDetails {
  lateTasks: LateTaskItem[];
  returnedTasks: ReturnedTaskItem[];
}

export type PerformanceTier =
  | "TIER_S"
  | "TIER_A"
  | "TIER_B"
  | "TIER_C"
  | "TIER_D"
  | "PENDING_EVALUATION";

export interface LeaderboardEmployee {
  id: string;
  userId?: string;
  employeeNumber: string;
  name: string;
  avatar?: string;
  departmentName: string;
  positionTitle: string;
  compositeScore: number;
  isEvaluated?: boolean;
  tier: PerformanceTier;
  tierLabel: string;
  isAtRisk: boolean;
  riskFlags: string[];
  pillars: PillarScores;
  telemetryStats: TelemetryStats;
  drilldownDetails?: DrilldownDetails;
}

export interface DepartmentStat {
  department: string;
  employeeCount: number;
  averageScore: number;
}

export interface LeaderboardSummary {
  totalEmployees: number;
  evaluatedEmployees?: number;
  averageScore: number;
  tierCounts: {
    TIER_S: number;
    TIER_A: number;
    TIER_B: number;
    TIER_C: number;
    TIER_D: number;
    PENDING_EVALUATION?: number;
  };
  atRiskCount: number;
  bestDepartment: string;
  needsSupportDepartment: string;
}

export interface LeaderboardData {
  summary: LeaderboardSummary;
  departmentStats: DepartmentStat[];
  leaderboard: LeaderboardEmployee[];
  period: string;
  isMonthSpecific?: boolean;
}

export type PeriodMode = "SLIDING_30" | "CURRENT_MONTH" | "PREVIOUS_MONTH";
