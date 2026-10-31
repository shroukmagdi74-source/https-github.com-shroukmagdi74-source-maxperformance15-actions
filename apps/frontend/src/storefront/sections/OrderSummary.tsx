import React from "react";
import {
  OrderSummaryProps,
  useOrderSummaryController,
  OrderSummaryHeader,
  OrderSummaryFreeShippingBar,
  OrderSummaryLineItems,
  OrderSummaryCouponBox,
  OrderSummaryTotalsCard,
  OrderSummaryAssuranceCard,
  OrderSummaryNextStepsCard,
  OrderSummaryCTA,
} from "./order-summary";

export * from "./order-summary";

export const OrderSummary: React.FC<OrderSummaryProps> = (props) => {
  const {
    couponFieldId,
    couponCode,
    isCouponLoading,
    items,
    persistedCartItemCount,
    updateQuantity,
    currency,
    subtotal,
    variant,
    prefersArabicCopy,
    isAirlume,
    isBiteRush,
    isSproutRoom,
    isWomenFashionSummary,
    isKhemetLuxe,
    isMarketSummary,
    isNatureSummary,
    isCommandSummary,
    isBoutiqueSummary,
    isFittingRoomSummary,
    hasNatureSummaryTone,
    checkoutPath,
    minimumOrder,
    effectiveShipping,
    loyaltyFreeShipping,
    loyaltyDiscount,
    voucherDiscount,
    couponDiscount,
    storePromotionDiscount,
    storePromotionTier,
    walletDiscount,
    walletDiscountPercent,
    walletDiscountEnabled,
    walletPaymentSettings,
    tierProgress,
    tiersEnabled,
    activeCoupon,
    freeShippingEnabled,
    freeShippingRemaining,
    freeShippingProgress,
    freeShippingTitle,
    resolvedFreeShippingText,
    showFreeShippingProgress,
    showLineItems,
    lineItemsEditable,
    lineItemsTitle,
    showCouponField,
    couponPlaceholder,
    couponButtonText,
    hideCheckoutButton,
    checkoutButtonText,
    subtotalLabel,
    shippingLabel,
    totalLabel,
    estimatedTotal,
    resolvedShippingValueText,
    resolvedShippingHelpText,
    title,
    subtitle,
    headerBadge,
    assuranceTitle,
    assuranceItems,
    showAssuranceCard,
    nextStepsTitle,
    nextSteps,
    showNextStepsCard,
    shouldShowTrustSummaryRow,
    secureCheckoutText,
    returnsText,
    wrapperClassName,
    sectionClassName,
    setCouponCode,
    handleApplyCoupon,
    handleCheckoutClick,
  } = useOrderSummaryController(props);

  if (!items.length) {
    if (persistedCartItemCount > 0) {
      return (
        <section className={sectionClassName}>
          <div className={wrapperClassName} aria-busy="true">
            <div className="space-y-4" aria-hidden="true">
              <div className="h-4 w-28 animate-pulse rounded-full bg-[#eee5d9]" />
              <div className="h-7 w-40 animate-pulse rounded-full bg-[#e8ddcf]" />
              <div className="h-20 animate-pulse rounded-[0.95rem] bg-[#f3ece3]" />
              <div className="h-28 animate-pulse rounded-[0.95rem] bg-[#f3ece3]" />
              <div className="space-y-3">
                <div className="h-5 animate-pulse rounded-full bg-[#eee5d9]" />
                <div className="h-5 animate-pulse rounded-full bg-[#eee5d9]" />
                <div className="h-6 animate-pulse rounded-full bg-[#e8ddcf]" />
              </div>
            </div>
          </div>
        </section>
      );
    }

    return null;
  }

  return (
    <section className={sectionClassName}>
      <div className={wrapperClassName}>
        <OrderSummaryHeader
          isFittingRoomSummary={isFittingRoomSummary}
          isBiteRush={isBiteRush}
          isSproutRoom={isSproutRoom}
          isMarketSummary={isMarketSummary}
          isKhemetLuxe={isKhemetLuxe}
          isNatureSummary={isNatureSummary}
          isCommandSummary={isCommandSummary}
          isBoutiqueSummary={isBoutiqueSummary}
          isWomenFashionSummary={isWomenFashionSummary}
          headerBadge={headerBadge}
          title={title}
          subtitle={subtitle}
          itemsCount={items.length}
        />

        <OrderSummaryFreeShippingBar
          showFreeShippingProgress={showFreeShippingProgress}
          freeShippingEnabled={freeShippingEnabled}
          freeShippingRemaining={freeShippingRemaining}
          freeShippingProgress={freeShippingProgress}
          freeShippingTitle={freeShippingTitle}
          resolvedFreeShippingText={resolvedFreeShippingText}
          currency={currency}
          variant={variant}
          isWomenFashionSummary={isWomenFashionSummary}
          isBiteRush={isBiteRush}
          isSproutRoom={isSproutRoom}
          isAirlume={isAirlume}
          isKhemetLuxe={isKhemetLuxe}
          hasNatureSummaryTone={hasNatureSummaryTone}
          isMarketSummary={isMarketSummary}
          isBoutiqueSummary={isBoutiqueSummary}
          isCommandSummary={isCommandSummary}
        />

        <OrderSummaryLineItems
          showLineItems={showLineItems}
          lineItemsEditable={lineItemsEditable}
          lineItemsTitle={lineItemsTitle}
          items={items}
          currency={currency}
          prefersArabicCopy={prefersArabicCopy}
          isFittingRoomSummary={isFittingRoomSummary}
          isKhemetLuxe={isKhemetLuxe}
          onUpdateQuantity={updateQuantity}
        />

        {isKhemetLuxe && (
          <OrderSummaryCouponBox
            showCouponField={showCouponField}
            couponFieldId={couponFieldId}
            couponCode={couponCode}
            isCouponLoading={isCouponLoading}
            couponPlaceholder={couponPlaceholder}
            couponButtonText={couponButtonText}
            isKhemetLuxe={isKhemetLuxe}
            isWomenFashionSummary={isWomenFashionSummary}
            isFittingRoomSummary={isFittingRoomSummary}
            isBiteRush={isBiteRush}
            isSproutRoom={isSproutRoom}
            isAirlume={isAirlume}
            hasNatureSummaryTone={hasNatureSummaryTone}
            isMarketSummary={isMarketSummary}
            isBoutiqueSummary={isBoutiqueSummary}
            isCommandSummary={isCommandSummary}
            onChangeCouponCode={setCouponCode}
            onApplyCoupon={handleApplyCoupon}
          />
        )}

        <OrderSummaryTotalsCard
          subtotal={subtotal}
          currency={currency}
          subtotalLabel={subtotalLabel}
          shippingLabel={shippingLabel}
          totalLabel={totalLabel}
          resolvedShippingValueText={resolvedShippingValueText}
          resolvedShippingHelpText={resolvedShippingHelpText}
          shippingCost={effectiveShipping}
          checkoutFreeShippingActive={freeShippingRemaining === 0}
          loyaltyFreeShipping={loyaltyFreeShipping}
          isShippingLoading={false}
          loyaltyDiscount={loyaltyDiscount}
          loyaltyDiscountPercent={0}
          tiersEnabled={tiersEnabled}
          voucherDiscount={voucherDiscount}
          tierProgress={tierProgress}
          couponDiscount={couponDiscount}
          activeCoupon={activeCoupon}
          storePromotionDiscount={storePromotionDiscount}
          storePromotionTier={storePromotionTier}
          walletDiscount={walletDiscount}
          walletDiscountPercent={walletDiscountPercent}
          walletDiscountEnabled={walletDiscountEnabled}
          walletPaymentSettings={walletPaymentSettings}
          estimatedTotal={estimatedTotal}
          isCommandSummary={isCommandSummary}
          isKhemetLuxe={isKhemetLuxe}
          isBoutiqueSummary={isBoutiqueSummary}
          isMarketSummary={isMarketSummary}
          hasNatureSummaryTone={hasNatureSummaryTone}
          isWomenFashionSummary={isWomenFashionSummary}
          isFittingRoomSummary={isFittingRoomSummary}
          isSproutRoom={isSproutRoom}
        />

        <OrderSummaryAssuranceCard
          showAssuranceCard={showAssuranceCard}
          assuranceTitle={assuranceTitle}
          assuranceItems={assuranceItems}
          isWomenFashionSummary={isWomenFashionSummary}
          isFittingRoomSummary={isFittingRoomSummary}
          isSproutRoom={isSproutRoom}
          isKhemetLuxe={isKhemetLuxe}
          isBoutiqueSummary={isBoutiqueSummary}
          isMarketSummary={isMarketSummary}
          hasNatureSummaryTone={hasNatureSummaryTone}
        />

        {!isKhemetLuxe && (
          <OrderSummaryCouponBox
            showCouponField={showCouponField}
            couponFieldId={couponFieldId}
            couponCode={couponCode}
            isCouponLoading={isCouponLoading}
            couponPlaceholder={couponPlaceholder}
            couponButtonText={couponButtonText}
            isKhemetLuxe={isKhemetLuxe}
            isWomenFashionSummary={isWomenFashionSummary}
            isFittingRoomSummary={isFittingRoomSummary}
            isBiteRush={isBiteRush}
            isSproutRoom={isSproutRoom}
            isAirlume={isAirlume}
            hasNatureSummaryTone={hasNatureSummaryTone}
            isMarketSummary={isMarketSummary}
            isBoutiqueSummary={isBoutiqueSummary}
            isCommandSummary={isCommandSummary}
            onChangeCouponCode={setCouponCode}
            onApplyCoupon={handleApplyCoupon}
          />
        )}

        <OrderSummaryCTA
          minimumOrder={minimumOrder}
          hideCheckoutButton={hideCheckoutButton}
          checkoutPath={checkoutPath}
          checkoutButtonText={checkoutButtonText}
          currency={currency}
          prefersArabicCopy={prefersArabicCopy}
          shouldShowTrustSummaryRow={shouldShowTrustSummaryRow}
          secureCheckoutText={secureCheckoutText}
          returnsText={returnsText}
          isWomenFashionSummary={isWomenFashionSummary}
          isFittingRoomSummary={isFittingRoomSummary}
          isBiteRush={isBiteRush}
          isSproutRoom={isSproutRoom}
          isAirlume={isAirlume}
          isKhemetLuxe={isKhemetLuxe}
          hasNatureSummaryTone={hasNatureSummaryTone}
          isMarketSummary={isMarketSummary}
          isBoutiqueSummary={isBoutiqueSummary}
          isCommandSummary={isCommandSummary}
          onCheckoutClick={handleCheckoutClick}
        />

        <OrderSummaryNextStepsCard
          showNextStepsCard={showNextStepsCard}
          nextStepsTitle={nextStepsTitle}
          nextSteps={nextSteps}
          isWomenFashionSummary={isWomenFashionSummary}
          isFittingRoomSummary={isFittingRoomSummary}
          isSproutRoom={isSproutRoom}
          isKhemetLuxe={isKhemetLuxe}
          isBoutiqueSummary={isBoutiqueSummary}
          isMarketSummary={isMarketSummary}
          hasNatureSummaryTone={hasNatureSummaryTone}
        />
      </div>
    </section>
  );
};

export default OrderSummary;
