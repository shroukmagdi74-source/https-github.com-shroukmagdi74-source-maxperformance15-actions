import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import api from "../../../services/api";
import { useCompany } from "../../../contexts/CompanyContext";
import { MonthOption, PayrollData, PayrollStatusConfig } from "./types";
import { buildPrintablePayrollHtml, parseComponents } from "./helpers";

export const useMyPayrollController = () => {
  const { t } = useTranslation();
  const { company } = useCompany();

  const statusConfig: PayrollStatusConfig = {
    DRAFT: {
      label: t("employee.payroll.statusDraft"),
      color: "bg-slate-100 text-slate-700 border-slate-200",
    },
    PENDING: {
      label: t("employee.payroll.statusPending"),
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    PENDING_APPROVAL: {
      label: t("employee.payroll.statusPending"),
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    APPROVED: {
      label: t("employee.payroll.statusApproved"),
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    PROCESSED: {
      label: t("employee.payroll.statusApproved"),
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    PAID: {
      label: t("employee.payroll.statusPaid"),
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    CANCELLED: {
      label: t("employee.payroll.statusCancelled"),
      color: "bg-rose-50 text-rose-700 border-rose-200",
    },
    PROJECTION: {
      label: t("employee.payroll.statusProjection"),
      color: "bg-violet-50 text-violet-700 border-violet-200",
    },
  };

  const [loading, setLoading] = useState<boolean>(true);
  const [payrollData, setPayrollData] = useState<PayrollData | null>(null);
  const [month, setMonth] = useState<string>(new Date().getMonth() + 1 + "");
  const [year, setYear] = useState<string>(new Date().getFullYear() + "");

  const months: MonthOption[] = [
    { value: "1", label: t("employee.payroll.january") },
    { value: "2", label: t("employee.payroll.february") },
    { value: "3", label: t("employee.payroll.march") },
    { value: "4", label: t("employee.payroll.april") },
    { value: "5", label: t("employee.payroll.may") },
    { value: "6", label: t("employee.payroll.june") },
    { value: "7", label: t("employee.payroll.july") },
    { value: "8", label: t("employee.payroll.august") },
    { value: "9", label: t("employee.payroll.september") },
    { value: "10", label: t("employee.payroll.october") },
    { value: "11", label: t("employee.payroll.november") },
    { value: "12", label: t("employee.payroll.december") },
  ];

  const years = Array.from({ length: 5 }, (_, i) =>
    (new Date().getFullYear() - 3 + i).toString(),
  );

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const response = await api.get("/hr/my-payroll", {
        params: { month, year },
      });
      setPayrollData(response.data?.payroll || null);
    } catch (error) {
      console.error("Error fetching payroll data:", error);
      toast.error(t("employee.payroll.fetchError"));
      setPayrollData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [month, year]);

  const allowances = parseComponents(payrollData?.allowances || null);
  const deductionsRaw = parseComponents(payrollData?.deductions || null);
  const originalBaseSalary = Number(
    payrollData?.employee?.baseSalary || payrollData?.baseSalary || 0,
  );
  const earnedBaseSalary = Number(payrollData?.baseSalary || 0);
  const partialMonthDeduction =
    originalBaseSalary > earnedBaseSalary
      ? originalBaseSalary - earnedBaseSalary
      : 0;

  const groupedDeductions = [
    ...(payrollData?.attendanceDeduction
      ? [
          {
            name: t("employee.payroll.absenceDeduction"),
            amount: Number(payrollData.attendanceDeduction),
          },
        ]
      : []),
    ...(payrollData?.latePenalty
      ? [
          {
            name: t("employee.payroll.latePenalty"),
            amount: Number(payrollData.latePenalty),
          },
        ]
      : []),
    ...(partialMonthDeduction > 0
      ? [
          {
            name: t("employee.payroll.restOfMonth"),
            amount: partialMonthDeduction,
          },
        ]
      : []),
    ...deductionsRaw,
  ];

  const handlePrint = () => {
    if (!payrollData) return;

    const htmlContent = buildPrintablePayrollHtml({
      payrollData,
      companyName: company?.name,
      months,
      month,
      year,
      statusConfig,
      t,
    });

    const printWin = window.open("", "_blank");
    if (printWin) {
      printWin.document.write(htmlContent);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
        printWin.close();
      }, 500);
    }
  };

  const totalEarningsDisplay =
    Number(payrollData?.grossSalary || 0) + partialMonthDeduction;
  const totalDeductionsDisplay =
    Number(payrollData?.totalDeductions || 0) + partialMonthDeduction;

  return {
    t,
    loading,
    payrollData,
    month,
    setMonth,
    year,
    setYear,
    months,
    years,
    allowances,
    groupedDeductions,
    originalBaseSalary,
    totalEarningsDisplay,
    totalDeductionsDisplay,
    handlePrint,
  };
};
