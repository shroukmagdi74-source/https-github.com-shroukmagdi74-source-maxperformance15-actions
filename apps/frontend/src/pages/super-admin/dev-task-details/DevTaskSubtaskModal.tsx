import React from "react";
import {
  ClipboardDocumentListIcon,
  XMarkIcon,
  BriefcaseIcon,
  UserGroupIcon,
  CheckIcon,
  DocumentDuplicateIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import type { SubtaskFormData } from "./types";

export interface DevTaskSubtaskModalProps {
  showSubtaskModal: boolean;
  setShowSubtaskModal: (show: boolean) => void;
  subtaskForm: SubtaskFormData;
  setSubtaskForm: React.Dispatch<React.SetStateAction<SubtaskFormData>>;
  handleCreateSubtask: (e: React.FormEvent) => void;
  handleDepartmentChange: (dept: string) => void;
  teamMembers: any[];
}

export const DevTaskSubtaskModal: React.FC<DevTaskSubtaskModalProps> = ({
  showSubtaskModal,
  setShowSubtaskModal,
  subtaskForm,
  setSubtaskForm,
  handleCreateSubtask,
  handleDepartmentChange,
  teamMembers,
}) => {
  if (!showSubtaskModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl transform transition-all">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
              <ClipboardDocumentListIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                إنشاء مهمة فرعية جديدة
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                أضف تفاصيل المهمة والمسؤول عنها
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSubtaskModal(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleCreateSubtask} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
              <SparklesIcon className="h-4 w-4" /> عنوان المهمة
            </label>
            <input
              type="text"
              required
              value={subtaskForm.title}
              onChange={(e) =>
                setSubtaskForm({ ...subtaskForm, title: e.target.value })
              }
              placeholder="مثال: إصلاح خطأ في واجهة المستخدم"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
              <DocumentDuplicateIcon className="h-4 w-4" /> الوصف
            </label>
            <textarea
              value={subtaskForm.description}
              onChange={(e) =>
                setSubtaskForm({
                  ...subtaskForm,
                  description: e.target.value,
                })
              }
              placeholder="اشرح تفاصيل المهمة هنا..."
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                <BriefcaseIcon className="h-4 w-4" /> القسم المعني
              </label>
              <select
                value={subtaskForm.department}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:border-indigo-500 dark:text-white transition-all text-sm"
              >
                <option value="">-- اختر القسم --</option>
                {Array.from(
                  new Set(
                    teamMembers
                      .filter((m) => m.department)
                      .map((m) => m.department)
                  )
                ).map((dept: any) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                <UserGroupIcon className="h-4 w-4" /> المسؤول
              </label>
              <select
                value={subtaskForm.assigneeId}
                onChange={(e) =>
                  setSubtaskForm({
                    ...subtaskForm,
                    assigneeId: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:border-indigo-500 dark:text-white transition-all text-sm"
              >
                <option value="">-- اختر المسؤول --</option>
                {teamMembers
                  .filter(
                    (m) =>
                      !subtaskForm.department ||
                      m.department === subtaskForm.department
                  )
                  .map((member) => (
                    <option
                      key={member.userId || member.id}
                      value={member.userId || member.id}
                    >
                      {member.name}{" "}
                      {member.availability !== "available" ? "(مشغول)" : ""}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                النوع
              </label>
              <select
                value={subtaskForm.type}
                onChange={(e) =>
                  setSubtaskForm({ ...subtaskForm, type: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:border-indigo-500 dark:text-white transition-all text-sm"
              >
                <option value="FEATURE">ميزة</option>
                <option value="BUG">خطأ برمجى</option>
                <option value="ENHANCEMENT">تحسين</option>
                <option value="REFACTOR">إعادة هيكلة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                الأولوية
              </label>
              <select
                value={subtaskForm.priority}
                onChange={(e) =>
                  setSubtaskForm({
                    ...subtaskForm,
                    priority: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:border-indigo-500 dark:text-white transition-all text-sm"
              >
                <option value="LOW">منخفضة</option>
                <option value="MEDIUM">متوسطة</option>
                <option value="HIGH">عالية</option>
                <option value="CRITICAL">حرجة</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-50 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowSubtaskModal(false)}
              className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2"
            >
              إنشاء المهمة <CheckIcon className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
