import React from 'react';
import type { ConversionUrgencyBlock, UrgencyBlockId } from './types';

export interface ConversionUrgencyTickerProps {
  dominantUrgency: ConversionUrgencyBlock | null;
  dominantUrgencyId: UrgencyBlockId | null;
  urgencyBlocks: ConversionUrgencyBlock[];
}

export const ConversionUrgencyTicker: React.FC<ConversionUrgencyTickerProps> = ({
  dominantUrgency,
  dominantUrgencyId,
  urgencyBlocks,
}) => {
  if (!dominantUrgency || !dominantUrgencyId) {
    return null;
  }

  const block = urgencyBlocks.find((b) => b.id === dominantUrgencyId);
  if (!block) {
    return null;
  }

  return (
    <div
      className="space-y-2 animate-in fade-in duration-700 slide-in-from-bottom-3 fill-mode-forwards delay-150"
      data-testid="conversion-urgency-ticker"
    >
      <div>{block.dominantNode}</div>
    </div>
  );
};

export default ConversionUrgencyTicker;
