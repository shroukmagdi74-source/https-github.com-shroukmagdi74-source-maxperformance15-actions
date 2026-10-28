import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, DocumentDuplicateIcon, PlusIcon } from "@heroicons/react/24/outline";

interface TaskTemplatesHeaderProps {
  onNewTemplate?: () => void;
  onOpenCreateModal?: () => void;
}

export const TaskTemplatesHeader: React.FC<TaskTemplatesHeaderProps> = ({
  onNewTemplate,
  onOpenCreateModal,
}) => {
  const handleClick = onOpenCreateModal || onNewTemplate;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <Link
            to="/tasks"
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <ArrowLeftIcon className="h-5 w-5 ml-2" />
            العودة
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <DocumentDuplicateIcon className="h-7 w-7 text-indigo-600 ml-2" />
            قوالب المهام
          </h1>
        </div>

        <button
          onClick={handleClick}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors cursor-pointer"
        >
          <PlusIcon className="h-5 w-5 ml-2" />
          قالب جديد
        </button>
      </div>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        أنشئ قوالب للمهام المتكررة لتوفير الوقت
      </p>
    </div>
  );
};
