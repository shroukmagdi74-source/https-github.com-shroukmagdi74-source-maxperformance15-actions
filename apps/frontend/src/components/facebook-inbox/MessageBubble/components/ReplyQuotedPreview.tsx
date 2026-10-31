import React from "react";
import { ReplyReference } from "./types";
import { buildProxyImageUrl } from "@/utils/imageUrl";

export interface ReplyQuotedPreviewProps {
  replyTo: ReplyReference;
  replyToResolvedId?: string;
  replyImageUrl?: string;
  isCustomer: boolean;
  onScrollToMessage?: (messageId: string) => void;
}

export const ReplyQuotedPreview: React.FC<ReplyQuotedPreviewProps> = ({
  replyTo,
  replyToResolvedId,
  replyImageUrl,
  isCustomer,
  onScrollToMessage,
}) => {
  return (
    <div
      onClick={() => {
        if (replyToResolvedId && onScrollToMessage) {
          onScrollToMessage(replyToResolvedId);
        }
      }}
      className={`mb-2 text-xs rounded-xl p-2 flex items-center justify-between gap-2.5 transition-all ${
        replyToResolvedId && onScrollToMessage
          ? "cursor-pointer hover:opacity-90 active:scale-[0.99]"
          : ""
      }`}
      style={{
        background: isCustomer
          ? "color-mix(in srgb, var(--color-foreground) 6%, transparent)"
          : "rgba(0, 0, 0, 0.2)",
        borderInlineStart: `3px solid ${
          isCustomer ? "var(--color-primary)" : "rgba(255, 255, 255, 0.9)"
        }`,
      }}
      title={
        replyToResolvedId && onScrollToMessage
          ? "اضغط للانتقال إلى الرسالة الأصلية"
          : undefined
      }
    >
      <div className="flex-1 min-w-0">
        <div
          className="font-bold truncate mb-0.5 text-[11px]"
          style={{
            color: isCustomer ? "var(--color-primary)" : "#ffffff",
          }}
        >
          {replyTo.senderName || "موظف"}
        </div>
        <div
          className="truncate text-[11px]"
          style={{
            color: isCustomer
              ? "var(--color-muted-foreground)"
              : "rgba(255, 255, 255, 0.85)",
          }}
        >
          {replyImageUrl
            ? replyTo.content &&
              replyTo.content !== "📷 صورة" &&
              replyTo.content !== "مرفق/صورة"
              ? replyTo.content
              : "📷 صورة"
            : replyTo.type === "text"
              ? replyTo.content
              : replyTo.content || "مرفق/صورة"}
        </div>
      </div>

      {replyImageUrl && (
        <div className="relative flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 shadow-xs">
          <img
            src={replyImageUrl}
            alt="صورة مقتبسة"
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (!target.dataset.retried && replyToResolvedId) {
                target.dataset.retried = "true";
                target.src = buildProxyImageUrl(null, {
                  messageId: replyToResolvedId,
                });
                return;
              }
              target.style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ReplyQuotedPreview;
