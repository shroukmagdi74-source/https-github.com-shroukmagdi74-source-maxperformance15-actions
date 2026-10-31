import React from "react";
import {
  OrderSummaryVariant,
  getProgressBarClassName,
  replaceCurrencyToken,
} from "./types";

export interface OrderSummaryFreeShippingBarProps {
  showFreeShippingProgress: boolean;
  freeShippingEnabled: boolean;
  freeShippingRemaining: number;
  freeShippingProgress: number;
  freeShippingTitle: string;
  resolvedFreeShippingText: string;
  currency: string;
  variant: OrderSummaryVariant;
  isWomenFashionSummary: boolean;
  isBiteRush: boolean;
  isSproutRoom: boolean;
  isAirlume: boolean;
  isKhemetLuxe: boolean;
  hasNatureSummaryTone: boolean;
  isMarketSummary: boolean;
  isBoutiqueSummary: boolean;
  isCommandSummary: boolean;
}

export const OrderSummaryFreeShippingBar: React.FC<
  OrderSummaryFreeShippingBarProps
> = ({
  showFreeShippingProgress,
  freeShippingEnabled,
  freeShippingRemaining,
  freeShippingProgress,
  freeShippingTitle,
  resolvedFreeShippingText,
  currency,
  variant,
  isWomenFashionSummary,
  isBiteRush,
  isSproutRoom,
  isAirlume,
  isKhemetLuxe,
  hasNatureSummaryTone,
  isMarketSummary,
  isBoutiqueSummary,
  isCommandSummary,
}) => {
  if (!showFreeShippingProgress || !freeShippingEnabled) return null;

  const progressCardClassName = isWomenFashionSummary
    ? "space-y-2.5 rounded-[1.25rem] border border-[#ead8cf] bg-white/94 p-3.5 shadow-[0_16px_42px_-40px_rgba(107,33,49,0.1)]"
    : isBiteRush
      ? "space-y-3 rounded-[1.5rem] border border-[#f8c08c] bg-white/88 p-4 shadow-[0_18px_50px_-40px_rgba(247,115,22,0.32)]"
      : isSproutRoom
        ? "space-y-3 border border-[#d8e6d8] bg-[#f8fbf7] p-4"
        : isAirlume
          ? "space-y-3 rounded-[1.2rem] border border-primary/10 bg-white/88 p-4 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.28)]"
          : isKhemetLuxe
            ? "space-y-3 rounded-[0.95rem] border border-[#e7ddd0] bg-transparent p-0 shadow-none"
            : hasNatureSummaryTone
              ? "space-y-3 rounded-[1.3rem] border border-[#dce4d5] bg-white/92 p-4 shadow-[0_18px_50px_-42px_rgba(26,51,40,0.2)]"
              : isMarketSummary
                ? "space-y-3 rounded-[1.5rem] border border-[#f0d4b0] bg-white/92 p-4 shadow-[0_18px_50px_-42px_rgba(154,93,34,0.14)]"
                : isBoutiqueSummary
                  ? "space-y-3 rounded-[1.5rem] border border-[#ead8cf] bg-white/92 p-4 shadow-[0_18px_50px_-42px_rgba(107,33,49,0.12)]"
                  : isCommandSummary
                    ? "space-y-3 rounded-[1.5rem] border border-[#ead8b1] bg-white/92 p-4 shadow-[0_18px_50px_-42px_rgba(90,62,24,0.16)]"
                    : "space-y-3 rounded-[1rem] border border-border bg-background/75 p-4";

  return (
    <div className={progressCardClassName}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            ميزة الشحن
          </p>
          <p className="text-sm text-foreground">
            {freeShippingRemaining > 0
              ? replaceCurrencyToken(
                  freeShippingTitle,
                  freeShippingRemaining,
                  currency,
                )
              : resolvedFreeShippingText}
          </p>
        </div>
        <span className="text-xs font-semibold text-muted-foreground tabular-nums">
          {Math.round(freeShippingProgress)}%
        </span>
      </div>
      <div className={getProgressBarClassName(variant)}>
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${freeShippingProgress}%` }}
        />
      </div>
    </div>
  );
};

export default OrderSummaryFreeShippingBar;
