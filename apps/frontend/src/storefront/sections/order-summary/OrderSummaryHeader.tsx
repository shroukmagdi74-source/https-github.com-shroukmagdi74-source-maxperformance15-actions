import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { buildStorefrontPath } from "../../utils/paths";

export interface OrderSummaryHeaderProps {
  isFittingRoomSummary: boolean;
  isBiteRush: boolean;
  isSproutRoom: boolean;
  isMarketSummary: boolean;
  isKhemetLuxe: boolean;
  isNatureSummary: boolean;
  isCommandSummary: boolean;
  isBoutiqueSummary: boolean;
  isWomenFashionSummary: boolean;
  headerBadge?: string;
  title?: string;
  subtitle?: string;
  itemsCount: number;
}

export const OrderSummaryHeader: React.FC<OrderSummaryHeaderProps> = ({
  isFittingRoomSummary,
  isBiteRush,
  isSproutRoom,
  isMarketSummary,
  isKhemetLuxe,
  isNatureSummary,
  isCommandSummary,
  isBoutiqueSummary,
  isWomenFashionSummary,
  headerBadge,
  title,
  subtitle,
  itemsCount,
}) => {
  const location = useLocation();

  const titleClassName = isWomenFashionSummary
    ? "font-heading text-base font-bold text-foreground sm:text-lg"
    : isFittingRoomSummary
      ? "text-center font-heading text-base font-black text-[#242220]"
      : isKhemetLuxe
        ? "font-heading text-[1.05rem] font-bold text-foreground"
        : "font-heading text-lg font-bold text-foreground";

  const subtitleClassName = isWomenFashionSummary
    ? "text-sm leading-5 text-muted-foreground"
    : isFittingRoomSummary
      ? "text-center text-xs leading-5 text-[#8a837c]"
      : isKhemetLuxe
        ? "text-sm leading-6 text-[#6f6455]"
        : "text-sm leading-6 text-muted-foreground";

  const showSummaryHeading =
    !isFittingRoomSummary && Boolean(headerBadge || title || subtitle);

  return (
    <>
      {isFittingRoomSummary ? (
        <div className="flex items-center justify-between gap-4 pb-1">
          <Link
            to={buildStorefrontPath(
              location.pathname,
              "/shop",
              location.search,
            )}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#45413d] transition-colors hover:bg-[#f7f4f1]"
            aria-label="Back to shop"
          >
            <ArrowLeft size={18} strokeWidth={2.2} />
          </Link>
          <h2 className="font-heading text-base font-black text-[#242220]">
            {title || "Shopping Bag"}
          </h2>
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-[#45413d]">
            <ShoppingBag size={18} strokeWidth={2.2} />
            <span className="absolute end-1 top-1 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#8fcac0] px-1 text-[8px] font-black text-white">
              {itemsCount}
            </span>
          </span>
        </div>
      ) : null}

      {showSummaryHeading ? (
        <div className="space-y-2">
          {isBiteRush ? (
            <span className="inline-flex rounded-full bg-[#111111] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              إجمالي الطلب
            </span>
          ) : isSproutRoom && headerBadge ? (
            <span className="inline-flex rounded-full border border-[#d8e6d8] bg-[#f8fbf7] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#43604b]">
              {headerBadge}
            </span>
          ) : isMarketSummary && headerBadge ? (
            <span className="inline-flex rounded-full border border-[#f0d4b0] bg-[#fff8ef] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#8b6037]">
              {headerBadge}
            </span>
          ) : isKhemetLuxe && headerBadge ? (
            <span className="inline-flex rounded-full border border-[#d9c8ad] bg-[#fffaf2] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#725523]">
              {headerBadge}
            </span>
          ) : isNatureSummary && headerBadge ? (
            <span className="inline-flex rounded-full border border-[#dbe3d4] bg-[#f6f8f2] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#4a6843]">
              {headerBadge}
            </span>
          ) : isCommandSummary && headerBadge ? (
            <span className="inline-flex rounded-full border border-[#ead8b1] bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#6d5527]">
              {headerBadge}
            </span>
          ) : isBoutiqueSummary && headerBadge ? (
            <span className="inline-flex rounded-full border border-[#f0ddd5] bg-[#fff7f4] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#8b5f59]">
              {headerBadge}
            </span>
          ) : null}
          {title ? <h2 className={titleClassName}>{title}</h2> : null}
          {subtitle ? <p className={subtitleClassName}>{subtitle}</p> : null}
        </div>
      ) : null}
    </>
  );
};

export default OrderSummaryHeader;
