import {
  MonitorOverviewStats,
  MonitorStatusFilter,
  SortField,
  TeamMemberSummary,
} from "./types";

export const formatSeconds = (sec: number = 0): string => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h} س ${m} د`;
};

export const formatClockTime = (iso?: string | null): string | null => {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
};

export const getAttendanceActivityDelta = (
  clockIn?: string | null,
  firstAct?: string | null
): number | null => {
  if (!clockIn || !firstAct) return null;
  try {
    const tIn = new Date(clockIn).getTime();
    const tAct = new Date(firstAct).getTime();
    if (isNaN(tIn) || isNaN(tAct)) return null;
    return Math.round((tAct - tIn) / 60000);
  } catch {
    return null;
  }
};

export const getCheckInMethodLabel = (method?: string): string => {
  if (method === "fingerprint" || method === "biometric") return "بصمة";
  if (method === "mobile") return "موبايل";
  if (method === "web") return "ويب";
  return method || "نظام";
};

export const parseTeamOverviewData = (
  data: any[]
): { members: TeamMemberSummary[]; stats: MonitorOverviewStats } => {
  let totalActiveSec = 0;
  let activeProdScore = 0;
  let activeProdCount = 0;
  let activeCount = 0;
  let totalTasks = 0;
  let totalCreated = 0;
  let totalWarmup = 0;
  let warmupCount = 0;
  let totalRatio = 0;
  let ratioCount = 0;

  const seen = new Set<string>();
  const formatted: TeamMemberSummary[] = [];

  for (const item of data) {
    const empName = item.employee?.firstName
      ? `${item.employee.firstName} ${item.employee.lastName || ""}`.trim()
      : item.employeeName || item.employeeId;
    const key = item.employeeId || empName;
    if (seen.has(key)) continue;
    seen.add(key);

    totalActiveSec += item.totalActiveSeconds || 0;
    if (item.status === "active") activeCount++;
    totalTasks += item.completedTasksCount || 0;
    totalCreated += item.createdTasksCount || 0;

    if (
      (item.totalActiveSeconds || 0) > 0 &&
      (item.productivityScore || 0) > 0
    ) {
      activeProdScore += item.productivityScore;
      activeProdCount++;
    }

    const lateStartSec = item.lateStartSeconds ?? 0;
    const lateStartMin =
      item.lateStartMinutes ?? Math.round(lateStartSec / 60);
    if (lateStartMin > 0) {
      totalWarmup += lateStartMin;
      warmupCount++;
    }
    if (typeof item.activityRatio === "number") {
      totalRatio += item.activityRatio;
      ratioCount++;
    }

    formatted.push({
      employeeId: item.employeeId,
      employeeName: empName,
      departmentName: item.employee?.department?.name || "الإدارة العامة",
      jobTitle: item.employee?.position?.title || "موظف",
      status: item.status || "offline",
      breakReason: item.breakReason || null,
      isCurrentlyOnBreak: Boolean(item.isCurrentlyOnBreak),
      totalActiveSeconds: item.totalActiveSeconds || 0,
      totalIdleSeconds: item.totalIdleSeconds || 0,
      totalProductiveSeconds: item.totalProductiveSeconds || 0,
      totalUnproductiveSeconds: item.totalUnproductiveSeconds || 0,
      totalBreaksCount: item.totalBreaksCount || 0,
      totalBreakSeconds: item.totalBreakSeconds || 0,
      totalBreakMinutes:
        item.totalBreakMinutes ||
        Math.round((item.totalBreakSeconds || 0) / 60),
      totalSleepSeconds:
        typeof item.totalSleepSeconds === "number"
          ? item.totalSleepSeconds
          : Math.max(
              0,
              (item.totalIdleSeconds || 0) - (item.totalBreakSeconds || 0)
            ),
      productivityScore: Math.round(item.productivityScore || 0),
      activityRatio:
        typeof item.activityRatio === "number" ? item.activityRatio : undefined,
      lateStartSeconds: lateStartSec,
      lateStartMinutes: lateStartMin,
      weeklyAvgLateStartMinutes: item.weeklyAvgLateStartMinutes ?? lateStartMin,
      totalClockSeconds:
        item.totalClockSeconds ?? item.elapsedAttendanceSeconds ?? 0,
      openTasksCount: item.openTasksCount || 0,
      overdueTasksCount: item.overdueTasksCount || 0,
      tasksPerHour:
        typeof item.tasksPerHour === "number" ? item.tasksPerHour : 0,
      operationalSignal: item.operationalSignal || null,
      lastHeartbeat: item.lastActivityTime,
      firstActivityTime: item.firstActivityTime,
      lastSeenTime: item.lastSeenTime,
      deviceName: item.deviceName,
      isDeviceConnected: item.isDeviceConnected,
      clockInTime: item.clockInTime,
      clockOutTime: item.clockOutTime,
      checkInMethod: item.checkInMethod,
      hasMissingClockOut: item.hasMissingClockOut || false,
      topApp:
        item.topApp ||
        (item.topApps
          ? Object.keys(JSON.parse(item.topApps || "{}"))[0]
          : undefined),
      completedTasksCount: item.completedTasksCount || 0,
      createdTasksCount: item.createdTasksCount || 0,
      elapsedAttendanceSeconds: item.elapsedAttendanceSeconds || 0,
      untrackedSeconds: item.untrackedSeconds || 0,
      activeTask: item.activeTask || null,
    });
  }

  return {
    members: formatted,
    stats: {
      totalTracked: formatted.length,
      activeNow: activeCount,
      avgProductivity:
        activeProdCount > 0
          ? Math.round(activeProdScore / activeProdCount)
          : 0,
      totalHoursTracked: Math.round((totalActiveSec / 3600) * 10) / 10,
      totalTasksCompleted: totalTasks,
      totalTasksCreated: totalCreated,
      avgWarmupMinutes:
        warmupCount > 0 ? Math.round(totalWarmup / warmupCount) : 0,
      avgActivityRatio:
        ratioCount > 0 ? Math.round(totalRatio / ratioCount) : 0,
    },
  };
};

export const filterAndSortTeamMembers = (
  teamMembers: TeamMemberSummary[],
  searchQuery: string,
  statusFilter: MonitorStatusFilter,
  sortField: SortField,
  sortDirection: "asc" | "desc"
): TeamMemberSummary[] => {
  const query = searchQuery.trim().toLowerCase();
  const filtered = teamMembers.filter((m) => {
    const matchesSearch =
      !query ||
      (m.employeeName && m.employeeName.toLowerCase().includes(query)) ||
      (m.jobTitle && m.jobTitle.toLowerCase().includes(query)) ||
      (m.departmentName && m.departmentName.toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === "all" ||
      m.status === statusFilter ||
      (statusFilter === "idle" &&
        (m.status === "idle" || m.status === "break"));

    return matchesSearch && matchesStatus;
  });

  return [...filtered].sort((a, b) => {
    const valA: any = a[sortField] ?? 0;
    const valB: any = b[sortField] ?? 0;
    if (typeof valA === "string") {
      return sortDirection === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    return sortDirection === "asc" ? valA - valB : valB - valA;
  });
};
