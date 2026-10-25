import React from "react";
import { TFunction } from "i18next";
import { motion } from "framer-motion";
import { Building2, History } from "lucide-react";

export const MyPayrollSkeleton: React.FC = () => (
  <div className="max-w-[1400px] mx-auto w-full grid lg:grid-cols-3 gap-10">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="h-96 bg-slate-900/50 animate-pulse rounded-[4rem]"
      ></div>
    ))}
  </div>
);

interface MyPayrollEmptyStateProps {
  t: TFunction;
}

export const MyPayrollEmptyState: React.FC<MyPayrollEmptyStateProps> = ({
  t,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    className="max-w-4xl mx-auto flex flex-col items-center justify-center py-40 text-center bg-slate-900/30 backdrop-blur-3xl rounded-[5rem] border border-white/5 shadow-3xl"
  >
    <div className="relative mb-12">
      <div className="h-40 w-40 bg-emerald-500/10 rounded-[3rem] flex items-center justify-center animate-bounce">
        <History className="h-20 w-20 text-emerald-500" />
      </div>
    </div>
    <h3 className="text-5xl font-black text-white mb-6 tracking-tight">
      {t("employee.payroll.noData")}
    </h3>
    <p className="text-slate-400 max-w-lg text-xl font-medium leading-relaxed">
      {t("employee.payroll.processing")}
    </p>
  </motion.div>
);

export const MyPayrollFooter: React.FC = () => (
  <div className="max-w-[1400px] mx-auto w-full pt-16 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40 border-t border-slate-200 dark:border-white/5">
    <div className="flex items-center gap-4 text-slate-600 dark:text-white">
      <Building2 className="h-5 w-5" />
      <span className="text-[10px] font-black tracking-[0.4em] uppercase">
        MAX-P ENTERPRISE PLATFORM
      </span>
    </div>
    <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
      <span>Security Certified</span>
      <span className="h-1 w-1 bg-slate-400 rounded-full"></span>
      <span>© 2026 All Rights Reserved</span>
    </div>
  </div>
);
