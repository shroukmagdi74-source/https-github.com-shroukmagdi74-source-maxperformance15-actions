import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Bot, Pencil, Pin, Radio, Smile } from "lucide-react";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import api from "../../../services/api";
import { cn } from "@/lib/utils";
import { buildWhatsAppMediaUrl } from "../utils/mediaUrl";
import WhatsAppReactionSelector from "./WhatsAppReactionSelector";

import {
  type MessageBubbleProps,
  shouldShowDateSeparator,
  MessageDateSeparator,
  MessageStatusIcon,
  MessageReactionsPill,
  MessageCorrectionEditor,
  MessageMediaLightbox,
  MessageContentRenderer,
  useMessageReactions,
} from "./message-bubble";

export type { MessageBubbleProps };

const MessageBubble: React.FC<MessageBubbleProps> = React.memo(
  ({
    message,
    previousMessage,
    isGroup,
    sessionId,
    onContextMenu,
    getParticipantName,
    onQuotedMessageClick,
    onCorrect,
    highlighted,
    onReaction,
    currentUserId,
  }) => {
    const { t } = useTranslation();
    const senderName = message.fromMe && message.senderName ? message.senderName : null;

    const {
      reactionCounts,
      totalReactionCount,
      myReaction,
      reactorDescriptions,
      showReactionSelector,
      setShowReactionSelector,
      reactionTriggerRef,
      pillRef,
      activeTriggerRef,
      setActiveTriggerRef,
    } = useMessageReactions({ message, currentUserId, isGroup, getParticipantName });

    // ── AI Correction State ──
    const [isEditing, setIsEditing] = useState(false);
    const [correctionText, setCorrectionText] = useState("");
    const [saving, setSaving] = useState(false);
    const isAI = message.fromMe && message.isAIResponse;

    // ── Copy Code State ──
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // ── Media Preview Lightbox State ──
    const [previewOpen, setPreviewOpen] = useState(false);

    const effectiveMediaUrl = useMemo(() => {
      if (message.mediaUrl) {
        return buildWhatsAppMediaUrl(message.mediaUrl, message.id);
      }
      if (message.interactiveData) {
        try {
          const interactive =
            typeof message.interactiveData === "string"
              ? JSON.parse(message.interactiveData)
              : message.interactiveData;
          const headerParam = Array.isArray(interactive?.components)
            ? interactive.components.find((c: any) => String(c?.type || "").toUpperCase() === "HEADER")?.parameters?.[0]
            : null;
          if (headerParam?.image?.link) {
            return buildWhatsAppMediaUrl(headerParam.image.link, message.id);
          }
          if (headerParam?.image?.id && message.id) {
            return buildWhatsAppMediaUrl(`meta-media:${headerParam.image.id}`, message.id);
          }
        } catch {}
      }
      return null;
    }, [message.mediaUrl, message.interactiveData, message.id]);

    const handleCopyCode = (code: string) => {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`تم نسخ الكود: ${code}`);
      setTimeout(() => setCopiedCode(null), 2000);
    };

    const isPinned = Boolean(
      typeof message.metadata === "string"
        ? message.metadata.includes('"isPinned":true')
        : message.metadata?.isPinned
    );

    const submitCorrection = async () => {
      if (!correctionText.trim() || !sessionId) return;
      try {
        setSaving(true);
        await api.post(`/whatsapp/messages/${encodeURIComponent(message.messageId)}/correct`, {
          sessionId,
          correction: correctionText,
        });
        tToast.success("MessageBubble.msg_fbfd");
        setIsEditing(false);
        setCorrectionText("");
        onCorrect?.();
      } catch (err: any) {
        console.error("Correction failed:", err);
        toast.error(err?.response?.data?.error || "فشل تصحيح الرد");
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="w-full px-space-2 py-space-0">
        {shouldShowDateSeparator(message, previousMessage) ? (
          <MessageDateSeparator timestamp={message.timestamp} />
        ) : null}

        <div
          className={cn(
            "group/bubble relative flex w-full items-center px-space-1",
            message.fromMe ? "justify-end" : "justify-start"
          )}
        >
          {onReaction && (
            <div className="relative flex-shrink-0">
              <button
                type="button"
                ref={reactionTriggerRef}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveTriggerRef(reactionTriggerRef);
                  setShowReactionSelector((prev) => !prev);
                }}
                aria-label={t("whatsapp.reactions.add", "إضافة تفاعل")}
                title={t("whatsapp.reactions.add", "إضافة تفاعل")}
                className={cn(
                  "flex size-7 items-center justify-center rounded-full transition-all duration-150 active:scale-90 border",
                  showReactionSelector || myReaction
                    ? "opacity-100"
                    : "opacity-0 group-hover/bubble:opacity-100 focus:opacity-100",
                  myReaction
                    ? "text-amber-600 bg-amber-100 border-amber-300 dark:bg-amber-950/60 dark:border-amber-800/80 dark:text-amber-400"
                    : "text-[color:var(--color-muted-foreground)] hover:bg-[var(--whatsapp-surface-hover)] hover:text-[color:var(--color-foreground)] border-transparent",
                  message.fromMe ? "order-first me-1" : "order-last ms-1"
                )}
              >
                <Smile size={16} strokeWidth={2.2} />
              </button>
            </div>
          )}

          <div
            className={cn(
              "wa-bubble wa-bubble-enter relative min-w-[5rem] cursor-context-menu rounded-xl px-space-2 py-space-1 shadow-xs sm:px-space-3 sm:py-space-2",
              "border border-transparent",
              message.fromMe
                ? "rounded-tr-[6px] bg-[var(--whatsapp-message-outgoing)] text-[var(--whatsapp-message-outgoing-text)]"
                : "rounded-tl-[6px] bg-[var(--whatsapp-message-incoming)] text-[var(--whatsapp-message-incoming-text)]",
              highlighted && "wa-highlight",
              totalReactionCount > 0 && "mb-2.5"
            )}
            onContextMenu={(event) => onContextMenu(event, message)}
          >
            {isGroup && !message.fromMe && (message.participant || message.participantName) ? (
              <p className="mb-1 text-xs font-semibold text-[color:var(--color-secondary)]">
                {message.participantName || getParticipantName(message.participant!)}
              </p>
            ) : null}

            {message.quotedMessageId ? (
              <div
                className="mb-2 cursor-pointer rounded-xl border border-[color:color-mix(in_srgb,var(--shell-control-border)_72%,transparent)] bg-[var(--whatsapp-surface-muted)] px-3 py-2 transition-colors hover:bg-primary/8"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuotedMessageClick?.(message.quotedMessageId!);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    onQuotedMessageClick?.(message.quotedMessageId!);
                  }
                }}
                role="button"
                tabIndex={0}
                title={t("whatsapp.window.goToMessage") || "Go to message"}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-primary)]">
                  {t("whatsapp.window.replyingTo")}
                </p>
                <p className="mt-1 truncate text-xs text-[color:var(--color-muted-foreground)]">
                  {message.quotedContent || t("whatsapp.window.message")}
                </p>
              </div>
            ) : null}

            {isPinned ? (
              <div className="mb-1 inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                <Pin className="size-3" />
                <span>مثبتة</span>
              </div>
            ) : null}

            {message.fromMe && message.metadata?.isBroadcast ? (
              <div className="mb-1 flex items-center gap-1.5">
                <div className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-sky-600/10 to-blue-600/10 px-1.5 py-0.5 text-[11px] font-medium text-sky-700 dark:from-sky-400/20 dark:to-blue-400/20 dark:text-sky-300">
                  <Radio className="size-3" />
                  <span>Broadcast</span>
                </div>
              </div>
            ) : null}

            {isAI ? (
              <div className="mb-1 flex items-center justify-between gap-1.5">
                <div className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-purple-600/10 to-violet-600/10 px-1.5 py-0.5 text-[11px] font-medium text-purple-700 dark:from-purple-400/20 dark:to-violet-400/20 dark:text-purple-300">
                  <Bot className="size-3" />
                  <span>AI</span>
                </div>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                      setCorrectionText(message.content || "");
                    }}
                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-purple-600 transition-colors hover:bg-purple-500/10 dark:text-purple-300 dark:hover:bg-purple-400/10"
                  >
                    <Pencil className="size-2.5" />
                    <span>تصحيح الرد</span>
                  </button>
                )}
              </div>
            ) : senderName ? (
              <p className="mb-1 text-xs font-semibold text-[color:var(--color-primary)]">
                {senderName}
              </p>
            ) : null}

            <MessageContentRenderer
              message={message}
              effectiveMediaUrl={effectiveMediaUrl}
              onOpenPreview={() => setPreviewOpen(true)}
              copiedCode={copiedCode}
              onCopyCode={handleCopyCode}
            />

            <div className="mt-1 flex items-center justify-end gap-1.5">
              <span className="text-[11px] text-[color:var(--color-muted-foreground)]">
                {format(new Date(message.timestamp), "HH:mm")}
              </span>
              {message.fromMe ? <MessageStatusIcon status={message.status} /> : null}
            </div>

            <MessageReactionsPill
              reactionCounts={reactionCounts}
              totalReactionCount={totalReactionCount}
              myReaction={myReaction}
              reactorDescriptions={reactorDescriptions}
              isFromMe={message.fromMe}
              pillRef={pillRef}
              onPillClick={(e) => {
                e.stopPropagation();
                if (onReaction && myReaction) {
                  onReaction(message.messageId, myReaction);
                } else {
                  setActiveTriggerRef(pillRef);
                  setShowReactionSelector((prev) => !prev);
                }
              }}
              onPillKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  if (onReaction && myReaction) {
                    onReaction(message.messageId, myReaction);
                  } else {
                    setActiveTriggerRef(pillRef);
                    setShowReactionSelector((prev) => !prev);
                  }
                }
              }}
            />
          </div>

          {showReactionSelector && (
            <WhatsAppReactionSelector
              triggerRef={activeTriggerRef}
              currentReaction={myReaction || undefined}
              onSelect={(emoji) => {
                if (onReaction) onReaction(message.messageId, emoji);
                setShowReactionSelector(false);
              }}
              onClose={() => setShowReactionSelector(false)}
            />
          )}
        </div>

        <MessageCorrectionEditor
          isEditing={isEditing}
          isAI={Boolean(isAI)}
          isFromMe={message.fromMe}
          correctionText={correctionText}
          setCorrectionText={setCorrectionText}
          saving={saving}
          onCancel={() => {
            setIsEditing(false);
            setCorrectionText("");
          }}
          onSubmit={submitCorrection}
        />

        <MessageMediaLightbox
          isOpen={previewOpen}
          mediaUrl={effectiveMediaUrl}
          mediaType={message.messageType || message.mediaType}
          mediaFileName={message.mediaFileName}
          content={message.content}
          onClose={() => setPreviewOpen(false)}
        />
      </div>
    );
  }
);

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;
