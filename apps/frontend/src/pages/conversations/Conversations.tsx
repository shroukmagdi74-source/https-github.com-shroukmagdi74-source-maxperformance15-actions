import React, { useEffect } from "react";
import {
  injectConversationsStyles,
  useConversationsState,
  ConversationsSidebar,
  ChatArea,
  ConversationsLoading,
} from "./components";

export type { Message, Conversation, Platform } from "./components";

const Conversations: React.FC = () => {
  useEffect(() => {
    injectConversationsStyles();
  }, []);

  const {
    filteredConversations,
    loading,
    selectedConversation,
    newMessage,
    searchQuery,
    isAutoUpdating,
    isUserTyping,
    hasNewMessages,
    showScrollButton,
    isConnected,
    messagesEndRef,
    messagesContainerRef,
    setNewMessage,
    setSearchQuery,
    handleScroll,
    handleTypingStart,
    handleSendMessage,
    handleKeyPress,
    handleSelectConversation,
    handleManualRefresh,
    scrollToBottom,
    formatTime,
  } = useConversationsState();

  if (loading) {
    return <ConversationsLoading />;
  }

  return (
    <div className="flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-full">
      <ConversationsSidebar
        filteredConversations={filteredConversations}
        selectedConversation={selectedConversation}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        loading={loading}
        isAutoUpdating={isAutoUpdating}
        isUserTyping={isUserTyping}
        hasNewMessages={hasNewMessages}
        handleManualRefresh={handleManualRefresh}
        handleSelectConversation={handleSelectConversation}
        formatTime={formatTime}
      />
      <ChatArea
        selectedConversation={selectedConversation}
        isConnected={isConnected}
        messages={selectedConversation?.messages || []}
        messagesContainerRef={messagesContainerRef}
        messagesEndRef={messagesEndRef}
        showScrollButton={showScrollButton}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onScroll={handleScroll}
        onScrollToBottom={scrollToBottom}
        onTypingStart={handleTypingStart}
        onSendMessage={handleSendMessage}
        onKeyPress={handleKeyPress}
        formatTime={formatTime}
      />
    </div>
  );
};

export default Conversations;
