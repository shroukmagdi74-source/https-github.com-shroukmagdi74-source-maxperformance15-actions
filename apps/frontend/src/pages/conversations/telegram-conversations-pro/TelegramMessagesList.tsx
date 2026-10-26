import React from "react";
import {
  Music,
  Mic,
  File,
  Map,
  Check,
  CheckCheck,
  Reply,
  Forward,
  Edit,
  Trash2,
  Download,
  Play,
} from "lucide-react";
import LinkifiedText from "../../../components/common/LinkifiedText";
import { Message } from "./types";

interface TelegramMessagesListProps {
  messages: Message[];
  filteredMessages: Message[];
  isRTL: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onReply: (msg: Message) => void;
  onForward: (msg: Message) => void;
  onEdit: (msg: Message) => void;
  onDelete: (messageId: string) => void;
}

export const TelegramMessagesList: React.FC<TelegramMessagesListProps> = ({
  messages,
  filteredMessages,
  isRTL,
  messagesEndRef,
  onReply,
  onForward,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 z-10 custom-scrollbar">
      {filteredMessages
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        )
        .map((msg, idx) => {
          const isMe = !msg.isFromCustomer;
          const replyingToMsg = msg.replyToMessageId
            ? messages.find((m) => m.id === msg.replyToMessageId)
            : null;

          return (
            <div
              key={idx}
              className={`group flex ${
                isMe
                  ? isRTL
                    ? "justify-start"
                    : "justify-end"
                  : isRTL
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-2xl shadow-sm relative group-hover:shadow-md transition-shadow ${
                  isMe
                    ? `business-bg-primary-soft ${
                        isRTL ? "rounded-tl-none" : "rounded-tr-none"
                      }`
                    : `business-bg-panel ${
                        isRTL ? "rounded-tr-none" : "rounded-tl-none"
                      }`
                }`}
              >
                {/* Reply Preview */}
                {replyingToMsg && (
                  <div
                    className={`mb-2 ${
                      isRTL ? "border-r-2" : "border-l-2"
                    } business-border-primary-strong pl-2 pr-2 py-1 business-bg-soft rounded text-xs`}
                  >
                    <p className="font-semibold business-text-primary">
                      {replyingToMsg.senderName}
                    </p>
                    <p className="business-text-muted truncate">
                      {replyingToMsg.content || (isRTL ? "وسائط" : "Media")}
                    </p>
                  </div>
                )}

                {!isMe && (
                  <p className="text-[10px] business-text-primary font-bold mb-1 opacity-80">
                    {msg.senderName}
                  </p>
                )}

                {/* Media: Image */}
                {msg.type === "image" && msg.fileUrl && (
                  <div className="mb-2 relative rounded-lg overflow-hidden border business-border">
                    <img
                      src={msg.fileUrl}
                      alt="attachment"
                      className="max-w-xs max-h-64 object-cover"
                    />
                  </div>
                )}

                {/* Media: Video */}
                {msg.type === "video" && msg.fileUrl && (
                  <div className="mb-2 relative rounded-lg overflow-hidden border business-border">
                    <video
                      src={msg.fileUrl}
                      controls
                      className="max-w-xs max-h-64"
                    />
                  </div>
                )}

                {/* Media: Audio */}
                {msg.type === "audio" && (
                  <div className="mb-2 flex items-center gap-2 p-2 business-bg-soft rounded">
                    <Music size={20} className="business-text-primary" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold">
                        {msg.fileName || (isRTL ? "ملف صوتي" : "Audio file")}
                      </p>
                      {msg.duration && (
                        <p className="text-[10px] business-text-muted">
                          {msg.duration}s
                        </p>
                      )}
                    </div>
                    <button className="p-1 business-hover-soft rounded">
                      <Play size={16} />
                    </button>
                  </div>
                )}

                {/* Media: Voice */}
                {msg.type === "voice" && (
                  <div className="mb-2 flex items-center gap-2 p-2 business-bg-soft rounded">
                    <Mic size={20} className="business-text-primary" />
                    <div className="flex-1 business-bg-soft-strong h-1 rounded-full">
                      <div
                        className="business-bg-primary-solid h-1 rounded-full"
                        style={{ width: "60%" }}
                      ></div>
                    </div>
                    {msg.duration && (
                      <span className="text-xs business-text-muted">
                        {msg.duration}s
                      </span>
                    )}
                  </div>
                )}

                {/* Media: Document */}
                {msg.type === "document" && (
                  <div className="mb-2 flex items-center gap-2 p-2 business-bg-soft rounded border business-border">
                    <File size={24} className="business-text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {msg.fileName || (isRTL ? "مستند" : "Document")}
                      </p>
                      {msg.fileSize && (
                        <p className="text-xs business-text-muted">
                          {(msg.fileSize / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>
                    <button className="p-1 business-hover-soft rounded">
                      <Download size={16} />
                    </button>
                  </div>
                )}

                {/* Media: Location */}
                {msg.type === "location" && msg.location && (
                  <div className="mb-2 relative rounded-lg overflow-hidden border business-border">
                    <div className="w-64 h-32 business-bg-soft-strong flex items-center justify-center">
                      <Map size={32} className="business-text-primary" />
                    </div>
                    <a
                      href={`https://www.google.com/maps?q=${msg.location.latitude},${msg.location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 left-2 right-2 business-bg-panel px-2 py-1 rounded text-xs business-text-primary business-hover-primary-soft text-center"
                    >
                      {isRTL ? "فتح في الخرائط" : "Open in Maps"}
                    </a>
                  </div>
                )}

                {/* Text Content */}
                {msg.content && (
                  <LinkifiedText
                    text={msg.content}
                    className={`block text-sm business-text-strong whitespace-pre-wrap leading-relaxed min-w-[120px] ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  />
                )}

                {/* Timestamp & Status */}
                <div
                  className={`flex ${
                    isRTL ? "justify-start" : "justify-end"
                  } items-center gap-1 mt-1 select-none`}
                >
                  <span className="text-[10px] business-text-subtle">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {isMe &&
                    (msg.status === "read" ? (
                      <CheckCheck size={14} className="business-text-primary" />
                    ) : (
                      <Check size={14} className="business-text-subtle" />
                    ))}
                </div>

                {/* Hover Message Actions */}
                <div
                  className={`absolute top-0 ${
                    isMe
                      ? isRTL
                        ? "-right-20"
                        : "-left-20"
                      : isRTL
                      ? "-left-20"
                      : "-right-20"
                  } h-full flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <button
                    onClick={() => onReply(msg)}
                    className="p-1.5 business-bg-panel rounded-full shadow business-text-muted business-hover-primary-text"
                    title={isRTL ? "رد" : "Reply"}
                  >
                    <Reply size={14} />
                  </button>
                  <button
                    onClick={() => onForward(msg)}
                    className="p-1.5 business-bg-panel rounded-full shadow business-text-muted business-hover-primary-text"
                    title={isRTL ? "إعادة توجيه" : "Forward"}
                  >
                    <Forward size={14} />
                  </button>
                  {isMe && (
                    <>
                      <button
                        onClick={() => onEdit(msg)}
                        className="p-1.5 business-bg-panel rounded-full shadow business-text-muted business-hover-primary-text"
                        title={isRTL ? "تعديل" : "Edit"}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(msg.id)}
                        className="p-1.5 business-bg-panel rounded-full shadow business-text-muted business-hover-danger-text"
                        title={isRTL ? "حذف" : "Delete"}
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      <div ref={messagesEndRef as any} />
    </div>
  );
};
