import React from "react";
import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";
import LinkifiedText from "../../../../components/common/LinkifiedText";
import type { Message } from "../../../../hooks/useWhatsAppQueries";

export interface TemplateMessageContentProps {
  message: Message;
  effectiveMediaUrl: string | null;
  onOpenPreview: () => void;
  renderButtonsBlock: () => React.ReactNode;
}

export const TemplateMessageContent: React.FC<TemplateMessageContentProps> = ({
  message,
  effectiveMediaUrl,
  onOpenPreview,
  renderButtonsBlock,
}) => {
  const { t } = useTranslation();

  let templateName = "";
  let bodyContent = message.content || "";
  try {
    const interactive = message.interactiveData ? JSON.parse(message.interactiveData) : null;
    if (interactive?.templateName) templateName = interactive.templateName;
    if (!templateName && bodyContent.startsWith("Template: ")) {
      templateName = bodyContent.replace("Template: ", "").trim();
    }
    if (templateName && bodyContent.startsWith(templateName + "\n")) {
      bodyContent = bodyContent.slice(templateName.length).trim();
    }
    if ((!bodyContent || bodyContent === `Template: ${templateName}` || bodyContent === templateName) && interactive?.templateBody) {
      bodyContent = interactive.templateBody;
    }
  } catch {}

  const isFallbackText = templateName ? (bodyContent === `Template: ${templateName}` || bodyContent === templateName) : false;
  const showBodyText = Boolean(bodyContent && !isFallbackText);

  const isVideoHeader =
    message.mediaType === "video" ||
    message.mediaMimeType?.startsWith("video/") ||
    /\.(mp4|mov|webm)(\?.*)?$/i.test(effectiveMediaUrl || "");
  const isDocumentHeader =
    message.mediaType === "document" ||
    message.mediaType === "file" ||
    message.mediaMimeType?.startsWith("application/") ||
    /\.(pdf|docx?|xlsx?)(\?.*)?$/i.test(effectiveMediaUrl || "");

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <FileText className="size-3.5 text-blue-600 dark:text-blue-400" />
        <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          {templateName || "Template"}
        </span>
      </div>
      {effectiveMediaUrl && (
        isVideoHeader ? (
          <video
            src={effectiveMediaUrl}
            controls
            className="max-h-[14rem] max-w-full rounded-lg"
          />
        ) : isDocumentHeader ? (
          <div className="flex min-w-[14rem] items-center gap-3 rounded-xl border border-[color:color-mix(in_srgb,var(--shell-control-border)_70%,transparent)] bg-[var(--whatsapp-surface-muted)] px-3 py-2">
            <FileText className="size-5 text-rose-500" />
            <span className="truncate text-xs font-medium text-[color:var(--color-foreground)]">
              {message.mediaFileName || t("whatsapp.media.document", "مستند القالب")}
            </span>
            <a
              href={effectiveMediaUrl}
              target="_blank"
              rel="noreferrer"
              download
              className="ms-auto text-xs text-primary underline"
            >
              {t("common.download", "تحميل")}
            </a>
          </div>
        ) : (
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
              src={effectiveMediaUrl}
              alt={templateName || "Template header image"}
              loading="lazy"
              className="max-h-[14rem] max-w-full rounded-lg object-cover transition-opacity group-hover:opacity-95"
            />
          </button>
        )
      )}
      {showBodyText ? (
        <LinkifiedText
          text={bodyContent}
          className="block whitespace-pre-wrap text-sm leading-[1.45] text-[color:var(--color-foreground)]"
        />
      ) : null}
      {renderButtonsBlock()}
    </div>
  );
};
