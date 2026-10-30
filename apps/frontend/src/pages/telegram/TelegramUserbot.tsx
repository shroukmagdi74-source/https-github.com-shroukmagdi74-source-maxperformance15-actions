import React from "react";
import {
  useTelegramUserbot,
  UserbotHeader,
  UserbotSelectStep,
  UserbotChatList,
  UserbotChatArea,
} from "./telegram-userbot";

export * from "./telegram-userbot";

const TelegramUserbot: React.FC = () => {
  const {
    step,
    setStep,
    userbots,
    selectedUserbot,
    setSelectedUserbot,
    filteredChats,
    selectedChat,
    setSelectedChat,
    messages,
    messageText,
    setMessageText,
    searchTerm,
    setSearchTerm,
    messagesEndRef,
    fetchChats,
    handleSendMessage,
    handleSendFile,
  } = useTelegramUserbot();

  return (
    <div className="p-6 w-full h-[calc(100dvh-100px)] flex flex-col">
      <UserbotHeader />

      {step === "SELECT" && (
        <UserbotSelectStep
          userbots={userbots}
          onSelectUserbot={(id, isConnected) => {
            setSelectedUserbot(id);
            if (isConnected) {
              setStep("CHATS");
            } else {
              setStep("SELECT");
            }
          }}
        />
      )}

      {step === "CHATS" && (
        <div className="flex-1 flex bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border dark:border-gray-700">
          <UserbotChatList
            chats={filteredChats}
            selectedChat={selectedChat}
            onSelectChat={setSelectedChat}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRefreshChats={fetchChats}
          />
          <UserbotChatArea
            selectedChat={selectedChat}
            selectedUserbot={selectedUserbot}
            messages={messages}
            messageText={messageText}
            onMessageTextChange={setMessageText}
            onSendMessage={handleSendMessage}
            onSendFile={handleSendFile}
            messagesEndRef={messagesEndRef}
          />
        </div>
      )}
    </div>
  );
};

export default TelegramUserbot;
