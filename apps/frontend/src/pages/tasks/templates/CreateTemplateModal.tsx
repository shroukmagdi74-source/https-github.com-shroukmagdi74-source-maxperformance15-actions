import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Category, NewTemplatePayload, Project } from "./types";

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  newTemplate: NewTemplatePayload;
  setNewTemplate: React.Dispatch<React.SetStateAction<NewTemplatePayload>>;
  projects: Project[];
  categories: Category[];
  tagInput: string;
  setTagInput: (val: string) => void;
  addTag: (tags: string[], setTags: (tags: string[]) => void) => void;
  removeTag: (tag: string, tags: string[], setTags: (tags: string[]) => void) => void;
  onCreate: () => Promise<void>;
}

export const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  isOpen,
  onClose,
  newTemplate,
  setNewTemplate,
  projects,
  categories,
  tagInput,
  setTagInput,
  addTag,
  removeTag,
  onCreate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border border-gray-200 dark:border-gray-700 w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            إنشاء قالب جديد
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                اسم القالب *
              </label>
              <input
                type="text"
                value={newTemplate.name}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, name: e.target.value })
                }
                placeholder="مثال: مهمة مراجعة أسبوعية"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                وصف القالب
              </label>
              <input
                type="text"
                value={newTemplate.description}
                onChange={(e) =>
                  setNewTemplate({
                    ...newTemplate,
                    description: e.target.value,
                  })
                }
                placeholder="وصف مختصر للقالب"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div className="col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                تفاصيل المهمة
              </h4>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                عنوان المهمة *
              </label>
              <input
                type="text"
                value={newTemplate.taskTitle}
                onChange={(e) =>
                  setNewTemplate({
                    ...newTemplate,
                    taskTitle: e.target.value,
                  })
                }
                placeholder="عنوان المهمة التي ستُنشأ"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                وصف المهمة
              </label>
              <textarea
                value={newTemplate.taskDescription}
                onChange={(e) =>
                  setNewTemplate({
                    ...newTemplate,
                    taskDescription: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                الأولوية
              </label>
              <select
                value={newTemplate.priority}
                onChange={(e) =>
                  setNewTemplate({
                    ...newTemplate,
                    priority: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer"
                style={{ colorScheme: "dark" }}
              >
                <option value="low" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  منخفض
                </option>
                <option value="medium" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  متوسط
                </option>
                <option value="high" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  عالي
                </option>
                <option value="urgent" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
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
                value={newTemplate.estimatedHours}
                onChange={(e) =>
                  setNewTemplate({
                    ...newTemplate,
                    estimatedHours: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                المشروع
              </label>
              <select
                value={newTemplate.projectId}
                onChange={(e) =>
                  setNewTemplate({
                    ...newTemplate,
                    projectId: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer"
                style={{ colorScheme: "dark" }}
              >
                <option value="" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  بدون مشروع
                </option>
                {projects.map((project) => (
                  <option
                    key={project.id}
                    value={project.id}
                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                القسم
              </label>
              <select
                value={newTemplate.categoryId}
                onChange={(e) =>
                  setNewTemplate({
                    ...newTemplate,
                    categoryId: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer"
                style={{ colorScheme: "dark" }}
              >
                <option value="" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  بدون قسم
                </option>
                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                الوسوم
              </label>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(),
                    addTag(newTemplate.tags, (tags) =>
                      setNewTemplate({ ...newTemplate, tags }),
                    ))
                  }
                  placeholder="أضف وسم واضغط Enter"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    addTag(newTemplate.tags, (tags) =>
                      setNewTemplate({ ...newTemplate, tags }),
                    )
                  }
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  إضافة
                </button>
              </div>
              {newTemplate.tags && Array.isArray(newTemplate.tags) && newTemplate.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newTemplate.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() =>
                          removeTag(tag, newTemplate.tags, (tags) =>
                            setNewTemplate({ ...newTemplate, tags }),
                          )
                        }
                        className="mr-1 text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
            onClick={() => void onCreate()}
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors cursor-pointer"
          >
            إنشاء القالب
          </button>
        </div>
      </div>
    </div>
  );
};
