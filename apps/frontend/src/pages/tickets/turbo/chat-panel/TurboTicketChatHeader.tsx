import React from "react";
import {
  ArrowPathIcon,
  ArrowRightIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  ClockIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import type { TurboTicketItem } from "../types";
import { getStatusBadge } from "./chatPanelUtils";

export interface TurboTicketChatHeaderProps {
  ticket: TurboTicketItem;
  loading: boolean;
  copiedCode: boolean;
  showOrderSidebar: boolean;
  ratingScore: number | null;
  submittingRating: boolean;
  activeOrder: any;
  onBackToList?: () => void;
  onCopyCode: (code: string) => void;
  onToggleOrderSidebar: () => void;
  onRate: (score: number) => void;
  onOpenLogs: () => void;
  onRefreshTicket: () => void;
}

export const TurboTicketChatHeader: React.FC<TurboTicketChatHeaderProps> = ({
  ticket,
  loading,
  copiedCode,
  showOrderSidebar,
  ratingScore,
  submittingRating,
  activeOrder,
  onBackToList,
  onCopyCode,
  onToggleOrderSidebar,
  onRate,
  onOpenLogs,
  onRefreshTicket,
}) => {
  const statusInfo = ticket.status !== undefined ? getStatusBadge(ticket.status) : null;
  const isShipmentCodeDifferent =
    ticket.code && String(ticket.code).trim() !== String(ticket.id).trim();

  return (
    <header className="p-2.5 sm:p-3 px-3 sm:px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-2.5 shrink-0 z-10">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onBackToList && (
          <button
            type="button"
            onClick={onBackToList}
            className="md:hidden p-1.5 px-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition active:scale-95 flex items-center gap-1 text-xs font-semibold shrink-0"
            title="الرجوع لقائمة التذاكر"
          >
            <ArrowRightIcon className="h-4 w-4" />
            <span>رجوع</span>
          </button>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums">
              تذكرة #{ticket.id}
            </h2>
            {statusInfo && (
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${statusInfo.className}`}
              >
                {statusInfo.label}
              </span>
            )}
            {isShipmentCodeDifferent && (
              <button
                type="button"
                onClick={() => onCopyCode(ticket.code!)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-mono transition"
                title="نسخ كود الشحنة"
              >
                <span>شحنة: {ticket.code}</span>
                {copiedCode ? (
                  <ClipboardDocumentCheckIcon className="h-3 w-3 text-emerald-600" />
                ) : (
                  <ClipboardDocumentIcon className="h-3 w-3 text-zinc-400" />
                )}
              </button>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-sm mt-0.5">
            {ticket.subject || ticket.description || "استفسار شحن"}
          </p>
        </div>
      </div>

      {/* Right Tools: Order Details & Rating & Logs & Refresh */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          type="button"
          onClick={onToggleOrderSidebar}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
            showOrderSidebar
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xs"
              : activeOrder || ticket.matchedOrderSummary
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
              : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
          title="تفاصيل الأوردر المرتبط"
        >
          <ShoppingBagIcon className="h-4 w-4" />
          <span className="hidden sm:inline">تفاصيل الأوردر</span>
          {(activeOrder || ticket.matchedOrderSummary) && (
            <span className="tabular-nums font-mono px-1.5 py-0.2 rounded text-[10px] bg-emerald-600 text-white font-bold">
              #{activeOrder?.orderNumber || ticket.matchedOrderSummary?.orderNumber}
            </span>
          )}
        </button>

        {/* Rating */}
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs">
          <span className="text-zinc-500 text-[11px] ml-1">تقييم:</span>
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              disabled={submittingRating}
              onClick={() => onRate(s)}
              className="text-amber-400 hover:scale-110 transition disabled:opacity-50"
            >
              {ratingScore && ratingScore >= s ? (
                <StarSolid className="h-3.5 w-3.5" />
              ) : (
                <StarOutline className="h-3.5 w-3.5 text-zinc-400" />
              )}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onOpenLogs}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <ClockIcon className="h-3.5 w-3.5" />
          <span>السجل</span>
        </button>

        <button
          type="button"
          onClick={onRefreshTicket}
          disabled={loading}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50"
          title="تحديث المحادثة"
        >
          <ArrowPathIcon
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>
    </header>
  );
};
