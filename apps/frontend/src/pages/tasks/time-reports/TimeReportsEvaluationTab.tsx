import React from "react";
import { Link } from "react-router-dom";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import {
  type TimeEvaluationSummary,
  type TimeEvaluationTask,
  RETURN_REASON_LABELS,
  RETURN_SEVERITY_LABELS,
} from "./types";

interface TimeReportsEvaluationTabProps {
  summary?: TimeEvaluationSummary | null;
  tasks?: TimeEvaluationTask[];
}

export const TimeReportsEvaluationTab: React.FC<TimeReportsEvaluationTabProps> = ({
  summary,
  tasks,
}) => {
  return (
    <div className="space-y-6">
      {/* Telemetry Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400 block text-xs">
            المهام المقيّمة
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
            {summary?.totalTasks ?? 0}
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400 block text-xs">
            إجمالي الساعات المقدرة
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
            {summary?.totalEstimatedHours ?? 0} س
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400 block text-xs">
            إجمالي الساعات الفعلية
          </span>
          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
            {summary?.totalActualHours ?? 0} س
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400 block text-xs">
            دقة التقدير الإجمالية
          </span>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {summary?.overallAccuracyPct ?? 0}%
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400 block text-xs">
            إجمالي وقت إعادة العمل
          </span>
          <span className="text-lg font-bold text-amber-600 dark:text-amber-400 tabular-nums">
            {Math.round(summary?.totalReworkMinutes ?? 0)} دقيقة
          </span>
        </div>
      </div>

      {/* Tasks Evaluation Table */}
      <div className="overflow-x-auto">
        {!tasks || tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <ArrowPathIcon className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>لا توجد بيانات تقييم وقت أو مهام مطابقة في هذه الفترة</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300">
                  المهمة والمشروع
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300">
                  المكلّف
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300">
                  الحالة
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300">
                  المقدّر
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300">
                  الفعلي
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300">
                  الانحراف والدقة
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300">
                  الجلسات
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300">
                  وقت إعادة العمل
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {tasks.map((task) => {
                const isOver =
                  task.diffMinutes > 0 && task.estimatedMinutes > 0;
                const returnReasonLabel = task.returnReasonType
                  ? RETURN_REASON_LABELS[task.returnReasonType] ||
                    task.returnReasonType
                  : null;
                const returnSeverityLabel = task.returnSeverity
                  ? RETURN_SEVERITY_LABELS[task.returnSeverity] ||
                    `شدة ${task.returnSeverity}`
                  : null;

                return (
                  <tr
                    key={task.taskId}
                    className="hover:bg-gray-50/75 dark:hover:bg-gray-750 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link
                        to={`/tasks/${task.taskId}`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 font-medium block truncate max-w-xs"
                        title={task.title}
                      >
                        {task.title}
                      </Link>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {task.projectName || "بدون مشروع"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                      {task.assigneeName || "غير محدد"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      <span className="px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 tabular-nums">
                      {task.estimatedHours} س
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                      {task.actualHours} س
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      <div className="flex items-center gap-1.5 tabular-nums">
                        <span
                          className={`px-1.5 py-0.5 rounded font-semibold ${
                            isOver
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          }`}
                        >
                          {task.diffHours > 0
                            ? `+${task.diffHours}س`
                            : `${task.diffHours}س`}{" "}
                          (
                          {task.diffPct > 0
                            ? `+${task.diffPct}%`
                            : `${task.diffPct}%`}
                          )
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          دقة: {task.accuracyPct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                      <span>{task.sessionsCount} جلسات</span>
                      {task.firstSession && (
                        <span className="block text-[10px] text-gray-400">
                          {new Date(task.firstSession).toLocaleDateString(
                            "ar-EG",
                            { month: "short", day: "numeric" }
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      <span
                        className={`px-2 py-0.5 rounded font-bold tabular-nums ${
                          task.reworkMinutes > 0
                            ? "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {Math.round(task.reworkMinutes)} د
                      </span>
                      {returnReasonLabel && (
                        <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-1 flex items-center gap-1">
                          <span>{returnReasonLabel}</span>
                          {returnSeverityLabel && (
                            <span className="font-semibold">
                              ({returnSeverityLabel})
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
