import React from "react";

export const ConversationsLoading: React.FC = () => {
  return (
    <div className="min-h-[400px] flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto" />
          <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-white mx-auto" />
        </div>
        <div className="mt-6 space-y-2">
          <p className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            جاري تحميل المحادثات
          </p>
          <p className="text-sm text-gray-500">يرجى الانتظار قليلاً...</p>
        </div>
      </div>
    </div>
  );
};
