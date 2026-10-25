export type AutoCloseReviewStatus = "PENDING" | "REVIEWED" | "ADJUSTED" | "DISMISSED";

export interface AttendanceAutoCloseAudit {
  id: string;
  scheduledCheckOut: string | null;
  autoClosedAt: string | null;
  reminderSentAt: string | null;
  autoCloseReason: string | null;
  autoClosePolicy: string;
  reviewStatus: AutoCloseReviewStatus;
  reviewNotes: string | null;
  reviewedByUserId?: string | null;
  createdAt: string;
  updatedAt: string;
  isAutoClosed?: boolean;
}

export interface AutoCloseSummary {
  total: number;
  pending: number;
  reviewed: number;
  adjusted: number;
  dismissed: number;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  checkInLocation: string | null;
  checkOutLocation: string | null;
  checkInMethod: string | null;
  checkOutMethod: string | null;
  status: string;
  workHours: number | null;
  overtimeHours: number | null;
  lateMinutes: number | null;
  earlyLeaveMinutes: number | null;
  notes: string | null;
  workMode: string | null;
  autoCloseAudit?: AttendanceAutoCloseAudit | null;
  isAutoClosed?: boolean;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string;
    employeeNumber: string;
    department: { name: string } | null;
  };
}

export interface TodayStats {
  date: string;
  timezone?: string;
  totalEmployees: number;
  present: number;
  late: number;
  absent: number;
  records: AttendanceRecord[];
}

export interface ManualAttendanceForm {
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
  notes: string;
  workMode: string;
  lateHours: number;
  lateMins: number;
  earlyHours: number;
  earlyMins: number;
}

export interface ManualOverrides {
  status: boolean;
  late: boolean;
  early: boolean;
}

export interface EmployeeSimple {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
}

export interface SelectedLocationData {
  latitude: number;
  longitude: number;
  type: string;
}
