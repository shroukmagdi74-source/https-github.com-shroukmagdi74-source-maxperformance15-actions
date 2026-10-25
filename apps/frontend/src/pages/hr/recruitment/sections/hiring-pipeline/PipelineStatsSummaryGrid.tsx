import React from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

interface PipelineStatsSummaryGridProps {
  totalApplicants: number;
  activePipelineApplicants: number;
  inInterviewStages: number;
  hiredApplicants: number;
  conversionRate: number;
}

export const PipelineStatsSummaryGrid: React.FC<
  PipelineStatsSummaryGridProps
> = ({
  totalApplicants,
  activePipelineApplicants,
  inInterviewStages,
  hiredApplicants,
  conversionRate,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        إحصائيات المسار
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            إجمالي المتقدمين
          </p>
          <p className="text-3xl font-bold text-blue-600 font-mono tabular-nums">
            {totalApplicants}
          </p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-xl border-2 border-slate-200">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            داخل المسار الآن
          </p>
          <p className="text-3xl font-bold text-slate-700 dark:text-slate-200 font-mono tabular-nums">
            {activePipelineApplicants}
          </p>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-purple-200">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            في المقابلات
          </p>
          <p className="text-3xl font-bold text-purple-600 font-mono tabular-nums">
            {inInterviewStages}
          </p>
        </div>
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border-2 border-emerald-200">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            تم التوظيف
          </p>
          <p className="text-3xl font-bold text-emerald-600 flex items-center gap-2 font-mono tabular-nums">
            <CheckCircleIcon className="w-7 h-7" />
            {hiredApplicants}
          </p>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            معدل التحويل من جديد إلى توظيف
          </p>
          <p className="text-3xl font-bold text-red-600 flex items-center gap-2 font-mono tabular-nums">
            <XCircleIcon className="w-7 h-7" />
            {conversionRate}%
          </p>
        </div>
      </div>
    </div>
  );
};
