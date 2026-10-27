import React from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  Check,
  Copy,
  ExternalLink,
  MapPin,
  PhoneCall,
  PhoneOff,
} from "lucide-react";
import LinkifiedText from "../../../../components/common/LinkifiedText";
import type { Message } from "../../../../hooks/useWhatsAppQueries";
import { stripBaileysButtonBox } from "./messageBubbleUtils";

export interface InteractivePollContentProps {
  message: Message;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
  renderButtonsBlock: () => React.ReactNode;
}

export const InteractivePollContent: React.FC<InteractivePollContentProps> = ({
  message,
  copiedCode,
  onCopyCode,
  renderButtonsBlock,
}) => {
  const { t } = useTranslation();

  if (message.messageType === "LOCATION") {
    try {
      const location = message.content ? JSON.parse(message.content) : {};
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;

      return (
        <a
          href={mapUrl}
          target="_blank"
          rel="noreferrer"
          className="block rounded-xl border border-[color:color-mix(in_srgb,var(--shell-control-border)_70%,transparent)] bg-[var(--whatsapp-surface-muted)] px-3 py-3 transition-colors hover:bg-[var(--whatsapp-surface)]"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
              <MapPin className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                {t("whatsapp.window.location")}
              </p>
              <p className="text-sm text-[color:var(--color-muted-foreground)]">
                {location.address ||
                  location.name ||
                  `${location.latitude}, ${location.longitude}`}
              </p>
            </div>
          </div>
        </a>
      );
    } catch {
      return (
        <LinkifiedText
          text={message.content ?? ""}
          className="block whitespace-pre-wrap text-sm leading-[1.45] text-[color:var(--color-foreground)]"
        />
      );
    }
  }

  if (message.messageType === "BUTTONS") {
    const bodyText = stripBaileysButtonBox(message.content || "");
    return (
      <div className="space-y-1.5">
        {bodyText ? (
          <LinkifiedText
            text={bodyText}
            className="block whitespace-pre-wrap text-sm leading-[1.45] text-[color:var(--color-foreground)]"
          />
        ) : null}
        {renderButtonsBlock()}
      </div>
    );
  }

  if (message.messageType === "CALL_LOG") {
    let callData: any = {};
    try {
      callData = message.interactiveData ? JSON.parse(message.interactiveData) : {};
    } catch {}

    return (
      <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
          <PhoneOff className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
              درع المكالمات • مكالمة واردة تم رفضها تلقائياً
            </span>
            {callData.isVideo ? (
              <span className="rounded bg-amber-200/60 px-1 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                فيديو
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-[11px] text-amber-700/90 dark:text-amber-300/80">
            {callData.autoReplied ? "تم إرسال رسالة التوضيح التلقائية للعميل بنجاح" : "تم رفض المكالمة لمنع الإزعاج"}
          </p>
        </div>
      </div>
    );
  }

  if (message.messageType === "POLL") {
    let pollInfo: any = {};
    try {
      pollInfo = message.interactiveData ? JSON.parse(message.interactiveData) : {};
    } catch {}

    const question = pollInfo.name || message.content || "استطلاع رأي";
    const options: string[] = pollInfo.values || [];
    const votes: { name: string; voters?: string[] }[] = pollInfo.votes || [];
    const isMultiple = pollInfo.selectableCount === 0 || pollInfo.selectableCount > 1;
    const totalVotes = votes.reduce((acc, v) => acc + (v.voters?.length || 0), 0);

    return (
      <div className="min-w-[16rem] max-w-sm space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="size-4 text-[color:var(--color-primary)]" />
            <span className="text-xs font-semibold text-[color:var(--color-muted-foreground)]">
              استطلاع رأي {isMultiple ? "• اختيارات متعددة" : "• اختيار واحد"}
            </span>
          </div>
          {totalVotes > 0 ? (
            <span className="rounded-full bg-[color:var(--whatsapp-surface-muted)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--color-muted-foreground)]">
              {totalVotes} {totalVotes === 1 ? "صوت" : totalVotes === 2 ? "صوتان" : "أصوات"}
            </span>
          ) : null}
        </div>

        <h4 className="text-sm font-bold text-[color:var(--color-foreground)]">
          {question}
        </h4>

        <div className="space-y-2">
          {options.map((optName, idx) => {
            const optVoteObj = votes.find((v) => v.name?.trim().toLowerCase() === optName?.trim().toLowerCase());
            const optVoteCount = optVoteObj?.voters?.length || 0;
            const percentage = totalVotes > 0 ? Math.round((optVoteCount / totalVotes) * 100) : 0;

            return (
              <div
                key={idx}
                className="relative overflow-hidden rounded-xl border border-[color:var(--shell-control-border)] bg-[var(--whatsapp-surface-muted)] p-2.5 transition-all"
              >
                {totalVotes > 0 && percentage > 0 ? (
                  <div
                    className="absolute inset-y-0 start-0 bg-[color:var(--color-primary)]/15 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                ) : null}

                <div className="relative flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 font-medium text-[color:var(--color-foreground)]">
                    <span className="flex size-4 items-center justify-center rounded-full border border-[color:var(--shell-control-border)] text-[10px] text-[color:var(--color-muted-foreground)]">
                      {idx + 1}
                    </span>
                    <span>{optName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[color:var(--color-muted-foreground)]">
                    {totalVotes > 0 ? (
                      <>
                        <span className="tabular-nums font-mono">{percentage}%</span>
                        <span className="text-[10px] opacity-75 tabular-nums">({optVoteCount})</span>
                      </>
                    ) : (
                      <span className="text-[10px] opacity-60">0 أصوات</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (message.messageType === "INTERACTIVE") {
    let interactiveDataObj: any = {};
    try {
      interactiveDataObj = message.interactiveData ? JSON.parse(message.interactiveData) : {};
    } catch {}

    const title = interactiveDataObj.title || "";
    const body = interactiveDataObj.text || message.content || "";
    const footer = interactiveDataObj.footer || "";
    const buttons: any[] = interactiveDataObj.buttons || [];

    return (
      <div className="min-w-[16rem] max-w-sm space-y-2">
        {title ? (
          <h4 className="text-sm font-bold text-[color:var(--color-foreground)]">{title}</h4>
        ) : null}
        {body ? (
          <LinkifiedText
            text={body}
            className="block whitespace-pre-wrap text-sm leading-[1.45] text-[color:var(--color-foreground)]"
          />
        ) : null}
        {footer ? (
          <p className="text-xs text-[color:var(--color-muted-foreground)]">{footer}</p>
        ) : null}

        {buttons.length > 0 ? (
          <div className="mt-2 space-y-1.5 pt-1 border-t border-[color:var(--shell-control-border)]/60">
            {buttons.map((btn, i) => {
              const bType = btn.type || (btn.name ? btn.name.replace("cta_", "") : "quick_reply");
              const displayText = btn.displayText || btn.text || btn.params?.display_text || "زر";
              const code = btn.code || btn.copyCode || btn.params?.copy_code;
              const url = btn.url || btn.params?.url;
              const phone = btn.phoneNumber || btn.phone || btn.params?.phone_number;

              if (bType === "copy" || btn.name === "cta_copy" || code) {
                const isCopied = copiedCode === code;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onCopyCode(code || displayText)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-center text-xs font-bold text-sky-700 transition-colors hover:bg-sky-500/20 dark:text-sky-300"
                  >
                    {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    <span>{displayText} {code ? `(${code})` : ""}</span>
                  </button>
                );
              }

              if (bType === "url" || btn.name === "cta_url" || url) {
                return (
                  <a
                    key={i}
                    href={url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[color:var(--shell-control-border)] bg-[var(--whatsapp-surface-muted)] px-3 py-2 text-center text-xs font-bold text-[color:var(--color-foreground)] transition-colors hover:bg-[var(--whatsapp-surface-hover)]"
                  >
                    <ExternalLink className="size-3.5 text-[color:var(--color-muted-foreground)]" />
                    <span>{displayText}</span>
                  </a>
                );
              }

              if (bType === "call" || btn.name === "cta_call" || phone) {
                return (
                  <a
                    key={i}
                    href={`tel:${phone || ""}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-center text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-500/20 dark:text-emerald-300"
                  >
                    <PhoneCall className="size-3.5" />
                    <span>{displayText} {phone ? `(${phone})` : ""}</span>
                  </a>
                );
              }

              return (
                <div
                  key={i}
                  className="flex w-full items-center justify-center rounded-xl border border-[color:var(--shell-control-border)] bg-[var(--whatsapp-surface-muted)] px-3 py-2 text-center text-xs font-bold text-[color:var(--color-foreground)]"
                >
                  {displayText}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }

  return null;
};
