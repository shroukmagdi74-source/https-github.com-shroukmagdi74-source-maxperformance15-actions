import React from "react";
import { MessageSquare, Shield, User, Download } from "lucide-react";
import { Ticket } from "./types";

interface UserChatMessagesProps {
  ticket: Ticket;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  formatFileSize: (bytes: number) => string;
}

export const UserChatMessages: React.FC<UserChatMessagesProps> = ({
  ticket,
  messagesEndRef,
  formatFileSize,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md mb-4 flex-1 flex flex-col min-h-0 border border-slate-200/80 dark:border-slate-800">
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
          <MessageSquare className="w-5 h-5 ml-2" />
          المحادثة ({ticket.messages.length})
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {ticket.messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${
              message.senderType === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                message.senderType === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-100"
              }`}
            >
              <div className="flex items-center mb-2">
                {message.senderType === "admin" ? (
                  <Shield className="w-4 h-4 ml-1 text-blue-600" />
                ) : (
                  <User className="w-4 h-4 ml-1" />
                )}
                <span className="text-xs font-medium">
                  {message.senderType === "admin"
                    ? "فريق الدعم"
                    : message.sender.name}
                </span>
              </div>

              <p className="text-sm leading-relaxed mb-2 whitespace-pre-wrap">
                {message.content}
              </p>

              {message.attachments && message.attachments.length > 0 && (
                <div className="space-y-2 mb-2">
                  {message.attachments.map((attachment, attachIndex) => (
                    <div key={attachIndex} className="flex items-center">
                      {attachment.mimetype?.startsWith("image/") ? (
                        <img
                          src={attachment.url}
                          alt={attachment.originalName}
                          className="max-w-full h-32 object-cover rounded cursor-pointer"
                          onClick={() => window.open(attachment.url, "_blank")}
                        />
                      ) : (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-xs hover:underline"
                        >
                          <Download className="w-3 h-3 ml-1" />
                          {attachment.originalName} (
                          {formatFileSize(attachment.size)})
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs opacity-75 tabular-nums">
                {new Date(message.createdAt).toLocaleString("ar-EG")}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
