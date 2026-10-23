import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import ChatSidebar from './components/ChatSidebar';
import ChatWindow from './components/ChatWindow';
import ChatRightPanel from './components/ChatRightPanel';
import { ChatActionDialogsHost } from './components/dialogs/ChatActionDialogsHost';
import { useWhatsAppChatCoordinator } from './hooks/useWhatsAppChatCoordinator';

const WhatsAppChatContent: React.FC = () => {
  const {
    user,
    authLoading,
    isAuthenticated,
    queryClient,
    t,
    fileInputRef,
    newMessage,
    setNewMessage,
    typingUsers,
    chatData,
    dialogs,
    chatActions,
    chatNav,
    getContactName,
    getParticipantName,
    selectedContactPhoneNumber,
  } = useWhatsAppChatCoordinator();

  if (authLoading || chatData.loadingSessions) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--app-canvas)]">
        <Loader2 className="size-6 animate-spin text-[color:var(--color-primary)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      className={cn(
        'whatsapp-workspace-root whatsapp-theme-transition flex h-full min-h-0 flex-col overflow-hidden',
        chatData.selectedContact && 'whatsapp-workspace--chat-active',
      )}
      data-chat-active={chatData.selectedContact ? 'true' : 'false'}
    >
      <h1 className="sr-only">لوحة تشغيل واتساب</h1>
      <div className="whatsapp-theme-transition flex h-full min-h-0 flex-1 flex-col overflow-hidden lg:flex-row border-none rounded-none shadow-none bg-[color:var(--color-card)]">
        <ChatSidebar
          className={cn(
            'wa-panel-sidebar ltr:lg:order-1 rtl:lg:order-1',
            chatData.selectedContact && 'max-lg:hidden',
          )}
          sessions={chatData.sessions}
          conversations={chatData.conversations}
          statuses={[]}
          selectedSession={chatData.selectedSession}
          selectedContact={chatData.selectedContact}
          currentUserProfile={chatData.currentUserProfile}
          isLoadingConversations={chatData.loadingConversations}
          isLoadingMoreConversations={chatData.isLoadingMoreConversations}
          hasMoreConversations={chatData.hasMoreConversations}
          isLoadingStatuses={false}
          onSelectSession={chatData.setSelectedSession}
          onSelectContact={chatNav.selectContactWithTransition}
          onOpenProfile={() => dialogs.setProfileDialogOpen(true)}
          onOpenNewChat={() => dialogs.setCheckNumberDialogOpen(true)}
          onOpenNewGroup={() => dialogs.setCreateGroupDialogOpen(true)}
          onOpenPrivacySettings={() => dialogs.setPrivacyDialogOpen(true)}
          onOpenBusinessProfile={() => dialogs.setBusinessProfileDialogOpen(true)}
          onSyncHistory={chatActions.handleSyncHistory}
          isSyncingHistory={chatActions.isSyncingHistory}
          onPinChat={chatActions.handlePinChat}
          onArchiveChat={chatActions.handleArchiveChat}
          onDeleteChat={chatActions.handleDeleteChat}
          onBlockContact={chatActions.handleBlockContact}
          onMuteChat={chatActions.handleMuteChat}
          onMarkAsRead={chatActions.handleMarkUnread}
          onLoadMore={chatData.fetchNextConversationsPage}
          conversationsError={chatData.conversationsError}
          onRetryConversations={() => chatData.refetchConversations()}
          onAddStatus={() => dialogs.setStatusDialogOpen(true)}
          onOpenBroadcast={() => dialogs.setBroadcastDialogOpen(true)}
          onOpenCheckNumber={() => dialogs.setCheckNumberDialogOpen(true)}
          onOpenLabels={() => {
            dialogs.setSelectedContactForLabel(null);
            dialogs.setLabelDialogOpen(true);
          }}
          onBulkDelete={chatActions.handleBulkDeleteChats}
          onDeleteAll={chatActions.handleDeleteAllChats}
          labels={chatData.labels}
          filterType={chatData.chatFilter}
          onFilterTypeChange={chatData.setChatFilter}
          searchTerm={chatData.searchTerm}
          onSearchChange={chatData.setSearchTerm}
          showArchived={chatData.showArchived}
          onToggleArchived={(archived) => chatData.setShowArchived(archived)}
          counts={chatData.conversationCounts}
        />

        <div className="relative flex h-full min-h-0 flex-1 overflow-hidden ltr:lg:order-2 rtl:lg:order-2">
          <ChatWindow
            showRightPanel={dialogs.showRightPanel}
            onToggleRightPanel={() => dialogs.setShowRightPanel((prev) => !prev)}
            className={cn(
              'wa-panel-chat',
              !chatData.selectedContact && 'max-lg:hidden',
              dialogs.showRightPanel && 'max-lg:hidden',
            )}
            selectedContact={chatData.selectedContact}
            messages={chatData.visibleMessages}
            loadingMessages={chatData.loadingMessages}
            onToggleAi={chatActions.handleToggleAi}
            virtualItems={chatData.messagesVirtualizer.getVirtualItems()}
            totalHeight={chatData.messagesVirtualizer.getTotalSize()}
            measureElement={chatData.messagesVirtualizer.measureElement}
            messagesContainerRef={chatData.messagesContainerRef}
            typingUsers={typingUsers}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            showEmojiPicker={dialogs.showEmojiPicker}
            setShowEmojiPicker={dialogs.setShowEmojiPicker}
            replyingTo={dialogs.replyingTo}
            setReplyingTo={dialogs.setReplyingTo}
            isRecording={dialogs.isRecording}
            setIsRecording={dialogs.setIsRecording}
            isSendingMessage={chatActions.sendMessageMutation.isPending}
            user={user}
            onSendFile={chatActions.handleSendFileDirect}
            onSendMessageText={chatActions.handleSendMessage}
            onSendMessage={chatActions.handleSendMessage}
            onFileUpload={chatActions.handleFileUpload}
            onVoiceNoteSend={async (blob) => {
              await chatActions.handleSendFileDirect(
                new File([blob], 'voice_note.webm', { type: 'audio/webm' })
              );
            }}
            onOpenContactInfo={() => dialogs.setShowContactInfo(true)}
            onMessageContextMenu={chatActions.handleMessageContextMenu}
            getContactName={getContactName}
            getParticipantName={getParticipantName}
            onOpenPoll={() => dialogs.setPollDialogOpen(true)}
            onOpenButtons={() => dialogs.setButtonsDialogOpen(true)}
            onOpenList={() => dialogs.setListDialogOpen(true)}
            onOpenCatalog={() => {
              void chatData.loadProducts();
              dialogs.setCatalogDialogOpen(true);
            }}
            onOpenLocation={() => dialogs.setLocationDialogOpen(true)}
            onOpenOrder={() => dialogs.setShowQuickOrderModal(true)}
            onOpenServiceOrder={() => dialogs.setShowServiceOrderModal(true)}
            onOpenTasks={() => dialogs.setShowQuickCreateTaskModal(true)}
            onOpenTemplate={() =>
              void chatData
                .handleOpenTemplateDialog()
                .then(() => dialogs.setTemplateDialogOpen(true))
            }
            onOpenProducts={() => dialogs.setShowProductPicker(true)}
            onOpenImageGallery={() => dialogs.setShowImageGallery(true)}
            onBackToList={() => {
              if (
                typeof document !== 'undefined' &&
                typeof document.startViewTransition === 'function'
              ) {
                document.startViewTransition(() => chatData.setSelectedContact(null));
              } else {
                chatData.setSelectedContact(null);
              }
            }}
            onTouchStart={chatNav.handleChatTouchStart}
            onTouchEnd={chatNav.handleChatTouchEnd}
            fileInputRef={fileInputRef}
            isUploadingMedia={
              chatActions.sendMediaMutation.isPending || chatActions.isDirectUploading
            }
            messagesError={chatData.messagesError}
            onRetryMessages={() => chatData.refetchMessages()}
            onOpenInteractive={() => dialogs.setInteractiveDialogOpen(true)}
            pinnedMessage={chatData.currentPinnedMessage}
            onScrollToPinnedMessage={() => {
              if (chatData.currentPinnedMessage) {
                chatData.handleScrollToMessage(
                  chatData.currentPinnedMessage.messageId
                );
              }
            }}
            onUnpinMessage={(messageId) => void chatActions.handleUnpinMessage(messageId)}
            highlightedMessageId={chatData.highlightedMessageId}
            onQuotedMessageClick={chatData.handleScrollToMessage}
            onSendReaction={chatActions.handleSendReaction}
          />

          {chatData.selectedContact && dialogs.showRightPanel && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/20 max-lg:block lg:hidden"
                onClick={() => dialogs.setShowRightPanel(false)}
              />
              <div className="chat-right-panel-container">
                <ChatRightPanel
                  key={
                    chatData.selectedContact.id || chatData.selectedContact.jid
                  }
                  contact={chatData.selectedContact}
                  labels={chatData.labels}
                  refreshToken={dialogs.ordersRefreshToken}
                  onOpenOrder={() => dialogs.setShowQuickOrderModal(true)}
                  onOpenServiceOrder={() => dialogs.setShowServiceOrderModal(true)}
                  onOpenTasks={() => dialogs.setShowQuickCreateTaskModal(true)}
                  onClose={() => dialogs.setShowRightPanel(false)}
                  onOpenLabels={() => {
                    dialogs.setSelectedContactForLabel(chatData.selectedContact);
                    dialogs.setLabelDialogOpen(true);
                  }}
                  onContactUpdated={(updatedContact) => {
                    chatData.setSelectedContact(updatedContact);
                    queryClient.invalidateQueries({
                      queryKey: ['whatsapp', 'conversations'],
                    });
                    queryClient.invalidateQueries({
                      queryKey: ['whatsapp', 'contacts'],
                    });
                    queryClient.invalidateQueries({
                      queryKey: ['whatsapp', 'messages'],
                    });
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <ChatActionDialogsHost
        dialogs={dialogs}
        chatData={chatData}
        chatActions={chatActions}
        selectedContactPhoneNumber={selectedContactPhoneNumber}
        getContactName={getContactName}
        t={t}
      />
    </div>
  );
};

export const WhatsAppChat: React.FC = () => <WhatsAppChatContent />;

export default WhatsAppChat;
