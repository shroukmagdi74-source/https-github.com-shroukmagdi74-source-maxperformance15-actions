export interface TeamMemberSummary {
  employeeId: string;
  employeeName?: string;
  departmentName?: string;
  jobTitle?: string;
  status: "active" | "idle" | "offline" | "break";
  breakReason?: string | null;
  isCurrentlyOnBreak?: boolean;
  totalActiveSeconds: number;
  totalIdleSeconds: number;
  totalProductiveSeconds?: number;
  totalUnproductiveSeconds?: number;
  totalBreaksCount?: number;
  totalBreakSeconds?: number;
  totalBreakMinutes?: number;
  totalSleepSeconds?: number;
  productivityScore: number;
  activityRatio?: number;
  lateStartSeconds?: number;
  lateStartMinutes?: number;
  weeklyAvgLateStartMinutes?: number;
  totalClockSeconds?: number;
  lastHeartbeat?: string;
  firstActivityTime?: string;
  lastSeenTime?: string;
  deviceName?: string;
  isDeviceConnected?: boolean;
  clockInTime?: string;
  clockOutTime?: string;
  checkInMethod?: string;
  topApp?: string;
  completedTasksCount?: number;
  createdTasksCount?: number;
  openTasksCount?: number;
  overdueTasksCount?: number;
  tasksPerHour?: number;
  operationalSignal?: {
    type:
      | "TASK_OVERLOAD"
      | "DISTRACTION"
      | "NEGLECT"
      | "OFF_DEVICE_WORK"
      | "STEADY_PERFORMANCE"
      | "NORMAL";
    label: string;
    severity: "info" | "warning" | "critical" | "success";
    reason: string;
  } | null;
  elapsedAttendanceSeconds?: number;
  untrackedSeconds?: number;
  hasMissingClockOut?: boolean;
  activeTask?: {
    entryId?: string;
    taskId: string;
    title: string;
    priority?: string;
    startTime?: string;
    elapsedSeconds?: number;
  } | null;
}

export type SortField =
  | "employeeName"
  | "totalActiveSeconds"
  | "totalIdleSeconds"
  | "totalBreakSeconds"
  | "totalBreaksCount"
  | "productivityScore"
  | "completedTasksCount"
  | "lateStartMinutes"
  | "activityRatio"
  | "tasksPerHour";

export type MonitorStatusFilter = "all" | "active" | "idle" | "offline";

export interface MonitorOverviewStats {
  totalTracked: number;
  activeNow: number;
  avgProductivity: number;
  totalHoursTracked: number;
  totalTasksCompleted: number;
  totalTasksCreated: number;
  avgWarmupMinutes: number;
  avgActivityRatio: number;
}
