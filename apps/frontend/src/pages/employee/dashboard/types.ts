export interface EmployeeInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  employeeNumber: string;
  department: { name: string; color: string } | null;
  position: { title: string } | null;
  hireDate: string;
  annualLeaveBalance: number;
  sickLeaveBalance: number;
}

export interface TodayAttendance {
  checkIn: string | null;
  checkOut: string | null;
  status: string;
}

export interface RecentLeave {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  createdAt?: string;
}

export interface PermissionRequest {
  id: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  reason: string;
  createdAt?: string;
}

export interface Warning {
  id: string;
  type?: string;
  severity?: string;
  title?: string;
  description?: string;
  status?: string;
  incidentDate?: string;
  createdAt?: string;
}

export interface AdvanceRequest {
  id: string;
  amount: number;
  reason?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  repaymentType: string;
  installmentsCount: number;
  remainingBalance: number;
}

export interface Reward {
  id: string;
  rewardName: string;
  calculatedValue: number;
  rewardCategory: string;
  status: string;
  appliedAt: string;
  createdAt: string;
}

export interface LastPayroll {
  id: string;
  month: number;
  year: number;
  netSalary: number;
  status: string;
  totalAllowances: number;
  totalDeductions: number;
}

export interface DashboardCachePayload {
  employee: EmployeeInfo | null;
  todayAttendance: TodayAttendance | null;
  recentLeaves: RecentLeave[];
  permissions: PermissionRequest[];
  advances: AdvanceRequest[];
  warnings: Warning[];
  rewards: Reward[];
  lastPayroll: LastPayroll | null;
}

export const DASHBOARD_CACHE_TTL_MS = 60 * 1000;

export const HR_APP_SLUGS = new Set([
  "hr-basic",
  "hr-core",
  "hr-pro",
  "hr-attendance-pro",
  "hr-payroll",
]);
