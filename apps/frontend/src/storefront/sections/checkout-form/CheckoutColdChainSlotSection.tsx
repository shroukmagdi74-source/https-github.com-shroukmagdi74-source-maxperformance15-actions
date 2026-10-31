import React from 'react';
import type { useCheckoutStore } from '../../store/useCheckoutStore';

export interface CheckoutColdChainSlotSectionProps {
  stepWrapperClassName: string;
  stepHeadingClassName: string;
  introTextClassName: string;
  themeDirection?: string;
  deliverySlot?: string;
  renderStepNumber: (num: number, color: string) => React.ReactNode;
  updateFormData: (data: Partial<ReturnType<typeof useCheckoutStore.getState>['formData']>) => void;
}

export const CheckoutColdChainSlotSection: React.FC<CheckoutColdChainSlotSectionProps> = ({
  stepWrapperClassName,
  stepHeadingClassName,
  introTextClassName,
  themeDirection,
  deliverySlot,
  renderStepNumber,
  updateFormData,
}) => {
  const isRtl = themeDirection === 'rtl';

  const slots = [
    { id: 'morning', label: isRtl ? 'الصباح (9ص - 12ظ)' : 'Morning (9AM - 12PM)' },
    { id: 'afternoon', label: isRtl ? 'الظهيرة (12ظ - 4ع)' : 'Afternoon (12PM - 4PM)' },
    { id: 'evening', label: isRtl ? 'المساء (4ع - 9م)' : 'Evening (4PM - 9PM)' },
    { id: 'express', label: isRtl ? 'توصيل سريع (خلال ساعتين)' : 'Express (Within 2 Hours)' },
  ];

  return (
    <div className={stepWrapperClassName}>
      <h2 className={stepHeadingClassName}>
        {renderStepNumber(3, 'bg-[#c5a059]')}
        {isRtl ? 'موعد التوصيل المبرد' : 'Cold-Chain Delivery Slot'}
      </h2>
      <p className={introTextClassName}>
        {isRtl
          ? 'اختر الموعد المفضل لضمان وصول اللحوم طازجة وبأعلى جودة.'
          : 'Select your preferred slot to ensure maximum freshness.'}
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {slots.map((slot) => (
          <button
            key={slot.id}
            type="button"
            onClick={() => updateFormData({ deliverySlot: slot.id })}
            className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
              deliverySlot === slot.id
                ? 'border-[#3f0c0d] bg-[#3f0c0d]/5 text-[#3f0c0d] ring-1 ring-[#3f0c0d]'
                : 'border-border bg-card hover:border-[#c5a059]'
            }`}
          >
            <span className="text-sm font-bold">{slot.label}</span>
            <div
              className={`h-4 w-4 rounded-full border-2 ${
                deliverySlot === slot.id ? 'border-[#3f0c0d] bg-[#3f0c0d]' : 'border-border'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
