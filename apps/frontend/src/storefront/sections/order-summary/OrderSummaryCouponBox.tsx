import React from "react";
import Button from "../../components/Button";

export interface OrderSummaryCouponBoxProps {
  showCouponField: boolean;
  couponFieldId: string;
  couponCode: string;
  isCouponLoading: boolean;
  couponPlaceholder: string;
  couponButtonText: string;
  isKhemetLuxe: boolean;
  isWomenFashionSummary: boolean;
  isFittingRoomSummary: boolean;
  isBiteRush: boolean;
  isSproutRoom: boolean;
  isAirlume: boolean;
  hasNatureSummaryTone: boolean;
  isMarketSummary: boolean;
  isBoutiqueSummary: boolean;
  isCommandSummary: boolean;
  onChangeCouponCode: (val: string) => void;
  onApplyCoupon: () => void;
}

export const OrderSummaryCouponBox: React.FC<OrderSummaryCouponBoxProps> = ({
  showCouponField,
  couponFieldId,
  couponCode,
  isCouponLoading,
  couponPlaceholder,
  couponButtonText,
  isKhemetLuxe,
  isWomenFashionSummary,
  isFittingRoomSummary,
  isBiteRush,
  isSproutRoom,
  isAirlume,
  hasNatureSummaryTone,
  isMarketSummary,
  isBoutiqueSummary,
  isCommandSummary,
  onChangeCouponCode,
  onApplyCoupon,
}) => {
  if (!showCouponField) return null;

  const checkingCouponText = "جارٍ التحقق...";

  const couponRowClassName = isWomenFashionSummary
    ? "flex flex-col gap-2 sm:flex-row"
    : isFittingRoomSummary
      ? "flex items-center gap-2"
      : isKhemetLuxe
        ? "flex flex-col items-stretch gap-3 sm:flex-row"
        : "flex gap-2";

  const couponInputClassName = isWomenFashionSummary
    ? "flex-1 min-h-[44px] rounded-[1rem] border border-[#ead8cf] bg-white/96 px-3 py-2.5 text-sm text-[#3d2a2f] placeholder:text-[#9a7671] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d77d6a]/18"
    : isFittingRoomSummary
      ? "min-h-[44px] flex-1 rounded-[1rem] border border-transparent bg-[#f7f4f1] px-4 py-2.5 text-sm text-[#242220] placeholder:text-[#b8b1aa] shadow-inner focus:border-[#d8cec4] focus:outline-none focus:ring-2 focus:ring-[#242220]/10"
      : isBiteRush
        ? "flex-1 rounded-[1.1rem] border border-[#f8c08c] bg-white px-3 py-2.5 text-sm text-[#111111] placeholder:text-[#a14a14] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]/20"
        : isSproutRoom
          ? "flex-1 rounded-full border border-[#d8e6d8] bg-white px-4 py-2.5 text-sm text-[#203528] placeholder:text-[#6b8a74] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7fa178]/20"
          : isAirlume
            ? "flex-1 rounded-[1rem] border border-primary/10 bg-white/92 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            : isKhemetLuxe
              ? "flex-1 min-h-[44px] rounded-[0.7rem] border border-[#ddd3c5] bg-white px-3 py-2.5 text-sm text-[#2c241b] placeholder:text-[#9a8c75] focus:outline-none focus:ring-2 focus:ring-[#b89255]/14"
              : hasNatureSummaryTone
                ? "flex-1 rounded-[1rem] border border-[#d8e0d1] bg-white/96 px-3 py-2.5 text-sm text-foreground placeholder:text-[#8b9783] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#88a876]/20"
                : isMarketSummary
                  ? "flex-1 rounded-[1.1rem] border border-[#f0d4b0] bg-white/96 px-3 py-2.5 text-sm text-[#4b3321] placeholder:text-[#a67d56] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c9874a]/18"
                  : isBoutiqueSummary
                    ? "flex-1 rounded-[1.1rem] border border-[#ead8cf] bg-white/96 px-3 py-2.5 text-sm text-[#3d2a2f] placeholder:text-[#9a7671] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d77d6a]/18"
                    : isCommandSummary
                      ? "flex-1 rounded-[1.1rem] border border-[#ead8b1] bg-white/96 px-3 py-2.5 text-sm text-[#1f1f1b] placeholder:text-[#8c7341] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d4a64a]/20"
                      : "flex-1 rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  if (isKhemetLuxe) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-semibold text-[#111111]">
          هل لديك كود خصم؟
        </p>
        <div className={couponRowClassName} dir="ltr">
          <input
            id={couponFieldId}
            name="couponCode"
            type="text"
            value={couponCode}
            onChange={(e) => onChangeCouponCode(e.target.value)}
            placeholder={couponPlaceholder}
            className={`${couponInputClassName} text-right [direction:rtl]`}
          />
          <Button
            variant="default"
            size="md"
            onClick={onApplyCoupon}
            disabled={isCouponLoading}
            className="min-h-[44px] w-full rounded-[0.5rem] bg-[#2c241b] px-6 font-bold text-white shadow-none hover:bg-[#1f1a14] disabled:bg-[#e8d8c2] disabled:text-[#7b6030] disabled:opacity-100 sm:min-w-[96px] sm:w-auto"
          >
            {isCouponLoading ? checkingCouponText : "تطبيق"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={couponRowClassName}>
      <input
        id={couponFieldId}
        name="couponCode"
        type="text"
        value={couponCode}
        onChange={(e) => onChangeCouponCode(e.target.value)}
        placeholder={couponPlaceholder}
        className={couponInputClassName}
      />
      <Button
        variant="outline"
        size="md"
        onClick={onApplyCoupon}
        disabled={isCouponLoading}
        className={
          isBiteRush
            ? "rounded-full border-[#111111] bg-[#111111] px-5 font-black text-white shadow-sm hover:border-[#f97316] hover:bg-[#f97316]"
            : isFittingRoomSummary
              ? "min-h-[44px] rounded-[1rem] border-[#2b2b2b] bg-[#2b2b2b] px-5 text-sm font-bold text-white shadow-none hover:border-[#1f1f1f] hover:bg-[#1f1f1f]"
              : isAirlume
                ? "rounded-full border-primary/12 bg-white/88 px-5 font-bold text-foreground shadow-sm hover:border-primary/30 hover:bg-white"
                : isKhemetLuxe
                  ? "rounded-[0.95rem] border-[#d9c8ad] bg-[#2c241b] px-5 font-bold text-white shadow-sm hover:border-[#b89255] hover:bg-[#6d5527]"
                  : hasNatureSummaryTone
                    ? "rounded-full border-[#d8e0d1] bg-[#f6f7f2] px-5 font-bold text-[#1a3328] shadow-sm hover:border-[#88a876] hover:bg-white"
                    : isMarketSummary
                      ? "rounded-full border-[#f0d4b0] bg-white px-5 font-bold text-[#8b6037] shadow-sm hover:border-[#c9874a] hover:bg-[#fff8ef]"
                      : isBoutiqueSummary
                        ? "rounded-full border-[#ead8cf] bg-white px-5 font-bold text-[#72545b] shadow-sm hover:border-[#d77d6a] hover:bg-[#fff8f5]"
                        : isCommandSummary
                          ? "rounded-full border-[#ead8b1] bg-white px-5 font-bold text-[#5b4a28] shadow-sm hover:border-[#d4a64a] hover:bg-[#fff8ea]"
                          : undefined
        }
      >
        {isCouponLoading ? checkingCouponText : couponButtonText}
      </Button>
    </div>
  );
};

export default OrderSummaryCouponBox;
