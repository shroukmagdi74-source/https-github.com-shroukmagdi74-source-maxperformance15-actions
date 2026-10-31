import React from "react";
import { FaceSmileIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { Mic } from "lucide-react";

interface MessageComposerBoxProps {
  message: string;
  messageInputRef: React.RefObject<HTMLTextAreaElement | null>;
  disabled: boolean;
  disabledReason?: string;
  isCompactMobile: boolean;
  isBusy: boolean;
  uploadingFile: boolean;
  showQuickReplies: boolean;
  showEmojiPicker: boolean;
  setShowEmojiPicker: React.Dispatch<React.SetStateAction<boolean>>;
  hasSendFile: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onStartVoiceRecording: () => void;
}

export const MessageComposerBox: React.FC<MessageComposerBoxProps> = ({
  message,
  messageInputRef,
  disabled,
  disabledReason,
  isCompactMobile,
  isBusy,
  uploadingFile,
  showQuickReplies,
  showEmojiPicker,
  setShowEmojiPicker,
  hasSendFile,
  onInputChange,
  onKeyPress,
  onStartVoiceRecording,
}) => {
  return (
    <>
      {/* Text Input Container - Takes flex-1 to maximize typing area */}
      <div className="relative min-w-0 flex-1 flex items-center">
        <textarea
          ref={messageInputRef}
          value={message}
          onChange={onInputChange}
          onKeyDown={onKeyPress}
          placeholder={
            disabled
              ? disabledReason || "يرجى إضافة رقم هاتف العميل أولاً للمراسلة..."
              : isCompactMobile
              ? "اكتب رسالة..."
              : "اكتب رسالة... (أو / للردود السريعة) - Shift+Enter لسطر جديد"
          }
          disabled={isBusy || uploadingFile || disabled}
          autoFocus={!isCompactMobile && !disabled}
          rows={1}
          className="business-chat-input w-full resize-none overflow-y-auto ps-3 pe-8 sm:pe-3 py-2 text-xs sm:text-sm md:text-base leading-relaxed disabled:opacity-50"
          style={{
            minHeight: "38px",
            maxHeight: "120px",
            height: "38px",
            ...(isBusy || uploadingFile || disabled
              ? {
                  background:
                    "var(--business-chat-input-disabled-bg, rgba(255, 255, 255, 0.05))",
                }
              : {}),
          }}
        />

        {/* Mobile Emoji Button inside input box */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          disabled={disabled}
          className="absolute end-2 top-1/2 -translate-y-1/2 sm:hidden p-1 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
          title="إيموجي"
          aria-label="إيموجي"
        >
          <FaceSmileIcon className="h-4 w-4" />
        </button>

        {/* Quick Reply Lightning Indicator */}
        {message.startsWith("/") && !showQuickReplies && !disabled && (
          <div
            className="absolute end-8 sm:end-2 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            ⚡
          </div>
        )}
      </div>

      {/* Send or Mic Button */}
      {message.trim() || !hasSendFile ? (
        <button
          type="submit"
          disabled={!message.trim() || isBusy || uploadingFile || disabled}
          className="business-chat-send-button business-chip-button relative z-10 flex h-[38px] w-[38px] sm:h-[40px] sm:w-auto flex-shrink-0 items-center justify-center gap-1.5 rounded-xl px-0 sm:px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 sm:text-base shadow-sm transition-transform active:scale-95"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
            borderColor: "transparent",
            color: "white",
          }}
          title="إرسال"
          aria-label="إرسال الرسالة"
        >
          {isBusy ? (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-t-transparent border-white sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">جاري الإرسال...</span>
            </>
          ) : (
            <>
              <PaperAirplaneIcon className="h-4 w-4 sm:h-5 sm:w-5 rtl:-scale-x-100" />
              <span className="hidden md:inline">إرسال</span>
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onStartVoiceRecording}
          disabled={isBusy || uploadingFile || disabled}
          className="business-chip-button relative z-10 flex h-[38px] w-[38px] sm:h-[40px] sm:w-[40px] flex-shrink-0 items-center justify-center rounded-xl transition-transform active:scale-95 shadow-sm text-primary hover:text-primary-foreground hover:bg-primary disabled:opacity-50"
          style={{
            background:
              "color-mix(in srgb, var(--color-primary, #3b82f6) 12%, transparent)",
          }}
          title="تسجيل رسالة صوتية"
          aria-label="تسجيل رسالة صوتية"
        >
          <Mic className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </button>
      )}
    </>
  );
};
