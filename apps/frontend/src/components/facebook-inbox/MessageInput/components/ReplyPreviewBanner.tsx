import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ReplyPreviewBannerProps {
  replyTo: any;
  onCancelReply?: () => void;
}

export const ReplyPreviewBanner: React.FC<ReplyPreviewBannerProps> = ({
  replyTo,
  onCancelReply,
}) => {
  if (!replyTo) return null;

  return (
    <div
      className="flex justify-between items-center text-xs sm:text-sm px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2"
      style={{
        background:
          "var(--business-surface-subtle, color-mix(in srgb, var(--color-foreground) 8%, var(--color-background)))",
        borderBottom: "1px solid var(--business-muted-line)",
      }}
    >
      <div className="flex flex-col max-w-[85%] sm:max-w-[90%] flex-1 min-w-0">
        <span
          className="font-semibold text-xs truncate"
          style={{ color: "var(--color-primary)" }}
        >
          الرد على {replyTo.senderName || replyTo.sender_name || "رسالة"}:
        </span>
        <span
          className="truncate text-xs"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {replyTo.content ||
            replyTo.text ||
            replyTo.message ||
            (replyTo.type === "image"
              ? "🖼️ صورة"
              : replyTo.type === "file"
              ? "📎 ملف"
              : "رسالة")}
        </span>
      </div>
      <button
        type="button"
        onClick={onCancelReply}
        aria-label="إلغاء الرد"
        className="business-chip-button p-1 sm:p-1.5 rounded-full flex-shrink-0"
      >
        <XMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </div>
  );
};
