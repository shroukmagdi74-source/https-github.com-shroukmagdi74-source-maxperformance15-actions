import React from 'react';
import {
  Archive,
  Check,
  Clock,
  Pin,
  VolumeX,
  XCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getInboxExternalImageUrl } from '@/utils/imageUrl';
import { getContactInitials } from '../../whatsappContactDisplay';
import {
  extractOrderCode,
  formatTime,
  getLastMessagePreview,
  getPreviewWithoutOrderCode,
  HighlightedText,
} from './snippetUtils';
import type { Contact } from '../../../../hooks/useWhatsAppQueries';

interface ChatSidebarConversationItemProps {
  contact: Contact;
  contactName: string;
  isSelected: boolean;
  multiSelectMode: boolean;
  isSelectedInMulti: boolean;
  swipedContactId: string | null;
  swipeOffset: number;
  searchTerm: string;
  labelsMap: Map<string, { name: string; color: string }>;
  onSelectContact: (contact: Contact) => void;
  onToggleSelectJid: (jid: string) => void;
  onArchiveChat: (contact: Contact) => void;
  onContextMenu: (e: React.MouseEvent, contact: Contact) => void;
  onTouchStart?: (e: React.TouchEvent, contactId: string) => void;
  onTouchMove?: (e: React.TouchEvent, contactId: string) => void;
  onTouchEnd?: (e: React.TouchEvent, contact: Contact) => void;
  onClearSwipe: () => void;
  translate: (key: string) => string;
  isRtl: boolean;
}

