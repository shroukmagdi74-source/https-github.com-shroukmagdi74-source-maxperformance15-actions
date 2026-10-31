import React from 'react';
import TierProgressBanner from '../../components/TierProgressBanner';
import { fieldIds } from './checkoutFormHelpers';
import type { useCheckoutStore } from '../../store/useCheckoutStore';

export interface CheckoutContactSectionProps {
  stepWrapperClassName: string;
  stepHeadingClassName: string;
  introTextClassName: string;
  labelClassName: string;
  inputClassName: string;
  contactGridClassName: string;
  contactTitle: string;
  contactDescription?: string;
  emailLabel: string;
  emailPlaceholder: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  formData: ReturnType<typeof useCheckoutStore.getState>['formData'];
  isKhemetLuxe: boolean;
  renderStepNumber: (num: number, color: string) => React.ReactNode;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handlePhoneBlur: () => void;
}

export const CheckoutContactSection: React.FC<CheckoutContactSectionProps> = ({
  stepWrapperClassName,
  stepHeadingClassName,
  introTextClassName,
  labelClassName,
  inputClassName,
  contactGridClassName,
  contactTitle,
  contactDescription,
  emailLabel,
  emailPlaceholder,
  fullNameLabel,
  fullNamePlaceholder,
  phoneLabel,
  phonePlaceholder,
  formData,
  isKhemetLuxe,
  renderStepNumber,
  handleChange,
  handlePhoneBlur,
}) => {
  return (
    <div className={stepWrapperClassName}>
      <h2 className={stepHeadingClassName}>
        {renderStepNumber(1, 'bg-pink-400')}
        {contactTitle}
      </h2>
      {contactDescription ? <p className={introTextClassName}>{contactDescription}</p> : null}
      {isKhemetLuxe ? (
        <>
          <div className="space-y-2">
            <label htmlFor={fieldIds.email} className={labelClassName}>
              {emailLabel}
            </label>
            <input
              id={fieldIds.email}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={emailPlaceholder}
              autoComplete="email"
              className={inputClassName}
            />
          </div>
          <div className={contactGridClassName}>
            <div className="space-y-2">
              <label htmlFor={fieldIds.customerName} className={labelClassName}>
                {fullNameLabel}
              </label>
              <input
                id={fieldIds.customerName}
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder={fullNamePlaceholder}
                autoComplete="name"
                required
                aria-required="true"
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={fieldIds.phone} className={labelClassName}>
                {phoneLabel}
              </label>
              <input
                id={fieldIds.phone}
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handlePhoneBlur}
                placeholder={phonePlaceholder}
                autoComplete="tel"
                required
                aria-required="true"
                className={inputClassName}
              />
              <TierProgressBanner />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={contactGridClassName}>
            <div className="space-y-2">
              <label htmlFor={fieldIds.customerName} className={labelClassName}>
                {fullNameLabel}
              </label>
              <input
                id={fieldIds.customerName}
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder={fullNamePlaceholder}
                autoComplete="name"
                required
                aria-required="true"
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={fieldIds.phone} className={labelClassName}>
                {phoneLabel}
              </label>
              <input
                id={fieldIds.phone}
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handlePhoneBlur}
                placeholder={phonePlaceholder}
                autoComplete="tel"
                required
                aria-required="true"
                className={inputClassName}
              />
            </div>
          </div>
          <TierProgressBanner />
          <div className="space-y-2">
            <label htmlFor={fieldIds.email} className={labelClassName}>
              {emailLabel}
            </label>
            <input
              id={fieldIds.email}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={emailPlaceholder}
              autoComplete="email"
              className={inputClassName}
            />
          </div>
        </>
      )}
    </div>
  );
};
