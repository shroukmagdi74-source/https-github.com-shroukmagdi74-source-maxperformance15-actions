import React from "react";
import { CheckCircle, Clock, Zap, Banknote } from "lucide-react";

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  avatar: string;
  baseSalary: number;
  department?: { name: string; id: string } | null;
  position?: { title: string; id: string } | null;
  email?: string;
  phone?: string;
  joinDate?: string;
  isActive: boolean;
}

export interface Deduction {
  id: string;
  type: string;
  name: string;
  amount: number;
  isPercentage: boolean;
  description?: string;
}

export interface Allowance {
  id: string;
  name: string;
  amount: number;
  isPercentage: boolean;
}

export interface LeaveRecord {
  id: string;
  type: string;
  startDate: Date;
  endDate: Date;
  days: number;
  isPaid: boolean;
  description?: string;
}

export interface AttendanceRecord {
  id: string;
  date: Date;
  status: "PRESENT" | "ABSENT" | "LATE" | "LEAVE" | "HOLIDAY";
  inTime?: string;
  outTime?: string;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  overtimeHours: number;
  description?: string;
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  config: {
    baseSalary?: number;
    attendance?: Partial<AttendanceRecord>[];
    leaves?: Partial<LeaveRecord>[];
    deductions?: Partial<Deduction>[];
    allowances?: Partial<Allowance>[];
    overtimeRate?: number;
    taxRate?: number;
  };
}

export interface DeductionDetail {
  name?: string;
  amount: number;
  reason: string;
  type?: string;
}

export interface PayrollResult {
  baseSalary: number;
  earnedBaseSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  grossSalary: number;
  netSalary: number;
  taxAmount: number;
  socialInsurance: number;
  overtimeAmount: number;
  overtimeHours: number;
  attendanceDeduction: number;
  absentDays: number;
  latePenalty: number;
  workingDays: number;
  actualWorkDays: number;
  dailyRate: number;
  standardWorkingDays: number;
  month: number;
  year: number;
  periodStart: string;
  periodEnd: string;
  status: string;
  deductionDetails?: DeductionDetail[];
  attendanceDeductionDetails?: DeductionDetail;
  latePenaltyDetails?: DeductionDetail;
  taxDetails?: DeductionDetail;
  socialInsuranceDetails?: DeductionDetail;
}

export const PRESET_SCENARIOS: TestScenario[] = [
  {
    id: "normal",
    name: "حالة طبيعية",
    description: "موظف بـ 22 يوم عمل كامل وبدون خصومات",
    icon: CheckCircle,
    config: {
      attendance: Array.from({ length: 22 }, (_, i) => ({
        date: new Date(2026, 1, i + 1),
        status: "PRESENT",
        lateMinutes: 0,
        earlyLeaveMinutes: 0,
        overtimeHours: 0,
      })),
    },
  },
  {
    id: "absent_late",
    name: "تأخير وغيابات",
    description: "غياب يومين وتأخير متكرر",
    icon: Clock,
    config: {
      attendance: [
        ...Array.from({ length: 18 }, (_, i) => ({
          date: new Date(2026, 1, i + 1),
          status: "PRESENT",
          lateMinutes: 0,
          earlyLeaveMinutes: 0,
          overtimeHours: 0,
        })),
        {
          date: new Date(2026, 1, 19),
          status: "LATE",
          lateMinutes: 60,
          earlyLeaveMinutes: 0,
          overtimeHours: 0,
        },
        {
          date: new Date(2026, 1, 20),
          status: "LATE",
          lateMinutes: 120,
          earlyLeaveMinutes: 0,
          overtimeHours: 0,
        },
        {
          date: new Date(2026, 1, 21),
          status: "ABSENT",
          lateMinutes: 0,
          earlyLeaveMinutes: 0,
          overtimeHours: 0,
        },
        {
          date: new Date(2026, 1, 22),
          status: "ABSENT",
          lateMinutes: 0,
          earlyLeaveMinutes: 0,
          overtimeHours: 0,
        },
      ],
    },
  },
  {
    id: "overtime_bonus",
    name: "إضافي ومكافآت",
    description: "ساعات عمل إضافية مع مكافأة مالية",
    icon: Zap,
    config: {
      attendance: Array.from({ length: 22 }, (_, i) => ({
        date: new Date(2026, 1, i + 1),
        status: "PRESENT",
        lateMinutes: 0,
        earlyLeaveMinutes: 0,
        overtimeHours: i < 5 ? 3 : 0,
      })),
      allowances: [
        { name: "بدل طبيعة عمل", amount: 500, isPercentage: false },
      ],
    },
  },
  {
    id: "unpaid_leave",
    name: "إجازة بدون راتب",
    description: "إجازة سلبية لمدة أسبوع",
    icon: Clock,
    config: {
      attendance: Array.from({ length: 15 }, (_, i) => ({
        date: new Date(2026, 1, i + 1),
        status: "PRESENT",
        lateMinutes: 0,
        earlyLeaveMinutes: 0,
        overtimeHours: 0,
      })),
      leaves: [
        {
          startDate: new Date(2026, 1, 16),
          endDate: new Date(2026, 1, 22),
          type: "UNPAID",
          isPaid: false,
          days: 7,
        },
      ],
    },
  },
  {
    id: "loan_advance",
    name: "خصم سلفة وصيانة",
    description: "خصم سلفة شهرية + غرامة عهدة",
    icon: Banknote,
    config: {
      attendance: Array.from({ length: 22 }, (_, i) => ({
        date: new Date(2026, 1, i + 1),
        status: "PRESENT",
        lateMinutes: 0,
        earlyLeaveMinutes: 0,
        overtimeHours: 0,
      })),
      deductions: [
        {
          type: "ADVANCE",
          name: "تسديد سلفة",
          amount: 500,
          isPercentage: false,
        },
        {
          type: "DAMAGE",
          name: "إهلاك معدات",
          amount: 200,
          isPercentage: false,
        },
      ],
    },
  },
];
