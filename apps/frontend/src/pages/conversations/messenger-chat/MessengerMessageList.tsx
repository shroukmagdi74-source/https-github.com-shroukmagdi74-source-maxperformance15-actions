import React from "react";
import LinkifiedText from "../../../components/common/LinkifiedText";
import type { Message } from "./types";

export interface MessengerMessageListProps {
  messages: Message[];
  expandedMessages: Set<string>;
  onToggleMessageExpansion: (id: string) => void;
  typingUsers: string[];
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const MessengerMessageList: React.FC<MessengerMessageListProps> = ({
  messages,
  expandedMessages,
  onToggleMessageExpansion,
  typingUsers,
  messagesContainerRef,
  messagesEndRef,
}) => {
  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-gray-50"
      style={{ minHeight: 0, height: "auto" }}
    >
      <div className="space-y-4 w-full">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex w-full ${
              message.isFromCustomer ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl 2xl:max-w-4xl px-4 py-2 rounded-lg min-h-fit ${
                message.isFromCustomer
                  ? "bg-white border border-gray-200"
                  : "bg-blue-500 text-white"
              }`}
              style={{
                maxHeight: "none",
                height: "auto",
                overflow: "visible",
              }}
            >
              {message.type === "image" && message.fileUrl && (
                <div className="mb-2">
                  <img
                    src={message.fileUrl}
                    alt={message.fileName || "صورة"}
                    className="rounded-lg max-h-48 object-cover"
                  />
                </div>
              )}
              {message.type === "voice" && message.fileUrl && (
                <div className="mb-2">
                  <audio controls className="w-full">
                    <source src={message.fileUrl} type="audio/mpeg" />
                    متصفحك لا يدعم عنصر الصوت.
                  </audio>
                </div>
              )}
              <div
                className="text-sm whitespace-pre-wrap break-words leading-relaxed overflow-visible w-full"
                style={{
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  hyphens: "auto",
                  maxHeight: "none",
                  height: "auto",
                  textOverflow: "clip",
                  overflow: "visible",
                  display: "block",
                }}
              >
                {message.content &&
                message.content.length > 500 &&
                !expandedMessages.has(message.id) ? (
                  message.content.substring(0, 500) + "..."
                ) : (
                  <LinkifiedText text={message.content} className="block" />
                )}
                {message.content && message.content.length > 500 && (
                  <button
                    onClick={() => onToggleMessageExpansion(message.id)}
                    className="text-xs text-blue-400 hover:text-blue-600 mt-1 block font-medium"
                  >
                    {expandedMessages.has(message.id) ? "إخفاء" : "عرض المزيد"}
                  </button>
                )}
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs opacity-70 tabular-nums">
                  {message.timestamp instanceof Date
                    ? message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                </span>
                {!message.isFromCustomer && (
                  <span className="text-xs opacity-70 mr-1">
                    {message.status === "sent"
                      ? "✓"
                      : message.status === "delivered"
                        ? "✓✓"
                        : "👁"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
