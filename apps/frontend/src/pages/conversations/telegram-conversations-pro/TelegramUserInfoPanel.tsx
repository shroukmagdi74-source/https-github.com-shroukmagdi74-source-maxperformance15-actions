import React from "react";
import {
  X,
  Phone,
  Bot,
  MapPin,
  Trash2,
  Video,
  File,
} from "lucide-react";
import { Conversation, Message } from "./types";

interface TelegramUserInfoPanelProps {
  activeConversation: Conversation;
  isRTL: boolean;
  onClose: () => void;
  mediaMessages: Message[];
  onDeleteConversation: () => void;
}

export const TelegramUserInfoPanel: React.FC<TelegramUserInfoPanelProps> = ({
  activeConversation,
  isRTL,
  onClose,
  mediaMessages,
  onDeleteConversation,
}) => {
  return (
    <div
      className={`w-[300px] business-bg-panel border-l business-border flex flex-col z-20 shadow-lg animate-in slide-in-from-right duration-300 ${
        isRTL ? "order-1 border-r border-l-0" : "order-3"
      }`}
    >
      {/* Header */}
      <div
        className={`p-4 border-b business-border flex justify-between items-center ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <h3 className="font-bold business-text-body">
          {isRTL ? "معلومات المستخدم" : "UserInfo"}
        </h3>
        <button
          onClick={onClose}
          className="business-text-subtle business-hover-muted"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br business-bg-brand-gradient business-text-on-accent flex items-center justify-center text-3xl font-bold shadow-lg mb-3">
            {activeConversation.customerName.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-lg font-bold business-text-strong text-center">
            {activeConversation.customerName}
          </h2>
          <p className="text-sm business-text-muted">
            @{activeConversation.customerName.replace(/\s/g, "").toLowerCase()}
          </p>
          <span className="mt-2 text-xs business-bg-primary-soft business-text-primary px-2 py-1 rounded-full font-medium">
            {isRTL ? "مستخدم تيليجرام" : "Telegram User"}
          </span>
        </div>

        {/* Info List */}
        <div className="space-y-4">
          <div
            className={`flex items-center gap-3 business-text-muted ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <Phone size={18} className="business-text-subtle" />
            <span className="text-sm">+20 10XXXX XXXX</span>
          </div>
          <div
            className={`flex items-center gap-3 business-text-muted ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <Bot size={18} className="business-text-subtle" />
            <span className="text-sm text-wrap break-all">
              {activeConversation.customerId}
            </span>
          </div>
          <div
            className={`flex items-center gap-3 business-text-muted ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <MapPin size={18} className="business-text-subtle" />
            <span className="text-sm">
              {isRTL ? "مصر (تقريبي)" : "Egypt (Approx.)"}
            </span>
          </div>
        </div>

        {/* Shared Media Section */}
        <div className="pt-4 border-t business-border">
          <h4
            className={`text-xs font-bold business-text-subtle uppercase tracking-wider mb-3 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {isRTL ? "الوسائط المشتركة" : "Shared Media"}
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {mediaMessages.slice(0, 9).map((msg, idx) => (
              <div
                key={idx}
                className="aspect-square business-bg-soft-strong rounded-lg overflow-hidden cursor-pointer hover:opacity-80"
              >
                {msg.type === "image" && msg.fileUrl ? (
                  <img
                    src={msg.fileUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {msg.type === "video" && (
                      <Video size={20} className="business-text-subtle" />
                    )}
                    {msg.type === "document" && (
                      <File className="business-text-subtle" size={20} />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t business-border space-y-2">
          <button
            onClick={onDeleteConversation}
            className={`w-full py-2 flex items-center justify-center gap-2 business-text-danger business-bg-danger-soft business-hover-danger-soft rounded-lg transition-colors text-sm font-medium ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <Trash2 size={16} />
            {isRTL ? "حذف المحادثة" : "Delete Conversation"}
          </button>
        </div>
      </div>
    </div>
  );
};
