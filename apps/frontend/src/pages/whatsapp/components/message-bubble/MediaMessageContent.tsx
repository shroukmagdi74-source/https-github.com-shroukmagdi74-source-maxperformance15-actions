import React from "react";
import { useTranslation } from "react-i18next";
import { Download, FileText } from "lucide-react";
import LinkifiedText from "../../../../components/common/LinkifiedText";
import { VoiceNotePlayer } from "../../../../components/facebook-inbox/MessageBubble/VoiceNotePlayer";
import type { Message } from "../../../../hooks/useWhatsAppQueries";
import { buildWhatsAppMediaUrl } from "../../utils/mediaUrl";

export interface MediaMessageContentProps {
  message: Message;
  onOpenPreview: () => void;
}

export const MediaMessageContent: React.FC<MediaMessageContentProps> = ({
  message,
  onOpenPreview,
}) => {
  const { t } = useTranslation();
  const fullMediaUrl = buildWhatsAppMediaUrl(message.mediaUrl!, message.id);
  const normalizedType = (message.messageType || message.mediaType || "").toUpperCase();
  const isImageOrStickerUrl =
    typeof message.mediaUrl === "string" &&
    /\.(webp|png|jpe?g|gif|svg)(\?.*)?$/i.test(message.mediaUrl);

  switch (normalizedType) {
    case "IMAGE":
      return (
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPreview();
            }}
            className="group block w-full cursor-zoom-in text-left focus:outline-hidden"
            title={t("whatsapp.media.viewImage", "عرض الصورة")}
          >
            <img
              src={fullMediaUrl}
              alt="Message media"
              loading="lazy"
              className="max-h-[12rem] max-w-full rounded-lg object-cover transition-opacity group-hover:opacity-95 sm:max-h-[18rem]"
            />
          </button>
          {message.content ? (
            <LinkifiedText
              text={message.content}
              className="block whitespace-pre-wrap text-sm leading-[1.45] text-[color:var(--color-foreground)]"
            />
          ) : null}
        </div>
      );
    case "STICKER":
      return (
        <div className="flex flex-col items-center justify-center py-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPreview();
            }}
            className="group block cursor-pointer rounded-lg p-0.5 transition-transform hover:scale-105 active:scale-95 focus:outline-hidden"
            title={t("whatsapp.media.viewSticker", "عرض الملصق")}
          >
            <img
              src={fullMediaUrl}
              alt="Sticker"
              loading="lazy"
              className="max-h-[10rem] max-w-[10rem] object-contain sm:max-h-[13rem] sm:max-w-[13rem]"
            />
          </button>
          {message.content ? (
            <LinkifiedText
              text={message.content}
              className="mt-1 block whitespace-pre-wrap text-sm leading-[1.45] text-[color:var(--color-foreground)]"
            />
          ) : null}
        </div>
      );
    case "VIDEO":
      return (
        <div className="space-y-1">
          <video
            src={fullMediaUrl}
            controls
            className="max-h-[12rem] max-w-full rounded-lg sm:max-h-[18rem]"
          />
          {message.content ? (
            <LinkifiedText
              text={message.content}
              className="block whitespace-pre-wrap text-[13px] leading-[1.35] text-[color:var(--color-foreground)]"
            />
          ) : null}
        </div>
      );
    case "AUDIO":
    case "VOICE":
      return (
        <VoiceNotePlayer
          src={fullMediaUrl}
          messageId={message.id}
          isCustomer={!message.fromMe}
        />
      );
    case "DOCUMENT":
    case "FILE":
      return (
        <div className="flex min-w-[14rem] items-center gap-3 rounded-xl border border-[color:color-mix(in_srgb,var(--shell-control-border)_70%,transparent)] bg-[var(--whatsapp-surface-muted)] px-3 py-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            <FileText className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[color:var(--color-foreground)]">
              {message.mediaFileName || "Document"}
            </p>
            <p className="text-xs text-[color:var(--color-muted-foreground)]">
              {t("common.download", "تحميل")}
            </p>
          </div>
          <a
            href={fullMediaUrl}
            target="_blank"
            rel="noreferrer"
            download
            className="inline-flex size-9 items-center justify-center rounded-full border border-[color:var(--shell-control-border)] bg-[var(--whatsapp-surface)] text-[color:var(--color-foreground)] transition-colors hover:bg-[var(--whatsapp-surface-hover)]"
          >
            <Download className="size-4" />
          </a>
        </div>
      );
    default:
      if (isImageOrStickerUrl || message.mediaMimeType?.startsWith("image/")) {
        return (
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenPreview();
              }}
              className="group block w-full cursor-zoom-in text-left focus:outline-hidden"
              title={t("whatsapp.media.viewImage", "عرض الصورة")}
            >
              <img
                src={fullMediaUrl}
                alt="Message media"
                loading="lazy"
                className="max-h-[12rem] max-w-full rounded-lg object-cover transition-opacity group-hover:opacity-95 sm:max-h-[18rem]"
              />
            </button>
            {message.content ? (
              <LinkifiedText
                text={message.content}
                className="block whitespace-pre-wrap text-sm leading-[1.45] text-[color:var(--color-foreground)]"
              />
            ) : null}
          </div>
        );
      }

      return (
        <div className="space-y-2">
          <p className="text-sm text-rose-700 dark:text-rose-200">
            {t("whatsapp.media.unsupported", "نوع وسائط غير مدعوم")}: {message.messageType}
          </p>
          <a
            href={fullMediaUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--shell-control-border)] bg-[var(--whatsapp-surface-strong)] px-3 py-2 text-sm text-[color:var(--color-foreground)] transition-colors hover:bg-[var(--whatsapp-surface-hover)]"
          >
            <Download className="size-4" />
            {t("common.download", "تحميل")}
          </a>
        </div>
      );
  }
};
