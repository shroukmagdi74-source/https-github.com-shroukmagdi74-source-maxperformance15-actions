import React from "react";
import {
  UserGroupIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  StarIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { Applicant } from "./types";
import { getStatusBadge } from "./helpers";

interface ApplicantsGridProps {
  filteredApplicants: Applicant[];
  loading: boolean;
  deletingApplicantId: string | null;
  onViewDetails: (applicant: Applicant) => void;
  onUpdateStatus: (applicantId: string, status: string) => void;
  onDeleteApplicant: (applicant: Applicant) => void;
}

export const ApplicantsGrid: React.FC<ApplicantsGridProps> = ({
  filteredApplicants,
  loading,
  deletingApplicantId,
  onViewDetails,
  onUpdateStatus,
  onDeleteApplicant,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {filteredApplicants.map((applicant, index) => {
            const statusBadge = getStatusBadge(applicant.status);
            return (
              <motion.div
                key={applicant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {applicant.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {applicant.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1">
                        <DocumentTextIcon className="w-4 h-4" />
                        {applicant.jobTitle}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-xl text-xs font-bold border-2 shadow-sm ${statusBadge.bg}`}
                  >
                    {statusBadge.text}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 mb-5">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                      <EnvelopeIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">
                      {applicant.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                    <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                      <PhoneIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium font-mono tabular-nums">
                      {applicant.phone}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-700">
                    <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1">
                      الخبرة
                    </div>
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 font-mono tabular-nums">
                      {applicant.experience}
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">
                      سنوات
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">
                      التعليم
                    </div>
                    <div className="text-sm font-bold text-indigo-700 dark:text-indigo-300 truncate">
                      {applicant.education || "غير محدد"}
                    </div>
                  </div>
                  {applicant.rating && (
                    <div className="col-span-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-yellow-700 dark:text-yellow-400 font-semibold">
                          التقييم
                        </span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`w-5 h-5 ${
                                i < applicant.rating!
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-5">
                  <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    المهارات
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {applicant.skills.slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                      >
                        {skill}
                      </span>
                    ))}
                    {applicant.skills.length === 0 && (
                      <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-lg">
                        لا توجد مهارات مسجلة
                      </span>
                    )}
                    {applicant.skills.length > 4 && (
                      <span className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg font-mono tabular-nums">
                        +{applicant.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-5 border-t-2 border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => onViewDetails(applicant)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold"
                  >
                    <EyeIcon className="w-5 h-5" />
                    عرض التفاصيل
                  </button>
                  {applicant.status === "NEW" && (
                    <button
                      onClick={() => onUpdateStatus(applicant.id, "REVIEWING")}
                      aria-label="تحويل إلى قيد المراجعة"
                      className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg hover:bg-amber-100 transition-all"
                    >
                      <ClockIcon className="w-5 h-5" />
                    </button>
                  )}
                  {applicant.status === "REVIEWING" && (
                    <>
                      <button
                        onClick={() =>
                          onUpdateStatus(applicant.id, "INTERVIEW_SCHEDULED")
                        }
                        aria-label="جدولة مقابلة"
                        className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg hover:bg-green-100 transition-all"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onUpdateStatus(applicant.id, "REJECTED")}
                        aria-label="رفض المتقدم"
                        className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => onDeleteApplicant(applicant)}
                    disabled={deletingApplicantId === applicant.id}
                    className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    title="حذف المتقدم"
                    aria-label={`حذف ${applicant.name}`}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredApplicants.length === 0 && !loading && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700">
          <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            لا يوجد متقدمين
          </p>
        </div>
      )}
    </>
  );
};
