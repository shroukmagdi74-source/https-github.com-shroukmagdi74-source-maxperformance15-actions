import React from "react";
import { ChatBubbleLeftRightIcon, UserIcon } from "@heroicons/react/24/outline";
import { formatDate, TicketMessage } from "./types";

interface TicketConversationCardProps {
  messages: TicketMessage[];
}

export const TicketConversationCard: React.FC<TicketConversationCardProps> = ({
  messages,
}) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900 dark:shadow-black/20">
      <div className="flex items-center gap-3 mb-6">
        <ChatBubbleLeftRightIcon className="w-6 h-6 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          المحادثة
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono tabular-nums">
          ({messages?.length || 0} رسالة)
        </span>
      </div>

      {messages && messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isClient = Number(message.is_client_message) === 1;
            const senderName =
              message.user?.name ||
              message.sender_name ||
              (message.user?.first_name
                ? `${message.user.first_name} ${message.user.last_name}`
                : null) ||
              (message.sender?.first_name
                ? `${message.sender.first_name} ${message.sender.last_name}`
                : "مستخدم");

            const roleName = message.user?.role?.name || message.sender?.role_name;

            return (
              <div
                key={message.id || index}
                className={`flex ${isClient ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[70%] ${
                    isClient
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                      : "bg-indigo-600 text-white"
                  } rounded-lg p-4`}
                >
                  {/* Sender info */}
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{senderName}</span>
                    {isClient ? (
                      roleName && (
                        <span className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                          {roleName}
                        </span>
                      )
                    ) : (
                      <span className="text-xs px-2 py-1 rounded bg-indigo-500 text-indigo-100 font-medium">
                        خدمة العملاء
                      </span>
                    )}
                  </div>

                  {/* Message content */}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content || message.message}
                  </p>

                  {/* Timestamp */}
                  <p
                    className={`text-xs mt-2 font-mono tabular-nums ${
                      isClient
                        ? "text-gray-500 dark:text-gray-400"
                        : "text-indigo-200"
                    }`}
                  >
                    {formatDate(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          <ChatBubbleLeftRightIcon className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p>لا توجد رسائل في هذه التذكرة</p>
        </div>
      )}
    </div>
  );
};
