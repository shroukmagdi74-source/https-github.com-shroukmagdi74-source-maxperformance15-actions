import React from "react";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

export const ChatEmptyState: React.FC = () => {
  return (
    <div className="flex-1 h-full max-h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50 overflow-hidden">
      <div className="text-center p-12">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
          <ChatBubbleLeftRightIcon className="h-12 w-12 text-indigo-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          اختر محادثة للبدء
        </h3>
        <p className="text-gray-500 text-lg mb-6">
          اختر محادثة من القائمة لبدء المراسلة مع العملاء
        </p>
        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer">
          <span>جاهز للمحادثة</span>
        </div>
      </div>
    </div>
  );
};