export const ChatSidebarConversationItem: React.FC<ChatSidebarConversationItemProps> = ({
  contact,
  contactName,
  isSelected,
  multiSelectMode,
  isSelectedInMulti,
  swipedContactId,
  swipeOffset,
  searchTerm,
  labelsMap,
  onSelectContact,
  onToggleSelectJid,
  onArchiveChat,
  onContextMenu,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onClearSwipe,
  translate,
  isRtl,
}) => {
  const isSwiped = swipedContactId === contact.id;

  const lastMessageContent = contact.lastMessage?.content;
  const orderCode = extractOrderCode(lastMessageContent);
  const isContentSearchResult = Boolean(searchTerm.trim() && contact.matchedMessage?.content);
  const searchPreviewContent = isContentSearchResult
    ? contact.matchedMessage?.content
    : orderCode
    ? getPreviewWithoutOrderCode(lastMessageContent, orderCode)
    : getLastMessagePreview(contact);

  const previewFromMe = isContentSearchResult
    ? Boolean(contact.matchedMessage?.fromMe)
    : Boolean(contact.lastMessage?.fromMe);
  const senderPrefix = previewFromMe ? translate('whatsapp.window.you') : null;

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Swipe action reveal */}
      {!multiSelectMode && (
        <div
          className={cn(
            'absolute inset-y-0 flex items-center px-4 transition-opacity duration-150',
            isRtl
              ? 'left-0 bg-primary/20 text-[color:var(--color-primary)] rounded-l-xl'
              : 'right-0 bg-primary/20 text-[color:var(--color-primary)] rounded-r-xl',
            isSwiped ? 'opacity-100' : 'opacity-0 pointer-events-none',
          )}
          style={{ width: '80px' }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onArchiveChat(contact);
              onClearSwipe();
            }}
            className="flex h-full w-full flex-col items-center justify-center gap-1 text-[11px] font-semibold"
          >
            <Archive className="size-4" />
            <span>{contact.isArchived ? 'إلغاء' : 'أرشفة'}</span>
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          if (multiSelectMode) {
            onToggleSelectJid(contact.jid);
            return;
          }
          if (swipedContactId === contact.id) {
            onClearSwipe();
          } else {
            onSelectContact(contact);
          }
        }}
        onTouchStart={!multiSelectMode && onTouchStart ? (e) => onTouchStart(e, contact.id) : undefined}
        onTouchMove={!multiSelectMode && onTouchMove ? (e) => onTouchMove(e, contact.id) : undefined}
        onTouchEnd={!multiSelectMode && onTouchEnd ? (e) => onTouchEnd(e, contact) : undefined}
        onContextMenu={(event) => {
          event.preventDefault();
          if (multiSelectMode) return;
          onContextMenu(event, contact);
        }}
        className={cn(
          'wa-conversation-item min-h-[3.25rem] w-full border-b border-t-0 border-x-0 border-[color:color-mix(in_srgb,var(--shell-control-border)_50%,transparent)] px-3 py-1.5 text-start transition-all duration-150 sm:min-h-[3.5rem] sm:py-2 rounded-none',
          multiSelectMode && isSelectedInMulti
            ? 'bg-[color:color-mix(in_srgb,var(--color-primary)_12%,var(--color-background))]'
            : !multiSelectMode && isSelected
            ? 'bg-[color:color-mix(in_srgb,var(--color-primary)_8%,var(--color-background))]'
            : 'bg-transparent hover:bg-[var(--whatsapp-surface-hover)]',
        )}
        style={{
          transform: !multiSelectMode && isSwiped ? `translateX(${swipeOffset}px)` : 'translateX(0px)',
        }}
      >
        <div className="flex items-center gap-2.5">
          {multiSelectMode && (
            <div
              className={cn(
                'flex size-4.5 shrink-0 items-center justify-center rounded-md border transition-colors',
                isSelectedInMulti
                  ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white'
                  : 'border-[color:var(--shell-control-border)]',
              )}
            >
              {isSelectedInMulti && <Check className="size-3" />}
            </div>
          )}

          <Avatar className="size-9 sm:size-10 shrink-0">
            <AvatarImage src={getInboxExternalImageUrl(contact.profilePicUrl) || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-[color:color-mix(in_srgb,var(--color-primary)_16%,transparent)] to-[color:color-mix(in_srgb,var(--color-primary)_4%,transparent)] text-xs font-semibold text-[color:var(--color-primary)]">
              {getContactInitials(contactName)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-1.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p
                    className={cn(
                      'truncate text-xs sm:text-sm text-[color:var(--color-foreground)]',
                      contact.unreadCount > 0 && 'font-semibold',
                    )}
                  >
                    {contactName}
                  </p>
                  {contact.isGroup && (
                    <Badge
                      variant="outline"
                      className="border-[color:var(--shell-control-border)] bg-[var(--whatsapp-surface-overlay)] px-1 text-[8px] uppercase text-[color:var(--color-muted-foreground)]"
                    >
                      G
                    </Badge>
                  )}
                  {contact.isNewsletter && (
                    <Badge
                      variant="outline"
                      className="border-[color:var(--shell-control-border)] bg-[var(--whatsapp-surface-overlay)] px-1 text-[8px] uppercase text-[color:var(--color-muted-foreground)]"
                    >
                      {translate('whatsapp.window.channel')}
                    </Badge>
                  )}
                  {contact.labels && contact.labels.length > 0 && (
                    <div className="flex -space-x-1 rtl:space-x-reverse">
                      {contact.labels.slice(0, 3).map((labelId) => {
                        const labelDef = labelsMap.get(labelId);
                        return labelDef ? (
                          <span
                            key={labelId}
                            className="inline-block size-2 rounded-full border border-background ring-1 ring-background/50"
                            style={{ backgroundColor: labelDef.color }}
                            title={labelDef.name}
                          />
                        ) : null;
                      })}
                      {contact.labels.length > 3 && (
                        <span className="text-[9px] font-mono leading-none text-[color:var(--color-muted-foreground)]">
                          +{contact.labels.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <p
                className={cn(
                  'shrink-0 text-[10px] font-mono tabular-nums',
                  contact.unreadCount > 0
                    ? 'font-medium text-[color:var(--color-primary)]'
                    : 'text-[color:var(--color-muted-foreground)]',
                )}
              >
                {formatTime(contact.lastMessageAt, translate('whatsapp.window.yesterday'))}
              </p>
            </div>

            <div className="mt-1 flex items-center justify-between gap-1.5">
              <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
                <p className="line-clamp-1 min-w-0 flex-1 text-xs leading-4 text-[color:var(--color-muted-foreground)]">
                  {senderPrefix && (
                    <span className="font-semibold text-[color:var(--color-foreground)]">
                      {senderPrefix}:{' '}
                    </span>
                  )}
                  {isContentSearchResult ? (
                    <HighlightedText text={searchPreviewContent || ''} query={searchTerm} />
                  ) : (
                    searchPreviewContent
                  )}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {contact.isPinned && (
                  <Pin className="size-3 text-[color:var(--color-muted-foreground)]" />
                )}
                {contact.isMuted && (
                  <VolumeX className="size-3 text-[color:var(--color-muted-foreground)]" />
                )}
                {contact.unreadCount > 0 && (
                  <span className="inline-flex min-w-4.5 items-center justify-center rounded-full bg-[color:var(--color-primary)] px-1 py-0.5 text-[9px] font-mono font-semibold tabular-nums text-white">
                    {contact.unreadCount}
                  </span>
                )}
                {contact.window && (
                  <span
                    className={cn(
                      'inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-medium font-mono tabular-nums',
                      contact.window.isOpen
                        ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
                    )}
                  >
                    {contact.window.isOpen ? (
                      <Clock className="size-2.5" />
                    ) : (
                      <XCircle className="size-2.5" />
                    )}
                    <span>{contact.window.remainingLabel}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};
