import React from "react";

export interface OrderSummaryAssuranceCardProps {
  showAssuranceCard: boolean;
  assuranceTitle: string;
  assuranceItems: string[];
  isWomenFashionSummary: boolean;
  isFittingRoomSummary: boolean;
  isSproutRoom: boolean;
  isKhemetLuxe: boolean;
  isBoutiqueSummary: boolean;
  isMarketSummary: boolean;
  hasNatureSummaryTone: boolean;
}

export const OrderSummaryAssuranceCard: React.FC<
  OrderSummaryAssuranceCardProps
> = ({
  showAssuranceCard,
  assuranceTitle,
  assuranceItems,
  isWomenFashionSummary,
  isFittingRoomSummary,
  isSproutRoom,
  isKhemetLuxe,
  isBoutiqueSummary,
  isMarketSummary,
  hasNatureSummaryTone,
}) => {
  if (!showAssuranceCard) return null;

  const notesCardClassName = isWomenFashionSummary
    ? "rounded-[1.25rem] border border-[#ead8cf] bg-white/94 p-3.5 shadow-[0_16px_44px_-40px_rgba(107,33,49,0.1)]"
    : isFittingRoomSummary
      ? "rounded-[1.25rem] border border-[#f0ebe6] bg-[#fbf8f5] p-4 text-[#6f6962]"
      : isSproutRoom
        ? "border border-[#d8e6d8] bg-[#f8fbf7] p-4"
        : isKhemetLuxe
          ? "rounded-[0.95rem] border border-[#e7ddd0] bg-transparent p-0 shadow-none"
          : isBoutiqueSummary
            ? "rounded-[1.5rem] border border-[#ead8cf] bg-white/94 p-4 shadow-[0_18px_50px_-42px_rgba(107,33,49,0.12)]"
            : isMarketSummary
              ? "rounded-[1.5rem] border border-[#f0d4b0] bg-white/94 p-4 shadow-[0_18px_50px_-42px_rgba(154,93,34,0.12)]"
              : hasNatureSummaryTone
                ? "rounded-[1.5rem] border border-[#dbe3d4] bg-white/94 p-4 shadow-[0_18px_50px_-42px_rgba(26,51,40,0.12)]"
                : "rounded-[1.5rem] border border-[#ead8b1] bg-white/92 p-4 shadow-[0_18px_50px_-42px_rgba(90,62,24,0.16)]";

  return (
    <div className={notesCardClassName}>
      <h3 className="text-sm font-black text-foreground">{assuranceTitle}</h3>
      <div className="mt-3 space-y-2">
        {assuranceItems.map((item) => (
          <p
            key={item}
            className={`flex items-start gap-2 text-sm ${
              isKhemetLuxe
                ? "text-[#6d5a44]"
                : isBoutiqueSummary
                  ? "text-[#72545b]"
                  : isMarketSummary
                    ? "text-[#7b5531]"
                    : hasNatureSummaryTone
                      ? "text-[#4a6843]"
                      : "text-[#5b4a28]"
            }`}
          >
            <span
              className={`mt-1 h-1.5 w-1.5 rounded-full ${
                isKhemetLuxe
                  ? "bg-[#b89255]"
                  : isBoutiqueSummary
                    ? "bg-[#d77d6a]"
                    : isMarketSummary
                      ? "bg-[#c9874a]"
                      : hasNatureSummaryTone
                        ? "bg-[#88a876]"
                        : "bg-[#d4a64a]"
              }`}
            />
            <span>{item}</span>
          </p>
        ))}
      </div>
    </div>
  );
};

export default OrderSummaryAssuranceCard;
