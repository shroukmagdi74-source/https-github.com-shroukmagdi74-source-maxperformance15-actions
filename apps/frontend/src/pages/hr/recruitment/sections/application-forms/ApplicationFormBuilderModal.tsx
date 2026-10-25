import React from "react";
import { LinkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import {
  ApplicationForm,
  JobOption,
  NewFormDraft,
  Question,
} from "./types";
import { ApplicationFormQuestionBuilder } from "./ApplicationFormQuestionBuilder";

interface ApplicationFormBuilderModalProps {
  showCreateModal: boolean;
  showEditModal: boolean;
  selectedForm: ApplicationForm | null;
  jobs: JobOption[];
  newForm: NewFormDraft;
  onNewFormChange: React.Dispatch<React.SetStateAction<NewFormDraft>>;
  newQuestion: Question;
  onNewQuestionChange: React.Dispatch<React.SetStateAction<Question>>;
  optionInput: string;
  onOptionInputChange: (val: string) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (index: number) => void;
  onMoveQuestion: (index: number, direction: "up" | "down") => void;
  onCopyFormLink: (slugOrId: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export const ApplicationFormBuilderModal: React.FC<
  ApplicationFormBuilderModalProps
> = ({
  showCreateModal,
  showEditModal,
  selectedForm,
  jobs,
  newForm,
  onNewFormChange,
  newQuestion,
  onNewQuestionChange,
  optionInput,
  onOptionInputChange,
  onAddOption,
  onRemoveOption,
  onAddQuestion,
  onRemoveQuestion,
  onMoveQuestion,
  onCopyFormLink,
  onClose,
  onSubmit,
}) => {
  return (
    <AnimatePresence>
      {(showCreateModal || showEditModal) && (
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
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              {showEditModal ? "تعديل الاستبيان" : "إنشاء استبيان جديد"}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    عنوان الاستبيان *
                  </label>
                  <input
                    type="text"
                    value={newForm.title}
                    onChange={(e) =>
                      onNewFormChange((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="مثال: استبيان التقديم لوظيفة مطور"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    رابط مخصص (Slug) - اختياري
                  </label>
                  <input
                    type="text"
                    value={newForm.slug}
                    onChange={(e) =>
                      onNewFormChange((prev) => ({
                        ...prev,
                        slug: e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .replace(/[^a-z0-9-]/g, ""),
                      }))
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="مثال: senior-developer-form"
                  />
                  <p className="text-xs text-gray-500 mt-1 font-mono">
                    سيكون الرابط: /apply/{newForm.slug || "id"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الوظيفة المرتبطة (اختياري)
                  </label>
                  <select
                    value={newForm.jobId}
                    onChange={(e) =>
                      onNewFormChange((prev) => ({
                        ...prev,
                        jobId: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">بدون وظيفة محددة</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  وصف الاستبيان (اختياري)
                </label>
                <textarea
                  value={newForm.description}
                  onChange={(e) =>
                    onNewFormChange((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="وصف مختصر للاستبيان..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newForm.isActive}
                  onChange={(e) =>
                    onNewFormChange((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  الاستبيان نشط (يمكن للمتقدمين الوصول إليه)
                </label>
              </div>

              {showEditModal && selectedForm && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-700">
                  <div className="flex items-start gap-3">
                    <LinkIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-2">
                        رابط الاستبيان للمتقدمين
                      </h4>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3">
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-mono break-all">
                          {window.location.origin}/apply/
                          {newForm.slug || selectedForm.id}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onCopyFormLink(newForm.slug || selectedForm.id)
                        }
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
                      >
                        <LinkIcon className="w-5 h-5" />
                        نسخ الرابط
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <ApplicationFormQuestionBuilder
                questions={newForm.questions}
                newQuestion={newQuestion}
                onNewQuestionChange={onNewQuestionChange}
                optionInput={optionInput}
                onOptionInputChange={onOptionInputChange}
                onAddOption={onAddOption}
                onRemoveOption={onRemoveOption}
                onAddQuestion={onAddQuestion}
                onRemoveQuestion={onRemoveQuestion}
                onMoveQuestion={onMoveQuestion}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                إلغاء
              </button>
              <button
                onClick={onSubmit}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                {showEditModal ? "حفظ التعديلات" : "إنشاء الاستبيان"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
