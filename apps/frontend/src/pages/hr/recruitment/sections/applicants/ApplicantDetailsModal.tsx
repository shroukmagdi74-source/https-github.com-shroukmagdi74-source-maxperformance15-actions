import React from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { Applicant } from "./types";
import { getStatusBadge } from "./helpers";

interface ApplicantDetailsModalProps {
  open: boolean;
  selectedApplicant: Applicant | null;
  onClose: () => void;
}

export const ApplicantDetailsModal: React.FC<ApplicantDetailsModalProps> = ({
  open,
  selectedApplicant,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {open && selectedApplicant && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  {selectedApplicant.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedApplicant.jobTitle}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${getStatusBadge(selectedApplicant.status).bg}`}
              >
                {getStatusBadge(selectedApplicant.status).text}
              </span>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white mb-2">
                    معلومات الاتصال
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">البريد:</span>{" "}
                      {selectedApplicant.email}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">الهاتف:</span>{" "}
                      <span className="font-mono tabular-nums">
                        {selectedApplicant.phone}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white mb-2">
                    المؤهلات
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">الخبرة:</span>{" "}
                      <span className="font-mono tabular-nums">
                        {selectedApplicant.experience}
                      </span>{" "}
                      سنوات
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">التعليم:</span>{" "}
                      {selectedApplicant.education}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 dark:text-white mb-2">
                  المهارات
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedApplicant.skills.length > 0 ? (
                    selectedApplicant.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-sm rounded-full border border-blue-200"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      لا توجد مهارات مسجلة
                    </span>
                  )}
                </div>
              </div>

              {selectedApplicant.coverLetter && (
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white mb-2">
                    خطاب التقديم
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedApplicant.coverLetter}
                  </p>
                </div>
              )}

              {selectedApplicant.notes && (
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white mb-2">
                    ملاحظات
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedApplicant.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              {selectedApplicant.resumeUrl && (
                <a
                  href={selectedApplicant.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <DocumentTextIcon className="w-5 h-5" />
                  عرض السيرة الذاتية
                </a>
              )}
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl hover:bg-gray-300 transition-all"
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
