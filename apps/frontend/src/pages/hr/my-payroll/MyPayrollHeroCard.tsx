import React from "react";
import { TFunction } from "i18next";
import { motion } from "framer-motion";
import { CheckCircle2, User as UserIcon } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { PayrollData } from "./types";
import { formatCurrency, itemVariants } from "./helpers";

interface MyPayrollHeroCardProps {
  t: TFunction;
  payrollData: PayrollData;
  originalBaseSalary: number;
}

export const MyPayrollHeroCard: React.FC<MyPayrollHeroCardProps> = ({
  t,
  payrollData,
  originalBaseSalary,
}) => {
  return (
    <motion.div
      variants={itemVariants}
      className="relative bg-white dark:bg-gradient-to-br dark:from-[#1e293b] dark:to-[#0f172a] rounded-[2.5rem] p-8 lg:p-10 border border-slate-200 dark:border-white/10 shadow-2xl dark:shadow-[0_30px_70px_rgba(0,0,0,0.4)] group overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
      <div className="absolute -bottom-20 -right-20 h-80 w-80 bg-emerald-500/5 rounded-full blur-[100px]"></div>

      <div className="flex flex-col lg:flex-row justify-between items-center gap-10 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 text-center lg:text-right">
          <div className="relative">
            <div className="h-28 w-28 lg:h-32 lg:w-32 bg-gradient-to-tr from-emerald-500 via-blue-600 to-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl group-hover:scale-105 transition-all duration-700">
              <UserIcon className="h-12 w-12 lg:h-14 lg:w-14 text-white" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-2 -left-2 h-10 w-10 bg-emerald-500 rounded-[1rem] flex items-center justify-center border-[4px] border-white dark:border-[#1e293b] shadow-xl"
            >
              <CheckCircle2 className="h-5 w-5 text-white" />
            </motion.div>
          </div>

          <div className="space-y-2 text-right">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {payrollData.employee?.firstName} {payrollData.employee?.lastName}
            </h2>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Badge className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/20 px-4 py-1 rounded-xl font-bold text-[10px] tracking-widest uppercase font-mono tabular-nums">
                ID: {payrollData.employee?.employeeNumber}
              </Badge>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-4 py-1 rounded-xl font-bold text-[10px]">
                {payrollData.employee?.position?.title ||
                  t("employee.payroll.distinguished")}
              </Badge>
            </div>
          </div>
        </div>

        <div className="text-center lg:text-left space-y-2 border-t lg:border-t-0 lg:border-r border-slate-100 dark:border-white/10 pt-10 lg:pt-0 lg:pr-10 w-full lg:w-auto">
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em] mb-1 opacity-80">
            {t("employee.payroll.baseContractSalary")}
          </p>
          <div className="flex items-baseline justify-center lg:justify-end gap-2">
            <span className="text-4xl lg:text-6xl font-bold tracking-tight font-mono tabular-nums bg-gradient-to-b from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:to-slate-500 bg-clip-text text-transparent drop-shadow-lg">
              {formatCurrency(originalBaseSalary)}
            </span>
            <span className="text-lg font-bold text-slate-400">
              {t("employee.payroll.egp")}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
