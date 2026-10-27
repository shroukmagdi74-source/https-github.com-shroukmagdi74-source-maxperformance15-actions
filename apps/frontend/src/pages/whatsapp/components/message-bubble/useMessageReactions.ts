import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Message } from "../../../../hooks/useWhatsAppQueries";

interface UseMessageReactionsOptions {
  message: Message;
  currentUserId?: string;
  isGroup: boolean;
  getParticipantName: (jid: string) => string;
}

export function useMessageReactions({
  message,
  currentUserId,
  isGroup,
  getParticipantName,
}: UseMessageReactionsOptions) {
  const { t } = useTranslation();

  const reactions = useMemo(() => {
    let r: Record<string, string> = {};
    if (message.reactions && typeof message.reactions === "object" && !Array.isArray(message.reactions)) {
      r = { ...message.reactions };
    } else if (message.metadata) {
      try {
        const meta = typeof message.metadata === "string" ? JSON.parse(message.metadata) : message.metadata;
        if (meta?.reactions && typeof meta.reactions === "object" && !Array.isArray(meta.reactions)) {
          r = { ...meta.reactions };
        }
      } catch {}
    }
    return r;
  }, [message.reactions, message.metadata]);

  const { reactionCounts, totalReactionCount, myReaction, reactorDescriptions } = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    let mine: string | null = null;
    const descriptions: string[] = [];

    Object.entries(reactions).forEach(([reactorKey, emoji]) => {
      if (typeof emoji === "string" && emoji.trim()) {
        const em = emoji.trim();
        counts[em] = (counts[em] || 0) + 1;
        total++;
        const isMe = reactorKey === "me" || reactorKey === "fromMe" || (currentUserId && reactorKey === currentUserId);
        if (isMe) {
          mine = em;
          descriptions.push(`${t("whatsapp.reactions.you", "أنت")}: ${em}`);
        } else {
          const name = isGroup && reactorKey.includes("@")
            ? getParticipantName(reactorKey)
            : t("whatsapp.reactions.contact", "العميل");
          descriptions.push(`${name}: ${em}`);
        }
      }
    });

    return {
      reactionCounts: counts,
      totalReactionCount: total,
      myReaction: mine,
      reactorDescriptions: descriptions,
    };
  }, [reactions, currentUserId, isGroup, getParticipantName, t]);

  const [showReactionSelector, setShowReactionSelector] = useState(false);
  const reactionTriggerRef = useRef<HTMLButtonElement | null>(null);
  const pillRef = useRef<HTMLDivElement | null>(null);
  const [activeTriggerRef, setActiveTriggerRef] = useState<React.RefObject<HTMLElement | null>>(reactionTriggerRef);

  return {
    reactions,
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
  };
}
