import React from 'react';
import { cn as cx } from '../../../lib/utils';
import type { ConversionBlock } from './types';

export interface ConversionPulseRowProps {
  secondaryProofBlocks: ConversionBlock[];
  isContentCentered: boolean;
}

export const ConversionPulseRow: React.FC<ConversionPulseRowProps> = ({
  secondaryProofBlocks,
  isContentCentered,
}) => {
  if (secondaryProofBlocks.length === 0) {
    return null;
  }

  return (
    <div
      className={cx(
        'flex flex-wrap items-center gap-2 animate-in fade-in duration-700 slide-in-from-bottom-2 fill-mode-forwards delay-75',
        isContentCentered ? 'justify-center' : '',
      )}
      data-testid="conversion-pulse-row"
    >
      {secondaryProofBlocks.map((block) => (
        <div key={block.id}>{block.node}</div>
      ))}
    </div>
  );
};

export default ConversionPulseRow;
