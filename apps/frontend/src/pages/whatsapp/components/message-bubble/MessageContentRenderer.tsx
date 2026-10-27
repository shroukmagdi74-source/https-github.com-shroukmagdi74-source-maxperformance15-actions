import React from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import LinkifiedText from "../../../../components/common/LinkifiedText";
import type { Message } from "../../../../hooks/useWhatsAppQueries";
import { sanitizeInteractiveUrl } from "./messageBubbleUtils";
import { TemplateMessageContent } from "./TemplateMessageContent";
import { MediaMessageContent } from "./MediaMessageContent";
import { InteractivePollContent } from "./InteractivePollContent";

export interface MessageContentRendererProps {
  message: Message;
  effectiveMediaUrl: string | null;
  onOpenPreview: () => void;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
}

export const MessageContentRenderer: React.FC<MessageContentRendererProps> = ({
  message,
  effectiveMediaUrl,
  onOpenPreview,
  copiedCode,
  onCopyCode,
}) => {
  const { t } = useTranslation();

  let interactiveButtons: { id?: string; text: string; url?: string | null; type?: string | null }[] | null = null;
  let interactiveFooter: string | null = null;
  try {
    if (message.interactiveData) {
      const parsed = JSON.parse(message.interactiveData);
      let rawButtons = parsed?.buttons;
      if (!Array.isArray(rawButtons) || rawButtons.length === 0) {
        const buttonsComponent = Array.isArray(parsed?.components)
          ? parsed.components.find((c: any) => String(c?.type || "").toUpperCase() === "BUTTONS")
          : null;
        if (buttonsComponent?.buttons && Array.isArray(buttonsComponent.buttons)) {
          rawButtons = buttonsComponent.buttons;
        }
      }
      if (Array.isArray(rawButtons) && rawButtons.length > 0) {
        interactiveButtons = rawButtons
          .map((b: any) => ({
            id: b?.id,
            text: b?.text || b?.title || b?.displayText || b?.buttonText?.displayText || "",
            url: b?.url || null,
            type: b?.type || null,
          }))
          .filter((b: { text: string }) => b.text.trim());
      }
      if ((!interactiveButtons || interactiveButtons.length === 0) && Array.isArray(parsed?.templateButtons)) {
        interactiveButtons = parsed.templateButtons
          .map((b: any) => ({
            id: b?.id,
            text: b?.text || "",
            url: b?.url || null,
            type: b?.type || null,
          }))
          .filter((b: { text: string }) => b.text.trim());
      }
      if (parsed?.footer) {
        interactiveFooter = parsed.footer;
      } else if (Array.isArray(parsed?.components)) {
        const footerComponent = parsed.components.find((c: any) => String(c?.type || "").toUpperCase() === "FOOTER");
        if (footerComponent?.text) interactiveFooter = footerComponent.text;
      }
      if (!interactiveFooter && parsed?.templateFooter) {
        interactiveFooter = parsed.templateFooter;
      }
    }
  } catch {
    interactiveButtons = null;
  }

  const renderButtonsBlock = () => {
    if (!interactiveButtons || interactiveButtons.length === 0) return null;
    return (
      <div className="mt-1.5 space-y-1.5">
        {interactiveButtons.map((btn, i) => {
          const safeUrl = sanitizeInteractiveUrl(btn.url);
          return safeUrl ? (
            <a
              key={btn.id || i}
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-[color:color-mix(in_srgb,var(--shell-control-border)_80%,transparent)] bg-[var(--whatsapp-surface-muted)] px-3 py-2 text-center text-sm font-semibold text-[color:var(--color-foreground)] transition-colors hover:bg-[var(--whatsapp-surface-hover)]"
            >
              {btn.text}
              <span className="text-[color:var(--color-muted-foreground)]">↗</span>
            </a>
          ) : (
            <div
              key={btn.id || i}
              title="زر تفاعلي مخصص للعميل للضغط عليه داخل تطبيق واتساب على هاتفه"
              className="flex items-center justify-center rounded-lg border border-[color:color-mix(in_srgb,var(--shell-control-border)_80%,transparent)] bg-[var(--whatsapp-surface-muted)] px-3 py-2 text-center text-sm font-semibold text-[color:var(--color-foreground)] select-none opacity-90 cursor-default"
            >
              {btn.text}
            </div>
          );
        })}
        {interactiveFooter ? (
          <p className="pt-0.5 text-center text-xs text-[color:var(--color-muted-foreground)]">
            {interactiveFooter}
          </p>
        ) : null}
      </div>
    );
  };

  if (message.mediaUrl === "FAILED_DOWNLOAD") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-rose-300/70 bg-rose-500/10 px-3 py-2 text-rose-800 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-200">
        <AlertTriangle className="size-4" />
        <span className="text-sm">{t("whatsapp.dialogs.failedDownload")}</span>
      </div>
    );
  }

  const normalizedMessageType = String(message.messageType || "").toUpperCase();

  if (normalizedMessageType === "TEMPLATE") {
    return (
      <TemplateMessageContent
        message={message}
        effectiveMediaUrl={effectiveMediaUrl}
        onOpenPreview={onOpenPreview}
        renderButtonsBlock={renderButtonsBlock}
      />
    );
  }

  if (message.mediaUrl) {
    return (
      <MediaMessageContent
        message={message}
        onOpenPreview={onOpenPreview}
      />
    );
  }

  const specialContent = (
    <InteractivePollContent
      message={message}
      copiedCode={copiedCode}
      onCopyCode={onCopyCode}
      renderButtonsBlock={renderButtonsBlock}
    />
  );

  if (
    message.messageType === "LOCATION" ||
    message.messageType === "BUTTONS" ||
    message.messageType === "CALL_LOG" ||
    message.messageType === "POLL" ||
    message.messageType === "INTERACTIVE"
  ) {
    return specialContent;
  }

  return (
    <LinkifiedText
      text={message.content ?? ""}
      className="block whitespace-pre-wrap text-sm leading-[1.45] text-[color:var(--color-foreground)]"
    />
  );
};
