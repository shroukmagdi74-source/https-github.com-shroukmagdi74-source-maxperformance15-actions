export interface EmployeeAttendanceData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string | null;
  };
  company: {
    id: string;
    name: string;
    logo: string | null;
  };
  stats: {
    present: number;
    late: number;
    absent: number;
    onLeave: number;
    totalRecords: number;
  };
}

export interface AttendanceReportData {
  dateRange: { start: string; end: string };
  overview: {
    totalCompanies: number;
    totalEmployees: number;
    totalPresent: number;
    totalLate: number;
    totalAbsent: number;
    totalOnLeave: number;
  };
  byEmployee: EmployeeAttendanceData[];
}

export interface OwnerReportOptions {
  format: "pdf" | "excel";
  includeCharts: boolean;
  includeDetails: boolean;
  groupByCompany: boolean;
  showOnlyIssues: boolean;
}

export type OwnerReportViewMode = "cards" | "table";
export type OwnerReportSortBy = "name" | "attendance" | "company";
