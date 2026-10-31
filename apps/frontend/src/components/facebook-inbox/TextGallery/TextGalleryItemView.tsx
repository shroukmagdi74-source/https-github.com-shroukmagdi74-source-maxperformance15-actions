import React from "react";
import {
  SavedText,
  headingStyle,
  mutedStyle,
  primaryStyle,
  warningStyle,
  dangerStyle,
} from "./types";

interface TextGalleryItemViewProps {
  text: SavedText;
  onSelectText: (text: { content: string; imageUrls?: string[] }) => void;
  onInsertText?: (content: string) => void;
  onClose: () => void;
  onStartEditing: (text: SavedText, e: React.MouseEvent) => void;
  onTogglePin: (textId: string, e: React.MouseEvent) => void;
  onDelete: (textId: string, e: React.MouseEvent) => void;
  pinning: boolean;
  deleting: boolean;
}

export const TextGalleryItemView: React.FC<TextGalleryItemViewProps> = ({
  text,
  onSelectText,
  onInsertText,
  onClose,
  onStartEditing,
  onTogglePin,
  onDelete,
  pinning,
  deleting,
}) => {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          {text.isPinned && (
            <svg
              className="h-4 w-4 shrink-0"
              style={warningStyle}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-label="مثبت"
            >
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          )}
          <h5 className="font-semibold truncate" style={headingStyle}>
            {text.title || "بدون عنوان"}
          </h5>
        </div>

        {text.content && (
          <p
            className="line-clamp-3 whitespace-pre-wrap text-sm"
            style={mutedStyle}
          >
            {text.content}
          </p>
        )}

        {text.imageUrls && text.imageUrls.length > 0 && (
          <div className="flex gap-2 mt-2">
            {text.imageUrls.slice(0, 4).map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                className="h-12 w-12 rounded border object-cover"
                style={{ borderColor: "var(--business-card-border)" }}
              />
            ))}
            {text.imageUrls.length > 4 && (
              <div
                className="flex h-12 w-12 items-center justify-center rounded border text-xs font-semibold tabular-nums"
                style={{
                  background:
                    "color-mix(in srgb, var(--color-foreground) 10%, var(--color-background))",
                  borderColor: "var(--business-card-border)",
                  color: "var(--color-muted-foreground)",
                }}
              >
                +{text.imageUrls.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Action buttons: Insert & Direct Send */}
        <div
          className="mt-3 pt-2.5 flex items-center justify-between gap-2 border-t flex-wrap"
          style={{ borderColor: "var(--business-card-border)" }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {onInsertText && text.content && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onInsertText(text.content);
                  onClose();
                }}
                className="business-chip-button px-3 py-1.5 text-xs flex items-center gap-1.5 font-medium transition-all hover:scale-[1.02]"
                style={{
                  background:
                    "color-mix(in srgb, var(--color-primary) 14%, var(--color-background))",
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 28%, transparent)",
                  color: "var(--color-primary)",
                }}
                title="إدراج النص في صندوق الكتابة لتخصيصه قبل الإرسال"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span>إدراج في الرسالة</span>
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectText({
                  content: text.content,
                  ...(text.imageUrls && {
                    imageUrls: text.imageUrls,
                  }),
                });
              }}
              className="business-chip-button px-3 py-1.5 text-xs flex items-center gap-1.5 font-medium transition-all hover:scale-[1.02]"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                borderColor: "transparent",
                color: "white",
              }}
              title="إرسال مباشر للعميل الآن"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              <span>إرسال مباشر</span>
            </button>
          </div>

          <span className="text-[11px] tabular-nums" style={mutedStyle}>
            {text.imageUrls && text.imageUrls.length > 0
              ? `نص + ${text.imageUrls.length} صور`
              : "نص فقط"}
          </span>
        </div>
      </div>

      <div className="mr-2 flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
        <button
          type="button"
          onClick={(e) => onTogglePin(text.id, e)}
          disabled={pinning}
          className="business-icon-button business-icon-button--sm"
          style={text.isPinned ? warningStyle : mutedStyle}
          title={text.isPinned ? "إلغاء التثبيت" : "تثبيت"}
          aria-label={text.isPinned ? "إلغاء التثبيت" : "تثبيت"}
        >
          <svg
            className="w-4 h-4"
            fill={text.isPinned ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={(e) => onStartEditing(text, e)}
          className="business-icon-button business-icon-button--sm"
          style={primaryStyle}
          title="تعديل"
          aria-label="تعديل"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={(e) => onDelete(text.id, e)}
          disabled={deleting}
          className="business-icon-button business-icon-button--sm"
          style={dangerStyle}
          title="حذف"
          aria-label="حذف"
        >
          {deleting ? (
            <div
              className="h-4 w-4 animate-spin rounded-full border-b-2"
              style={{ borderColor: "var(--business-danger)" }}
            />
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};
