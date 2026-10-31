import React from 'react';
import { cn as cx } from '../../../lib/utils';
import type { ConversionBlock } from './types';

export interface ConversionConfidenceGridProps {
  showConfidenceGrid: boolean;
  visiblePrimaryBlocks: ConversionBlock[];
  primaryShellClass: string;
  resolvedPrimaryGridClass: string;
  primaryUsesMultiColumnLayout: boolean;
}

export const ConversionConfidenceGrid: React.FC<ConversionConfidenceGridProps> = ({
  showConfidenceGrid,
  visiblePrimaryBlocks,
  primaryShellClass,
  resolvedPrimaryGridClass,
  primaryUsesMultiColumnLayout,
}) => {
  if (!showConfidenceGrid || visiblePrimaryBlocks.length === 0) {
    return null;
  }

  return (
    <div
      className={cx(
        primaryShellClass,
        'mt-4 animate-in fade-in duration-700 slide-in-from-bottom-4 fill-mode-forwards delay-300',
      )}
      data-testid="conversion-confidence-grid"
    >
      <div className={resolvedPrimaryGridClass}>
        {visiblePrimaryBlocks.map((block) => (
          <div
            key={block.id}
            className={primaryUsesMultiColumnLayout ? block.wrapperClassName : undefined}
          >
            {block.node}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversionConfidenceGrid;
