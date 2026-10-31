import React from 'react';
import { PackagePlus, ShoppingBag } from 'lucide-react';
import { formatStorefrontCurrency } from '../../utils/currency';
import type { BoughtTogetherVariant } from './types';

interface BoughtTogetherFooterBarProps {
  isCompactPairingRail: boolean;
  isContentCentered: boolean;
  sectionVariant: BoughtTogetherVariant;
  bundleSummaryText: string;
  bundleHelpText: string;
  bundleVariantHint: string;
  selectableRecommendationsCount: number;
  totalLabel: string;
  bundleTotal: number;
  currency: string;
  selectedRecommendationsCount: number;
  addBundleText: string;
  onAddBundle: () => void;
}

export const BoughtTogetherFooterBar: React.FC<BoughtTogetherFooterBarProps> = ({
  isCompactPairingRail,
  isContentCentered,
  sectionVariant,
  bundleSummaryText,
  bundleHelpText,
  bundleVariantHint,
  selectableRecommendationsCount,
  totalLabel,
  bundleTotal,
  currency,
  selectedRecommendationsCount,
  addBundleText,
  onAddBundle,
}) => {
  const isCompleteLook = sectionVariant === 'complete-look';
  const isGiftPairings = sectionVariant === 'gift-pairings';

  return (
    <div
      className={`flex flex-col rounded-2xl border ${
        isCompactPairingRail ? 'mt-6 gap-3.5 p-4' : 'mt-8 gap-4 p-4 sm:p-6'
      } ${
        isGiftPairings
          ? 'border-[#eadfd7] bg-gradient-to-r from-card via-card/90 to-card shadow-[0_16px_40px_-32px_rgba(61,41,44,0.12)]'
          : isCompleteLook
            ? 'border-[#edd8d5] bg-gradient-to-r from-card via-card/90 to-card shadow-[0_20px_50px_-36px_rgba(107,33,49,0.12)]'
            : 'border-border/80 bg-card shadow-sm'
      } ${
        isContentCentered
          ? 'items-center text-center'
          : 'md:flex-row md:items-center md:justify-between'
      }`}
      data-testid="bundle-footer-bar"
    >
      <div className={`space-y-1.5 ${isContentCentered ? 'text-center' : ''}`}>
        <div
          className={`inline-flex items-center gap-2 text-sm sm:text-base font-bold text-foreground ${
            isContentCentered ? 'justify-center' : ''
          }`}
        >
          <PackagePlus size={18} className="text-primary shrink-0" />
          <span>{bundleSummaryText}</span>
        </div>
        <p
          className={
            isCompactPairingRail
              ? 'text-xs text-muted-foreground'
              : 'text-xs sm:text-sm text-muted-foreground'
          }
        >
          {selectableRecommendationsCount > 0 ? bundleHelpText : bundleVariantHint}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
        <div className="text-start sm:text-end sm:px-3">
          <span className="text-[11px] font-semibold text-muted-foreground block uppercase tracking-wider">
            {totalLabel}
          </span>
          <span className="text-xl sm:text-2xl font-black text-primary tabular-nums">
            {formatStorefrontCurrency(bundleTotal, currency)}
          </span>
        </div>

        <button
          type="button"
          onClick={onAddBundle}
          disabled={selectedRecommendationsCount === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm sm:text-base font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]"
        >
          <ShoppingBag size={18} />
          <span>{addBundleText}</span>
        </button>
      </div>
    </div>
  );
};

export default BoughtTogetherFooterBar;
