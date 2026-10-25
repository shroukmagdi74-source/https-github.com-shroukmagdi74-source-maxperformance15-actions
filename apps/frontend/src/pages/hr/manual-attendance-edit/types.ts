export interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  workHours: number | null;
  overtimeHours: number | null;
  lateMinutes: number | null;
  earlyLeaveMinutes?: number | null;
  notes: string | null;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string;
    employeeNumber: string;
    department?: { name: string } | null;
  };
  isNew?: boolean;
}

export interface EditingRecord {
  id: string;
  checkIn: string;
  checkOut: string;
  status: string;
  notes: string;
  lateHours: number;
  lateMins: number;
  earlyHours: number;
  earlyMins: number;
}

export interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  avatar?: string;
  department?: { name: string } | null;
}

export interface StatusOption {
  value: string;
  label: string;
  color: string;
}

export const statusOptions: StatusOption[] = [
  { value: "PRESENT", label: "حاضر", color: "bg-green-100 text-green-800" },
  { value: "LATE", label: "متأخر", color: "bg-yellow-100 text-yellow-800" },
  { value: "ABSENT", label: "غائب", color: "bg-red-100 text-red-800" },
  { value: "HALF_DAY", label: "نصف يوم", color: "bg-blue-100 text-blue-800" },
  { value: "ON_LEAVE", label: "إجازة", color: "bg-purple-100 text-purple-800" },
  { value: "REMOTE", label: "عن بُعد", color: "bg-indigo-100 text-indigo-800" },
];
