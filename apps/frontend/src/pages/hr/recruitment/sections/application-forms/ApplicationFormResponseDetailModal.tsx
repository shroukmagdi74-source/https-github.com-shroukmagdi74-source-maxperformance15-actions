import React from "react";
import {
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { FormResponse } from "./types";
import {
  getApplicantStatusBadgeClasses,
  getApplicantStatusLabel,
} from "./helpers";

interface ApplicationFormResponseDetailModalProps {
  open: boolean;
  selectedResponse: FormResponse | null;
  selectedResponseCanJoinPipeline: boolean;
  convertingResponseId: string | null;
  updatingResponseId: string | null;
  onConvertResponseToApplicant: (responseId: string) => void;
  onToggleContactStatus: (responseId: string, isContacted: boolean) => void;
  onClose: () => void;
}

export const ApplicationFormResponseDetailModal: React.FC<
  ApplicationFormResponseDetailModalProps
> = ({
  open,
  selectedResponse,
  selectedResponseCanJoinPipeline,
  convertingResponseId,
  updatingResponseId,
  onConvertResponseToApplicant,
  onToggleContactStatus,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {open && selectedResponse && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              تفاصيل الرد
            </h2>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {selectedResponse.respondentName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    {selectedResponse.respondentName}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedResponse.respondentEmail}
                  </p>
                  {selectedResponse.respondentPhone && (
                    <p className="text-gray-500 dark:text-gray-500 text-sm font-mono tabular-nums">
                      {selectedResponse.respondentPhone}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        selectedResponse.isContacted
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      }`}
                    >
                      {selectedResponse.isContacted ? (
                        <CheckCircleIcon className="w-4 h-4" />
                      ) : (
                        <XCircleIcon className="w-4 h-4" />
                      )}
                      {selectedResponse.isContacted
                        ? "تم التواصل"
                        : "لم يتم التواصل"}
                    </span>
                    {selectedResponse.isContacted &&
                      selectedResponse.contactedAt && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono tabular-nums">
                          تم التحديث في{" "}
                          {format(
                            new Date(selectedResponse.contactedAt),
                            "dd MMM yyyy - HH:mm",
                            { locale: ar }
                          )}
                        </span>
                      )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {selectedResponse.applicant ? (
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getApplicantStatusBadgeClasses(
                          selectedResponse.applicant.status
                        )}`}
                      >
                        <UserGroupIcon className="w-4 h-4" />
                        داخل المسار:{" "}
                        {getApplicantStatusLabel(
                          selectedResponse.applicant.status
                        )}
                      </span>
                    ) : selectedResponseCanJoinPipeline ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                        <UserGroupIcon className="w-4 h-4" />
                        لم يدخل مسار التوظيف بعد
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        <UserGroupIcon className="w-4 h-4" />
                        الاستبيان غير مربوط بوظيفة
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-2">
                  {!selectedResponse.applicant && (
                    <button
                      onClick={() =>
                        onConvertResponseToApplicant(selectedResponse.id)
                      }
                      disabled={
                        !selectedResponseCanJoinPipeline ||
                        convertingResponseId === selectedResponse.id
                      }
                      className="px-4 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <UserGroupIcon className="w-4 h-4" />
                      {convertingResponseId === selectedResponse.id
                        ? "جاري الإضافة..."
                        : selectedResponseCanJoinPipeline
                          ? "إضافة إلى مسار التوظيف"
                          : "اربط الاستبيان بوظيفة أولاً"}
                    </button>
                  )}
                  <button
                    onClick={() =>
                      onToggleContactStatus(
                        selectedResponse.id,
                        !selectedResponse.isContacted
                      )
                    }
                    disabled={updatingResponseId === selectedResponse.id}
                    className={`px-4 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
                      selectedResponse.isContacted
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
                        : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {selectedResponse.isContacted ? (
                      <XCircleIcon className="w-4 h-4" />
                    ) : (
                      <CheckCircleIcon className="w-4 h-4" />
                    )}
                    {updatingResponseId === selectedResponse.id
                      ? "جاري الحفظ..."
                      : selectedResponse.isContacted
                        ? "تحديد كـ لم يتم التواصل"
                        : "تحديد كـ تم التواصل"}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {selectedResponse.answers.map((answer, index) => (
                <div
                  key={answer.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                >
                  <p className="font-medium text-gray-800 dark:text-white mb-2">
                    <span className="font-mono tabular-nums">{index + 1}</span>.{" "}
                    {answer.question.questionText}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-600 p-3 rounded-lg">
                    {answer.answerText ||
                      (answer.answerFile ? (
                        <a
                          href={answer.answerFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          عرض الملف المرفق
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">
                          لم يتم الإجابة
                        </span>
                      ))}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
