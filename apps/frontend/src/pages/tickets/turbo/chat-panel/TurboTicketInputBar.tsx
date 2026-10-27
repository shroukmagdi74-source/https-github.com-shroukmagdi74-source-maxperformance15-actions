import React from "react";
import {
  PaperAirplaneIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export interface TurboTicketInputBarProps {
  replyText: string;
  setReplyText: (text: string) => void;
  replyImage: File | null;
  setReplyImage: (file: File | null) => void;
  replyImagePreview: string | null;
  sending: boolean;
  onSendReply: (e: React.FormEvent) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  onPreviewImage: (url: string) => void;
}

export const TurboTicketInputBar: React.FC<TurboTicketInputBarProps> = ({
  replyText,
  setReplyText,
  replyImage,
  setReplyImage,
  replyImagePreview,
  sending,
  onSendReply,
  onPaste,
  onPreviewImage,
}) => {
  return (
    <footer className="p-2.5 sm:p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 z-20 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg sm:shadow-none">
      {replyImage && (
        <div className="flex items-center gap-3 mb-2 p-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-xs w-fit shadow-xs">
          {replyImagePreview ? (
            <img
              src={replyImagePreview}
              alt="معاينة المرفق"
              onClick={() => onPreviewImage(replyImagePreview)}
              className="w-10 h-10 object-cover rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer hover:opacity-80 transition shrink-0"
              title="تكبير الصورة"
            />
          ) : (
            <PhotoIcon className="h-6 w-6 text-zinc-500 shrink-0" />
          )}
          <div className="min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[180px]">
                {replyImage.name}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                ({(replyImage.size / 1024).toFixed(0)} KB)
              </span>
            </div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              جاهزة للإرسال مع الرد
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReplyImage(null)}
            className="text-zinc-400 hover:text-rose-500 p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
            title="إلغاء المرفق"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={onSendReply} className="flex items-center gap-1.5 sm:gap-2">
        <label
          className="p-2 sm:p-2.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition active:scale-95 shrink-0"
          title="إرفاق صورة أو لقطة شاشة"
        >
          <PhotoIcon className="h-5 w-5" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={sending}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setReplyImage(e.target.files[0]);
              }
            }}
          />
        </label>

        <input
          type="text"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onPaste={onPaste}
          placeholder={
            replyImage
              ? "اكتب تعليقاً على الصورة (اختياري) أو اضغط إرسال..."
              : "اكتب ردك، أو الصق لقطة الشاشة مباشرة (Ctrl+V)..."
          }
          disabled={sending}
          className="flex-1 min-w-0 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:border-zinc-400 dark:focus:border-zinc-600 transition"
        />

        <button
          type="submit"
          disabled={sending || (!replyText.trim() && !replyImage)}
          className="p-2.5 px-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 disabled:opacity-40 transition active:scale-97 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold shrink-0 shadow-xs"
        >
          <span>{sending ? "إرسال..." : "إرسال"}</span>
          <PaperAirplaneIcon className="h-3.5 w-3.5 rotate-180" />
        </button>
      </form>
    </footer>
  );
};
