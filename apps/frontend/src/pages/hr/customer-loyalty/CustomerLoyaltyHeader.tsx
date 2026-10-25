import React from "react";
import { Heart, RefreshCw, Plus } from "lucide-react";

interface CustomerLoyaltyHeaderProps {
  onRefresh: () => void;
  onCreateProgram: () => void;
}

export const CustomerLoyaltyHeader: React.FC<CustomerLoyaltyHeaderProps> = ({
  onRefresh,
  onCreateProgram,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ولاء العملاء
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            إدارة برامج ولاء العملاء ومكافآتهم
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>تحديث</span>
        </button>
        <button
          type="button"
          onClick={onCreateProgram}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>برنامج جديد</span>
        </button>
      </div>
    </div>
  );
};
