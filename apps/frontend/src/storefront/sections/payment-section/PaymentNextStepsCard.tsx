import React from 'react';

interface PaymentNextStepsCardProps {
  showNextSteps: boolean;
  nextStepsCardClassName: string;
  postConfirmStepsTitle: string;
  postConfirmSteps: string[];
  isKhemetLuxe: boolean;
  isBoutiquePayment: boolean;
  isMarketPayment: boolean;
  hasNaturePaymentTone: boolean;
}

export const PaymentNextStepsCard: React.FC<PaymentNextStepsCardProps> = ({
  showNextSteps,
  nextStepsCardClassName,
  postConfirmStepsTitle,
  postConfirmSteps,
  isKhemetLuxe,
  isBoutiquePayment,
  isMarketPayment,
  hasNaturePaymentTone,
}) => {
  if (!showNextSteps) return null;

  return (
    <div className={nextStepsCardClassName}>
      <h3 className="text-sm font-black text-foreground">{postConfirmStepsTitle}</h3>
      <div className="mt-3 space-y-2">
        {postConfirmSteps.map((item, index) => (
          <p
            key={item}
            className={`flex items-start gap-2 text-sm ${
              isKhemetLuxe
                ? 'text-[#6d5a44]'
                : isBoutiquePayment
                ? 'text-[#72545b]'
                : isMarketPayment
                  ? 'text-[#7b5531]'
                  : hasNaturePaymentTone
                    ? 'text-[#4a6843]'
                    : 'text-[#5b4a28]'
            }`}
          >
            <span
              className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
                isKhemetLuxe
                  ? 'bg-[#f5ead7] text-[#725523]'
                  : isBoutiquePayment
                  ? 'bg-[#fff1ed] text-[#b06456]'
                  : isMarketPayment
                    ? 'bg-[#fff2df] text-[#a36a34]'
                    : hasNaturePaymentTone
                      ? 'bg-[#edf5e8] text-[#4a6843]'
                      : 'bg-[#fff4d8] text-[#8d6a2c]'
              }`}
            >
              {index + 1}
            </span>
            <span>{item}</span>
          </p>
        ))}
      </div>
    </div>
  );
};

export default PaymentNextStepsCard;
