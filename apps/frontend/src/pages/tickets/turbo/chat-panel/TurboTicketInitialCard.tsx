import React from "react";
import type { TurboTicketItem } from "../types";
import { formatSafeDateTime } from "../ticketDateUtils";
import { extractMediaUrls } from "./chatPanelUtils";

export interface TurboTicketInitialCardProps {
  ticket: TurboTicketItem;
  user: any;
  onPreviewImage: (url: string) => void;
}

export const TurboTicketInitialCard: React.FC<TurboTicketInitialCardProps> = ({
  ticket,
  user,
  onPreviewImage,
}) => {
  const storeName = user?.company?.name?.trim() || "المتجر";
  let creatorClean = (
    ticket.creator_name ||
    ticket.user?.name ||
    ticket.user_name ||
    ticket.client_name ||
    ""
  )
    .trim()
    .replace(/العميل\s+[^\s]+/gi, "")
    .trim();

  if (
    !creatorClean ||
    creatorClean.toLowerCase() === "swan" ||
    creatorClean === "المتجر"
  ) {
    creatorClean =
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
      "المسؤول";
  }
  const byText = `${storeName} - ${creatorClean}`;
  const initialMediaUrls = extractMediaUrls(ticket);

  return (
    <div className="p-3 sm:p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
      <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5 flex-wrap gap-1">
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
          تذكرة بواسطة: {byText}
        </span>
        <span className="tabular-nums font-mono text-[11px]">
          {ticket.created_at ? formatSafeDateTime(ticket.created_at) : ""}
        </span>
      </div>
      {ticket.category?.name && (
        <div className="mb-2">
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60">
            الفئة: {ticket.category.name}
          </span>
        </div>
      )}
      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
        {ticket.content || ticket.description || "لا يوجد وصف إضافي"}
      </p>

      {/* Initial Ticket Attachment if present */}
      {initialMediaUrls.length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
          <p className="text-[11px] text-zinc-400 mb-1.5 font-medium">
            مرفقات التذكرة ({initialMediaUrls.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {initialMediaUrls.map((url, attIdx) => (
              <button
                key={attIdx}
                type="button"
                onClick={() => onPreviewImage(url)}
                className="group relative rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 max-w-[160px] max-h-[120px] focus:outline-hidden bg-zinc-950/20"
                title="تكبير المرفق"
              >
                <img
                  src={url}
                  alt={`مرفق ${attIdx + 1}`}
                  className="object-cover w-full h-full group-hover:scale-105 transition"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
