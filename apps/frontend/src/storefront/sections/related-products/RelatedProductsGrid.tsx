import React from 'react';
import type { Location } from 'react-router-dom';
import type { QueryClient } from '@tanstack/react-query';
import type { Product } from '../../hooks/useProducts';
import ProductCard from '../../components/ProductCard';
import GracefulSmartCard from '../../components/GracefulSmartCard';
import { ElessiCompleteSetCard } from './ElessiCompleteSetCard';
import type { RelatedProductsVariant } from './relatedProductsTypes';

export interface RelatedProductsGridProps {
  shouldShowLoading: boolean;
  isElessiCompleteSet: boolean;
  elessiCompleteSetGridClass: string;
  effectiveRelatedGridClass: string;
  limit: number;
  mobileLimit: number;
  relatedProducts: Product[];
  isScentCircle: boolean;
  isClosetPairings: boolean;
  isCommandAlternatives: boolean;
  isGracefulRelated: boolean;
  effectiveCardVariant: RelatedProductsVariant;
  location: Location;
  queryClient: QueryClient;
  currency: string;
  prefersArabicCopy: boolean;
  shouldForceDocumentNavigation?: boolean;
}

export const RelatedProductsGrid: React.FC<RelatedProductsGridProps> = ({
  shouldShowLoading,
  isElessiCompleteSet,
  elessiCompleteSetGridClass,
  effectiveRelatedGridClass,
  limit,
  mobileLimit,
  relatedProducts,
  isScentCircle,
  isClosetPairings,
  isCommandAlternatives,
  isGracefulRelated,
  effectiveCardVariant,
  location,
  queryClient,
  currency,
  prefersArabicCopy,
  shouldForceDocumentNavigation = false,
}) => {
  if (shouldShowLoading) {
    return (
      <div className={isElessiCompleteSet ? elessiCompleteSetGridClass : effectiveRelatedGridClass}>
        {Array.from({ length: limit }).map((_, index) => (
          <div
            key={`related-skeleton-${index}`}
            className={`h-full overflow-hidden rounded-[var(--radius)] border p-4 animate-pulse ${
              isScentCircle
                ? 'border-[#eadfd7] bg-white'
                : isClosetPairings
                ? 'border-[#ead9d8] bg-white'
                : isCommandAlternatives
                ? 'border-[#dce4ef] bg-white'
                : 'border-border bg-card'
            }`}
          >
            <div className="aspect-square rounded-md bg-muted" />
            <div className="mt-4 space-y-3">
              <div className="h-4 w-2/3 rounded bg-muted" />
              <div className="h-4 w-1/3 rounded bg-muted" />
              <div className="h-10 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isElessiCompleteSet) {
    return (
      <div className={elessiCompleteSetGridClass}>
        {relatedProducts.map((relatedProduct, index) => (
          <div
            key={relatedProduct.id}
            className={index >= mobileLimit ? 'hidden sm:block' : ''}
          >
            <ElessiCompleteSetCard
              relatedProduct={relatedProduct}
              location={location}
              queryClient={queryClient}
              currency={currency}
              prefersArabicCopy={prefersArabicCopy}
              shouldForceDocumentNavigation={shouldForceDocumentNavigation}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={effectiveRelatedGridClass}>
      {relatedProducts.map((relatedProduct, index) => (
        <div
          key={relatedProduct.id}
          className={[
            index >= mobileLimit ? 'hidden sm:block' : '',
            isCommandAlternatives ? 'space-y-3' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {isCommandAlternatives ? (
            <div className="rounded-[1.35rem] border border-[#dce4ef] bg-white px-3.5 py-3 shadow-[0_18px_44px_-38px_rgba(15,23,42,0.22)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center rounded-full border border-[#f4d067] bg-[#fff9de] px-2.5 py-1 text-[10px] font-black tracking-[0.18em] text-[#8b623e]">
                  {typeof relatedProduct['decisionBadge'] === 'string' && relatedProduct['decisionBadge'].trim()
                    ? relatedProduct['decisionBadge']
                    : 'بديل قريب'}
                </span>
                <span className="text-[10px] font-bold tracking-[0.18em] text-[#64748b]">
                  {typeof relatedProduct['modelLabel'] === 'string' && relatedProduct['modelLabel'].trim()
                    ? relatedProduct['modelLabel']
                    : relatedProduct.category?.name || 'PC HUB'}
                </span>
              </div>
              {Array.isArray(relatedProduct['commandFacts']) &&
              relatedProduct['commandFacts'].length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {(relatedProduct['commandFacts'] as Array<{ label?: string; value?: string }>)
                    .slice(0, 2)
                    .map((fact, factIndex) => (
                      <span
                        key={`${fact.label || 'fact'}-${factIndex}`}
                        className="rounded-full border border-[#eef2f7] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-[#475569]"
                      >
                        {fact.value || fact.label}
                      </span>
                    ))}
                </div>
              ) : null}
            </div>
          ) : null}
          {isGracefulRelated ? (
            <GracefulSmartCard
              product={relatedProduct}
              index={index}
            />
          ) : (
            <ProductCard
              product={relatedProduct}
              variant={effectiveCardVariant}
            />
          )}
        </div>
      ))}
    </div>
  );
};
