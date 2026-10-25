import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useMyPayrollController,
  containerVariants,
  MyPayrollHeader,
  MyPayrollHeroCard,
  MyPayrollBreakdownGrid,
  MyPayrollSidebar,
  MyPayrollSkeleton,
  MyPayrollEmptyState,
  MyPayrollFooter,
} from "./my-payroll/index";

const MyPayroll: React.FC = () => {
  const {
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
  } = useMyPayrollController();

  return (
    <div
      className="p-4 md:p-8 lg:p-12 space-y-10 bg-slate-50 dark:bg-[#020617] min-h-screen font-inter text-slate-800 dark:text-slate-200 relative overflow-hidden transition-colors duration-500"
      dir="rtl"
    >
      {/* Dynamic Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 dark:bg-emerald-600/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <MyPayrollHeader
        t={t}
        payrollData={payrollData}
        month={month}
        onMonthChange={setMonth}
        year={year}
        onYearChange={setYear}
        months={months}
        years={years}
        onPrint={handlePrint}
      />

      <AnimatePresence mode="wait">
        {loading ? (
          <MyPayrollSkeleton />
        ) : !payrollData ? (
          <MyPayrollEmptyState t={t} />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-[1400px] mx-auto w-full grid lg:grid-cols-12 gap-10 relative z-10"
          >
            <div className="lg:col-span-8 space-y-10">
              <MyPayrollHeroCard
                t={t}
                payrollData={payrollData}
                originalBaseSalary={originalBaseSalary}
              />

              <MyPayrollBreakdownGrid
                t={t}
                payrollData={payrollData}
                allowances={allowances}
                groupedDeductions={groupedDeductions}
                totalEarningsDisplay={totalEarningsDisplay}
                totalDeductionsDisplay={totalDeductionsDisplay}
              />
            </div>

            <MyPayrollSidebar
              t={t}
              payrollData={payrollData}
              originalBaseSalary={originalBaseSalary}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <MyPayrollFooter />
    </div>
  );
};

export default MyPayroll;
