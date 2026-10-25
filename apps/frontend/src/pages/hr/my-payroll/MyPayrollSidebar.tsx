import React from "react";
import { TFunction } from "i18next";
import { motion } from "framer-motion";
import { CreditCard, ShieldCheck, Zap } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { PayrollData } from "./types";
import { itemVariants } from "./helpers";

interface MyPayrollSidebarProps {
  t: TFunction;
  payrollData: PayrollData;
  originalBaseSalary: number;
}

export const MyPayrollSidebar: React.FC<MyPayrollSidebarProps> = ({
  t,
  payrollData,
  originalBaseSalary,
}) => {
  return (
    <div className="lg:col-span-4 space-y-10">
      {/* Payment Method Card - Premium Wallet Style */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] p-8 border border-slate-200 dark:border-white/10 relative overflow-hidden group shadow-xl"
      >
        <div className="absolute -top-10 -left-10 h-40 w-40 bg-blue-500/5 rounded-full blur-[60px]"></div>

        <div className="space-y-8 relative z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-800 dark:text-white">
              {t("employee.payroll.paymentDetails")}
            </h3>
            <CreditCard className="text-blue-500 dark:text-emerald-400" />
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-white/10 hover:border-emerald-500/20 transition-all">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                {t("employee.payroll.bankTransfer")}
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 dark:bg-white/10 rounded-xl flex items-center justify-center font-black text-blue-600 dark:text-white italic text-lg">
                  {payrollData.employee?.bankName?.substring(0, 1) || "B"}
                </div>
                <div>
                  <p className="text-base font-black text-slate-800 dark:text-white leading-none">
                    {payrollData.employee?.bankName ||
                      t("employee.payroll.bankName")}
                  </p>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-500 mt-1">
                    {t("employee.payroll.accountActive")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-white/10 hover:border-emerald-500/20 transition-all">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                {t("employee.payroll.iban")}
              </p>
              <p className="text-base font-black text-slate-800 dark:text-white font-mono tabular-nums tracking-wider truncate">
                {payrollData.employee?.bankAccountNumber
                  ? `**** **** ${payrollData.employee.bankAccountNumber.slice(-4)}`
                  : "EG82 0003 4827 1019 3828"}
              </p>
            </div>
          </div>

          <div className="pt-2 space-y-4">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
              <span className="text-slate-400 dark:text-slate-500">
                {t("employee.payroll.monthlyIncentive")}
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                {(
                  (payrollData.bonuses / (originalBaseSalary || 1)) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min((payrollData.bonuses / (originalBaseSalary || 1)) * 100 * 2, 100)}%`,
                }}
                transition={{ duration: 2, ease: "circOut" }}
                className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-600 rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Secure Info Card */}
      <motion.div
        variants={itemVariants}
        className="bg-emerald-500/5 dark:bg-emerald-500/10 backdrop-blur-3xl rounded-[3rem] p-8 border border-emerald-500/20 space-y-6 relative overflow-hidden shadow-lg"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 rotate-12">
          <ShieldCheck className="h-24 w-24" />
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="h-9 w-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white">
            {t("employee.payroll.securityNotice")}
          </h3>
        </div>

        <div className="space-y-4 relative z-10">
          {[
            t("employee.payroll.encryptedData"),
            t("employee.payroll.digitalSignature"),
            t("employee.payroll.keepStatement"),
          ].map((text, i) => (
            <div key={i} className="flex gap-4 group">
              <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full mt-2 group-hover:scale-150 transition-all"></div>
              <p className="text-[13px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                {text}
              </p>
            </div>
          ))}
        </div>

        <Button className="w-full rounded-2xl h-14 bg-white dark:bg-emerald-500 text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest hover:scale-[1.02] shadow-xl border border-slate-200 dark:border-none">
          {t("employee.payroll.privacyPolicy")}
        </Button>
      </motion.div>
    </div>
  );
};
