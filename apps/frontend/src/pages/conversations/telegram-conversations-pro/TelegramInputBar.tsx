import React from "react";
import {
  X,
  Paperclip,
  Smile,
  Send,
  Mic,
  Image as ImageIcon,
  Video,
  Music,
  File,
  Map,
  Contact,
} from "lucide-react";
import { Message } from "./types";

interface TelegramInputBarProps {
  isRTL: boolean;
  inputText: string;
  setInputText: (val: string) => void;
  replyingTo: Message | null;
  setReplyingTo: (msg: Message | null) => void;
  editingMessage: Message | null;
  setEditingMessage: (msg: Message | null) => void;
  showFileMenu: boolean;
  setShowFileMenu: (show: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  videoInputRef: React.RefObject<HTMLInputElement | null>;
  audioInputRef: React.RefObject<HTMLInputElement | null>;
  documentInputRef: React.RefObject<HTMLInputElement | null>;
  onSendMessage: () => void;
  onEditMessage: (msg: Message) => void;
  onFileSelect: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video" | "audio" | "document",
  ) => void;
  onSendLocation: () => void;
}

export const TelegramInputBar: React.FC<TelegramInputBarProps> = ({
  isRTL,
  inputText,
  setInputText,
  replyingTo,
  setReplyingTo,
  editingMessage,
  setEditingMessage,
  showFileMenu,
  setShowFileMenu,
  fileInputRef,
  videoInputRef,
  audioInputRef,
  documentInputRef,
  onSendMessage,
  onEditMessage,
  onFileSelect,
  onSendLocation,
}) => {
  return (
    <div className="p-3 business-bg-panel border-t business-border z-10 px-4 py-4">
      {/* Reply Preview */}
      {replyingTo && (
        <div
          className={`mb-2 p-2 business-bg-primary-soft rounded-lg flex items-center justify-between ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <div className="flex-1">
            <p className="text-xs font-semibold business-text-primary">
              {isRTL ? "رد على" : "Replying to"} {replyingTo.senderName}
            </p>
            <p className="text-xs business-text-body truncate">
              {replyingTo.content || (isRTL ? "وسائط" : "Media")}
            </p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 business-hover-primary-soft business-hover-primary-solid rounded"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Edit Preview */}
      {editingMessage && (
        <div
          className={`mb-2 p-2 business-bg-warning-soft rounded-lg flex items-center justify-between ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <p className="text-xs font-semibold business-text-warning">
            {isRTL ? "تعديل الرسالة" : "Editing message"}
          </p>
          <button
            onClick={() => {
              setEditingMessage(null);
              setInputText("");
            }}
            className="p-1 business-hover-warning-soft rounded"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div
        className={`flex items-end gap-2 w-full ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        {/* File Menu Popup */}
        {showFileMenu && (
          <div
            className={`absolute bottom-16 ${
              isRTL ? "right-4" : "left-4"
            } business-bg-panel rounded-lg shadow-xl border business-border p-2 z-50`}
          >
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowFileMenu(false);
                }}
                className="p-3 business-hover-soft rounded-lg flex flex-col items-center gap-2"
              >
                <ImageIcon size={24} className="business-text-primary" />
                <span className="text-xs business-text-body">
                  {isRTL ? "صورة" : "Photo"}
                </span>
              </button>
              <button
                onClick={() => {
                  videoInputRef.current?.click();
                  setShowFileMenu(false);
                }}
                className="p-3 business-hover-soft rounded-lg flex flex-col items-center gap-2"
              >
                <Video size={24} className="business-text-primary" />
                <span className="text-xs">{isRTL ? "فيديو" : "Video"}</span>
              </button>
              <button
                onClick={() => {
                  audioInputRef.current?.click();
                  setShowFileMenu(false);
                }}
                className="p-3 business-hover-soft rounded-lg flex flex-col items-center gap-2"
              >
                <Music size={24} className="business-text-primary" />
                <span className="text-xs">{isRTL ? "صوت" : "Audio"}</span>
              </button>
              <button
                onClick={() => {
                  documentInputRef.current?.click();
                  setShowFileMenu(false);
                }}
                className="p-3 business-hover-soft rounded-lg flex flex-col items-center gap-2"
              >
                <File size={24} className="business-text-primary" />
                <span className="text-xs">{isRTL ? "ملف" : "File"}</span>
              </button>
              <button
                onClick={() => {
                  onSendLocation();
                  setShowFileMenu(false);
                }}
                className="p-3 business-hover-soft rounded-lg flex flex-col items-center gap-2"
              >
                <Map size={24} className="business-text-primary" />
                <span className="text-xs">{isRTL ? "موقع" : "Location"}</span>
              </button>
              <button
                onClick={() => {
                  alert(
                    isRTL
                      ? "ميزة مشاركة جهة الاتصال قريباً"
                      : "Contact sharing coming soon",
                  );
                  setShowFileMenu(false);
                }}
                className="p-3 business-hover-soft rounded-lg flex flex-col items-center gap-2"
              >
                <Contact size={24} className="business-text-primary" />
                <span className="text-xs">
                  {isRTL ? "جهة اتصال" : "Contact"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={fileInputRef as any}
          className="hidden"
          accept="image/*"
          onChange={(e) => onFileSelect(e, "image")}
        />
        <input
          type="file"
          ref={videoInputRef as any}
          className="hidden"
          accept="video/*"
          onChange={(e) => onFileSelect(e, "video")}
        />
        <input
          type="file"
          ref={audioInputRef as any}
          className="hidden"
          accept="audio/*"
          onChange={(e) => onFileSelect(e, "audio")}
        />
        <input
          type="file"
          ref={documentInputRef as any}
          className="hidden"
          onChange={(e) => onFileSelect(e, "document")}
        />

        <button
          onClick={() => setShowFileMenu(!showFileMenu)}
          className="p-3 business-hover-soft rounded-full business-text-subtle business-hover-muted transition-colors"
          title={isRTL ? "إرفاق ملف" : "Attach File"}
        >
          <Paperclip size={24} />
        </button>

        <div
          className={`flex-1 business-bg-soft border business-border business-control-border rounded-2xl flex items-center ${
            isRTL ? "pr-4 pl-4" : "pl-4 pr-4"
          } py-2 business-focus-within-primary business-focus-within-panel transition-all`}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (editingMessage) {
                  onEditMessage(editingMessage);
                } else {
                  onSendMessage();
                }
              }
            }}
            placeholder={isRTL ? "اكتب رسالة..." : "Write a message..."}
            className="w-full business-bg-clear border-none focus:ring-0 business-text-strong business-placeholder-muted leading-relaxed outline-none"
          />
          <Smile
            size={20}
            className={`business-text-subtle cursor-pointer business-hover-muted ${
              isRTL ? "mr-2" : "ml-2"
            }`}
          />
        </div>

        {inputText.trim() || editingMessage ? (
          <button
            onClick={() =>
              editingMessage ? onEditMessage(editingMessage) : onSendMessage()
            }
            className="p-3 business-bg-primary-solid business-text-on-accent rounded-full shadow-lg business-hover-primary-soft0 active:scale-95 transition-all flex items-center justify-center transform"
          >
            <Send size={20} className={isRTL ? "mr-0.5" : "ml-0.5"} />
          </button>
        ) : (
          <button
            className="p-3 business-bg-soft-strong business-text-muted rounded-full business-hover-soft transition-colors"
            title={
              isRTL ? "رسالة صوتية (قريباً)" : "Record Voice (Coming Soon)"
            }
          >
            <Mic size={24} />
          </button>
        )}
      </div>
    </div>
  );
};
