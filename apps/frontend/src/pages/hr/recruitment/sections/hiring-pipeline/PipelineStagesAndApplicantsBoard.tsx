import React from "react";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  ClipboardDocumentCheckIcon,
  TrashIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { PipelineStage, StageApplicant } from "./types";
import {
  DEFAULT_PIPELINE_STAGES,
  getPipelineStageColorClasses,
} from "./helpers";

interface PipelineStagesAndApplicantsBoardProps {
  stages: PipelineStage[];
  selectedStageId: string;
  onSelectStageId: (id: string) => void;
  selectedStage: PipelineStage;
  totalApplicants: number;
  loading: boolean;
  stageApplicantsLoading: boolean;
  stageApplicants: StageApplicant[];
  deletingApplicantId: string | null;
  onUpdateStatus: (applicantId: string, newStatus: string) => void;
  onDeleteApplicant: (applicant: StageApplicant) => void;
}

export const PipelineStagesAndApplicantsBoard: React.FC<
  PipelineStagesAndApplicantsBoardProps
> = ({
  stages,
  selectedStageId,
  onSelectStageId,
  selectedStage,
  totalApplicants,
  loading,
  stageApplicantsLoading,
  stageApplicants,
  deletingApplicantId,
  onUpdateStatus,
  onDeleteApplicant,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
        <ClipboardDocumentCheckIcon className="w-8 h-8 text-blue-600" />
        مسار التوظيف
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
        </div>
      ) : totalApplicants === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 p-8 text-center">
          <ClipboardDocumentCheckIcon className="w-16 h-16 mx-auto text-blue-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            المسار جاهز لكن لا يوجد متقدمون بعد
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-7">
            المتقدمون يظهرون هنا بعد إضافتهم من تبويب المتقدمين، أو تلقائيًا من
            ردود استبيانات التقديم إذا كان الاستبيان مربوطًا بوظيفة.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-right">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold">
                1. أنشئ وظيفة
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                اربطي الاستبيان بوظيفة واضحة.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-purple-700 dark:text-purple-300 font-semibold">
                2. اجمعي التقديمات
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                الردود المربوطة بوظيفة يمكن إدخالها للمسار.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold">
                3. تابعي المراحل
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                بعدها ستظهر كل مرحلة وعدد المرشحين فيها.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto pb-2">
            <div className="flex items-stretch gap-4 min-w-max">
              {stages.map((stage, index) => (
                <React.Fragment key={stage.id}>
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    onClick={() => onSelectStageId(stage.id)}
                    className={`relative min-w-[220px] p-5 rounded-2xl border-2 text-right transition-all ${getPipelineStageColorClasses(
                      stage.color,
                    )} ${
                      selectedStageId === stage.id
                        ? "shadow-xl ring-2 ring-blue-500 ring-offset-2 scale-[1.02]"
                        : "hover:shadow-lg"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div>
                        <p className="text-xs font-medium opacity-70 mb-1">
                          المرحلة
                        </p>
                        <h3 className="font-bold text-lg">{stage.name}</h3>
                      </div>
                      <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center font-bold text-xl shadow-sm font-mono tabular-nums">
                        {stage.count}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <UserGroupIcon className="w-4 h-4" />
                        <span className="font-mono tabular-nums">
                          {stage.count}
                        </span>{" "}
                        متقدم
                      </span>
                      <span className="font-semibold font-mono tabular-nums">
                        {Math.round((stage.count / totalApplicants) * 100)}%
                      </span>
                    </div>
                  </motion.button>
                  {index < stages.length - 1 && (
                    <div className="hidden xl:flex items-center justify-center">
                      <ArrowLeftIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  تفاصيل مرحلة: {selectedStage?.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  كل المتقدمين الموجودين حاليًا داخل هذه المرحلة
                </p>
              </div>
              <div
                className={`px-4 py-2 rounded-xl border text-sm font-semibold w-fit ${getPipelineStageColorClasses(
                  selectedStage?.color || "blue",
                )}`}
              >
                <span className="font-mono tabular-nums">
                  {selectedStage?.count || 0}
                </span>{" "}
                متقدم
              </div>
            </div>

            {stageApplicantsLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
              </div>
            ) : stageApplicants.length === 0 ? (
              <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  لا يوجد متقدمون ظاهرون داخل مرحلة {selectedStage?.name} حاليًا.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {stageApplicants.map((applicant) => (
                  <div
                    key={applicant.id}
                    className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-white">
                          {applicant.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono">
                          {applicant.email}
                        </p>
                        {applicant.phone && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono tabular-nums">
                            {applicant.phone}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={applicant.status}
                          onChange={(e) =>
                            onUpdateStatus(applicant.id, e.target.value)
                          }
                          disabled={deletingApplicantId === applicant.id}
                          className={`text-xs font-semibold rounded-lg px-2 py-1.5 cursor-pointer outline-none border hover:shadow-md transition-all focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed ${getPipelineStageColorClasses(
                            selectedStage?.color || "blue",
                          )}`}
                          title="تغيير المرحلة"
                        >
                          {DEFAULT_PIPELINE_STAGES.map((t_stage) => (
                            <option
                              key={t_stage.id}
                              value={t_stage.id}
                              className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                            >
                              {t_stage.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => onDeleteApplicant(applicant)}
                          disabled={deletingApplicantId === applicant.id}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition-all hover:bg-red-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60 disabled:cursor-not-allowed dark:border-red-800 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30"
                          title="حذف المتقدم"
                          aria-label={`حذف ${applicant.name}`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <BriefcaseIcon className="w-4 h-4" />
                        {applicant.jobTitle ||
                          applicant.job?.title ||
                          "بدون وظيفة"}
                      </span>
                      {applicant.createdAt && (
                        <span className="font-mono tabular-nums">
                          {format(
                            new Date(applicant.createdAt),
                            "dd MMM yyyy",
                            {
                              locale: ar,
                            },
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
