import React from "react";
import { Conversation, Message } from "./types";
import { ChatHeader } from "./ChatHeader";
import { ChatMessageList } from "./ChatMessageList";
import { ChatMessageInput } from "./ChatMessageInput";
import { ChatEmptyState } from "./ChatEmptyState";

interface ChatAreaProps {
  selectedConversation: Conversation | null;
  isConnected: boolean;
  messages: Message[];
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  showScrollButton: boolean;
  newMessage: string;
  setNewMessage: (msg: string) => void;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onScrollToBottom: () => void;
  onTypingStart: () => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  formatTime: (date: Date | string) => string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  selectedConversation,
  isConnected,
  messages,
  messagesContainerRef,
  messagesEndRef,
  showScrollButton,
  newMessage,
  setNewMessage,
  onScroll,
  onScrollToBottom,
  onTypingStart,
  onSendMessage,
  onKeyPress,
  formatTime,
}) => {
  if (!selectedConversation) {
    return <ChatEmptyState />;
  }

  return (
    <div className="flex-1 h-full max-h-full flex flex-col bg-white/50 backdrop-blur-sm overflow-hidden">
      <ChatHeader
        conversation={selectedConversation}
        isConnected={isConnected}
      />
      <ChatMessageList
        messages={messages}
        messagesContainerRef={messagesContainerRef}
        messagesEndRef={messagesEndRef}
        showScrollButton={showScrollButton}
        onScroll={onScroll}
        onScrollToBottom={onScrollToBottom}
        formatTime={formatTime}
      />
      <ChatMessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onTypingStart={onTypingStart}
        onSendMessage={onSendMessage}
        onKeyPress={onKeyPress}
      />
    </div>
  );
};
