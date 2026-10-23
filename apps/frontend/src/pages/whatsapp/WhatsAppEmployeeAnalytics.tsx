import React from "react";
import { BarChart3 } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { WhatsAppPageShell } from "./components/WhatsAppPageShell";
import {
  useWhatsAppEmployeeAnalyticsController,
  EmployeeAnalyticsDateControls,
  EmployeeAnalyticsHeroCards,
  EmployeeAnalyticsResponseChartsCard,
  EmployeeAnalyticsRankingsCard,
  EmployeeAnalyticsDetailTable,
} from "./employee-analytics";

const containerStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
} as const;

const noMotion = {
  hidden: { opacity: 1 },
  show: { opacity: 1 },
} as const;

export interface WhatsAppEmployeeAnalyticsProps {
  companyId?: string;
}

const WhatsAppEmployeeAnalytics: React.FC<WhatsAppEmployeeAnalyticsProps> = ({
  companyId,
}) => {
  const reduceMotion = useReducedMotion() ?? false;
  const {
    loading,
    refreshing,
    preset,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleSelectPreset,
    loadData,
    summary,
    employees,
    deltas,
    sparkData,
    sortedEmployees,
    topActive,
    leastActive,
    maxMessages,
    avgAssignedConv,
    chartData,
  } = useWhatsAppEmployeeAnalyticsController({ companyId });

  return (
    <WhatsAppPageShell
      title="تحليل أداء الموظفين"
      description="متابعة إحصائيات المحادثات والرسائل وأوقات الرد لكل موظف"
      icon={BarChart3}
      eyebrow="WhatsApp Analytics"
      actions={
        <EmployeeAnalyticsDateControls
          preset={preset}
          onSelectPreset={handleSelectPreset}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onRefresh={() => loadData(true)}
          refreshing={refreshing}
        />
      }
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl sm:rounded-3xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Skeleton className="h-72 rounded-2xl sm:rounded-3xl" />
              <Skeleton className="h-72 rounded-2xl sm:rounded-3xl lg:col-span-2" />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Skeleton className="h-56 rounded-2xl sm:rounded-3xl" />
              <Skeleton className="h-56 rounded-2xl sm:rounded-3xl" />
            </div>
            <Skeleton className="h-96 rounded-2xl sm:rounded-3xl" />
          </motion.div>
        ) : summary ? (
          <motion.div
            key="content"
            initial="hidden"
            animate="show"
            variants={reduceMotion ? noMotion : containerStagger}
            className="space-y-4 sm:space-y-6"
          >
            {/* Row 1: Hero Metrics */}
            <EmployeeAnalyticsHeroCards
              summary={summary}
              deltas={deltas}
              sparkData={sparkData}
              reducedMotion={reduceMotion}
            />

            {/* Row 2: Radial Progress + Bar Chart */}
            <EmployeeAnalyticsResponseChartsCard
              summary={summary}
              chartData={chartData}
              reducedMotion={reduceMotion}
            />

            {/* Row 3: Most / Least Active */}
            <EmployeeAnalyticsRankingsCard
              topActive={topActive}
              leastActive={leastActive}
              maxMessages={maxMessages}
              reducedMotion={reduceMotion}
            />

            {/* Row 4: Detailed Table */}
            <EmployeeAnalyticsDetailTable
              employees={sortedEmployees}
              activeEmployeesCount={summary.activeEmployees}
              avgAssignedConv={avgAssignedConv}
              reducedMotion={reduceMotion}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </WhatsAppPageShell>
  );
};

export default WhatsAppEmployeeAnalytics;
