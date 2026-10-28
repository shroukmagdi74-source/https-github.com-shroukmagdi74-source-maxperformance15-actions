import React from "react";
import { DocumentDuplicateIcon, PlusIcon } from "@heroicons/react/24/outline";

interface TaskTemplatesEmptyStateProps {
  onCreate?: () => void;
  onOpenCreateModal?: () => void;
}

export const TaskTemplatesEmptyState: React.FC<TaskTemplatesEmptyStateProps> = ({
  onCreate,
  onOpenCreateModal,
}) => {
  const handleClick = onOpenCreateModal || onCreate;

  return (
    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <DocumentDuplicateIcon className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        لا توجد قوالب بعد
      </p>
      <button
        onClick={handleClick}
        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer"
      >
        <PlusIcon className="h-5 w-5 ml-2" />
        إنشاء أول قالب
      </button>
    </div>
  );
};
