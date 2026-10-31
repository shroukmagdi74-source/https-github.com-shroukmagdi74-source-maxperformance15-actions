import React from 'react';
import { fieldIds, governorates } from './checkoutFormHelpers';
import type { useCheckoutStore } from '../../store/useCheckoutStore';

export interface CheckoutShippingSectionProps {
  stepWrapperClassName: string;
  stepHeadingClassName: string;
  introTextClassName: string;
  labelClassName: string;
  inputClassName: string;
  shippingGridClassName: string;
  autoHintClassName: string;
  autoSuccessClassName: string;
  shippingTitle: string;
  shippingDescription?: string;
  addressLabel: string;
  addressPlaceholder: string;
  cityLabel: string;
  cityPlaceholder: string;
  governorateLabel: string;
  governoratePlaceholder: string;
  autoDetectHint: string;
  autoDetectSuccessText: string;
  formData: ReturnType<typeof useCheckoutStore.getState>['formData'];
  renderStepNumber: (num: number, color: string) => React.ReactNode;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const CheckoutShippingSection: React.FC<CheckoutShippingSectionProps> = ({
  stepWrapperClassName,
  stepHeadingClassName,
  introTextClassName,
  labelClassName,
  inputClassName,
  shippingGridClassName,
  autoHintClassName,
  autoSuccessClassName,
  shippingTitle,
  shippingDescription,
  addressLabel,
  addressPlaceholder,
  cityLabel,
  cityPlaceholder,
  governorateLabel,
  governoratePlaceholder,
  autoDetectHint,
  autoDetectSuccessText,
  formData,
  renderStepNumber,
  handleChange,
}) => {
  return (
    <div className={stepWrapperClassName}>
      <h2 className={stepHeadingClassName}>
        {renderStepNumber(2, 'bg-sky-400')}
        {shippingTitle}
      </h2>
      {shippingDescription ? <p className={introTextClassName}>{shippingDescription}</p> : null}
      <div className="space-y-2">
        <label htmlFor={fieldIds.address} className={labelClassName}>
          {addressLabel}
        </label>
        <input
          id={fieldIds.address}
          type="text"
          name="address"
          value={formData.address || ''}
          onChange={handleChange}
          placeholder={addressPlaceholder}
          autoComplete="street-address"
          required
          aria-required="true"
          className={inputClassName}
        />
      </div>
      <div className={shippingGridClassName}>
        <div className="space-y-2">
          <label htmlFor={fieldIds.city} className={labelClassName}>
            {cityLabel}
          </label>
          <input
            id={fieldIds.city}
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder={cityPlaceholder}
            autoComplete="address-level2"
            required
            aria-required="true"
            className={inputClassName}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor={fieldIds.governorate} className={labelClassName}>
            {governorateLabel}
          </label>
          <div className="relative">
            {!formData.governorate && (formData.city || formData.address) ? (
              <p className={autoHintClassName}>{autoDetectHint}</p>
            ) : null}
            <select
              id={fieldIds.governorate}
              name="governorate"
              value={formData.governorate}
              onChange={handleChange}
              autoComplete="address-level1"
              required
              aria-required="true"
              className={`${inputClassName} appearance-none cursor-pointer`}
            >
              <option value="">{governoratePlaceholder}</option>
              {governorates.map((governorate) => (
                <option key={governorate.value} value={governorate.value}>
                  {governorate.label}
                </option>
              ))}
            </select>
            {formData.governorate ? (
              <p className={autoSuccessClassName}>{autoDetectSuccessText}</p>
            ) : null}
            <div className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
