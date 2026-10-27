import React from "react";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import LinkifiedText from "../../../components/common/LinkifiedText";
import { Message } from "./types";

interface ChatMessageListProps {
  messages: Message[];
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  showScrollButton: boolean;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onScrollToBottom: () => void;
  formatTime: (date: Date | string) => string;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  messagesContainerRef,
  messagesEndRef,
  showScrollButton,
  onScroll,
  onScrollToBottom,
  formatTime,
}) => {
  return (
    <div className="relative flex-1 min-h-0 overflow-hidden">
      <div
        ref={messagesContainerRef}
        onScroll={onScroll}
        className="h-full max-h-full overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-gray-50/50 messages-scroll scroll-indicator"
      >
        {messages?.length > 0 ? (
          messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.isFromCustomer ? "justify-start" : "justify-end"} animate-fade-in`}
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div
                className={`message-bubble relative max-w-xs lg:max-w-md px-5 py-3 rounded-2xl shadow-lg backdrop-blur-sm ${
                  message.isFromCustomer
                    ? "bg-white/90 text-gray-900 border border-gray-200/50"
                    : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-500/25"
                }`}
              >
                <LinkifiedText
                  text={message.content}
                  className="block text-sm leading-relaxed"
                />
                <div className="flex items-center justify-between mt-2">
                  <div
                    className={`text-xs font-medium tabular-nums ${
                      message.isFromCustomer
                        ? "text-gray-500"
                        : "text-white/80"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <ChatBubbleLeftRightIcon className="h-10 w-10 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                لا توجد رسائل بعد
              </h3>
              <p className="text-gray-500 mb-4">
                ابدأ محادثة جديدة مع العميل
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-medium shadow-lg">
                <span>في انتظار الرسائل...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* زر التمرير لأسفل */}
      {showScrollButton && (
        <button
          onClick={onScrollToBottom}
          className="absolute bottom-4 right-4 p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group animate-fade-in"
          title="التمرير لأسفل"
          aria-label="التمرير لأسفل"
        >
          <svg
            className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
