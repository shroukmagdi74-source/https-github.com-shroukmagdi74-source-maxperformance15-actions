import React from "react";
import { UserIcon } from "@heroicons/react/24/outline";
import type { TurboMessage } from "../types";
import { formatSafeTime } from "../ticketDateUtils";
import { extractMediaUrls } from "./chatPanelUtils";

export interface TurboTicketMessageBubbleProps {
  message: TurboMessage;
  isStore: boolean;
  senderTitle: string;
  roleName: string;
  onPreviewImage: (url: string) => void;
}

export const TurboTicketMessageBubble: React.FC<TurboTicketMessageBubbleProps> = ({
  message,
  isStore,
  senderTitle,
  roleName,
  onPreviewImage,
}) => {
  const textContent = message.content || message.message || "";
  const msgMediaUrls = extractMediaUrls(message);

  return (
    <div
      className={`flex flex-col ${isStore ? "items-end" : "items-start"}`}
    >
      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-1 px-1 flex-wrap">
        <UserIcon className="h-3 w-3" />
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
          {senderTitle}
        </span>
        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
          {roleName}
        </span>
        {message.created_at && (
          <span className="tabular-nums font-mono text-[10px]">
            • {formatSafeTime(message.created_at)}
          </span>
        )}
      </div>

      <div
        className={`max-w-[88%] sm:max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
          isStore
            ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-br-xs"
            : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-bl-xs"
        }`}
      >
        {textContent && (
          <p className="whitespace-pre-wrap break-words">{textContent}</p>
        )}

        {msgMediaUrls.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {msgMediaUrls.map((url, uIdx) => (
              <img
                key={uIdx}
                src={url}
                alt="مرفق التذكرة"
                onClick={() => onPreviewImage(url)}
                className="max-h-48 rounded-lg cursor-pointer hover:opacity-90 transition border border-white/20 object-contain bg-zinc-950/20"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
