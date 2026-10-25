import React from "react";
import { Clock, CheckCircle, XCircle } from "lucide-react";

export interface Deduction {
  id: string;
  type: string;
  category?: string;
  amount: number;
  reason: string;
  description?: string;
  date: string;
  effectiveMonth: number;
  effectiveYear: number;
  status: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  appliedToPayroll: boolean;
  notes?: string;
  createdAt: string;
}

export const DEDUCTION_TYPES: Record<string, string> = {
  PENALTY: "employee.deductions.typeFine",
  VIOLATION: "employee.deductions.typeViolation",
  DAMAGE: "employee.deductions.typeCompensation",
  INSURANCE: "employee.deductions.typeInsurance",
  LOAN_REPAYMENT: "employee.deductions.typeLoan",
  ADVANCE_REPAYMENT: "employee.deductions.typeAdvance",
  TAX: "employee.deductions.typeTax",
  SOCIAL_INSURANCE: "employee.deductions.typeSocialInsurance",
  ABSENCE: "employee.deductions.typeAbsence",
  LATE: "employee.deductions.typeLate",
  EARLY_LEAVE: "employee.deductions.typeEarlyLeave",
  OTHER: "employee.deductions.typeOther",
};

export const DEDUCTION_STATUS: Record<
  string,
  { labelKey: string; color: string; icon: React.ElementType }
> = {
  PENDING: {
    labelKey: "employee.deductions.pendingStatus",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: Clock,
  },
  APPROVED: {
    labelKey: "employee.deductions.approvedStatus",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircle,
  },
  REJECTED: {
    labelKey: "employee.deductions.rejectedStatus",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
  },
  APPLIED: {
    labelKey: "employee.deductions.appliedStatus",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    icon: CheckCircle,
  },
  CANCELLED: {
    labelKey: "employee.deductions.cancelledStatus",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    icon: XCircle,
  },
};

export const formatDeductionCurrency = (amount: number) => {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
  }).format(amount);
};

export const formatDeductionDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("ar-EG");
};
