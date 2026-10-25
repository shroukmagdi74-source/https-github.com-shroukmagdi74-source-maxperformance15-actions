export interface DeductionEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeNumber?: string;
}

export interface Deduction {
  id: string;
  employeeId: string;
  type: string;
  category?: string;
  amount: number;
  reason: string;
  description?: string;
  date: string;
  effectiveMonth: number;
  effectiveYear: number;
  status: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  appliedToPayroll: boolean;
  payrollId?: string;
  notes?: string;
  createdAt: string;
  employee?: DeductionEmployee;
}

export interface DeductionStats {
  total: number;
  totalAmount: string;
  byStatus: {
    status: string;
    _count: number;
  }[];
}

export interface CreateDeductionForm {
  employeeId: string;
  type: string;
  category: string;
  amount: string;
  reason: string;
  description: string;
  date: string;
  effectiveMonth: number;
  effectiveYear: number;
  notes: string;
}

export const DEDUCTION_TYPES: Record<string, string> = {
  PENALTY: "غرامة",
  VIOLATION: "مخالفة",
  DAMAGE: "تعويض عن ضرر",
  INSURANCE: "تأمين",
  LOAN_REPAYMENT: "سداد قرض",
  ADVANCE_REPAYMENT: "سداد سلفة",
  TAX: "ضريبة",
  SOCIAL_INSURANCE: "تأمينات اجتماعية",
  ABSENCE: "غياب",
  LATE: "تأخير",
  EARLY_LEAVE: "خروج مبكر",
  OTHER: "أخرى",
};

export const DEDUCTION_STATUS: Record<
  string,
  { label: string; color: string }
> = {
  PENDING: {
    label: "في الانتظار",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  APPROVED: {
    label: "موافق عليه",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  REJECTED: {
    label: "مرفوض",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
  APPLIED: {
    label: "تم التطبيق",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  CANCELLED: {
    label: "ملغي",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  },
};
