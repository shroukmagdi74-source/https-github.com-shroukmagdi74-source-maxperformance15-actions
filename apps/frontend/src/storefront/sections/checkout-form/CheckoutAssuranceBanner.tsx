import React from 'react';

export interface CheckoutAssuranceBannerProps {
  isMarketCheckout: boolean;
  isNatureCheckout: boolean;
  assuranceBadge: string;
  assuranceTitle: string;
  assuranceItems: string[];
}

export const CheckoutAssuranceBanner: React.FC<CheckoutAssuranceBannerProps> = ({
  isMarketCheckout,
  isNatureCheckout,
  assuranceBadge,
  assuranceTitle,
  assuranceItems,
}) => {
  return (
    <div
      className={`rounded-[1.9rem] p-5 ${
        isMarketCheckout
          ? 'border border-[#f0d4b0] bg-[linear-gradient(135deg,#fffaf2_0%,#fff3e3_100%)] shadow-[0_22px_70px_-56px_rgba(154,93,34,0.14)]'
          : isNatureCheckout
            ? 'border border-[#dbe3d4] bg-[linear-gradient(135deg,#fbfdf9_0%,#f1f6ee_100%)] shadow-[0_22px_70px_-56px_rgba(26,51,40,0.14)]'
            : 'border border-[#ead8b1] bg-[linear-gradient(135deg,#fffaf0_0%,#fff4de_100%)] shadow-[0_22px_70px_-56px_rgba(90,62,24,0.18)]'
      }`}
    >
      <span
        className={`inline-flex rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${
          isMarketCheckout
            ? 'border border-[#f0d4b0] text-[#8b6037]'
            : isNatureCheckout
              ? 'border border-[#dbe3d4] text-[#4a6843]'
              : 'border border-[#ead8b1] text-[#6d5527]'
        }`}
      >
        {assuranceBadge}
      </span>
      <h2 className="mt-3 font-heading text-lg font-black text-foreground">
        {assuranceTitle}
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {assuranceItems.map((item) => (
          <span
            key={item}
            className={`inline-flex rounded-full border bg-white/92 px-3 py-1 text-[11px] font-semibold ${
              isMarketCheckout
                ? 'border-[#f0d4b0] text-[#8b6037]'
                : isNatureCheckout
                  ? 'border-[#dbe3d4] text-[#4a6843]'
                  : 'border-[#ead8b1] text-[#6d5527]'
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};
