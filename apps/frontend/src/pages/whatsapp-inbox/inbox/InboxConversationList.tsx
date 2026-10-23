import React from 'react';
import { Clock, MessageSquare, ShieldAlert, Sparkles, User, XCircle } from 'lucide-react';
import { formatQueueLabel, formatWorkflowStatus } from '../queuePresentation';
import type { Conversation } from './types';

interface InboxConversationListProps {
  conversations: Conversation[];
  language: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
  previewFallback: string;
  unassignedLabel: string;
  vipLabel: string;
  formatMessageTime: (value?: string | null) => string | null;
  onSelectConversation: (id: string) => void;
}

export const InboxConversationList: React.FC<InboxConversationListProps> = ({
  conversations,
  language,
  emptyStateTitle,
  emptyStateDescription,
  previewFallback,
  unassignedLabel,
  vipLabel,
  formatMessageTime,
  onSelectConversation,
}) => {
  if (conversations.length === 0) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center p-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted/40 text-muted-foreground mb-3">
          <MessageSquare className="size-6 text-muted-foreground/60" />
        </div>
        <div className="text-sm font-semibold text-foreground">
          {emptyStateTitle}
        </div>
        <div className="mt-1 max-w-sm text-xs text-muted-foreground">
          {emptyStateDescription}
        </div>
      </div>
    );
  }

  return (
    <div className="wa-slim-scroll wa-messages-scroll min-h-0 flex-1 overflow-y-auto p-3 md:p-4 space-y-2">
      {conversations.map((conversation) => {
        const messageTime = formatMessageTime(conversation.lastMessageAt);

        return (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onSelectConversation(conversation.id)}
            className="group w-full rounded-lg border border-border/50 bg-card p-3 text-left transition hover:border-primary/40 hover:bg-muted/20 active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">
                  {conversation.customer.name}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground font-mono tabular-nums">
                  {conversation.customer.phone}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {formatQueueLabel(conversation.queueKey, conversation.status, language)}
                </span>
                {messageTime && (
                  <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                    {messageTime}
                  </span>
                )}
                {!conversation.isRead && (
                  <span className="rounded-full bg-destructive px-1.5 py-0.2 text-[10px] font-bold font-mono tabular-nums text-destructive-foreground shadow-xs">
                    {conversation.unreadCount || 1}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-2 line-clamp-1 text-xs text-muted-foreground">
              {conversation.lastMessagePreview || previewFallback}
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="rounded-md border border-border/40 bg-muted/40 px-1.5 py-0.5 text-[10px]">
                {formatWorkflowStatus(conversation.status, language)}
              </span>

              {conversation.assignedUser ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                  <User className="size-2.5" />
                  <span>{`${conversation.assignedUser.firstName} ${conversation.assignedUser.lastName}`.trim()}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="size-2.5" />
                  <span>{unassignedLabel}</span>
                </span>
              )}

              {conversation.customer.status === 'VIP' && (
                <span className="inline-flex items-center gap-1 rounded-md border border-indigo-500/20 bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="size-2.5" />
                  <span>{vipLabel}</span>
                </span>
              )}

              {conversation.window?.isOpen ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  <Clock className="size-2.5" />
                  <span>{conversation.window.remainingLabel}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-rose-600 dark:text-rose-400">
                  <XCircle className="size-2.5" />
                  <span>{conversation.window.remainingLabel}</span>
                </span>
              )}

              {conversation.flags.detectedLanguage && (
                <span className="rounded-md border border-border/40 bg-muted/20 px-1 py-0.5 text-[9px] font-mono uppercase">
                  {conversation.flags.detectedLanguage}
                </span>
              )}

              {conversation.flags.detectedCountry && (
                <span className="rounded-md border border-border/40 bg-muted/20 px-1 py-0.5 text-[9px] font-mono">
                  {conversation.flags.detectedCountry}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
