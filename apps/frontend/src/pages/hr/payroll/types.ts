export interface PayrollEmployee {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  avatar: string;
  department: { name: string } | null;
  position: { title: string } | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankIban?: string | null;
}

export interface Payroll {
  id: string;
  month: number;
  year: number;
  baseSalary: number;
  fullMonthBaseSalary?: number;
  totalAllowances: number;
  totalDeductions: number;
  overtimeAmount: number;
  overtimeHours?: number;
  overtimeRate?: number;
  bonuses: number;
  socialInsurance: number;
  taxAmount: number;
  grossSalary: number;
  netSalary: number;
  attendanceDeduction: number;
  absentDays: number;
  latePenalty: number;
  actualWorkDays?: number;
  workingDays?: number;
  status: string;
  paidAt: string | null;
  allowances: string | null;
  deductions: string | null;
  employee: PayrollEmployee;
}

export interface PayrollSummary {
  month: number;
  year: number;
  totalEmployees: number;
  totalBaseSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  totalOvertime: number;
  totalBonuses: number;
  totalGross: number;
  totalNet: number;
  byStatus: Record<string, number>;
}

export interface PayrollAutoStatus {
  success: boolean;
  autoDeductionEnabled?: boolean;
  payrollDay?: number;
  absencePenaltyRate?: number;
  workingHoursPerDay?: number;
  stats?: {
    attendanceCount?: number;
    draftCount?: number;
  };
}

export interface EditFormData {
  baseSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  overtimeAmount: number;
  bonuses: number;
  socialInsurance: number;
  taxAmount: number;
}

export interface KeyedAmountItem {
  id: string;
  name: string;
  amount: number;
}

export type PaymentMethod = 'bank_transfer' | 'cash' | 'e_wallet';

export const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'مسودة', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  PENDING: { label: 'بانتظار الاعتماد', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  PENDING_APPROVAL: { label: 'بانتظار الاعتماد', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  APPROVED: { label: 'معتمد', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PROCESSED: { label: 'معتمد', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PAID: { label: 'مدفوع', color: 'bg-indigo-50 text-violet-700 border-violet-200' },
  CANCELLED: { label: 'ملغي', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  PROJECTION: { label: 'تقديري', color: 'bg-violet-50 text-violet-700 border-violet-200' },
};

export const months = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export const formatCurrency = (amount: number | undefined | null) => {
  const value = amount ?? 0;
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};
