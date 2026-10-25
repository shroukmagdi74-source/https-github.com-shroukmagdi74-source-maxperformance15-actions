import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Applicant, NewApplicantForm } from "./types";
import { ApplicantDetailsModal } from "./ApplicantDetailsModal";

interface ApplicantModalsProps {
  showDetailsModal: boolean;
  selectedApplicant: Applicant | null;
  onCloseDetailsModal: () => void;
  showAddModal: boolean;
  jobs: any[];
  newApplicant: NewApplicantForm;
  onNewApplicantChange: (form: NewApplicantForm) => void;
  onAddApplicant: () => void;
  onCloseAddModal: () => void;
}

export const ApplicantModals: React.FC<ApplicantModalsProps> = ({
  showDetailsModal,
  selectedApplicant,
  onCloseDetailsModal,
  showAddModal,
  jobs,
  newApplicant,
  onNewApplicantChange,
  onAddApplicant,
  onCloseAddModal,
}) => {
  return (
    <>
      <ApplicantDetailsModal
        open={showDetailsModal}
        selectedApplicant={selectedApplicant}
        onClose={onCloseDetailsModal}
      />

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onCloseAddModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                إضافة متقدم جديد
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الاسم الكامل <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newApplicant.name}
                      onChange={(e) =>
                        onNewApplicantChange({
                          ...newApplicant,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                      placeholder="أدخل الاسم الكامل"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      البريد الإلكتروني <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={newApplicant.email}
                      onChange={(e) =>
                        onNewApplicantChange({
                          ...newApplicant,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      value={newApplicant.phone}
                      onChange={(e) =>
                        onNewApplicantChange({
                          ...newApplicant,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white font-mono tabular-nums"
                      placeholder="01xxxxxxxxx"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الوظيفة المتقدم لها{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newApplicant.jobId}
                      onChange={(e) =>
                        onNewApplicantChange({
                          ...newApplicant,
                          jobId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                    >
                      <option value="">اختر الوظيفة...</option>
                      {jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      سنوات الخبرة
                    </label>
                    <input
                      type="number"
                      value={newApplicant.experience}
                      onChange={(e) =>
                        onNewApplicantChange({
                          ...newApplicant,
                          experience: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white font-mono tabular-nums"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      المؤهل التعليمي
                    </label>
                    <input
                      type="text"
                      value={newApplicant.education}
                      onChange={(e) =>
                        onNewApplicantChange({
                          ...newApplicant,
                          education: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                      placeholder="بكالوريوس، ماجستير..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    المهارات (افصل بينها بفاصلة)
                  </label>
                  <input
                    type="text"
                    value={newApplicant.skills}
                    onChange={(e) =>
                      onNewApplicantChange({
                        ...newApplicant,
                        skills: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                    placeholder="JavaScript, React, Node.js"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    رسالة التقديم
                  </label>
                  <textarea
                    value={newApplicant.coverLetter}
                    onChange={(e) =>
                      onNewApplicantChange({
                        ...newApplicant,
                        coverLetter: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                    placeholder="اكتب رسالة التقديم..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    رابط السيرة الذاتية
                  </label>
                  <input
                    type="url"
                    value={newApplicant.resumeUrl}
                    onChange={(e) =>
                      onNewApplicantChange({
                        ...newApplicant,
                        resumeUrl: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={onAddApplicant}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                  إضافة المتقدم
                </button>
                <button
                  onClick={onCloseAddModal}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl hover:bg-gray-300 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
