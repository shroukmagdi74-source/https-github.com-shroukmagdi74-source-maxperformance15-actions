import {
  Calendar,
  Palmtree,
  Stethoscope,
  Baby,
  Heart,
  GraduationCap,
  AlertTriangle,
} from "lucide-react";

export interface LeaveRequest {
  id: string;
  userId: string;
  type: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  reason: string;
  isHalfDay?: boolean;
  halfDayPeriod?: string | null;
  createdAt: string;
  approvedAt: string | null;
  rejectionReason: string | null;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string;
    department: { name: string } | null;
  };
  approver: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface LeaveTypeOption {
  labelKey: string;
  icon: any;
  color: string;
}

export const leaveTypeConfig: Record<string, LeaveTypeOption> = {
  ANNUAL: {
    labelKey: "employee.leaves.annual",
    icon: Palmtree,
    color: "bg-green-100 text-green-800",
  },
  SICK: { labelKey: "employee.leaves.sick", icon: Stethoscope, color: "bg-red-100 text-red-800" },
  UNPAID: {
    labelKey: "employee.leaves.withoutPay",
    icon: Calendar,
    color: "bg-gray-100 text-gray-800",
  },
  MATERNITY: { labelKey: "employee.leaves.maternity", icon: Baby, color: "bg-pink-100 text-pink-800" },
  PATERNITY: { labelKey: "employee.leaves.paternity", icon: Baby, color: "bg-blue-100 text-blue-800" },
  BEREAVEMENT: {
    labelKey: "employee.leaves.funeral",
    icon: Heart,
    color: "bg-purple-100 text-purple-800",
  },
  MARRIAGE: { labelKey: "employee.leaves.marriage", icon: Heart, color: "bg-rose-100 text-rose-800" },
  HAJJ: { labelKey: "employee.leaves.hajj", icon: Calendar, color: "bg-amber-100 text-amber-800" },
  STUDY: {
    labelKey: "employee.leaves.study",
    icon: GraduationCap,
    color: "bg-indigo-100 text-indigo-800",
  },
  EMERGENCY: {
    labelKey: "employee.leaves.emergency",
    icon: AlertTriangle,
    color: "bg-orange-100 text-orange-800",
  },
  OTHER: {
    labelKey: "employee.leaves.other",
    icon: Calendar,
    color: "bg-slate-100 text-slate-800",
  },
};

export const statusConfig: Record<string, { labelKey: string; color: string }> = {
  PENDING: { labelKey: "employee.leaves.pendingStatus", color: "bg-yellow-100 text-yellow-800" },
  APPROVED: { labelKey: "employee.leaves.approvedStatus", color: "bg-green-100 text-green-800" },
  REJECTED: { labelKey: "employee.leaves.rejectedStatus", color: "bg-red-100 text-red-800" },
  CANCELLED: { labelKey: "employee.leaves.cancelledStatus", color: "bg-gray-100 text-gray-800" },
};

export interface LeaveFormData {
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  isHalfDay: boolean;
  halfDayPeriod: string;
  isPaid: boolean;
}

export interface EditLeaveFormData {
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  isHalfDay: boolean;
  halfDayPeriod: string;
  isPaid: boolean;
}
