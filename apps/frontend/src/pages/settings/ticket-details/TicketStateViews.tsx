import React from "react";
import { ArrowLeftIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface TicketStateViewProps {
  onBack: () => void;
  onRetry?: () => void;
  error?: string | null;
}

export const TicketLoadingView: React.FC = () => (
  <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-950">
    <div className="w-full">
      <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-gray-900 dark:shadow-black/20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">
          جاري تحميل تفاصيل التذكرة...
        </p>
      </div>
    </div>
  </div>
);

export const TicketErrorView: React.FC<TicketStateViewProps> = ({
  onBack,
  onRetry,
  error,
}) => (
  <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-950">
    <div className="w-full">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        العودة لإعدادات Turbo
      </button>

      <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-gray-900 dark:shadow-black/20">
        <ExclamationCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          خطأ في تحميل التذكرة
        </h2>
        <p className="mb-4 text-gray-600 dark:text-gray-300">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
          >
            إعادة المحاولة
          </button>
        )}
      </div>
    </div>
  </div>
);

export const TicketNotFoundView: React.FC<TicketStateViewProps> = ({ onBack }) => (
  <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-950">
    <div className="w-full">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        العودة لإعدادات Turbo
      </button>

      <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-gray-900 dark:shadow-black/20">
        <p className="text-gray-600 dark:text-gray-300">
          لم يتم العثور على التذكرة
        </p>
      </div>
    </div>
  </div>
);
