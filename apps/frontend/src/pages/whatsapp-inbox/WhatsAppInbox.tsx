import React from 'react';
import type { WhatsAppInboxProps } from './inbox/types';
import {
  useWhatsAppInboxController,
  InboxSessionsRailDesktop,
  InboxHeroHeader,
  InboxFilterBar,
  InboxConversationList,
  InboxModeratorPoolSidebar,
} from './inbox';

const WhatsAppInbox: React.FC<WhatsAppInboxProps> = (props) => {
  const {
    copy,
    sessions,
    activeSession,
    selectedSession,
    conversations,
    queueCounters,
    moderatorPool,
    search,
    setSearch,
    queueFilter,
    setQueueFilter,
    queueTabs,
    heroMetrics,
    loading,
    error,
    formatSessionStatus,
    formatMessageTime,
    selectSession,
    navigateToChat,
    navigateToDashboard,
    loadConversations,
  } = useWhatsAppInboxController(props);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      </div>
    );
  }

  return (
    <div
      dir={copy.isArabic ? 'rtl' : 'ltr'}
      className="flex h-[calc(100dvh-64px)] overflow-hidden bg-background"
    >
      <InboxSessionsRailDesktop
        sessions={sessions}
        activeSession={activeSession}
        onSelectSession={selectSession}
        railEyebrow={copy.inbox.railEyebrow}
        railTitle={copy.inbox.railTitle}
        formatSessionStatus={formatSessionStatus}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <InboxHeroHeader
          selectedSession={selectedSession}
          sessions={sessions}
          activeSession={activeSession}
          onSelectSession={selectSession}
          heroFallbackTitle={copy.inbox.heroFallbackTitle}
          heroMetrics={heroMetrics}
          railEyebrow={copy.inbox.railEyebrow}
          railTitle={copy.inbox.railTitle}
          formatSessionStatus={formatSessionStatus}
        />

        <div className="grid min-h-0 flex-1 gap-0 xl:grid-cols-[1fr,320px]">
          <section className="flex min-h-0 flex-col border-r border-border/50 bg-background rtl:border-r-0 rtl:border-l">
            <InboxFilterBar
              error={error}
              search={search}
              onSearchChange={setSearch}
              onRefresh={loadConversations}
              onOpenDashboard={navigateToDashboard}
              searchPlaceholder={copy.inbox.searchPlaceholder}
              refreshLabel={copy.inbox.refresh}
              openDashboardLabel={copy.inbox.openDashboard}
              queueFilter={queueFilter}
              onSelectQueueFilter={setQueueFilter}
              queueTabs={queueTabs}
              queueCounters={queueCounters}
            />

            <InboxConversationList
              conversations={conversations}
              language={copy.locale}
              emptyStateTitle={copy.inbox.emptyStateTitle}
              emptyStateDescription={copy.inbox.emptyStateDescription}
              previewFallback={copy.inbox.previewFallback}
              unassignedLabel={copy.common.unassigned}
              vipLabel={copy.common.vip}
              formatMessageTime={formatMessageTime}
              onSelectConversation={navigateToChat}
            />
          </section>

          <InboxModeratorPoolSidebar
            moderatorPool={moderatorPool}
            eyebrow={copy.inbox.moderatorPoolEyebrow}
            title={copy.inbox.moderatorPoolTitle}
            emptyLabel={copy.inbox.moderatorPoolEmpty}
            onlineLabel={copy.common.online}
            offlineLabel={copy.common.offline}
            noDepartmentLabel={copy.common.noDepartment}
            activeLabel={copy.common.active}
            pendingLabel={copy.common.pending}
          />
        </div>
      </main>
    </div>
  );
};

export default WhatsAppInbox;
