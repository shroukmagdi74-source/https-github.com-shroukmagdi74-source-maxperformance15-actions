export interface TodayAttendance {
  id?: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  checkInLocation: string | null;
  checkOutLocation: string | null;
  status: string;
  workMode?: "OFFICE" | "HOME" | null;
  workHours: number | null;
  lateMinutes: number | null;
  earlyLeaveMinutes: number | null;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  totalWorkHours: number;
  totalOvertimeHours: number;
  attendanceRate: number;
}

export interface TodayGoal {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  progress: number;
  unit?: string | null;
  project?: { id: string; name: string } | null;
  parentGoal?: { id: string; title: string } | null;
}

export interface SelectedMapLocation {
  latitude: number;
  longitude: number;
  type: string;
}

export interface GeofenceModalData {
  distance?: number;
  rawDistance?: number;
  allowedRadius?: number;
  accuracy?: number;
  failure?: "OUT_OF_RANGE" | "WEAK_ACCURACY" | "LOCATION_MISSING" | "REMOTE_NOT_ALLOWED" | string;
  attemptId?: string | null;
  canRequestException?: boolean;
  branchNetworkEnabled?: boolean;
  requiresLocation?: boolean;
}

export const STALE_SHIFT_HOURS = 24;
