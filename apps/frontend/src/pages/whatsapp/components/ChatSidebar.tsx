import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Loader2, RefreshCw, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getBestContactDisplayName } from '../whatsappContactDisplay';
import type { Contact } from '../../../hooks/useWhatsAppQueries';
import {
  ChatSidebarContextMenu,
  ChatSidebarConversationItem,
  ChatSidebarEmptyState,
  ChatSidebarFilterBar,
  ChatSidebarHeader,
  ChatSidebarStatusesList,
  type ChatSidebarProps,
  type ContextMenuState,
} from './chat-sidebar';

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  className,
  sessions,
  conversations,
  statuses,
  selectedSession,
  selectedContact,
  currentUserProfile,
  isLoadingConversations,
  isLoadingMoreConversations,
  hasMoreConversations,
  isLoadingStatuses,
  onSelectSession,
  onSelectContact,
  onOpenProfile,
  onOpenNewChat,
  onOpenNewGroup,
  onOpenPrivacySettings,
  onOpenBusinessProfile,
  onSyncHistory,
  isSyncingHistory = false,
  onPinChat,
  onArchiveChat,
  onDeleteChat,
  onBlockContact,
  onMuteChat,
  onMarkAsRead,
  onLoadMore,
  onAddStatus,
  onOpenBroadcast,
  onOpenCheckNumber,
  onOpenLabels,
  conversationsError,
  onRetryConversations,
  onBulkDelete,
  onDeleteAll,
  labels,
  filterType,
  onFilterTypeChange,
  searchTerm,
  onSearchChange,
  showArchived,
  onToggleArchived,
  counts,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedJids, setSelectedJids] = useState<Set<string>>(new Set());

  // Swipe-to-action states for mobile
  const [swipedContactId, setSwipedContactId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const swipeTouchStartRef = useRef<number>(0);
  const swipeTouchStartYRef = useRef<number>(0);
  const isSwipingRef = useRef<boolean>(false);

  const handleSwipeTouchStart = (e: React.TouchEvent, _contactId: string) => {
    swipeTouchStartRef.current = e.touches[0]!.clientX;
    swipeTouchStartYRef.current = e.touches[0]!.clientY;
    isSwipingRef.current = true;
  };

  const handleSwipeTouchMove = (e: React.TouchEvent, contactId: string) => {
    if (!isSwipingRef.current) return;
    const diffX = e.touches[0]!.clientX - swipeTouchStartRef.current;
    const diffY = Math.abs(e.touches[0]!.clientY - swipeTouchStartYRef.current);

    if (diffY > 30 && Math.abs(diffX) < 10) {
      isSwipingRef.current = false;
      setSwipeOffset(0);
      setSwipedContactId(null);
      return;
    }

    const limit = 80;
    if (isRtl) {
      if (diffX > 0) {
        setSwipedContactId(contactId);
        setSwipeOffset(Math.min(limit, diffX));
      }
    } else {
      if (diffX < 0) {
        setSwipedContactId(contactId);
        setSwipeOffset(Math.max(-limit, diffX));
      }
    }
  };

  const handleSwipeTouchEnd = (_e: React.TouchEvent, _contact: Contact) => {
    isSwipingRef.current = false;
    const threshold = 40;
    if (isRtl) {
      if (swipeOffset > threshold) {
        setSwipeOffset(80);
      } else {
        setSwipeOffset(0);
        setSwipedContactId(null);
      }
    } else {
      if (swipeOffset < -threshold) {
        setSwipeOffset(-80);
      } else {
        setSwipeOffset(0);
        setSwipedContactId(null);
      }
    }
  };

  const sessionOptions = useMemo(
    () => sessions.filter((session) => session.id !== 'all'),
    [sessions],
  );

  useEffect(() => {
    if (!contextMenu) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setContextMenu(null);
    };
    const handleResize = () => setContextMenu(null);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [contextMenu]);

  const labelsMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    if (labels) {
      labels.forEach((l) => map.set(l.id, { name: l.name, color: l.color }));
    }
    return map;
  }, [labels]);

  const allCount = counts?.all ?? conversations.length;
  const unreadCount = counts?.unread ?? 0;
  const unrepliedCount = counts?.unreplied ?? 0;
  const groupCount = counts?.groups ?? 0;
  const archivedCount = counts?.archived ?? conversations.filter((c) => c.isArchived).length;

  const connectedSessionCount = useMemo(
    () =>
      sessionOptions.filter((session) =>
        ['CONNECTED', 'connected'].includes(session.liveStatus || session.status),
      ).length,
    [sessionOptions],
  );

  const selectedSessionMeta = sessionOptions.find((session) => session.id === selectedSession);
  const isSelectedSessionConnected = selectedSessionMeta
    ? ['CONNECTED', 'connected'].includes(
        selectedSessionMeta.liveStatus || selectedSessionMeta.status,
      )
    : connectedSessionCount > 0;

  const resolvedSessionValue = selectedSession || 'all';

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    const threshold = 150;
    const isNearBottom = scrollHeight - scrollTop <= clientHeight + threshold;

    if (isNearBottom && hasMoreConversations && !isLoadingMoreConversations) {
      onLoadMore();
    }
  };

  const renderLoadingRows = () => (
    <div className="space-y-0 px-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 border-b border-[color:color-mix(in_srgb,var(--shell-control-border)_50%,transparent)] px-3 py-2.5"
        >
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-32 rounded-full" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <aside
      dir={i18n.dir()}
      className={cn(
        'whatsapp-theme-transition relative flex h-full max-lg:w-full min-w-0 shrink-0 flex-col overflow-hidden border-b border-[color:color-mix(in_srgb,var(--shell-control-border)_82%,transparent)] bg-[var(--app-panel-bg)] lg:min-h-0 lg:w-[390px] lg:min-w-[360px] lg:border-b-0 lg:border-r',
        className,
      )}
    >
      <ChatSidebarHeader
        multiSelectMode={multiSelectMode}
        selectedJids={selectedJids}
        conversations={conversations}
        onExitMultiSelect={() => {
          setMultiSelectMode(false);
          setSelectedJids(new Set());
        }}
        onToggleSelectAll={() => {
          const allJids = conversations.map((c) => c.jid);
          if (selectedJids.size === allJids.length) {
            setSelectedJids(new Set());
          } else {
            setSelectedJids(new Set(allJids));
          }
        }}
        onBulkDelete={onBulkDelete}
        currentUserProfile={currentUserProfile}
        onOpenProfile={onOpenProfile}
        isSelectedSessionConnected={isSelectedSessionConnected}
        showArchived={showArchived}
        sessionOptions={sessionOptions}
        resolvedSessionValue={resolvedSessionValue}
        onSelectSession={onSelectSession}
        onOpenNewChat={onOpenNewChat}
        onOpenNewGroup={onOpenNewGroup}
        onSyncHistory={onSyncHistory}
        isSyncingHistory={isSyncingHistory}
        selectedSession={selectedSession}
        onOpenBroadcast={onOpenBroadcast}
        onOpenLabels={onOpenLabels}
        onEnterMultiSelect={() => {
          setMultiSelectMode(true);
          setSelectedJids(new Set());
        }}
        onDeleteAll={onDeleteAll}
        onOpenBusinessProfile={onOpenBusinessProfile}
        onOpenPrivacySettings={onOpenPrivacySettings}
        onOpenCheckNumber={onOpenCheckNumber}
        onToggleArchived={onToggleArchived}
        translate={t}
        isRtl={isRtl}
      />

      <ChatSidebarFilterBar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        filterType={filterType}
        onFilterTypeChange={onFilterTypeChange}
        showArchived={showArchived}
        onToggleArchived={onToggleArchived}
        allCount={allCount}
        unrepliedCount={unrepliedCount}
        unreadCount={unreadCount}
        groupCount={groupCount}
        archivedCount={archivedCount}
        statusesCount={statuses.length}
        translate={t}
      />

      <div
        className="wa-slim-scroll wa-safe-bottom min-h-0 flex-1 overflow-y-auto px-2 py-1 sm:py-2"
        onScroll={handleScroll}
      >
        {filterType === 'statuses' ? (
          <ChatSidebarStatusesList
            statuses={statuses}
            isLoadingStatuses={isLoadingStatuses}
            onAddStatus={onAddStatus}
            renderLoadingRows={renderLoadingRows}
            translate={t}
            isRtl={isRtl}
          />
        ) : conversationsError ? (
          <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
            <AlertTriangle className="mb-4 size-10 text-rose-500" />
            <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
              {t('whatsapp.dialogs.error')}
            </p>
            <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">
              {t('whatsapp.window.selectChat')}
            </p>
            {onRetryConversations && (
              <Button
                variant="outline"
                className="mt-4 rounded-full border-[color:var(--shell-control-border)]"
                onClick={onRetryConversations}
              >
                <RefreshCw className="size-4 ml-2" />
                {t('conversations.retry')}
              </Button>
            )}
          </div>
        ) : isLoadingConversations && conversations.length === 0 ? (
          renderLoadingRows()
        ) : conversations.length === 0 ? (
          <ChatSidebarEmptyState
            icon={Users}
            title={t('conversations.noConversations')}
            description="جرّب تعديل البحث أو أظهر الأرشيف للعثور على محادثات إضافية."
          />
        ) : (
          <div className="space-y-1">
            {conversations.map((contact) => (
              <ChatSidebarConversationItem
                key={contact.id}
                contact={contact}
                contactName={getBestContactDisplayName(contact)}
                isSelected={selectedContact?.id === contact.id}
                multiSelectMode={multiSelectMode}
                isSelectedInMulti={selectedJids.has(contact.jid)}
                swipedContactId={swipedContactId}
                swipeOffset={swipeOffset}
                searchTerm={searchTerm}
                labelsMap={labelsMap}
                onSelectContact={onSelectContact}
                onToggleSelectJid={(jid) => {
                  setSelectedJids((prev) => {
                    const next = new Set(prev);
                    if (next.has(jid)) next.delete(jid);
                    else next.add(jid);
                    return next;
                  });
                }}
                onArchiveChat={onArchiveChat}
                onContextMenu={(event, c) => {
                  setContextMenu({
                    mouseX: event.clientX + 2,
                    mouseY: event.clientY - 6,
                    contact: c,
                  });
                }}
                onTouchStart={handleSwipeTouchStart}
                onTouchMove={handleSwipeTouchMove}
                onTouchEnd={handleSwipeTouchEnd}
                onClearSwipe={() => {
                  setSwipedContactId(null);
                  setSwipeOffset(0);
                }}
                translate={t}
                isRtl={isRtl}
              />
            ))}

            {isLoadingMoreConversations && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="size-4 animate-spin text-[color:var(--color-muted-foreground)]" />
              </div>
            )}
          </div>
        )}
      </div>

      <ChatSidebarContextMenu
        contextMenu={contextMenu}
        onClose={() => setContextMenu(null)}
        onPinChat={onPinChat}
        onMarkAsRead={onMarkAsRead}
        onMuteChat={onMuteChat}
        onArchiveChat={onArchiveChat}
        onDeleteChat={onDeleteChat}
        onBlockContact={onBlockContact}
        translate={t}
      />
    </aside>
  );
};

ChatSidebar.displayName = 'ChatSidebar';

export default ChatSidebar;
