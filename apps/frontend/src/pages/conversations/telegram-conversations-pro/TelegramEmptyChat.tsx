import React from "react";
import { MessageCircle } from "lucide-react";

interface TelegramEmptyChatProps {
  isRTL: boolean;
}

export const TelegramEmptyChat: React.FC<TelegramEmptyChatProps> = ({ isRTL }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center business-text-subtle select-none">
      <div className="w-24 h-24 business-bg-soft rounded-full flex items-center justify-center mb-6 shadow-sm">
        <MessageCircle size={48} className="business-text-subtle" />
      </div>
      <p className="text-lg font-medium business-text-subtle">
        {isRTL ? "اختر محادثة للبدء" : "Select a chat to start messaging"}
      </p>
      <p
        className={`text-sm mt-2 max-w-xs text-center ${
          isRTL ? "text-right" : "text-left"
        }`}
      >
        {isRTL
          ? "استخدم شريط البحث على اليمين للعثور على عملاء محددين."
          : "Use the search bar on the left to find specific customers."}
      </p>
    </div>
  );
};
