import React from "react";
import {
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  LinkIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { ApplicationForm } from "./types";

interface ApplicationFormsHeaderAndGridProps {
  loading: boolean;
  searchTerm: string;
  onSearchTermChange: (val: string) => void;
  filteredForms: ApplicationForm[];
  onOpenCreateModal: () => void;
  onEditForm: (form: ApplicationForm) => void;
  onViewResponses: (form: ApplicationForm) => void;
  onDeleteForm: (formId: string) => void;
  onCopyFormLink: (slugOrId: string) => void;
}

export const ApplicationFormsHeaderAndGrid: React.FC<
  ApplicationFormsHeaderAndGridProps
> = ({
  loading,
  searchTerm,
  onSearchTermChange,
  filteredForms,
  onOpenCreateModal,
  onEditForm,
  onViewResponses,
  onDeleteForm,
  onCopyFormLink,
}) => {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 md:w-80">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في الاستبيانات..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="w-full pr-10 pl-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
        >
          <PlusIcon className="w-5 h-5" />
          إنشاء استبيان جديد
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700">
          <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            لا توجد استبيانات
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            قم بإنشاء استبيان جديد للمتقدمين
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form, index) => (
            <motion.div
              key={form.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-xl ${
                      form.isActive
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <DocumentTextIcon
                      className={`w-6 h-6 ${
                        form.isActive ? "text-green-600" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white">
                      {form.title}
                    </h3>
                    {form.jobTitle && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {form.jobTitle}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    form.isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {form.isActive ? "نشط" : "غير نشط"}
                </span>
              </div>

              {form.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {form.description}
                </p>
              )}

              <div className="flex items-center gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <QuestionMarkCircleIcon className="w-4 h-4" />
                  <span>
                    <span className="font-mono tabular-nums">
                      {form.questionsCount}
                    </span>{" "}
                    سؤال
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <UserGroupIcon className="w-4 h-4" />
                  <span>
                    <span className="font-mono tabular-nums">
                      {form.responsesCount}
                    </span>{" "}
                    رد
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-mono tabular-nums">
                تم الإنشاء:{" "}
                {format(new Date(form.createdAt), "dd MMM yyyy", {
                  locale: ar,
                })}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      رابط الاستبيان:
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 truncate font-mono">
                      {window.location.origin}/apply/{form.slug || form.id}
                    </p>
                  </div>
                  <button
                    onClick={() => onCopyFormLink(form.slug || form.id)}
                    className="flex-shrink-0 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm flex items-center gap-1"
                  >
                    <LinkIcon className="w-4 h-4" />
                    نسخ
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => onEditForm(form)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all text-sm"
                >
                  <PencilIcon className="w-4 h-4" />
                  تعديل
                </button>
                <button
                  onClick={() => onViewResponses(form)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all text-sm"
                >
                  <ClipboardDocumentListIcon className="w-4 h-4" />
                  الردود
                </button>
                <button
                  onClick={() => onDeleteForm(form.id)}
                  className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                  title="حذف"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
};
