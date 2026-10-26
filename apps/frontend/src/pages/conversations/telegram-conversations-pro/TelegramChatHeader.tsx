import React from "react";
import { Search, Image as ImageIcon, Phone, MoreVertical } from "lucide-react";
import { Conversation } from "./types";

interface TelegramChatHeaderProps {
  activeConversation: Conversation;
  isRTL: boolean;
  isTyping: boolean;
  isInfoOpen: boolean;
  showMediaGallery: boolean;
  chatSearchQuery: string;
  onToggleAi: () => void;
  onToggleChatSearch: () => void;
  onToggleMediaGallery: () => void;
  onToggleInfo: () => void;
}

export const TelegramChatHeader: React.FC<TelegramChatHeaderProps> = ({
  activeConversation,
  isRTL,
  isTyping,
  isInfoOpen,
  showMediaGallery,
  onToggleAi,
  onToggleChatSearch,
  onToggleMediaGallery,
  onToggleInfo,
}) => {
  return (
    <div
      className={`p-3 business-bg-panel border-b business-border flex justify-between items-center z-10 shadow-sm px-4 ${
        isRTL ? "flex-row-reverse" : ""
      }`}
    >
      <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br business-bg-brand-gradient business-text-on-accent flex items-center justify-center font-bold text-lg shadow-sm">
          {activeConversation.customerName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-bold business-text-strong pointer-events-none">
            {activeConversation.customerName}
          </h3>
          <div
            className={`text-xs business-text-primary flex items-center gap-1 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="w-1.5 h-1.5 rounded-full business-bg-success-solid"></div>
            {isRTL ? "مشترك بوت" : "bot subscriber"}
            {isTyping && (
              <span className="business-text-muted ml-2">
                {isRTL ? "يكتب..." : "typing..."}
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className={`flex items-center gap-2 business-text-muted ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <button
          onClick={onToggleAi}
          className={`p-2 business-hover-soft rounded-full transition-colors ${
            activeConversation.aiEnabled !== false
              ? "business-text-primary business-bg-primary-soft"
              : "text-gray-400 hover:text-gray-600"
          }`}
          title={
            activeConversation.aiEnabled !== false
              ? isRTL
                ? "إيقاف الرد الآلي"
                : "Disable AI Auto-reply"
              : isRTL
              ? "تشغيل الرد الآلي"
              : "Enable AI Auto-reply"
          }
        >
          <span className="text-base">🤖</span>
        </button>

        <button
          onClick={onToggleChatSearch}
          className="p-2 business-hover-soft rounded-full transition-colors"
          title={isRTL ? "بحث في المحادثة" : "Search in chat"}
        >
          <Search size={20} />
        </button>

        <button
          onClick={onToggleMediaGallery}
          className={`p-2 business-hover-soft rounded-full transition-colors ${
            showMediaGallery ? "business-text-primary business-bg-primary-soft" : ""
          }`}
          title={isRTL ? "معرض الوسائط" : "Media gallery"}
        >
          <ImageIcon size={20} />
        </button>

        <button
          className="p-2 business-hover-soft rounded-full transition-colors"
          title={isRTL ? "مكالمة (قريباً)" : "Call (Coming Soon)"}
        >
          <Phone size={20} />
        </button>

        <button
          className={`p-2 business-hover-soft rounded-full transition-colors ${
            isInfoOpen ? "business-text-primary business-bg-primary-soft" : ""
          }`}
          onClick={onToggleInfo}
          title={isRTL ? "تبديل المعلومات" : "Toggle Info"}
        >
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
};
