import React from 'react';
import type { CheckoutFormProps } from './checkout-form/checkoutFormTypes';
import { useCheckoutFormController } from './checkout-form/useCheckoutFormController';
import { CheckoutAssuranceBanner } from './checkout-form/CheckoutAssuranceBanner';
import { CheckoutReturningCustomerBanner } from './checkout-form/CheckoutReturningCustomerBanner';
import { CheckoutContactSection } from './checkout-form/CheckoutContactSection';
import { CheckoutShippingSection } from './checkout-form/CheckoutShippingSection';
import { CheckoutColdChainSlotSection } from './checkout-form/CheckoutColdChainSlotSection';
import { CheckoutNotesSection } from './checkout-form/CheckoutNotesSection';

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ section, settings }) => {
  const ctrl = useCheckoutFormController({ section, settings });

  if (!ctrl.items.length) {
    return null;
  }

  return (
    <section
      className={`w-full scroll-mt-24 ${
        ctrl.isFittingRoomCheckout
          ? 'bg-[linear-gradient(180deg,#f5ece4_0%,#f7efe8_48%,#ffffff_100%)] py-6'
          : 'bg-background'
      }`}
    >
      <div className={ctrl.sectionStackClassName}>
        {ctrl.hasEnhancedCheckoutIntro ? (
          <CheckoutAssuranceBanner
            isMarketCheckout={ctrl.isMarketCheckout}
            isNatureCheckout={ctrl.isNatureCheckout}
            assuranceBadge={ctrl.assuranceBadge}
            assuranceTitle={ctrl.assuranceTitle}
            assuranceItems={ctrl.assuranceItems}
          />
        ) : null}

        <CheckoutReturningCustomerBanner
          loginStripClassName={ctrl.loginStripClassName}
          isBiteRush={ctrl.isBiteRush}
          isKhemetLuxe={ctrl.isKhemetLuxe}
          returningCustomerText={ctrl.returningCustomerText}
          returningCustomerHint={ctrl.returningCustomerHint}
          loginPath={ctrl.loginPath}
          loginLinkClassName={ctrl.loginLinkClassName}
          loginLinkText={ctrl.loginLinkText}
        />

        <CheckoutContactSection
          stepWrapperClassName={ctrl.stepWrapperClassName(ctrl.variant)}
          stepHeadingClassName={ctrl.stepHeadingClassName}
          introTextClassName={ctrl.introTextClassName}
          labelClassName={ctrl.labelClassName}
          inputClassName={ctrl.inputClassName}
          contactGridClassName={ctrl.contactGridClassName}
          contactTitle={ctrl.contactTitle}
          contactDescription={ctrl.contactDescription}
          emailLabel={ctrl.emailLabel}
          emailPlaceholder={ctrl.emailPlaceholder}
          fullNameLabel={ctrl.fullNameLabel}
          fullNamePlaceholder={ctrl.fullNamePlaceholder}
          phoneLabel={ctrl.phoneLabel}
          phonePlaceholder={ctrl.phonePlaceholder}
          formData={ctrl.formData}
          isKhemetLuxe={ctrl.isKhemetLuxe}
          renderStepNumber={ctrl.renderStepNumber}
          handleChange={ctrl.handleChange}
          handlePhoneBlur={ctrl.handlePhoneBlur}
        />

        {ctrl.isKhemetLuxe && <div className="border-t border-[#e5dacb] pt-2" />}

        <CheckoutShippingSection
          stepWrapperClassName={ctrl.stepWrapperClassName(ctrl.variant)}
          stepHeadingClassName={ctrl.stepHeadingClassName}
          introTextClassName={ctrl.introTextClassName}
          labelClassName={ctrl.labelClassName}
          inputClassName={ctrl.inputClassName}
          shippingGridClassName={ctrl.shippingGridClassName}
          autoHintClassName={ctrl.autoHintClassName}
          autoSuccessClassName={ctrl.autoSuccessClassName}
          shippingTitle={ctrl.shippingTitle}
          shippingDescription={ctrl.shippingDescription}
          addressLabel={ctrl.addressLabel}
          addressPlaceholder={ctrl.addressPlaceholder}
          cityLabel={ctrl.cityLabel}
          cityPlaceholder={ctrl.cityPlaceholder}
          governorateLabel={ctrl.governorateLabel}
          governoratePlaceholder={ctrl.governoratePlaceholder}
          autoDetectHint={ctrl.autoDetectHint}
          autoDetectSuccessText={ctrl.autoDetectSuccessText}
          formData={ctrl.formData}
          renderStepNumber={ctrl.renderStepNumber}
          handleChange={ctrl.handleChange}
        />

        {ctrl.isButcherCheckout && (
          <CheckoutColdChainSlotSection
            stepWrapperClassName={ctrl.stepWrapperClassName(ctrl.variant)}
            stepHeadingClassName={ctrl.stepHeadingClassName}
            introTextClassName={ctrl.introTextClassName}
            themeDirection={ctrl.theme.direction}
            deliverySlot={ctrl.formData.deliverySlot}
            renderStepNumber={ctrl.renderStepNumber}
            updateFormData={ctrl.updateFormData}
          />
        )}

        {ctrl.isKhemetLuxe && ctrl.showNotesSection && <div className="border-t border-[#e5dacb] pt-2" />}

        {ctrl.showNotesSection ? (
          <CheckoutNotesSection
            stepWrapperClassName={ctrl.stepWrapperClassName(ctrl.variant)}
            stepHeadingClassName={ctrl.stepHeadingClassName}
            introTextClassName={ctrl.introTextClassName}
            notesTextareaClassName={ctrl.notesTextareaClassName}
            notesTitle={ctrl.notesTitle}
            notesOptionalLabel={ctrl.notesOptionalLabel}
            notesDescription={ctrl.notesDescription}
            notesPlaceholder={ctrl.notesPlaceholder}
            notes={ctrl.formData.notes}
            isButcherCheckout={ctrl.isButcherCheckout}
            renderStepNumber={ctrl.renderStepNumber}
            handleChange={ctrl.handleChange}
          />
        ) : null}
      </div>
    </section>
  );
};

export default CheckoutForm;
