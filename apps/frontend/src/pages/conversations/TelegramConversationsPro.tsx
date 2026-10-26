import React from "react";
import { useAuth } from "../../hooks/useAuthSimple";
import { useTranslation } from "react-i18next";
import useSocket from "../../hooks/useSocket";
import {
  useTelegramConversations,
  useTelegramMessages,
  TelegramConversationsSidebar,
  TelegramChatHeader,
  TelegramMediaGalleryDrawer,
  TelegramMessagesList,
  TelegramInputBar,
  TelegramUserInfoPanel,
  TelegramEmptyChat,
} from "./telegram-conversations-pro";

const TelegramConversationsPro: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { i18n } = useTranslation();
  const { socket, isConnected } = useSocket();

  const isRTL = i18n.language === "ar";
  const dir = isRTL ? "rtl" : "ltr";

  // Conversations Hook
  const {
    conversations,
    setConversations,
    selectedConversationId,
    setSelectedConversationId,
    loading,
    searchQuery,
    setSearchQuery,
    filteredConversations,
    activeConversation,
  } = useTelegramConversations({
    isAuthenticated,
    companyId: user?.companyId,
  });

  // Messages Hook
  const {
    messages,
    inputText,
    setInputText,
    chatSearchQuery,
    setChatSearchQuery,
    isInfoOpen,
    setIsInfoOpen,
    isTyping,
    showMediaGallery,
    setShowMediaGallery,
    replyingTo,
    setReplyingTo,
    editingMessage,
    setEditingMessage,
    showFileMenu,
    setShowFileMenu,
    messagesEndRef,
    fileInputRef,
    videoInputRef,
    audioInputRef,
    documentInputRef,
    handleSendMessage,
    handleFileSelect,
    handleSendLocation,
    handleEditMessage,
    handleDeleteMessage,
    handleForwardMessage,
    handleToggleAi,
    filteredMessages,
    mediaMessages,
  } = useTelegramMessages({
    selectedConversationId,
    activeConversation,
    companyId: user?.companyId,
    userId: user?.id,
    socket,
    isConnected,
    isRTL,
    setConversations,
  });

  return (
    <div
      className="flex h-[calc(100dvh-64px)] business-bg-messenger-app business-bg-soft overflow-hidden"
      dir={dir}
    >
      {/* Sidebar: Conversations List */}
      <TelegramConversationsSidebar
        isRTL={isRTL}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        loading={loading}
        filteredConversations={filteredConversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
      />

      {/* Middle: Chat Thread Area */}
      <div className="flex-1 flex flex-col business-bg-messenger-thread business-bg-panel bg-opacity-10 relative order-2">
        {selectedConversationId && activeConversation ? (
          <>
            <TelegramChatHeader
              activeConversation={activeConversation}
              isRTL={isRTL}
              isTyping={isTyping}
              isInfoOpen={isInfoOpen}
              showMediaGallery={showMediaGallery}
              chatSearchQuery={chatSearchQuery}
              onToggleAi={handleToggleAi}
              onToggleChatSearch={() =>
                setChatSearchQuery(chatSearchQuery ? "" : " ")
              }
              onToggleMediaGallery={() =>
                setShowMediaGallery(!showMediaGallery)
              }
              onToggleInfo={() => setIsInfoOpen(!isInfoOpen)}
            />

            <TelegramMediaGalleryDrawer
              isRTL={isRTL}
              chatSearchQuery={chatSearchQuery}
              setChatSearchQuery={setChatSearchQuery}
              showMediaGallery={showMediaGallery}
              mediaMessages={mediaMessages}
            />

            <TelegramMessagesList
              messages={messages}
              filteredMessages={filteredMessages}
              isRTL={isRTL}
              messagesEndRef={messagesEndRef}
              onReply={setReplyingTo}
              onForward={handleForwardMessage}
              onEdit={(msg) => {
                setEditingMessage(msg);
                setInputText(msg.content);
              }}
              onDelete={handleDeleteMessage}
            />

            <TelegramInputBar
              isRTL={isRTL}
              inputText={inputText}
              setInputText={setInputText}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              editingMessage={editingMessage}
              setEditingMessage={setEditingMessage}
              showFileMenu={showFileMenu}
              setShowFileMenu={setShowFileMenu}
              fileInputRef={fileInputRef}
              videoInputRef={videoInputRef}
              audioInputRef={audioInputRef}
              documentInputRef={documentInputRef}
              onSendMessage={handleSendMessage}
              onEditMessage={handleEditMessage}
              onFileSelect={handleFileSelect}
              onSendLocation={handleSendLocation}
            />
          </>
        ) : (
          <TelegramEmptyChat isRTL={isRTL} />
        )}
      </div>

      {/* Right Sidebar: CRM Info */}
      {selectedConversationId && activeConversation && isInfoOpen && (
        <TelegramUserInfoPanel
          activeConversation={activeConversation}
          isRTL={isRTL}
          onClose={() => setIsInfoOpen(false)}
          mediaMessages={mediaMessages}
          onDeleteConversation={() => {
            alert(
              isRTL ? "ميزة حذف المحادثة قريباً" : "Delete conversation coming soon",
            );
          }}
        />
      )}
    </div>
  );
};

export default TelegramConversationsPro;
