import React from 'react';
import {
  PaymentHeader,
  PaymentMethodList,
  PaymentNextStepsCard,
  PaymentSubmitAction,
  PaymentSummaryCard,
  usePaymentSectionController,
  type PaymentSectionProps,
} from './payment-section';

export type { PaymentSectionProps };

export const PaymentSection: React.FC<PaymentSectionProps> = (props) => {
  const ctrl = usePaymentSectionController(props);

  if (!ctrl.items.length) {
    return null;
  }

  return (
    <section className="w-full scroll-mt-24 bg-background">
      <div className={ctrl.surfaceClassName}>
        <PaymentHeader
          showHeaderBadge={ctrl.showHeaderBadge}
          assuranceBadge={ctrl.assuranceBadge}
          isBiteRush={ctrl.isBiteRush}
          isMarketPayment={ctrl.isMarketPayment}
          hasNaturePaymentTone={ctrl.hasNaturePaymentTone}
          isKhemetLuxe={ctrl.isKhemetLuxe}
          isBoutiquePayment={ctrl.isBoutiquePayment}
          isCommandPayment={ctrl.isCommandPayment}
          titleClassName={ctrl.titleClassName}
          subtitleClassName={ctrl.subtitleClassName}
          title={ctrl.title}
          subtitle={ctrl.subtitle}
          showAssuranceCard={ctrl.showAssuranceCard}
          assuranceCardClassName={ctrl.assuranceCardClassName}
          assuranceTitle={ctrl.assuranceTitle}
          assuranceItems={ctrl.assuranceItems}
        />

        <PaymentMethodList
          walletDiscountEnabled={ctrl.walletDiscountEnabled}
          walletDiscountPercent={ctrl.walletDiscountPercent}
          showWalletDiscountBadge={ctrl.showWalletDiscountBadge}
          paymentMethod={ctrl.paymentMethod}
          walletEnabled={ctrl.walletEnabled}
          walletDiscount={ctrl.walletDiscount}
          currency={ctrl.currency}
          methodStackClassName={ctrl.methodStackClassName}
          methodOptions={ctrl.methodOptions}
          setPaymentMethod={ctrl.setPaymentMethod}
          methodCardClassName={ctrl.methodCardClassName}
          isWomenFashionPayment={ctrl.isWomenFashionPayment}
          hasEnhancedPaymentTone={ctrl.hasEnhancedPaymentTone}
          isKhemetLuxe={ctrl.isKhemetLuxe}
          isBoutiquePayment={ctrl.isBoutiquePayment}
          isMarketPayment={ctrl.isMarketPayment}
          hasNaturePaymentTone={ctrl.hasNaturePaymentTone}
          walletPaymentSettings={ctrl.walletPaymentSettings}
          walletDiscountActive={ctrl.walletDiscountEnabled && ctrl.walletDiscountPercent > 0}
          walletFileInputRef={ctrl.walletFileInputRef}
          walletProofUploading={ctrl.walletProofUploading}
          handleWalletProofFile={ctrl.handleWalletProofFile}
          walletProofImageUrl={ctrl.walletProofImageUrl}
          walletTransferRef={ctrl.walletTransferRef}
          setWalletTransferRef={ctrl.setWalletTransferRef}
          tierProgress={ctrl.tierProgress}
          useCashback={ctrl.useCashback}
          setUseCashback={ctrl.setUseCashback}
          usePoints={ctrl.usePoints}
          setUsePoints={ctrl.setUsePoints}
        />

        <PaymentSummaryCard
          showSummaryCard={ctrl.showSummaryCard}
          showCompactInlineSummary={ctrl.showCompactInlineSummary}
          summaryWrapperClassName={ctrl.summaryWrapperClassName}
          inlineSummaryClassName={ctrl.inlineSummaryClassName}
          summaryTitle={ctrl.summaryTitle}
          summaryDescription={ctrl.summaryDescription}
          subtotalLabel={ctrl.subtotalLabel}
          subtotal={ctrl.subtotal}
          currency={ctrl.currency}
          shippingLabel={ctrl.shippingLabel}
          checkoutFreeShippingActive={ctrl.checkoutFreeShippingActive}
          loyaltyFreeShipping={ctrl.loyaltyFreeShipping}
          trimmedGovernorate={ctrl.trimmedGovernorate}
          isShippingLoading={ctrl.isShippingLoading}
          summaryShippingValueText={ctrl.summaryShippingValueText}
          loyaltyDiscount={ctrl.loyaltyDiscount}
          tiersEnabled={ctrl.tiersEnabled}
          loyaltyDiscountPercent={ctrl.loyaltyDiscountPercent}
          voucherDiscount={ctrl.voucherDiscount}
          tierProgress={ctrl.tierProgress}
          couponDiscount={ctrl.couponDiscount}
          activeCoupon={ctrl.activeCoupon}
          walletDiscount={ctrl.walletDiscount}
          showWalletDiscountBadge={ctrl.showWalletDiscountBadge}
          walletDiscountPercent={ctrl.walletDiscountPercent}
          totalLabel={ctrl.totalLabel}
          total={ctrl.total}
          shippingMessage={ctrl.shippingMessage}
          requiresShippingSelection={ctrl.requiresShippingSelection}
          governorateRequiredText={ctrl.governorateRequiredText}
          isEmailValid={ctrl.isEmailValid}
          invalidEmailText={ctrl.invalidEmailText}
          formDataPhone={ctrl.formData.phone}
          isPhoneValid={ctrl.isPhoneValid}
          invalidPhoneText={ctrl.invalidPhoneText}
          shippingPromptText={ctrl.shippingPromptText}
          isBoutiquePayment={ctrl.isBoutiquePayment}
          isMarketPayment={ctrl.isMarketPayment}
          hasNaturePaymentTone={ctrl.hasNaturePaymentTone}
        />

        <PaymentSubmitAction
          validationErrors={ctrl.validationErrors}
          validationBoxClassName={ctrl.validationBoxClassName}
          handlePlaceOrder={ctrl.handlePlaceOrder}
          isSubmitting={ctrl.isSubmitting}
          subtotal={ctrl.subtotal}
          confirmButtonClassName={ctrl.confirmButtonClassName}
          paymentMethod={ctrl.paymentMethod}
          processingText={ctrl.processingText}
          confirmOrderText={ctrl.confirmOrderText}
          payButtonPrefix={ctrl.payButtonPrefix}
          total={ctrl.total}
          currency={ctrl.currency}
          securityText={ctrl.securityText}
        />

        <PaymentNextStepsCard
          showNextSteps={ctrl.showNextSteps}
          nextStepsCardClassName={ctrl.nextStepsCardClassName}
          postConfirmStepsTitle={ctrl.postConfirmStepsTitle}
          postConfirmSteps={ctrl.postConfirmSteps}
          isKhemetLuxe={ctrl.isKhemetLuxe}
          isBoutiquePayment={ctrl.isBoutiquePayment}
          isMarketPayment={ctrl.isMarketPayment}
          hasNaturePaymentTone={ctrl.hasNaturePaymentTone}
        />
      </div>
    </section>
  );
};

export default PaymentSection;
