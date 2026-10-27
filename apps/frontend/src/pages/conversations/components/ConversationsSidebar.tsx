import React from "react";
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { Conversation, Platform } from "./types";

interface ConversationsSidebarProps {
  filteredConversations: Conversation[];
  selectedConversation: Conversation | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loading: boolean;
  isAutoUpdating: boolean;
  isUserTyping: boolean;
  hasNewMessages: boolean;
  handleManualRefresh: () => void;
  handleSelectConversation: (conversation: Conversation) => void;
  formatTime: (date: Date | string) => string;
}

const getPlatformIcon = (platform: Platform) => {
  switch (platform) {
    case "facebook":
      return (
        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-xs font-bold">f</span>
        </div>
      );
    case "whatsapp":
      return (
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-xs">💬</span>
        </div>
      );
    case "telegram":
      return (
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-xs">✈️</span>
        </div>
      );
    default:
      return (
        <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-xs">💬</span>
        </div>
      );
  }
};

export const ConversationsSidebar: React.FC<ConversationsSidebarProps> = ({
  filteredConversations,
  selectedConversation,
  searchQuery,
  setSearchQuery,
  loading,
  isAutoUpdating,
  isUserTyping,
  hasNewMessages,
  handleManualRefresh,
  handleSelectConversation,
  formatTime,
}) => {
  return (
    <div className="w-1/3 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 flex flex-col shadow-xl">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200/50 bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">المحادثات</h2>
              <p className="text-indigo-100 text-sm">
                إدارة محادثات العملاء (
                <span className="tabular-nums">{filteredConversations.length}</span>)
              </p>
            </div>
            {hasNewMessages && (
              <div className="flex items-center space-x-2 space-x-reverse bg-red-500/20 px-3 py-1 rounded-full backdrop-blur-sm">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <span className="text-xs text-red-100 font-medium animate-pulse">
                  رسائل جديدة
                </span>
              </div>
            )}
          </div>
          {isAutoUpdating && !isUserTyping && (
            <div className="flex items-center text-sm bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white ml-2" />
              <span className="text-white font-medium">تحديث تلقائي</span>
            </div>
          )}
          {isUserTyping && (
            <div className="flex items-center text-sm bg-orange-500/20 px-3 py-1 rounded-full backdrop-blur-sm">
              <div className="flex space-x-1 ml-2">
                <div className="w-2 h-2 bg-orange-300 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-orange-300 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-orange-300 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
              <span className="text-orange-100 font-medium">جاري الكتابة</span>
            </div>
          )}
        </div>
        <div className="flex space-x-3 space-x-reverse mt-4">
          <div className="relative flex-1">
            <label htmlFor="conversations-search" className="sr-only">
              البحث في المحادثات
            </label>
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
            <input
              id="conversations-search"
              name="searchQuery"
              type="text"
              autoComplete="off"
              placeholder="البحث في المحادثات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm transition-all duration-200"
            />
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={handleManualRefresh}
              disabled={loading || isAutoUpdating}
              className="p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              title="تحديث المحادثات"
            >
              <ArrowPathIcon
                className={`h-5 w-5 ${loading || isAutoUpdating ? "animate-spin" : ""}`}
              />
            </button>

            {/* مؤشر حالة التحديث التلقائي */}
            <div className="flex items-center space-x-2 space-x-reverse text-xs bg-white/20 px-3 py-2 rounded-xl backdrop-blur-sm">
              <div
                className={`w-2 h-2 rounded-full ${!isUserTyping ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`}
              />
              <span className="text-white/80 font-medium">
                {!isUserTyping ? "متصل" : "متوقف"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 conversations-scroll scroll-indicator">
        {filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                لا توجد محادثات
              </h3>
              <p className="text-gray-500 text-sm">في انتظار رسائل العملاء...</p>
            </div>
          </div>
        ) : (
          filteredConversations.map((conversation, index) => (
            <div
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation)}
              className={`conversation-item group relative p-4 mb-2 rounded-2xl cursor-pointer animate-slide-in ${
                selectedConversation?.id === conversation.id
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:shadow-lg hover:shadow-gray-500/10"
              }`}
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="relative">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      selectedConversation?.id === conversation.id
                        ? "bg-white/20 backdrop-blur-sm"
                        : "bg-gradient-to-br from-indigo-100 to-purple-100"
                    }`}
                  >
                    <UserCircleIcon
                      className={`h-8 w-8 ${
                        selectedConversation?.id === conversation.id
                          ? "text-white"
                          : "text-indigo-600"
                      }`}
                    />
                  </div>
                  {conversation.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
                  )}
                  <div className="absolute -bottom-1 -left-1 text-sm">
                    {getPlatformIcon(conversation.platform)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className={`text-base font-semibold truncate transition-colors duration-300 ${
                        selectedConversation?.id === conversation.id
                          ? "text-white"
                          : "text-gray-900"
                      }`}
                    >
                      {conversation.customerName}
                      {conversation.pageName && (
                        <span className="text-xs text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded mr-2">
                          {conversation.pageName}
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span
                        className={`text-xs font-medium tabular-nums ${
                          selectedConversation?.id === conversation.id
                            ? "text-white/80"
                            : "text-gray-500"
                        }`}
                      >
                        {formatTime(conversation.lastMessageTime)}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-2 text-xs font-bold text-white bg-red-500 rounded-full shadow-lg animate-pulse tabular-nums">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <p
                    className={`text-sm truncate transition-colors duration-300 ${
                      selectedConversation?.id === conversation.id
                        ? "text-white/90"
                        : "text-gray-600"
                    }`}
                  >
                    {conversation.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
