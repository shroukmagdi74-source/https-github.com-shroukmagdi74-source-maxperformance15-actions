import React from "react";
import { Bot, Settings, Search } from "lucide-react";
import { Conversation } from "./types";

interface TelegramConversationsSidebarProps {
  isRTL: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  loading: boolean;
  filteredConversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export const TelegramConversationsSidebar: React.FC<TelegramConversationsSidebarProps> = ({
  isRTL,
  searchQuery,
  setSearchQuery,
  loading,
  filteredConversations,
  selectedConversationId,
  onSelectConversation,
}) => {
  return (
    <div
      className={`w-[350px] business-bg-panel border-r business-border flex flex-col shrink-0 z-20 ${
        isRTL ? "order-3" : "order-1"
      }`}
    >
      {/* Header */}
      <div className="p-4 business-bg-primary-solid business-text-on-accent flex justify-between items-center shadow-sm">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Bot size={20} />
          {isRTL ? "محادثات تيليجرام" : "Telegram Chats"}
        </h2>
        <div className="flex gap-2">
          <Settings
            size={18}
            className="cursor-pointer opacity-80 hover:opacity-100"
          />
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b business-border">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? "بحث في المحادثات..." : "Search chats..."}
            className={`w-full ${
              isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
            } py-2 business-bg-soft-strong border-none rounded-lg text-sm business-text-strong business-placeholder-muted focus:ring-2 business-focus-primary transition-all`}
          />
          <Search
            className={`absolute ${isRTL ? "right-3" : "left-3"} top-2.5 business-text-subtle`}
            size={16}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-10 text-center business-text-subtle flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 business-border-primary-strong mb-2"></div>
            {isRTL ? "جاري التحميل..." : "Loading..."}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-10 text-center business-text-subtle">
            {searchQuery
              ? isRTL
                ? "لا توجد نتائج"
                : "No results found"
              : isRTL
              ? "لا توجد محادثات"
              : "No conversations found"}
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`p-3 border-b business-border cursor-pointer business-hover-primary-soft business-hover-soft transition-colors ${
                selectedConversationId === conv.id
                  ? `business-bg-primary-soft ${
                      isRTL
                        ? "border-r-4 business-border-r-primary"
                        : "border-l-4 business-border-l-primary"
                    }`
                  : ""
              }`}
            >
              <div
                className={`flex justify-between items-start mb-1 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <h3 className="font-semibold business-text-strong text-sm truncate">
                  {conv.customerName}
                </h3>
                <span
                  className={`text-[10px] business-text-subtle whitespace-nowrap ${
                    isRTL ? "mr-2" : "ml-2"
                  }`}
                >
                  {conv.lastMessageTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div
                className={`flex justify-between items-end ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <p
                  className={`text-xs business-text-muted truncate max-w-[200px] ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {conv.lastMessage}
                </p>
                {conv.unreadCount > 0 && (
                  <span className="business-bg-primary-solid business-text-on-accent text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
