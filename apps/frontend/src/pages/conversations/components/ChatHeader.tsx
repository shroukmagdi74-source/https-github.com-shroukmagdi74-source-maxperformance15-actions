import React from "react";
import {
  UserCircleIcon,
  PhoneIcon,
  VideoCameraIcon,
  InformationCircleIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { Conversation } from "./types";

interface ChatHeaderProps {
  conversation: Conversation;
  isConnected: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  isConnected,
}) => {
  return (
    <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg">
              <UserCircleIcon className="h-8 w-8 text-indigo-600" />
            </div>
            {conversation.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {conversation.customerName}
            </h3>
            <div className="flex items-center space-x-3 space-x-reverse mt-1">
              <span
                className={`text-sm font-medium ${conversation.isOnline ? "text-green-600" : "text-gray-500"}`}
              >
                {conversation.isOnline ? "متصل الآن" : "غير متصل"}
              </span>
              <div className="flex items-center space-x-1 space-x-reverse">
                <div
                  className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                />
                <span className="text-xs text-gray-500">
                  {isConnected ? "مباشر" : "غير مباشر"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            type="button"
            className="p-3 text-gray-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200 group"
            aria-label="اتصال هاتف"
          >
            <PhoneIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
          </button>
          <button
            type="button"
            className="p-3 text-gray-400 hover:text-purple-600 rounded-xl hover:bg-purple-50 transition-all duration-200 group"
            aria-label="اتصال فيديو"
          >
            <VideoCameraIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
          </button>
          <button
            type="button"
            className="p-3 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 group"
            aria-label="معلومات المحادثة"
          >
            <InformationCircleIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
          </button>
          <button
            type="button"
            className="p-3 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
            aria-label="خيارات إضافية"
          >
            <EllipsisVerticalIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </div>
  );
};
