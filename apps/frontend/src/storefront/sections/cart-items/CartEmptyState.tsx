import React from 'react';
import { Link } from 'react-router-dom';

export interface CartEmptyStateProps {
  isBiteRush: boolean;
  isSproutRoom: boolean;
  isPharmacy: boolean;
  isMarketCart: boolean;
  isNatureCart: boolean;
  emptyTitle: string;
  emptyText: string;
  continueShoppingText: string;
  continueShoppingClassName: string;
  shopPath: string;
}

export const CartEmptyState: React.FC<CartEmptyStateProps> = ({
  isBiteRush,
  isSproutRoom,
  isPharmacy,
  isMarketCart,
  isNatureCart,
  emptyTitle,
  emptyText,
  continueShoppingText,
  continueShoppingClassName,
  shopPath,
}) => {
  return (
    <section
      className={`w-full py-20 ${
        isBiteRush
          ? 'bg-[radial-gradient(circle_at_top,#fff3e1_0%,#fffaf4_42%,#fff_78%)]'
          : isSproutRoom
            ? 'bg-[radial-gradient(circle_at_top,#eef5ea_0%,#fbfaf5_48%,#fff_82%)]'
          : isPharmacy
            ? 'bg-[radial-gradient(circle_at_top,#e9fbf6_0%,#f8fffd_45%,#fff_82%)]'
            : isMarketCart
              ? 'bg-[radial-gradient(circle_at_top,#fff6ea_0%,#fffdf8_45%,#fff_82%)]'
            : isNatureCart
              ? 'bg-[radial-gradient(circle_at_top,#eef5ea_0%,#f8fbf7_45%,#fff_82%)]'
            : 'bg-background'
      }`}
    >
      <div
        className={`container flex flex-col items-center space-y-4 px-4 text-center md:px-6 ${
          isBiteRush
            ? 'rounded-[2.2rem] border border-[#f8c08c] bg-white/75 py-12 shadow-[0_30px_80px_-60px_rgba(247,115,22,0.28)]'
            : isSproutRoom
              ? 'rounded-[2rem] border border-[#d8e6d8] bg-white/90 py-12 shadow-[0_26px_74px_-60px_rgba(32,53,40,0.14)]'
            : isPharmacy
              ? 'rounded-[2.2rem] border border-[#99f6e4] bg-white/85 py-12 shadow-[0_30px_80px_-60px_rgba(20,184,166,0.22)]'
              : isMarketCart
                ? 'rounded-[2.2rem] border border-[#f0d4b0] bg-white/88 py-12 shadow-[0_30px_80px_-60px_rgba(154,93,34,0.16)]'
              : isNatureCart
                ? 'rounded-[2.2rem] border border-[#dbe3d4] bg-white/88 py-12 shadow-[0_30px_80px_-60px_rgba(26,51,40,0.14)]'
              : ''
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={
            isBiteRush
              ? 'text-[#f97316]/40'
              : isPharmacy
                ? 'text-[#14b8a6]/35'
                : isMarketCart
                  ? 'text-[#c9874a]/35'
                : isNatureCart
                  ? 'text-[#476343]/30'
                : 'text-muted-foreground/40'
          }
        >
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
        <h2 className="font-heading text-xl font-bold text-foreground">
          {emptyTitle}
        </h2>
        <p className="max-w-xl text-sm text-muted-foreground">{emptyText}</p>
        <Link
          to={shopPath}
          className={continueShoppingClassName}
        >
          {continueShoppingText}
        </Link>
      </div>
    </section>
  );
};
