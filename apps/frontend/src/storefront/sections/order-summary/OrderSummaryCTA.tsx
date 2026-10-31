import React from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button";
import { formatStorefrontCurrency } from "../../utils/currency";

export interface OrderSummaryCTAProps {
  minimumOrder: {
    blocked: boolean;
    message?: string;
    progress?: number;
    remaining: number;
  };
  hideCheckoutButton: boolean;
  checkoutPath: string;
  checkoutButtonText: string;
  currency: string;
  prefersArabicCopy: boolean;
  shouldShowTrustSummaryRow: boolean;
  secureCheckoutText: string;
  returnsText: string;
  isWomenFashionSummary: boolean;
  isFittingRoomSummary: boolean;
  isBiteRush: boolean;
  isSproutRoom: boolean;
  isAirlume: boolean;
  isKhemetLuxe: boolean;
  hasNatureSummaryTone: boolean;
  isMarketSummary: boolean;
  isBoutiqueSummary: boolean;
  isCommandSummary: boolean;
  onCheckoutClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const OrderSummaryCTA: React.FC<OrderSummaryCTAProps> = ({
  minimumOrder,
  hideCheckoutButton,
  checkoutPath,
  checkoutButtonText,
  currency,
  prefersArabicCopy,
  shouldShowTrustSummaryRow,
  secureCheckoutText,
  returnsText,
  isWomenFashionSummary,
  isFittingRoomSummary,
  isBiteRush,
  isSproutRoom,
  isAirlume,
  isKhemetLuxe,
  hasNatureSummaryTone,
  isMarketSummary,
  isBoutiqueSummary,
  isCommandSummary,
  onCheckoutClick,
}) => {
  const checkoutButtonClassName = isWomenFashionSummary
    ? "h-11.5 rounded-full border-none bg-[linear-gradient(135deg,#3d2a2f_0%,#8f4d41_100%)] text-sm font-black text-white shadow-[0_20px_64px_-34px_rgba(107,33,49,0.24)] transition-all hover:opacity-95 sm:h-12 sm:text-base"
    : isFittingRoomSummary
      ? "h-12 rounded-[1rem] border-none bg-[#2b2b2b] text-sm font-bold text-white shadow-[0_18px_44px_-28px_rgba(31,31,31,0.42)] transition-all hover:bg-[#1f1f1f]"
      : isBiteRush
        ? "h-12 rounded-full border-none bg-[linear-gradient(135deg,#f97316_0%,#ef4444_100%)] text-white shadow-[0_24px_80px_-34px_rgba(239,68,68,0.6)] transition-all hover:shadow-[0_28px_86px_-30px_rgba(249,115,22,0.68)]"
        : isSproutRoom
          ? "h-12 rounded-full border-none bg-[#203528] text-[#f4fbf5] shadow-[0_22px_56px_-36px_rgba(32,53,40,0.42)] transition-all hover:opacity-95"
          : isAirlume
            ? "h-12 rounded-full border-none bg-[linear-gradient(135deg,#0f172a_0%,hsl(var(--primary))_58%,#60a5fa_100%)] text-white shadow-[0_24px_80px_-38px_hsl(var(--primary)/0.7)] transition-all hover:opacity-95"
            : isKhemetLuxe
              ? "h-11.5 rounded-[0.85rem] border-none bg-[linear-gradient(135deg,#2c241b_0%,#7b6030_48%,#b89255_100%)] text-sm font-black text-white shadow-none transition-all hover:opacity-95 sm:h-12"
              : hasNatureSummaryTone
                ? "h-12 rounded-full border-none bg-[linear-gradient(135deg,#1a3328_0%,#476343_100%)] text-white shadow-[0_24px_70px_-36px_rgba(26,51,40,0.55)] transition-all hover:opacity-95"
                : isMarketSummary
                  ? "h-12 rounded-full border-none bg-[linear-gradient(135deg,#6b4423_0%,#c9874a_100%)] text-white shadow-[0_24px_70px_-36px_rgba(154,93,34,0.34)] transition-all hover:opacity-95"
                  : isBoutiqueSummary
                    ? "h-12 rounded-full border-none bg-[linear-gradient(135deg,#3d2a2f_0%,#8f4d41_100%)] text-white shadow-[0_24px_80px_-36px_rgba(107,33,49,0.3)] transition-all hover:opacity-95"
                    : isCommandSummary
                      ? "h-12 rounded-full border-none bg-[linear-gradient(135deg,#1f1f1b_0%,#725523_52%,#d5ac58_100%)] text-white shadow-[0_24px_80px_-36px_rgba(90,62,24,0.5)] transition-all hover:opacity-95"
                      : undefined;

  const trustRowClassName = isWomenFashionSummary
    ? "flex flex-wrap items-center justify-center gap-2 rounded-[1rem] border border-[#ead8cf] bg-white/92 px-3 py-2 text-[11px] text-[#8b5f59] shadow-sm"
    : isBiteRush
      ? "flex items-center justify-center gap-4 rounded-full border border-[#f8c08c] bg-white/88 px-4 py-3 text-xs text-[#8a4b1f] shadow-sm"
      : isSproutRoom
        ? "flex flex-wrap items-center justify-center gap-3 rounded-full border border-[#d8e6d8] bg-[#f8fbf7] px-4 py-3 text-xs text-[#56715e]"
        : isAirlume
          ? "flex items-center justify-center gap-4 rounded-full border border-primary/10 bg-white/88 px-4 py-3 text-xs text-muted-foreground shadow-sm"
          : isKhemetLuxe
            ? "flex flex-wrap items-center justify-center gap-3 rounded-[0.85rem] border border-[#e7ddd0] bg-[#fcf8f2] px-4 py-3 text-xs text-[#725523]"
            : hasNatureSummaryTone
              ? "flex items-center justify-center gap-4 rounded-full border border-[#dbe3d4] bg-white/88 px-4 py-3 text-xs text-[#64725f] shadow-sm"
              : isMarketSummary
                ? "flex flex-wrap items-center justify-center gap-3 rounded-[1.2rem] border border-[#f0d4b0] bg-white/92 px-4 py-3 text-xs text-[#8b6037] shadow-sm"
                : isBoutiqueSummary
                  ? "flex flex-wrap items-center justify-center gap-3 rounded-[1.2rem] border border-[#ead8cf] bg-white/92 px-4 py-3 text-xs text-[#8b5f59] shadow-sm"
                  : isCommandSummary
                    ? "flex flex-wrap items-center justify-center gap-3 rounded-[1.2rem] border border-[#ead8b1] bg-white/92 px-4 py-3 text-xs text-[#6d5527] shadow-sm"
                    : "flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground";

  return (
    <>
      {minimumOrder.blocked ? (
        <div className="space-y-3 rounded-[1rem] border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold leading-6 text-amber-900">
            {minimumOrder.message}
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-amber-200">
            <div
              className="h-full rounded-full bg-amber-600 transition-[width] duration-500"
              style={{ width: `${minimumOrder.progress}%` }}
            />
          </div>
        </div>
      ) : null}

      {!hideCheckoutButton ? (
        <Link
          to={checkoutPath}
          className="block"
          onClick={onCheckoutClick}
          aria-disabled={minimumOrder.blocked}
        >
          <Button
            fullWidth
            size="lg"
            className={checkoutButtonClassName}
            disabled={minimumOrder.blocked}
          >
            {minimumOrder.blocked
              ? `${prefersArabicCopy ? "متبقي" : "Remaining"} ${formatStorefrontCurrency(minimumOrder.remaining, currency)}`
              : checkoutButtonText}
          </Button>
        </Link>
      ) : null}

      {shouldShowTrustSummaryRow ? (
        <div className={trustRowClassName}>
          <span className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {secureCheckoutText}
          </span>
          <span>&bull;</span>
          <span>{returnsText}</span>
        </div>
      ) : null}
    </>
  );
};

export default OrderSummaryCTA;
