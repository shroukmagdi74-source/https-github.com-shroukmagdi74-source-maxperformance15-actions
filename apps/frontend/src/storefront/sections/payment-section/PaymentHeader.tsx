import React from 'react';

interface PaymentHeaderProps {
  showHeaderBadge: boolean;
  assuranceBadge: string;
  isBiteRush: boolean;
  isMarketPayment: boolean;
  hasNaturePaymentTone: boolean;
  isKhemetLuxe: boolean;
  isBoutiquePayment: boolean;
  isCommandPayment: boolean;
  titleClassName: string;
  subtitleClassName: string;
  title: string;
  subtitle: string;
  showAssuranceCard: boolean;
  assuranceCardClassName: string;
  assuranceTitle: string;
  assuranceItems: string[];
}

export const PaymentHeader: React.FC<PaymentHeaderProps> = ({
  showHeaderBadge,
  assuranceBadge,
  isBiteRush,
  isMarketPayment,
  hasNaturePaymentTone,
  isKhemetLuxe,
  isBoutiquePayment,
  isCommandPayment,
  titleClassName,
  subtitleClassName,
  title,
  subtitle,
  showAssuranceCard,
  assuranceCardClassName,
  assuranceTitle,
  assuranceItems,
}) => {
  return (
    <>
      <div className="space-y-2">
        {showHeaderBadge && assuranceBadge.trim() ? (
          isBiteRush ? (
            <span className="inline-flex rounded-full bg-[#111111] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              تأكيد الطلب
            </span>
          ) : isMarketPayment ? (
            <span className="inline-flex rounded-full border border-[#f0d4b0] bg-[#fff8ef] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#8b6037]">
              {assuranceBadge}
            </span>
          ) : hasNaturePaymentTone ? (
            <span className="inline-flex rounded-full border border-[#dbe3d4] bg-[#f6f8f2] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#4a6843]">
              {assuranceBadge}
            </span>
          ) : isKhemetLuxe ? (
            <span className="inline-flex rounded-full border border-[#d9c8ad] bg-[#fffaf2] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#725523]">
              {assuranceBadge}
            </span>
          ) : isBoutiquePayment ? (
            <span className="inline-flex rounded-full border border-[#f0ddd5] bg-[#fff7f4] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#8b5f59]">
              {assuranceBadge}
            </span>
          ) : isCommandPayment ? (
            <span className="inline-flex rounded-full border border-[#ead8b1] bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#6d5527]">
              {assuranceBadge}
            </span>
          ) : null
        ) : null}
        <h2 className={titleClassName}>{title}</h2>
        <p className={subtitleClassName}>{subtitle}</p>
      </div>

      {showAssuranceCard ? (
        <div className={assuranceCardClassName}>
          <h3 className="text-sm font-black text-foreground">{assuranceTitle}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {assuranceItems.map((item) => (
              <span
                key={item}
                className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${
                  isKhemetLuxe
                    ? 'border-[#d9c8ad] bg-white/92 text-[#725523]'
                    : isBoutiquePayment
                    ? 'border-[#ead8cf] bg-white/92 text-[#8b5f59]'
                    : isMarketPayment
                      ? 'border-[#f0d4b0] bg-white/92 text-[#8b6037]'
                      : hasNaturePaymentTone
                        ? 'border-[#dbe3d4] bg-white/92 text-[#4a6843]'
                    : 'border-[#ead8b1] bg-white/92 text-[#6d5527]'
                }`}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default PaymentHeader;
