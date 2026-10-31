import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Check, Plus, ShoppingBag } from 'lucide-react';
import type { Product, ProductVariant } from '../../hooks/useProducts';
import StorefrontProductImage from '../../components/StorefrontProductImage';
import VariantSelector from '../../components/VariantSelector';
import { buildStorefrontPath } from '../../utils/paths';
import { formatStorefrontCurrency } from '../../utils/currency';
import {
  getCardClassName,
  getProductVariants,
  getVariantAttributeLabels,
  hasVariants,
  parseVariantSettings,
  type BoughtTogetherVariant,
} from './types';

interface BoughtTogetherCardProps {
  item: Product;
  isCurrentProduct: boolean;
  isSelected: boolean;
  sectionVariant: BoughtTogetherVariant;
  prefersArabicCopy: boolean;
  currency: string;
  currentProductLabel: string;
  recommendationLabel: string;
  includedText: string;
  selectedStateText: string;
  selectStateText: string;
  quickAddText: string;
  selectedVariant: ProductVariant | null;
  selectedAttributes: Record<string, string>;
  recommendationPrice: number;
  imageCandidates: string[];
  onToggleSelection: (item: Product) => void;
  onQuickAdd: (item: Product) => void;
  onUpdateAttributes: (itemId: string, nextAttributes: Record<string, string>) => void;
}

