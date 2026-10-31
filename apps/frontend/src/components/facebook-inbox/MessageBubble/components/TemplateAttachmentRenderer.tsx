import React from "react";
import { getInboxExternalImageUrl } from "@/utils/imageUrl";
import { MessageAttachment } from "./types";

export interface TemplateAttachmentRendererProps {
  messageId?: string;
  attachments: MessageAttachment[];
  isCustomer: boolean;
}

export const TemplateAttachmentRenderer: React.FC<TemplateAttachmentRendererProps> = ({
  messageId,
  attachments,
  isCustomer,
}) => {
  return (
    <div className="mb-2 flex flex-col gap-2">
      {attachments.map((att, i) => {
        // Skip standard media handled by MediaAttachmentRenderer
        if (att.type === "image" || att.type === "IMAGE") return null;
        if (att.type === "video" || att.type === "VIDEO") return null;
        if (att.type === "audio" || att.type === "AUDIO") return null;

        // Generic template
        if (att.payload && att.payload.template_type === "generic") {
          return (
            <div
              key={i}
              className="flex flex-col gap-2 overflow-hidden rounded-lg border"
              style={{
                borderColor: isCustomer
                  ? "var(--business-card-border)"
                  : "rgba(255,255,255,0.2)",
              }}
            >
              {att.payload.elements?.map((el, j) => (
                <div
                  key={j}
                  className="p-2"
                  style={{
                    background: isCustomer
                      ? "var(--business-bubble-card-bg, rgba(255, 255, 255, 0.06))"
                      : "rgba(0,0,0,0.12)",
                  }}
                >
                  {el.image_url && (
                    <img
                      src={getInboxExternalImageUrl(el.image_url, {
                        messageId,
                      })}
                      alt=""
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  {el.title && (
                    <div className="font-bold text-sm mb-1">{el.title}</div>
                  )}
                  {el.subtitle && (
                    <div className="text-xs opacity-80 mb-2">{el.subtitle}</div>
                  )}
                  <div className="flex flex-col gap-1">
                    {el.buttons?.map((btn, k) => (
                      <a
                        key={k}
                        href={btn.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center py-1.5 px-3 rounded text-xs transition-colors truncate"
                        style={{
                          background: isCustomer
                            ? "var(--business-bubble-link-bg, rgba(59, 130, 246, 0.15))"
                            : "rgba(255,255,255,0.2)",
                          color: isCustomer
                            ? "var(--color-primary)"
                            : "white",
                        }}
                      >
                        {btn.title} {btn.type === "web_url" ? "🔗" : ""}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        // Button template
        if (att.payload && att.payload.template_type === "button") {
          return (
            <div key={i} className="flex flex-col gap-2">
              <div className="text-sm opacity-90 mb-1">{att.payload.text}</div>
              <div className="flex flex-col gap-1">
                {att.payload.buttons?.map((btn, k) => (
                  <a
                    key={k}
                    href={btn.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center py-1.5 px-3 rounded text-xs transition-colors truncate"
                    style={{
                      background: isCustomer
                        ? "var(--business-bubble-link-bg, rgba(59, 130, 246, 0.15))"
                        : "rgba(255,255,255,0.2)",
                      color: isCustomer
                        ? "var(--color-primary)"
                        : "white",
                    }}
                  >
                    {btn.title}
                  </a>
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

export default TemplateAttachmentRenderer;
