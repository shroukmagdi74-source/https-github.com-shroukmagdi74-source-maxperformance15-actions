import React from 'react';
import { formatStorefrontCurrency } from '../../utils/currency';
import type { BoughtTogetherVariant } from './types';

interface BoughtTogetherHeaderProps {
  isCompactPairingRail: boolean;
  isContentCentered: boolean;
  isSoleaFemmeTheme: boolean;
  prefersArabicCopy: boolean;
  title: string;
  subtitle: string;
  totalLabel: string;
  bundleTotal: number;
  currency: string;
  selectedCountText: string;
  sectionVariant: BoughtTogetherVariant;
}

export const BoughtTogetherHeader: React.FC<BoughtTogetherHeaderProps> = ({
  isCompactPairingRail,
  isContentCentered,
  isSoleaFemmeTheme,
  prefersArabicCopy,
  title,
  subtitle,
  totalLabel,
  bundleTotal,
  currency,
  selectedCountText,
  sectionVariant,
}) => {
  const isCompleteLook = sectionVariant === 'complete-look';
  const isGiftPairings = sectionVariant === 'gift-pairings';

  const eyebrowText = isSoleaFemmeTheme
    ? prefersArabicCopy
      ? 'تنسيق Solea'
      : 'Solea pairing'
    : prefersArabicCopy
      ? 'يُشترى معًا'
      : 'Bought Together';

  return (
    <div
      className={`flex flex-col ${
        isCompactPairingRail ? 'gap-3' : 'gap-4'
      } ${
        isContentCentered
          ? 'items-center text-center'
          : 'lg:flex-row lg:items-end lg:justify-between'
      }`}
    >
      <div
        className={`${
          isCompactPairingRail ? 'space-y-1.5' : 'space-y-2'
        } ${isContentCentered ? 'mx-auto max-w-3xl text-center' : ''}`}
      >
        <span
          className={`inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary ${
            isContentCentered ? 'mx-auto' : ''
          }`}
        >
          {eyebrowText}
        </span>
        <div className={isCompactPairingRail ? 'space-y-1.5' : 'space-y-2'}>
          <h2
            className={`font-heading font-black tracking-tight text-foreground ${
              isCompactPairingRail
                ? 'text-[1.35rem] sm:text-2xl'
                : 'text-xl sm:text-2xl lg:text-3xl'
            }`}
          >
            {title}
          </h2>
          <p
            className={`text-muted-foreground ${
              isCompactPairingRail
                ? 'line-clamp-2 text-[12px] leading-6 sm:line-clamp-none sm:text-sm md:text-base'
                : 'text-xs sm:text-sm leading-6 md:text-base'
            } ${isContentCentered ? 'mx-auto max-w-2xl' : 'max-w-2xl'}`}
          >
            {subtitle}
          </p>
        </div>
      </div>

      <div
        className={`rounded-2xl border ${
          isCompactPairingRail
            ? 'w-full px-3.5 py-2.5 sm:w-auto sm:px-4 sm:py-3'
            : 'w-full sm:w-auto px-4 py-3'
        } ${
          isGiftPairings
            ? 'border-[#eadfd7] bg-card shadow-[0_20px_50px_-44px_rgba(61,41,44,0.12)]'
            : isCompleteLook
              ? 'border-[#edd8d5] bg-card shadow-[0_20px_50px_-44px_rgba(107,33,49,0.14)]'
              : 'border-border/80 bg-card'
        } ${isContentCentered ? 'text-center' : ''}`}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {totalLabel}
        </p>
        <p
          className={`mt-0.5 font-black text-primary tabular-nums ${
            isCompactPairingRail ? 'text-xl sm:text-2xl' : 'text-2xl'
          }`}
        >
          {formatStorefrontCurrency(bundleTotal, currency)}
        </p>
        <p
          className={`mt-0.5 text-muted-foreground ${
            isCompactPairingRail ? 'text-[11px] leading-5' : 'text-xs'
          }`}
        >
          {selectedCountText}
        </p>
      </div>
    </div>
  );
};

export default BoughtTogetherHeader;
