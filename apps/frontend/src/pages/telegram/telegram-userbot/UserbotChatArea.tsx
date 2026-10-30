import React from "react";
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import type { Chat, Message } from "./types";
import { MediaMessage } from "./MediaMessage";

export interface UserbotChatAreaProps {
  selectedChat: Chat | null;
  selectedUserbot: string | null;
  messages: Message[];
  messageText: string;
  onMessageTextChange: (text: string) => void;
  onSendMessage: () => void;
  onSendFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const UserbotChatArea: React.FC<UserbotChatAreaProps> = ({
  selectedChat,
  selectedUserbot,
  messages,
  messageText,
  onMessageTextChange,
  onSendMessage,
  onSendFile,
  messagesEndRef,
}) => {
  if (!selectedChat) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-gray-400">
        <ChatBubbleLeftRightIcon className="h-20 w-20 mb-4 opacity-20" />
        <p>Select a chat to view conversation</p>
      </div>
    );
  }

  const sortedMessages = [...messages].sort((a, b) => a.date - b.date);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-gray-900">
      {/* Active Chat Header */}
      <div className="p-4 bg-white dark:bg-gray-800 border-b dark:border-b-gray-700 shadow-sm flex-none">
        <h3 className="font-bold text-lg dark:text-white">
          {selectedChat.name}
        </h3>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {sortedMessages.map((msg, index) => (
          <div
            key={`${msg.id}-${index}`}
            className={`flex ${msg.isOut ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-lg shadow-sm overflow-hidden ${
                msg.isOut
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none"
              } ${msg.media ? "p-0" : "p-3"}`}
            >
              {/* Sender name for incoming messages */}
              {!msg.isOut && msg.senderName && (
                <div
                  className={`text-xs font-semibold mb-1 px-3 pt-3 ${
                    msg.isOut
                      ? "text-blue-200"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {msg.senderName}
                </div>
              )}
              {msg.media && selectedUserbot && selectedChat && (
                <MediaMessage
                  msg={msg}
                  userbotId={selectedUserbot}
                  chat={selectedChat}
                />
              )}
              {!msg.media && (
                <div className="break-words">{msg.text}</div>
              )}
              {msg.media && msg.text && (
                <div className="break-words mt-2 px-3">{msg.text}</div>
              )}
              <div
                className={`text-[10px] mt-1 flex justify-between items-center px-3 pb-2 ${
                  msg.isOut ? "text-blue-200" : "text-gray-400"
                }`}
              >
                <span className="tabular-nums">
                  {new Date(msg.date * 1000).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {msg.isOut && <span className="ml-2">✓</span>}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-t-gray-700 flex gap-2 flex-none items-center">
        <label className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500">
          <input
            type="file"
            className="hidden"
            onChange={onSendFile}
            aria-label="Upload file"
          />
          <span className="text-xl">📎</span>
        </label>
        <input
          type="text"
          className="flex-1 border dark:border-gray-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => onMessageTextChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSendMessage()}
        />
        <button
          onClick={onSendMessage}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          aria-label="Send message"
        >
          <PaperAirplaneIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};
