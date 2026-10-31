import React from 'react';
import { cn as cx } from '../../lib/utils';
import {
  ConversionConfidenceGrid,
  ConversionFooterBulkSavings,
  ConversionPulseRow,
  ConversionStackHeader,
  ConversionUrgencyTicker,
  useConversionStackController,
  type ConversionStackProps,
} from './conversion-stack';

export type { ConversionStackProps };

export const ConversionStack: React.FC<ConversionStackProps> = (props) => {
  const ctrl = useConversionStackController(props);

  if (!ctrl.shouldRender) {
    return null;
  }

  if (ctrl.standaloneBlockId) {
    if (!ctrl.standaloneSectionNode) {
      return null;
    }

    return (
      <section
        className={cx(
          'w-full',
          ctrl.variant === 'minimal' || ctrl.variant === 'couture-minimal'
            ? 'pt-1 pb-1'
            : 'pt-2 pb-2',
        )}
        data-testid={ctrl.sectionTestId}
      >
        <ConversionStackHeader
          heading={ctrl.heading}
          subtitle={ctrl.subtitle}
          variant={ctrl.variant}
          headerClass={ctrl.headerClass}
          isContentCentered={ctrl.isContentCentered}
          isStandalone
        />

        {ctrl.standaloneSectionNode}
      </section>
    );
  }

  return (
    <section
      className={cx(
        'w-full',
        ctrl.variant === 'minimal' || ctrl.variant === 'couture-minimal'
          ? 'pt-3 pb-2'
          : 'pt-4 pb-3',
      )}
      data-testid={ctrl.sectionTestId}
    >
      <div className={ctrl.surfaceClass}>
        <ConversionStackHeader
          heading={ctrl.heading}
          subtitle={ctrl.subtitle}
          variant={ctrl.variant}
          headerClass={ctrl.headerClass}
          isContentCentered={ctrl.isContentCentered}
        />

        <div className={ctrl.leadStackClass}>
          {/* Layer 1: Pulse Row (High-Density Social Proof) */}
          <ConversionPulseRow
            secondaryProofBlocks={ctrl.secondaryProofBlocks}
            isContentCentered={ctrl.isContentCentered}
          />

          {/* Layer 2: Urgency Ticker (Dominant Signals) */}
          <ConversionUrgencyTicker
            dominantUrgency={ctrl.dominantUrgency}
            dominantUrgencyId={ctrl.dominantUrgencyId}
            urgencyBlocks={ctrl.urgencyBlocks}
          />

          {/* Layer 3: Confidence Grid (Reassurance) */}
          <ConversionConfidenceGrid
            showConfidenceGrid={ctrl.showConfidenceGrid}
            visiblePrimaryBlocks={ctrl.visiblePrimaryBlocks}
            primaryShellClass={ctrl.primaryShellClass}
            resolvedPrimaryGridClass={ctrl.resolvedPrimaryGridClass}
            primaryUsesMultiColumnLayout={ctrl.primaryUsesMultiColumnLayout}
          />
        </div>

        {/* Footer: Bulk Savings */}
        <ConversionFooterBulkSavings
          modules={ctrl.modules}
          productId={ctrl.product?.id}
          variant={ctrl.variant}
          prefersArabicCopy={ctrl.prefersArabicCopy}
        />
      </div>
    </section>
  );
};

export default ConversionStack;
