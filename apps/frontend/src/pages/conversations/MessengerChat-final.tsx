import React from "react";
import SavedReplies from "../../components/conversations/SavedReplies";
import CustomerProfile from "../../components/conversations/CustomerProfile";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import {
  useMessengerChat,
  MessengerConversationsSidebar,
  MessengerChatHeader,
  MessengerMessageList,
  MessengerMessageInput,
  MessengerDeleteModal,
} from "./messenger-chat";

export * from "./messenger-chat";

const MessengerChat: React.FC = () => {
  const {
    filteredConversations,
    selectedConversation,
    messages,
    newMessage,
    setNewMessage,
    loading,
    searchQuery,
    setSearchQuery,
    sending,
    typingUsers,
    messagesEndRef,
    messagesContainerRef,
    fileInputRef,
    showSavedReplies,
    setShowSavedReplies,
    showCustomerProfile,
    setShowCustomerProfile,
    customerProfile,
    showDeleteModal,
    setShowDeleteModal,
    conversationToDelete,
    setConversationToDelete,
    conversationFilter,
    setConversationFilter,
    savedReplies,
    expandedMessages,
    handleToggleAi,
    handleSendMessage,
    handleDeleteConversation,
    handleSelectConversation,
    useSavedReply,
    handleFileUpload,
    toggleMessageExpansion,
  } = useMessengerChat();

  return (
    <div className="flex bg-gray-50 h-[calc(100vh-4rem)] overflow-hidden">
      {/* قائمة المحادثات */}
      <MessengerConversationsSidebar
        conversations={filteredConversations}
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        loading={loading}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        conversationFilter={conversationFilter}
        onConversationFilterChange={setConversationFilter}
      />

      {/* منطقة المحادثة */}
      <div className="flex-1 flex flex-col min-h-0 bg-white">
        {selectedConversation ? (
          <>
            <MessengerChatHeader
              conversation={selectedConversation}
              onToggleAi={handleToggleAi}
              onOpenCustomerProfile={() => setShowCustomerProfile(true)}
              onOpenSavedReplies={() => setShowSavedReplies(true)}
              onTriggerFileUpload={() => fileInputRef.current?.click()}
              onRequestDelete={() => {
                setConversationToDelete(selectedConversation);
                setShowDeleteModal(true);
              }}
            />

            <MessengerMessageList
              messages={messages}
              expandedMessages={expandedMessages}
              onToggleMessageExpansion={toggleMessageExpansion}
              typingUsers={typingUsers}
              messagesContainerRef={messagesContainerRef}
              messagesEndRef={messagesEndRef}
            />

            <MessengerMessageInput
              newMessage={newMessage}
              onNewMessageChange={setNewMessage}
              onSendMessage={handleSendMessage}
              onOpenSavedReplies={() => setShowSavedReplies(true)}
              onFileUpload={handleFileUpload}
              sending={sending}
              fileInputRef={fileInputRef}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">اختر محادثة للبدء</p>
            </div>
          </div>
        )}
      </div>

      {/* مكون الردود المحفوظة */}
      {showSavedReplies && (
        <SavedReplies
          replies={savedReplies}
          onClose={() => setShowSavedReplies(false)}
          onUseReply={useSavedReply}
        />
      )}

      {/* مكون ملف العميل */}
      {showCustomerProfile && customerProfile && selectedConversation && (
        <CustomerProfile
          customerId={selectedConversation.customerId}
          isOpen={showCustomerProfile}
          onClose={() => setShowCustomerProfile(false)}
        />
      )}

      {/* مودال حذف المحادثة */}
      <MessengerDeleteModal
        isOpen={showDeleteModal}
        conversation={conversationToDelete}
        onClose={() => setShowDeleteModal(false)}
        onConfirmDelete={handleDeleteConversation}
      />
    </div>
  );
};

export default MessengerChat;
