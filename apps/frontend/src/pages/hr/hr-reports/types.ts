export interface AttendanceReport {
  totalEmployees: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  averageWorkHours: number;
  attendanceRate: number;
  byDepartment: {
    department: string;
    rate: number;
    employees: number;
  }[];
}

export interface LeaveReport {
  totalRequests: number;
  approved: number;
  rejected: number;
  pending: number;
  totalDaysTaken: number;
  byType: {
    type: string;
    count: number;
    days: number;
  }[];
}

export interface PayrollReport {
  totalPayroll: number;
  totalBaseSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  totalOvertime: number;
  averageSalary: number;
  byDepartment: {
    department: string;
    total: number;
    employees: number;
  }[];
}

export interface WarningReport {
  totalWarnings: number;
  byType: { type: string; count: number }[];
  bySeverity: { severity: string; count: number }[];
}

export interface TrainingReport {
  totalTrainings: number;
  completed: number;
  inProgress: number;
  completionRate: number;
  byCategory: { name: string; count: number }[];
}

export interface PerformanceReport {
  averageRating: number;
  reviewCount: number;
  distribution: { rating: string; count: number }[];
}
