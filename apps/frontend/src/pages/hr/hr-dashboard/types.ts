export interface DashboardMetricGroupItem {
  name?: string;
  label?: string;
  value?: number;
  count?: number;
  type?: string;
  status?: string;
}

export interface DashboardEmployee {
  id: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  department?: {
    name?: string;
  };
  position?: {
    title?: string;
  };
  hireDate?: string;
}

export interface AttendanceRecord {
  employee?: DashboardEmployee;
  checkIn?: string;
  status?: string;
}

export interface LeaveRequest {
  id: string;
  type?: string;
  totalDays?: number;
  employee?: DashboardEmployee;
}

export interface PermissionRequest {
  id: string;
  type?: string;
  duration?: number;
  employee?: DashboardEmployee;
}

export interface AdvanceRequest {
  id: string;
  amount?: number;
  createdAt?: string;
  employee?: DashboardEmployee;
}

export interface DepartmentOverview {
  id: string;
  name?: string;
  color?: string;
  employeeCount?: number;
}

export interface WarningSeveritySummary {
  severity: string;
  _count: number;
}

export interface DashboardData {
  employees: {
    totalEmployees: number;
    activeEmployees: number;
    byDepartment: DashboardMetricGroupItem[];
    byContractType: DashboardMetricGroupItem[];
    byStatus: DashboardMetricGroupItem[];
    recentHires: DashboardEmployee[];
    upcomingBirthdays: DashboardEmployee[];
  };
  attendance: {
    date: string;
    totalEmployees: number;
    present: number;
    late: number;
    absent: number;
    records: AttendanceRecord[];
  };
  pendingLeaves: LeaveRequest[];
  departments: {
    totalDepartments: number;
    departments: DepartmentOverview[];
  };
  pendingPermissions: PermissionRequest[];
  pendingAdvances: AdvanceRequest[];
  recruitment: {
    activeJobs: number;
    totalApplicants: number;
    scheduledInterviews: number;
    pendingReviews: number;
    hiredThisMonth: number;
  };
  warnings: {
    total: number;
    bySeverity: WarningSeveritySummary[];
    acknowledged: number;
  };
}
