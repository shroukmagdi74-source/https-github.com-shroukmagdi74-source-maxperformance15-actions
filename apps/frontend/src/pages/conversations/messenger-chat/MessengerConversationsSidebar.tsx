import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import type { Conversation, ConversationFilter } from "./types";

export interface MessengerConversationsSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  loading: boolean;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  conversationFilter: ConversationFilter;
  onConversationFilterChange: (filter: ConversationFilter) => void;
}

export const MessengerConversationsSidebar: React.FC<
  MessengerConversationsSidebarProps
> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  loading,
  searchQuery,
  onSearchQueryChange,
  conversationFilter,
  onConversationFilterChange,
}) => {
  const filterOptions: ConversationFilter[] = [
    "all",
    "new",
    "active",
    "archived",
    "important",
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">المحادثات</h2>

        <div className="mt-3 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن محادثة..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        <div className="mt-3 flex gap-1">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => onConversationFilterChange(filter)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                conversationFilter === filter
                  ? "bg-blue-500 text-white font-medium"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filter === "all"
                ? "الكل"
                : filter === "new"
                  ? "جديد"
                  : filter === "active"
                    ? "نشط"
                    : filter === "archived"
                      ? "مؤرشف"
                      : "مهم"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            جاري التحميل...
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            لا توجد محادثات
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedConversation?.id === conversation.id ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-center">
                {conversation.customerAvatar ? (
                  <img
                    src={conversation.customerAvatar}
                    alt={conversation.customerName}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                    <span className="text-gray-600 text-sm font-medium">
                      {conversation.customerName?.charAt(0) || "ع"}
                    </span>
                  </div>
                )}
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {conversation.customerName}
                      {conversation.pageName && (
                        <span className="text-xs text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded mr-2">
                          {conversation.pageName}
                        </span>
                      )}
                    </h3>
                    <span className="text-xs text-gray-500 tabular-nums">
                      {conversation.lastMessageTime
                        ? new Date(
                            conversation.lastMessageTime,
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "الآن"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.lastMessage}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        conversation.status === "new"
                          ? "bg-green-100 text-green-800"
                          : conversation.status === "active"
                            ? "bg-blue-100 text-blue-800"
                            : conversation.status === "archived"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {conversation.status === "new"
                        ? "جديد"
                        : conversation.status === "active"
                          ? "نشط"
                          : conversation.status === "archived"
                            ? "مؤرشف"
                            : "مهم"}
                    </span>
                    {conversation.isOnline && (
                      <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
