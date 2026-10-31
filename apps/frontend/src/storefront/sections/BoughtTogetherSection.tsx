import React from 'react';
import {
  BoughtTogetherCard,
  BoughtTogetherFooterBar,
  BoughtTogetherHeader,
  BoughtTogetherSkeleton,
  getWrapperClassName,
  useBoughtTogetherController,
  type BoughtTogetherSectionProps,
} from './bought-together';

export const BoughtTogetherSection: React.FC<BoughtTogetherSectionProps> = ({
  section,
  settings,
}) => {
  const ctrl = useBoughtTogetherController({ section, settings });

  if (!ctrl.boughtTogetherEnabled) {
    return null;
  }

  if (ctrl.productLoading || ctrl.loading) {
    return <BoughtTogetherSkeleton />;
  }

  if (!ctrl.product || ctrl.recommendations.length === 0) {
    return null;
  }

  const wrapperClassName = getWrapperClassName(ctrl.sectionVariant);

  return (
    <section
      ref={ctrl.sectionRef}
      className={`w-full border-t border-border bg-background ${
        ctrl.isCompactPairingRail ? 'py-8 md:py-12' : 'py-10 md:py-16'
      }`}
      data-testid="bought-together-section"
    >
      <div className="container px-3.5 sm:px-6">
        <div className={wrapperClassName}>
          <div
            className={
              ctrl.isCompactPairingRail
                ? 'px-3.5 sm:px-5 md:px-6'
                : 'px-4 sm:px-6 md:px-8'
            }
          >
            <BoughtTogetherHeader
              isCompactPairingRail={ctrl.isCompactPairingRail}
              isContentCentered={ctrl.isContentCentered}
              isSoleaFemmeTheme={ctrl.isSoleaFemmeTheme}
              prefersArabicCopy={ctrl.prefersArabicCopy}
              title={ctrl.title}
              subtitle={ctrl.subtitle}
              totalLabel={ctrl.totalLabel}
              bundleTotal={ctrl.bundleTotal}
              currency={ctrl.currency}
              selectedCountText={ctrl.selectedCountText}
              sectionVariant={ctrl.sectionVariant}
            />

            <div className={ctrl.effectiveBundleGridClassName}>
              {ctrl.bundleItems.map((item) => {
                const isCurrentProduct = item.id === ctrl.product?.id;
                const isSelected = isCurrentProduct || ctrl.selectedIds.has(item.id);

                return (
                  <BoughtTogetherCard
                    key={item.id}
                    item={item}
                    isCurrentProduct={isCurrentProduct}
                    isSelected={isSelected}
                    sectionVariant={ctrl.sectionVariant}
                    prefersArabicCopy={ctrl.prefersArabicCopy}
                    currency={ctrl.currency}
                    currentProductLabel={ctrl.currentProductLabel}
                    recommendationLabel={ctrl.recommendationLabel}
                    includedText={ctrl.includedText}
                    selectedStateText={ctrl.selectedStateText}
                    selectStateText={ctrl.selectStateText}
                    quickAddText={ctrl.quickAddText}
                    selectedVariant={ctrl.getSelectedRecommendationVariant(item)}
                    selectedAttributes={ctrl.getRecommendationAttributes(item)}
                    recommendationPrice={ctrl.getRecommendationPrice(item)}
                    imageCandidates={ctrl.getRecommendationImageCandidates(item)}
                    onToggleSelection={ctrl.handleToggleSelection}
                    onQuickAdd={ctrl.handleQuickAdd}
                    onUpdateAttributes={ctrl.updateRecommendationAttributes}
                  />
                );
              })}
            </div>

            <BoughtTogetherFooterBar
              isCompactPairingRail={ctrl.isCompactPairingRail}
              isContentCentered={ctrl.isContentCentered}
              sectionVariant={ctrl.sectionVariant}
              bundleSummaryText={ctrl.bundleSummaryText}
              bundleHelpText={ctrl.bundleHelpText}
              bundleVariantHint={ctrl.bundleVariantHint}
              selectableRecommendationsCount={ctrl.selectableRecommendations.length}
              totalLabel={ctrl.totalLabel}
              bundleTotal={ctrl.bundleTotal}
              currency={ctrl.currency}
              selectedRecommendationsCount={ctrl.selectedRecommendations.length}
              addBundleText={ctrl.addBundleText}
              onAddBundle={ctrl.handleAddBundle}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BoughtTogetherSection;
