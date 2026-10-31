import React from "react";
import { buildProxyImageUrl } from "@/utils/imageUrl";
import VoiceNotePlayer from "../VoiceNotePlayer";
import { formatFileSize } from "./mediaUtils";

export interface MediaAttachmentRendererProps {
  messageId?: string;
  imageMediaUrls: string[];
  hasVideoMessage: boolean;
  videoMediaUrl: string;
  hasAudioMessage: boolean;
  audioMediaUrl: string;
  hasFileMessage: boolean;
  fileMediaUrl: string;
  messageFileLabel: string;
  fileSize?: number;
  isCustomer: boolean;
  bubbleSubtleText: string;
}

export const MediaAttachmentRenderer: React.FC<MediaAttachmentRendererProps> = ({
  messageId,
  imageMediaUrls,
  hasVideoMessage,
  videoMediaUrl,
  hasAudioMessage,
  audioMediaUrl,
  hasFileMessage,
  fileMediaUrl,
  messageFileLabel,
  fileSize,
  isCustomer,
  bubbleSubtleText,
}) => {
  return (
    <>
      {/* Image message */}
      {imageMediaUrls.length > 0 && (
        <div className="mb-2 flex flex-col gap-2">
          {imageMediaUrls.map((imageUrl, index) => (
            <img
              key={`${imageUrl}-${index}`}
              src={imageUrl}
              alt="صورة"
              loading="lazy"
              className="rounded-lg max-w-full h-auto"
              style={{ maxHeight: "300px" }}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (target.dataset.retried) {
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector(".fb-expired-img-notice")) {
                    const notice = document.createElement("div");
                    notice.className =
                      "fb-expired-img-notice flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs my-1";
                    notice.textContent = "⚠️ انتهت صلاحية عرض هذه الصورة من خوادم فيسبوك";
                    parent.appendChild(notice);
                  }
                  return;
                }
                target.dataset.retried = "true";
                if (messageId) {
                  target.src = buildProxyImageUrl(null, {
                    messageId,
                    attachmentIndex: index,
                  });
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Video message */}
      {hasVideoMessage && videoMediaUrl && (
        <div className="mb-2">
          <video
            src={videoMediaUrl}
            controls
            className="rounded-lg max-w-full h-auto"
            style={{ maxHeight: "300px" }}
          />
        </div>
      )}

      {/* Audio message */}
      {hasAudioMessage && audioMediaUrl && (
        <div className="mb-2">
          <VoiceNotePlayer
            src={audioMediaUrl}
            messageId={messageId}
            isCustomer={isCustomer}
          />
        </div>
      )}

      {/* File message */}
      {hasFileMessage && fileMediaUrl && (
        <a
          href={fileMediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2 rounded-lg mb-2"
          style={{
            background: isCustomer
              ? "color-mix(in srgb, var(--color-border) 34%, white)"
              : "rgba(255,255,255,0.2)",
          }}
        >
          <div
            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              background: isCustomer
                ? "rgba(255,255,255,0.55)"
                : "rgba(255,255,255,0.3)",
            }}
          >
            📎
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium truncate"
              style={{
                color: isCustomer ? "var(--color-foreground)" : "white",
              }}
            >
              {messageFileLabel}
            </p>
            <p className="text-xs" style={{ color: bubbleSubtleText }}>
              {formatFileSize(fileSize)}
            </p>
          </div>
          <div className="text-xs">⬇️</div>
        </a>
      )}
    </>
  );
};

export default MediaAttachmentRenderer;
