import {
  AttendanceRecord,
  Allowance,
  Deduction,
  PayrollResult,
} from "./types";

export function formatCurrency(amount: number | undefined | null): string {
  const value = amount ?? 0;
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function calculatePayrollSimulation({
  baseSalary,
  attendance,
  allowances,
  deductions,
}: {
  baseSalary: number;
  attendance: AttendanceRecord[];
  allowances: Allowance[];
  deductions: Deduction[];
}): PayrollResult {
  const standardWorkingDays = 26;
  const workingDays = attendance.length;
  const absentDays = attendance.filter((a) => a.status === "ABSENT").length;
  const actualWorkDays = workingDays - absentDays;

  // Daily rate and earned base salary
  const dailyRate = baseSalary / standardWorkingDays;
  const earnedBaseSalary = actualWorkDays * dailyRate;

  // Absence deduction
  const attendanceDeduction = absentDays * dailyRate;
  const attendanceDeductionDetails = {
    amount: attendanceDeduction,
    reason: `خصم غياب ${absentDays} يوم بمعدل ${dailyRate.toFixed(2)} جنيه لليوم`,
    days: absentDays,
  };

  // Overtime
  const hourlyRate = dailyRate / 8;
  const overtimeHours = attendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);
  const overtimeRate = 1.5;
  const overtimeAmount = overtimeHours * hourlyRate * overtimeRate;

  // Late penalty
  const totalLateMinutes = attendance.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
  const minuteRate = hourlyRate / 60;
  const latePenaltyRate = 2;
  const latePenalty = totalLateMinutes * minuteRate * latePenaltyRate;
  const latePenaltyDetails = {
    amount: latePenalty,
    reason: `خصم تأخير ${totalLateMinutes} دقيقة بمعدل ${(minuteRate * latePenaltyRate).toFixed(2)} جنيه للدقيقة`,
    minutes: totalLateMinutes,
  };

  // Allowances
  const totalAllowances = allowances.reduce((sum, a) => {
    if (a.isPercentage) {
      return sum + (earnedBaseSalary * a.amount) / 100;
    }
    return sum + a.amount;
  }, 0);

  // Deductions
  const deductionDetails = deductions.map((d) => {
    const amount = d.isPercentage
      ? (earnedBaseSalary * d.amount) / 100
      : d.amount;
    return {
      name: d.name,
      amount: amount,
      reason: d.isPercentage
        ? `${d.amount}% من الراتب الأساسي`
        : `مبلغ ثابت`,
      type: d.type,
    };
  });

  const totalDeductions = deductionDetails.reduce(
    (sum, d) => sum + d.amount,
    0,
  );

  // Gross
  const grossSalary = earnedBaseSalary + totalAllowances + overtimeAmount;

  // Tax
  const taxRate = 0.15;
  const taxableIncome = grossSalary;
  const taxAmount = taxableIncome * taxRate;
  const taxDetails = {
    amount: taxAmount,
    reason: `ضريبة دخل ${taxRate * 100}% من إجمالي الراتب (${grossSalary.toFixed(2)} جنيه)`,
  };

  // Social Insurance
  const socialInsuranceRate = 0.09;
  const socialInsurance = earnedBaseSalary * socialInsuranceRate;
  const socialInsuranceDetails = {
    amount: socialInsurance,
    reason: `تأمينات اجتماعية ${socialInsuranceRate * 100}% من الراتب الأساسي (${earnedBaseSalary.toFixed(2)} جنيه)`,
  };

  // Net
  const netSalary =
    grossSalary -
    totalDeductions -
    taxAmount -
    socialInsurance -
    latePenalty;

  return {
    baseSalary,
    earnedBaseSalary,
    totalAllowances,
    totalDeductions,
    grossSalary,
    netSalary,
    taxAmount,
    socialInsurance,
    overtimeAmount,
    overtimeHours,
    attendanceDeduction,
    absentDays,
    latePenalty,
    workingDays,
    actualWorkDays,
    dailyRate,
    standardWorkingDays,
    month: 2,
    year: 2026,
    periodStart: "2026-02-01",
    periodEnd: "2026-02-28",
    status: "PROJECTION",
    deductionDetails,
    attendanceDeductionDetails,
    latePenaltyDetails,
    taxDetails,
    socialInsuranceDetails,
  };
}
