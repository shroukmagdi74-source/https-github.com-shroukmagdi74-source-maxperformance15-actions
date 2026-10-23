/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';

import WhatsAppChat from '../WhatsAppChat';

vi.mock('../hooks/useWhatsAppChatCoordinator', () => ({
  useWhatsAppChatCoordinator: () => ({
    user: { id: 'u-1', name: 'Moderator' },
    authLoading: false,
    isAuthenticated: true,
    queryClient: { invalidateQueries: vi.fn() },
    t: (key: string) => key,
    fileInputRef: { current: null },
    newMessage: '',
    setNewMessage: vi.fn(),
    typingUsers: new Set(),
    chatData: {
      sessions: [{ id: 'sess-1', name: 'Main Channel' }],
      conversations: [
        {
          id: 'c-1',
          jid: '201012345678@s.whatsapp.net',
          name: 'Ahmed Omar',
          unreadCount: 0,
        },
      ],
      selectedSession: 'all',
      selectedContact: null,
      currentUserProfile: null,
      loadingConversations: false,
      isLoadingMoreConversations: false,
      hasMoreConversations: false,
      setSelectedSession: vi.fn(),
      setSelectedContact: vi.fn(),
      visibleMessages: [],
      loadingMessages: false,
      messagesVirtualizer: {
        getVirtualItems: () => [],
        getTotalSize: () => 0,
        measureElement: vi.fn(),
      },
      messagesContainerRef: { current: null },
      labels: [],
      chatFilter: 'all',
      setChatFilter: vi.fn(),
      searchTerm: '',
      setSearchTerm: vi.fn(),
      showArchived: false,
      setShowArchived: vi.fn(),
      conversationCounts: { all: 1, unread: 0, groups: 0, broadcast: 0 },
      products: [],
      templates: [],
      loadingTemplates: false,
      loadProducts: vi.fn(),
      handleOpenTemplateDialog: vi.fn().mockResolvedValue(undefined),
      starredMessagesOpen: false,
      setStarredMessagesOpen: vi.fn(),
      starredMessages: [],
      currentPinnedMessage: null,
      highlightedMessageId: null,
      handleScrollToMessage: vi.fn(),
      fetchNextConversationsPage: vi.fn(),
      refetchConversations: vi.fn(),
      refetchMessages: vi.fn(),
      loadStarredMessages: vi.fn(),
    },
    dialogs: {
      showRightPanel: false,
      setShowRightPanel: vi.fn(),
      showEmojiPicker: false,
      setShowEmojiPicker: vi.fn(),
      replyingTo: null,
      setReplyingTo: vi.fn(),
      isRecording: false,
      setIsRecording: vi.fn(),
      showContactInfo: false,
      setShowContactInfo: vi.fn(),
      pollDialogOpen: false,
      setPollDialogOpen: vi.fn(),
      buttonsDialogOpen: false,
      setButtonsDialogOpen: vi.fn(),
      listDialogOpen: false,
      setListDialogOpen: vi.fn(),
      catalogDialogOpen: false,
      setCatalogDialogOpen: vi.fn(),
      locationDialogOpen: false,
      setLocationDialogOpen: vi.fn(),
      templateDialogOpen: false,
      setTemplateDialogOpen: vi.fn(),
      statusDialogOpen: false,
      setStatusDialogOpen: vi.fn(),
      forwardDialogOpen: false,
      setForwardDialogOpen: vi.fn(),
      showReactionPicker: null,
      setShowReactionPicker: vi.fn(),
      showQuickOrderModal: false,
      setShowQuickOrderModal: vi.fn(),
      showServiceOrderModal: false,
      setShowServiceOrderModal: vi.fn(),
      showQuickCreateTaskModal: false,
      setShowQuickCreateTaskModal: vi.fn(),
      showProductPicker: false,
      setShowProductPicker: vi.fn(),
      showImageGallery: false,
      setShowImageGallery: vi.fn(),
      interactiveDialogOpen: false,
      setInteractiveDialogOpen: vi.fn(),
      labelDialogOpen: false,
      setLabelDialogOpen: vi.fn(),
      selectedContactForLabel: null,
      setSelectedContactForLabel: vi.fn(),
      broadcastDialogOpen: false,
      setBroadcastDialogOpen: vi.fn(),
      privacyDialogOpen: false,
      setPrivacyDialogOpen: vi.fn(),
      businessProfileDialogOpen: false,
      setBusinessProfileDialogOpen: vi.fn(),
      createGroupDialogOpen: false,
      setCreateGroupDialogOpen: vi.fn(),
      profileDialogOpen: false,
      setProfileDialogOpen: vi.fn(),
      checkNumberDialogOpen: false,
      setCheckNumberDialogOpen: vi.fn(),
      quickOrderContact: null,
      setQuickOrderContact: vi.fn(),
      ordersRefreshToken: 0,
      setOrdersRefreshToken: vi.fn(),
    },
    chatActions: {
      sendMessageMutation: { isPending: false },
      sendMediaMutation: { isPending: false },
      isDirectUploading: false,
      postingStatus: false,
      isSyncingHistory: false,
      messageContextMenu: null,
      setMessageContextMenu: vi.fn(),
      selectedMessageForMenu: null,
      setSelectedMessageForMenu: vi.fn(),
      confirmData: null,
      setConfirmData: vi.fn(),
      handleSendMessage: vi.fn(),
      handleSendFileDirect: vi.fn(),
      handleFileUpload: vi.fn(),
      handleMessageContextMenu: vi.fn(),
      handleSyncHistory: vi.fn(),
      handlePinChat: vi.fn(),
      handleArchiveChat: vi.fn(),
      handleDeleteChat: vi.fn(),
      handleBlockContact: vi.fn(),
      handleUnblockContact: vi.fn(),
      handleMuteChat: vi.fn(),
      handleMarkUnread: vi.fn(),
      handleBulkDeleteChats: vi.fn(),
      handleDeleteAllChats: vi.fn(),
      handleToggleAi: vi.fn(),
      handleSendPoll: vi.fn(),
      handleSendButtons: vi.fn(),
      handleSendList: vi.fn(),
      handleSendProduct: vi.fn(),
      handleSendLocation: vi.fn(),
      handleSendTemplate: vi.fn(),
      handlePostStatusAction: vi.fn(),
      handleSendReaction: vi.fn(),
      handleReply: vi.fn(),
      handleCopy: vi.fn(),
      handleForwardMessage: vi.fn(),
      handleStarMessage: vi.fn(),
      handlePinMessage: vi.fn(),
      handleUnpinMessage: vi.fn(),
      handleDeleteMessage: vi.fn(),
      handleClearChat: vi.fn(),
      handleSendProductImages: vi.fn(),
      handleSelectImageFromGallery: vi.fn(),
      handleSelectMultipleImagesFromGallery: vi.fn(),
      handleSendInteractive: vi.fn(),
    },
    chatNav: {
      selectContactWithTransition: vi.fn(),
      handleChatTouchStart: vi.fn(),
      handleChatTouchEnd: vi.fn(),
    },
    getContactName: (c: any) => c.name || 'Unknown',
    getParticipantName: (jid: string) => jid || '',
    selectedContactPhoneNumber: null,
  }),
}));

vi.mock('../components/ChatSidebar', () => ({
  default: () => <div data-testid="chat-sidebar">Chat Sidebar</div>,
}));

vi.mock('../components/ChatWindow', () => ({
  default: () => <div data-testid="chat-window">Chat Window</div>,
}));

vi.mock('../components/ChatRightPanel', () => ({
  default: () => <div data-testid="chat-right-panel">Right Panel</div>,
}));

vi.mock('../components/dialogs/ChatActionDialogsHost', () => ({
  ChatActionDialogsHost: () => <div data-testid="dialogs-host" />,
}));

describe('WhatsAppChat', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders chat workspace with sidebar, window and dialogs host', () => {
    render(
      <MemoryRouter>
        <WhatsAppChat />
      </MemoryRouter>
    );

    expect(screen.getByText('لوحة تشغيل واتساب')).toBeInTheDocument();
    expect(screen.getByTestId('chat-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('chat-window')).toBeInTheDocument();
    expect(screen.getByTestId('dialogs-host')).toBeInTheDocument();
  });
});
