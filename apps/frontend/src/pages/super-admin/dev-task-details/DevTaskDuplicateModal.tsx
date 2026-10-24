import React from "react";
import {
  DocumentDuplicateIcon,
  XMarkIcon,
  UserIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import type { DuplicateFormData } from "./types";

export interface DevTaskDuplicateModalProps {
  showDuplicateModal: boolean;
  setShowDuplicateModal: (show: boolean) => void;
  duplicateForm: DuplicateFormData;
  setDuplicateForm: React.Dispatch<React.SetStateAction<DuplicateFormData>>;
  isDuplicating: boolean;
  handleDuplicateTask: () => void;
  taskAssigneeName?: string;
  teamMembers: any[];
}

export const DevTaskDuplicateModal: React.FC<DevTaskDuplicateModalProps> = ({
  showDuplicateModal,
  setShowDuplicateModal,
  duplicateForm,
  setDuplicateForm,
  isDuplicating,
  handleDuplicateTask,
  taskAssigneeName,
  teamMembers,
}) => {
  if (!showDuplicateModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl transform transition-all">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <DocumentDuplicateIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                تكرار المهمة
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                إنشاء نسخة من المهمة مع إمكانية تغيير المسؤول
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowDuplicateModal(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <UserIcon className="h-4 w-4" /> المسؤول الجديد (اختياري)
            </label>
            <select
              value={duplicateForm.newAssigneeId}
              onChange={(e) =>
                setDuplicateForm({
                  ...duplicateForm,
                  newAssigneeId: e.target.value,
                })
              }
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:text-white transition-all text-sm"
            >
              <option value="">
                -- نفس المسؤول الحالي ({taskAssigneeName || "غير محدد"}) --
              </option>
              {teamMembers.map((member) => (
                <option
                  key={member.userId || member.id}
                  value={member.userId || member.id}
                >
                  {member.name}{" "}
                  {member.availability !== "available" ? "(مشغول)" : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              اترك فارغاً للاحتفاظ بنفس المسؤول
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-colors">
              <input
                type="checkbox"
                checked={duplicateForm.includeChecklists}
                onChange={(e) =>
                  setDuplicateForm({
                    ...duplicateForm,
                    includeChecklists: e.target.checked,
                  })
                }
                className="h-4 w-4 text-purple-600 rounded border-gray-300 cursor-pointer"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  تضمين القوائم المرجعية
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  نسخ جميع القوائم والعناصر (سيتم إعادة تعيين حالة الإكمال)
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-colors">
              <input
                type="checkbox"
                checked={duplicateForm.includeAttachments}
                onChange={(e) =>
                  setDuplicateForm({
                    ...duplicateForm,
                    includeAttachments: e.target.checked,
                  })
                }
                className="h-4 w-4 text-purple-600 rounded border-gray-300 cursor-pointer"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  تضمين المرفقات
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  نسخ جميع الملفات المرفقة (قريباً)
                </p>
              </div>
            </label>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4">
            <div className="flex gap-3">
              <LightBulbIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">ملاحظة:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>سيتم إنشاء المهمة بحالة &quot;Backlog&quot;</li>
                  <li>سيتم إعادة تعيين التقدم والساعات الفعلية</li>
                  <li>سيتم نسخ جميع التفاصيل الأخرى</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end p-6 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setShowDuplicateModal(false)}
            disabled={isDuplicating}
            className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleDuplicateTask}
            disabled={isDuplicating}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-200 dark:shadow-none transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDuplicating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                جاري التكرار...
              </>
            ) : (
              <>
                <DocumentDuplicateIcon className="h-5 w-5" />
                تكرار المهمة
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
