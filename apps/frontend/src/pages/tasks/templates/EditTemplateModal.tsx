import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { TaskTemplate } from "./types";

interface EditTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTemplate: TaskTemplate | null;
  setEditingTemplate: React.Dispatch<React.SetStateAction<TaskTemplate | null>>;
  onUpdate: () => Promise<void>;
}

export const EditTemplateModal: React.FC<EditTemplateModalProps> = ({
  isOpen,
  onClose,
  editingTemplate,
  setEditingTemplate,
  onUpdate,
}) => {
  if (!isOpen || !editingTemplate) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border border-gray-200 dark:border-gray-700 w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            تعديل القالب
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                اسم القالب *
              </label>
              <input
                type="text"
                value={editingTemplate.name}
                onChange={(e) =>
                  setEditingTemplate({
                    ...editingTemplate,
                    name: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                وصف القالب
              </label>
              <input
                type="text"
                value={editingTemplate.description || ""}
                onChange={(e) =>
                  setEditingTemplate({
                    ...editingTemplate,
                    description: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                عنوان المهمة *
              </label>
              <input
                type="text"
                value={editingTemplate.taskTitle}
                onChange={(e) =>
                  setEditingTemplate({
                    ...editingTemplate,
                    taskTitle: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                وصف المهمة
              </label>
              <textarea
                value={editingTemplate.taskDescription || ""}
                onChange={(e) =>
                  setEditingTemplate({
                    ...editingTemplate,
                    taskDescription: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 resize-none placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                الأولوية
              </label>
              <select
                value={editingTemplate.priority}
                onChange={(e) =>
                  setEditingTemplate({
                    ...editingTemplate,
                    priority: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                style={{ colorScheme: "dark" }}
              >
                <option
                  value="low"
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  منخفض
                </option>
                <option
                  value="medium"
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  متوسط
                </option>
                <option
                  value="high"
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  عالي
                </option>
                <option
                  value="urgent"
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  عاجل
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                الساعات المقدرة
              </label>
              <input
                type="number"
                min="0"
                value={editingTemplate.estimatedHours || 0}
                onChange={(e) =>
                  setEditingTemplate({
                    ...editingTemplate,
                    estimatedHours: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 tabular-nums"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2 space-x-reverse">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            onClick={onUpdate}
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors cursor-pointer"
          >
            حفظ التغييرات
          </button>
        </div>
      </div>
    </div>
  );
};
