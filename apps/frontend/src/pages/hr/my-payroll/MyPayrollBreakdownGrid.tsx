import React from "react";
import { TFunction } from "i18next";
import { motion } from "framer-motion";
import {
  AlertCircle,
  FileText,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { PayrollData, SalaryComponent } from "./types";
import { formatCurrency, itemVariants } from "./helpers";

interface MyPayrollBreakdownGridProps {
  t: TFunction;
  payrollData: PayrollData;
  allowances: SalaryComponent[];
  groupedDeductions: SalaryComponent[];
  totalEarningsDisplay: number;
  totalDeductionsDisplay: number;
}

export const MyPayrollBreakdownGrid: React.FC<MyPayrollBreakdownGridProps> = ({
  t,
  payrollData,
  allowances,
  groupedDeductions,
  totalEarningsDisplay,
  totalDeductionsDisplay,
}) => {
  return (
    <div className="grid md:grid-cols-2 gap-10">
      {/* Earnings */}
      <motion.div variants={itemVariants} className="space-y-8">
        <div className="flex items-center justify-between px-6">
          <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-4">
            <div className="h-9 w-9 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            {t("employee.payroll.earnings")}
          </h3>
          <div className="text-emerald-400 font-black text-lg font-mono tabular-nums">
            +{formatCurrency(totalEarningsDisplay)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] p-8 border border-slate-200 dark:border-white/5 space-y-6 shadow-xl dark:shadow-2xl">
          <div className="flex justify-between items-center bg-slate-50 dark:bg-white/5 p-5 rounded-3xl border border-slate-100 dark:border-white/5 group hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 dark:text-blue-400">
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-bold text-slate-600 dark:text-slate-300 text-base">
                {t("employee.payroll.baseSalary")}
              </span>
            </div>
            <span className="font-black text-slate-900 dark:text-white text-lg font-mono tabular-nums">
              {formatCurrency(
                payrollData.employee?.baseSalary || payrollData.baseSalary,
              )}
            </span>
          </div>

          <div className="space-y-4 px-4">
            {allowances.map((al, idx) => (
              <div key={idx} className="flex justify-between items-center group">
                <span className="text-slate-500 dark:text-slate-400 font-bold group-hover:text-emerald-500 transition-colors text-sm">
                  {al.name}
                </span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-base font-mono tabular-nums">
                  +{formatCurrency(al.amount)}
                </span>
              </div>
            ))}
            {payrollData.overtimeAmount > 0 && (
              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-white/5">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-bold block leading-none mb-1 text-sm">
                    {t("employee.payroll.overtime")}
                  </span>
                  <span className="text-[9px] text-emerald-500/80 font-black uppercase font-mono tabular-nums">
                    ({payrollData.overtimeHours}H APPROVED)
                  </span>
                </div>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-base font-mono tabular-nums">
                  +{formatCurrency(payrollData.overtimeAmount)}
                </span>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
            <span className="font-black text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-[0.2em]">
              {t("employee.payroll.totalEarnings")}
            </span>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {formatCurrency(totalEarningsDisplay)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Deductions */}
      <motion.div variants={itemVariants} className="space-y-8">
        <div className="flex items-center justify-between px-6">
          <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-4">
            <div className="h-9 w-9 bg-red-500/20 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            {t("employee.payroll.deductions")}
          </h3>
          <div className="text-red-400 font-black text-lg font-mono tabular-nums">
            -{formatCurrency(totalDeductionsDisplay)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] p-8 border border-slate-200 dark:border-white/5 space-y-6 shadow-xl dark:shadow-2xl">
          <div className="flex justify-between items-center bg-slate-50 dark:bg-white/5 p-5 rounded-3xl border border-slate-100 dark:border-white/5 group hover:border-red-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="font-bold text-slate-600 dark:text-slate-300 text-base">
                {t("employee.payroll.insurance")}
              </span>
            </div>
            <span className="font-black text-red-600 dark:text-red-400 text-lg font-mono tabular-nums">
              -{formatCurrency(payrollData.socialInsurance)}
            </span>
          </div>

          <div className="space-y-4 px-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">
                {t("employee.payroll.tax")}
              </span>
              <span className="font-black text-red-600 dark:text-red-400 text-base font-mono tabular-nums">
                -{formatCurrency(payrollData.taxAmount)}
              </span>
            </div>
            {groupedDeductions.map((de, idx) => (
              <div key={idx} className="flex justify-between items-center group">
                <span className="text-slate-500 dark:text-slate-400 font-bold group-hover:text-red-500 transition-colors text-sm">
                  {de.name}
                </span>
                <span className="font-black text-red-600 dark:text-red-400 text-base font-mono tabular-nums">
                  -{formatCurrency(de.amount)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
            <span className="font-black text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-[0.2em]">
              {t("employee.payroll.totalDeductions")}
            </span>
            <span className="text-3xl font-black text-red-600 dark:text-red-400 font-mono tabular-nums">
              {formatCurrency(totalDeductionsDisplay)}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