export const BoughtTogetherCard: React.FC<BoughtTogetherCardProps> = ({
  item,
  isCurrentProduct,
  isSelected,
  sectionVariant,
  prefersArabicCopy,
  currency,
  currentProductLabel,
  recommendationLabel,
  includedText,
  selectedStateText,
  selectStateText,
  quickAddText,
  selectedVariant,
  selectedAttributes,
  recommendationPrice,
  imageCandidates,
  onToggleSelection,
  onQuickAdd,
  onUpdateAttributes,
}) => {
  const location = useLocation();
  const isVariantProduct = hasVariants(item);
  const itemVariants = getProductVariants(item);
  const isCompleteLook = sectionVariant === 'complete-look';
  const isPairingRail = sectionVariant === 'pairing-rail';
  const isGiftPairings = sectionVariant === 'gift-pairings';

  const selectedVariantSummary = Object.values(selectedAttributes)
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' • ');

  const variantAttributeLabels = getVariantAttributeLabels(item, prefersArabicCopy);
  const recommendationVariantSettings = !isCurrentProduct ? parseVariantSettings(item) : null;
  const productPath = buildStorefrontPath(
    location.pathname,
    `/product/${item.slug || item.id}`,
    location.search,
  );

  return (
    <div
      className={`w-[78vw] max-w-[285px] shrink-0 snap-start sm:w-auto sm:max-w-none sm:shrink flex flex-col justify-between ${getCardClassName(
        sectionVariant,
        isSelected,
        false,
      )}`}
      data-testid={`bundle-card-${item.id}`}
    >
      <div className="flex flex-col h-full">
        {/* Product Image Box */}
        <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-muted/40 group">
          <StorefrontProductImage
            candidates={imageCandidates}
            alt={item.name}
            width="420"
            height="525"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            fallback={
              <div className="flex w-full h-full items-center justify-center text-xs text-muted-foreground">
                IMG
              </div>
            }
          />

          {/* Top Badge */}
          <span
            className={`absolute top-2.5 start-2.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md ${
              isCurrentProduct
                ? 'bg-foreground text-background'
                : isGiftPairings
                  ? 'bg-white/95 text-[#8b623e] dark:bg-card/90 dark:text-[#d4a373]'
                  : isCompleteLook || isPairingRail
                    ? 'bg-white/95 text-[#8b3d33] dark:bg-card/90 dark:text-[#e07a5f]'
                    : 'bg-background/90 text-foreground'
            }`}
          >
            {isCurrentProduct ? currentProductLabel : recommendationLabel}
          </span>

          {/* Checkbox Toggle Button for Recommendations */}
          {!isCurrentProduct ? (
            <button
              type="button"
              onClick={() => onToggleSelection(item)}
              className={`absolute top-2.5 end-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-all duration-200 ${
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground scale-105'
                  : 'border-border/80 bg-background/90 text-muted-foreground hover:text-foreground hover:border-primary/50 backdrop-blur-sm'
              }`}
              aria-pressed={isSelected}
              aria-label={
                isSelected
                  ? prefersArabicCopy
                    ? `إزالة ${item.name} من الباقة`
                    : `Remove ${item.name} from bundle`
                  : prefersArabicCopy
                    ? `إضافة ${item.name} إلى الباقة`
                    : `Add ${item.name} to bundle`
              }
            >
              <Check size={16} strokeWidth={2.5} />
            </button>
          ) : null}
        </div>

        {/* Content Area */}
        <div className="mt-3.5 flex flex-col flex-1 justify-between gap-3 min-w-0">
          <div className="space-y-1.5 min-w-0">
            <Link
              to={productPath}
              className="line-clamp-2 text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors leading-snug"
              title={item.name}
            >
              {item.name}
            </Link>

            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="text-base sm:text-lg font-extrabold text-primary tabular-nums">
                {formatStorefrontCurrency(
                  isVariantProduct ? recommendationPrice : Number(item.price) || 0,
                  currency,
                )}
              </span>
              {Number(item.compareAtPrice || item.comparePrice) > Number(item.price) && (
                <span className="text-xs text-muted-foreground line-through tabular-nums">
                  {formatStorefrontCurrency(
                    Number(item.compareAtPrice || item.comparePrice),
                    currency,
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Variants & Actions */}
          {isCurrentProduct ? (
            <div className="space-y-2 pt-1">
              <div className="rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-center text-xs font-semibold text-muted-foreground leading-5">
                {includedText}
              </div>
            </div>
          ) : isVariantProduct ? (
            <div className="space-y-2.5 pt-1 min-w-0">
              {isSelected ? (
                <div className="space-y-2 rounded-xl border border-border/60 bg-secondary/20 p-2.5">
                  <VariantSelector
                    variants={itemVariants}
                    selectedAttributes={selectedAttributes}
                    onChange={(nextAttributes) => onUpdateAttributes(item.id, nextAttributes)}
                    density="compact"
                    variantSettings={recommendationVariantSettings}
                  />
                  <p className="text-[11px] leading-5 text-muted-foreground">
                    {selectedVariant ? (
                      <span className="inline-flex items-center gap-1 font-medium text-foreground/85">
                        <span>{prefersArabicCopy ? 'النسخة المحددة:' : 'Selected:'}</span>
                        <span className="font-bold text-primary">{selectedVariantSummary}</span>
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        {variantAttributeLabels.selectionHint ||
                          (prefersArabicCopy
                            ? 'يرجى اختيار المقاس أو اللون'
                            : 'Please choose size or color')}
                      </span>
                    )}
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground/80 py-0.5">
                  {prefersArabicCopy ? 'متوفر بعدة مقاسات وألوان' : 'Available in multiple options'}
                </p>
              )}

              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => onToggleSelection(item)}
                  className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                    isSelected
                      ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
                      : 'border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check size={14} strokeWidth={2.5} />
                      <span>{selectedStateText}</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} strokeWidth={2.5} />
                      <span>{selectStateText}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onQuickAdd(item)}
                  disabled={!selectedVariant}
                  className="inline-flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors py-1 disabled:opacity-40 disabled:hover:text-muted-foreground"
                >
                  <ShoppingBag size={12} />
                  <span>{quickAddText}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 pt-1 min-w-0">
              <button
                type="button"
                onClick={() => onToggleSelection(item)}
                className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                  isSelected
                    ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
                    : 'border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted'
                }`}
              >
                {isSelected ? (
                  <>
                    <Check size={14} strokeWidth={2.5} />
                    <span>{selectedStateText}</span>
                  </>
                ) : (
                  <>
                    <Plus size={14} strokeWidth={2.5} />
                    <span>{selectStateText}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onQuickAdd(item)}
                className="inline-flex w-full items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors py-1"
              >
                <ShoppingBag size={12} />
                <span>{quickAddText}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoughtTogetherCard;
