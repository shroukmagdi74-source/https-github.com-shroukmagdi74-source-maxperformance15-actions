import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Download, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MessageMediaLightboxProps {
  isOpen: boolean;
  mediaUrl: string | null;
  mediaType?: string | null;
  mediaFileName?: string | null;
  content?: string | null;
  onClose: () => void;
}

export const MessageMediaLightbox: React.FC<MessageMediaLightboxProps> = ({
  isOpen,
  mediaUrl,
  mediaType,
  mediaFileName,
  content,
  onClose,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mediaUrl || typeof document === "undefined") {
    return null;
  }

  const isSticker = String(mediaType || "").toUpperCase() === "STICKER";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in-0 duration-150"
      onClick={onClose}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
    >
      {/* Top action bar */}
      <div
        className="absolute top-4 inset-x-4 flex items-center justify-between text-white z-10 px-2 sm:px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white/90">
            {isSticker
              ? t("whatsapp.media.sticker", "ملصق")
              : mediaFileName || t("whatsapp.media.image", "صورة")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={mediaUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
            title={t("whatsapp.media.openNewTab", "فتح في صفحة جديدة")}
          >
            <ExternalLink className="size-4" />
          </a>
          <a
            href={mediaUrl}
            download={mediaFileName || (isSticker ? "sticker.webp" : "image")}
            className="inline-flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
            title={t("common.download", "تحميل")}
          >
            <Download className="size-4" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
            title={t("common.close", "إغلاق")}
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Media container */}
      <div
        className="relative flex max-h-[85vh] max-w-[92vw] items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={mediaUrl}
          alt={mediaFileName || "Preview"}
          className={cn(
            "max-h-[82vh] max-w-[90vw] select-none rounded-lg object-contain shadow-2xl",
            isSticker && "max-h-[60vh] max-w-[60vw]"
          )}
        />
      </div>

      {content ? (
        <div
          className="mt-3 max-w-xl rounded-xl bg-black/60 px-4 py-2 text-center text-sm text-white/90 backdrop-blur-xs"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      ) : null}
    </div>,
    document.body
  );
};
