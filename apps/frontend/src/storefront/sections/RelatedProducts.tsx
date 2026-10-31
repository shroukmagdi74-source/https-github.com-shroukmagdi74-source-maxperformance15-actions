import React from 'react';
import type { RelatedProductsProps } from './related-products/relatedProductsTypes';
import { useRelatedProductsController } from './related-products/useRelatedProductsController';
import { RelatedProductsHeader } from './related-products/RelatedProductsHeader';
import { RelatedProductsGrid } from './related-products/RelatedProductsGrid';

export const RelatedProducts: React.FC<RelatedProductsProps> = ({ section, settings }) => {
  const ctrl = useRelatedProductsController({ section, settings });

  if (ctrl.error || (!ctrl.shouldShowLoading && ctrl.relatedProducts.length === 0)) {
    return null;
  }

  return (
    <section
      ref={(node) => {
        if (ctrl.sectionRef && 'current' in ctrl.sectionRef) {
          (ctrl.sectionRef as React.MutableRefObject<HTMLElement | null>).current = node;
        }
        ctrl.viewElementRef.current = node;
      }}
      className={`w-full border-t ${ctrl.isElessiCompleteSet ? 'min-h-[44rem] md:min-h-[45rem]' : ''} ${
        ctrl.isWomenFashionClosetPairings ? 'py-8 md:py-12' : 'py-12 md:py-16'
      } ${
        ctrl.isElessiOrganicRelated
          ? 'border-[#eadfcd] bg-[linear-gradient(180deg,#fffefb_0%,#f8f1e8_42%,#ffffff_100%)]'
          : ctrl.isElessiCompleteSet
          ? 'border-[#ead8ca] bg-[#fffdfa]'
          : ctrl.isElessiDigitalRelated
          ? 'border-[#e4e9f0] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_40%,#ffffff_100%)]'
          : ctrl.isElessiPlantRelated
          ? 'border-[#d8e6d8] bg-[linear-gradient(180deg,#fbfaf5_0%,#eef5ea_38%,#ffffff_100%)]'
          : ctrl.isElessiBikeRelated
          ? 'border-[#e3e7eb] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fb_42%,#ffffff_100%)]'
          : ctrl.isElessiMerchRail || ctrl.isElessiDiscoveryStrip
          ? 'border-[#ead8ca] bg-[linear-gradient(180deg,#fffdfa_0%,#f8efe6_44%,#ffffff_100%)]'
          : ctrl.isScentCircle
          ? 'border-[#eadfd7] bg-[linear-gradient(180deg,#fffdfa_0%,#fff8f4_44%,#ffffff_100%)]'
          : ctrl.isClosetPairings
          ? 'border-[#ead9d8] bg-[linear-gradient(180deg,#fffaf9_0%,#fffdfc_46%,#ffffff_100%)]'
          : ctrl.isCommandAlternatives
          ? 'border-[#dce4ef] bg-[linear-gradient(180deg,#fffdf7_0%,#f7f9fd_38%,#ffffff_100%)]'
          : 'border-border bg-background'
      }`}
    >
      <div className="container px-4 md:px-6">
        <RelatedProductsHeader
          isFastlyOfferWallRelated={ctrl.isFastlyOfferWallRelated}
          fastlyCtaPath={ctrl.fastlyCtaPath}
          title={ctrl.title}
          subtitle={ctrl.subtitle}
          ctaText={ctrl.ctaText}
          isWomenFashionClosetPairings={ctrl.isWomenFashionClosetPairings}
          isContentCentered={ctrl.isContentCentered}
          isElessiOrganicRelated={ctrl.isElessiOrganicRelated}
          isElessiDigitalRelated={ctrl.isElessiDigitalRelated}
          isElessiPlantRelated={ctrl.isElessiPlantRelated}
          isElessiBikeRelated={ctrl.isElessiBikeRelated}
          isElessiCompleteSet={ctrl.isElessiCompleteSet}
          isElessiMerchRail={ctrl.isElessiMerchRail}
          isElessiDiscoveryStrip={ctrl.isElessiDiscoveryStrip}
          isScentCircle={ctrl.isScentCircle}
          isClosetPairings={ctrl.isClosetPairings}
          isCommandAlternatives={ctrl.isCommandAlternatives}
          prefersArabicCopy={ctrl.prefersArabicCopy}
          commandHeaderTitle={ctrl.commandHeaderTitle}
          commandHeaderSubtitle={ctrl.commandHeaderSubtitle}
          currentProductFacts={ctrl.currentProductFacts}
        />

        <RelatedProductsGrid
          shouldShowLoading={ctrl.shouldShowLoading}
          isElessiCompleteSet={ctrl.isElessiCompleteSet}
          elessiCompleteSetGridClass={ctrl.elessiCompleteSetGridClass}
          effectiveRelatedGridClass={ctrl.effectiveRelatedGridClass}
          limit={ctrl.limit}
          mobileLimit={ctrl.mobileLimit}
          relatedProducts={ctrl.relatedProducts}
          isScentCircle={ctrl.isScentCircle}
          isClosetPairings={ctrl.isClosetPairings}
          isCommandAlternatives={ctrl.isCommandAlternatives}
          isGracefulRelated={ctrl.isGracefulRelated}
          effectiveCardVariant={ctrl.effectiveCardVariant}
          location={ctrl.location}
          queryClient={ctrl.queryClient}
          currency={ctrl.currency}
          prefersArabicCopy={ctrl.prefersArabicCopy}
          shouldForceDocumentNavigation={ctrl.shouldForceDocumentNavigation}
        />
      </div>
    </section>
  );
};

export default RelatedProducts;
