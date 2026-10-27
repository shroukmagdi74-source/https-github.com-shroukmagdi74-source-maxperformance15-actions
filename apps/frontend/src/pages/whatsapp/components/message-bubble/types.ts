import React from "react";
import type { Message } from "../../../../hooks/useWhatsAppQueries";

export interface MessageBubbleProps {
  message: Message;
  previousMessage?: Message;
  isGroup: boolean;
  sessionId?: string;
  onContextMenu: (event: React.MouseEvent, message: Message) => void;
  getParticipantName: (jid: string) => string;
  onQuotedMessageClick?: (quotedMessageId: string) => void;
  onCorrect?: () => void;
  highlighted?: boolean;
  onReaction?: (messageId: string, emoji: string) => void;
  currentUserId?: string;
}

export interface InteractiveButton {
  id?: string;
  text: string;
  url?: string | null;
  type?: string | null;
}

export interface ReactionsInfo {
  reactionCounts: Record<string, number>;
  totalReactionCount: number;
  myReaction: string | null;
  reactorDescriptions: string[];
}
