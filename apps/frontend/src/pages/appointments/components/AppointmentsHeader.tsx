import React from "react";
import { CalendarDaysIcon, PlusIcon } from "@heroicons/react/24/outline";

interface AppointmentsHeaderProps {
  onOpenCreateModal: () => void;
}

export const AppointmentsHeader: React.FC<AppointmentsHeaderProps> = ({
  onOpenCreateModal,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <CalendarDaysIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mr-3" />
            إدارة المواعيد والتقويم
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            جدولة ومتابعة المواعيد مع العملاء
          </p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          موعد جديد
        </button>
      </div>
    </div>
  );
};
