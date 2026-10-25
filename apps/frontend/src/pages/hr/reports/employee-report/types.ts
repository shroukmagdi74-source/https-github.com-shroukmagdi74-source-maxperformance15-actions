export interface EmployeeOption {
  id: string;
  firstName?: string;
  lastName?: string;
  employeeNumber?: string;
}

export interface EmployeeReportAttendanceRecord {
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  workHours: number;
  lateMinutes: number;
}

export interface EmployeeReportLeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  reason: string;
}

export interface EmployeeReportAdvanceRequest {
  id: string;
  amount: number;
  requestDate: string;
  status: string;
  reason: string;
}

export interface EmployeeReportPermissionRequest {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  status: string;
  reason: string;
}

export interface EmployeeReportManualDeduction {
  id: string;
  amount: number;
  reason: string;
  date: string;
  status: string;
  type: string;
}

export interface EmployeeReportWarning {
  id: string;
  type: string;
  date: string;
  description: string;
}

export interface EmployeeReportData {
  employee: {
    id: string;
    name: string;
    employeeNumber: string;
    department: string;
    position: string;
  };
  attendance: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    totalLateMinutes: number;
    totalWorkHours: number;
    overtimeHours: number;
    records: EmployeeReportAttendanceRecord[];
  };
  leaves: {
    totalRequests: number;
    approved: number;
    pending: number;
    rejected: number;
    totalDaysTaken: number;
    requests: EmployeeReportLeaveRequest[];
  };
  advances: {
    totalRequests: number;
    totalAmount: number;
    pending: number;
    approved: number;
    requests: EmployeeReportAdvanceRequest[];
  };
  permissions: {
    totalRequests: number;
    approved: number;
    totalHours: number;
    requests: EmployeeReportPermissionRequest[];
  };
  payroll: {
    baseSalary: number;
    allowances: number;
    deductions: number;
    overtimePay: number;
    netSalary: number;
    lastPayment: string | null;
    manualDeductions: EmployeeReportManualDeduction[];
  };
  performance: {
    lastReview: {
      date: string;
      score: number;
      reviewer: string;
    } | null;
    activeGoals: number;
    completedGoals: number;
  };
  warnings: {
    total: number;
    recent: EmployeeReportWarning[];
  };
}
