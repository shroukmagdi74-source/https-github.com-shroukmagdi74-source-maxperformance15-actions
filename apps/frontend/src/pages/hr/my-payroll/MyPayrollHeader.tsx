import React from "react";
import { TFunction } from "i18next";
import { motion } from "framer-motion";
import { Printer, ShieldCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { MonthOption, PayrollData } from "./types";

interface MyPayrollHeaderProps {
  t: TFunction;
  payrollData: PayrollData | null;
  month: string;
  onMonthChange: (value: string) => void;
  year: string;
  onYearChange: (value: string) => void;
  months: MonthOption[];
  years: string[];
  onPrint: () => void;
}

export const MyPayrollHeader: React.FC<MyPayrollHeaderProps> = ({
  t,
  payrollData,
  month,
  onMonthChange,
  year,
  onYearChange,
  months,
  years,
  onPrint,
}) => {
  return (
    <div className="max-w-[1400px] mx-auto w-full flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 text-[10px] font-black tracking-[0.3em] text-emerald-400 uppercase bg-emerald-500/5 px-5 py-2 rounded-full border border-emerald-500/20 w-fit backdrop-blur-md"
        >
          <ShieldCheck className="h-4 w-4" />
          {t("employee.payroll.subtitle")}
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
            {t("employee.payroll.welcome", {
              name: payrollData?.employee?.firstName,
            })}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl leading-relaxed">
            {t("employee.payroll.detail", {
              month: months.find((m) => m.value === month)?.label,
              year,
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex bg-slate-200/50 dark:bg-white/5 backdrop-blur-3xl p-1.5 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl relative">
          <Select value={month} onValueChange={onMonthChange}>
            <SelectTrigger className="border-none w-36 shadow-none focus:ring-0 text-slate-800 dark:text-white font-black hover:bg-slate-300/30 dark:hover:bg-white/10 transition-all rounded-[1.5rem] h-12 text-base bg-transparent">
              <SelectValue
                placeholder={t("employee.payroll.monthPlaceholder")}
              />
            </SelectTrigger>
            <SelectContent className="rounded-3xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 text-slate-800 dark:text-white backdrop-blur-3xl">
              {months.map((m) => (
                <SelectItem
                  key={m.value}
                  value={m.value}
                  className="font-bold py-2 focus:bg-emerald-500/20"
                >
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="w-px bg-slate-300 dark:bg-white/10 my-3 mx-1"></div>
          <Select value={year} onValueChange={onYearChange}>
            <SelectTrigger className="border-none w-28 shadow-none focus:ring-0 text-slate-800 dark:text-white font-black hover:bg-slate-300/30 dark:hover:bg-white/10 transition-all rounded-[1.5rem] h-12 text-base bg-transparent font-mono tabular-nums">
              <SelectValue
                placeholder={t("employee.payroll.yearPlaceholder")}
              />
            </SelectTrigger>
            <SelectContent className="rounded-3xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 text-slate-800 dark:text-white backdrop-blur-3xl">
              {years.map((y) => (
                <SelectItem
                  key={y}
                  value={y}
                  className="font-bold py-2 focus:bg-emerald-500/20 font-mono tabular-nums"
                >
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {payrollData && (
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 25px rgba(16, 185, 129, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            className="rounded-[2rem] bg-emerald-500 text-white px-8 h-14 font-black text-base flex items-center justify-center gap-3 shadow-lg transition-all cursor-pointer border-none"
            onClick={onPrint}
          >
            <Printer className="w-5 h-5" />{" "}
            {t("employee.payroll.printStatement")}
          </motion.button>
        )}
      </div>
    </div>
  );
};
