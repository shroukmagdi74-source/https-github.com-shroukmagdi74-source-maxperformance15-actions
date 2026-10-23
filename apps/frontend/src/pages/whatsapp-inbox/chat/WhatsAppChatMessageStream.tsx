import React from 'react';
import { Bot, Check, Edit2, FileIcon, ImageIcon, Music, Paperclip, Video, X } from 'lucide-react';
import LinkifiedText from '../../../components/common/LinkifiedText';
import type { ChatMessage } from './types';

interface WhatsAppChatMessageStreamProps {
  messages: ChatMessage[];
  editingMessageId: string | null;
  correctionText: string;
  onStartCorrection: (id: string, initialContent: string) => void;
  onCancelCorrection: () => void;
  onCorrectionTextChange: (text: string) => void;
  onSubmitCorrection: (id: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  locale: string;
  mediaHintCopy: Record<string, string>;
}

export const WhatsAppChatMessageStream: React.FC<WhatsAppChatMessageStreamProps> = ({
  messages,
  editingMessageId,
  correctionText,
  onStartCorrection,
  onCancelCorrection,
  onCorrectionTextChange,
  onSubmitCorrection,
  messagesEndRef,
  locale,
  mediaHintCopy,
}) => {
  const formatTime = (value?: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    }).format(date);
  };

  const renderMediaHint = (type?: string) => {
    const key = String(type || '').toUpperCase();
    if (key === 'IMAGE') return <ImageIcon className="size-4" />;
    if (key === 'VIDEO') return <Video className="size-4" />;
    if (key === 'AUDIO' || key === 'VOICE') return <Music className="size-4" />;
    if (key === 'DOCUMENT') return <FileIcon className="size-4" />;
    return <Paperclip className="size-4" />;
  };

  const renderContent = (message: ChatMessage) => {
    const typeUpper = String(message.type || '').toUpperCase();
    if (typeUpper === 'TEXT') {
      return (
        <LinkifiedText
          text={message.content}
          className="block whitespace-pre-wrap break-words text-sm leading-6"
        />
      );
    }
    return (
      <div className="flex items-center gap-2 text-sm italic">
        {renderMediaHint(typeUpper)}
        <span>{mediaHintCopy[typeUpper] || message.type}</span>
      </div>
    );
  };

  return (
    <div className="wa-slim-scroll wa-messages-scroll flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          لا توجد رسائل سابقة في هذه المحادثة
        </div>
      ) : (
        messages.map((message) => {
          const isOutgoing = !message.isFromCustomer;
          const isBot = isOutgoing && !message.user;
          const isEditing = editingMessageId === message.id;

          return (
            <div
              key={message.id}
              className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`group relative max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-xs transition ${
                  isOutgoing
                    ? isBot
                      ? 'border border-indigo-500/30 bg-indigo-600/90 text-white'
                      : 'border border-primary/20 bg-primary text-primary-foreground'
                    : 'border border-border/60 bg-card text-foreground'
                }`}
              >
                {/* Header for outgoing: Bot indicator or Agent Name */}
                {isOutgoing && (
                  <div className="mb-1 flex items-center justify-between gap-2 text-[11px] opacity-80">
                    {isBot ? (
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <Bot className="size-3" />
                        <span>رد تلقائي من الوكيل</span>
                      </span>
                    ) : message.user ? (
                      <span className="font-medium">
                        {`${message.user.firstName} ${message.user.lastName}`.trim()}
                      </span>
                    ) : null}

                    {isBot && !isEditing && (
                      <button
                        type="button"
                        onClick={() => onStartCorrection(message.id, message.content)}
                        className="opacity-0 group-hover:opacity-100 transition inline-flex items-center gap-0.5 text-[10px] underline hover:text-white"
                        title="تصحيح رد الوكيل"
                      >
                        <Edit2 className="size-2.5" />
                        <span>تصحيح</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Content or Correction Input */}
                {isEditing ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      value={correctionText}
                      onChange={(e) => onCorrectionTextChange(e.target.value)}
                      rows={2}
                      className="w-full rounded-md border border-white/30 bg-black/20 p-2 text-xs text-white placeholder-white/50 outline-none"
                      placeholder="أدخل النص البديل الصحيح..."
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={onCancelCorrection}
                        className="inline-flex items-center gap-1 rounded bg-black/20 px-2 py-0.5 text-[10px] text-white hover:bg-black/30"
                      >
                        <X className="size-3" />
                        <span>إلغاء</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onSubmitCorrection(message.id)}
                        className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-indigo-700 hover:bg-white/90"
                      >
                        <Check className="size-3" />
                        <span>حفظ</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  renderContent(message)
                )}

                {/* Timestamp */}
                <div
                  className={`mt-1 text-[10px] font-mono tabular-nums ${
                    isOutgoing ? 'text-right opacity-70' : 'text-left text-muted-foreground'
                  }`}
                >
                  {formatTime(message.createdAt)}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
