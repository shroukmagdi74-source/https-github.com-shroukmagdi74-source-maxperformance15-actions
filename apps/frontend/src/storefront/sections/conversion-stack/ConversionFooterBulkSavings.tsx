import React from 'react';
import { cn as cx } from '../../../lib/utils';
import VolumeDiscountBadge from '../../../components/VolumeDiscountBadge';
import type { ConversionStackVariant, JsonRecord } from './types';

export interface ConversionFooterBulkSavingsProps {
  modules: JsonRecord;
  productId?: string;
  variant: ConversionStackVariant;
  prefersArabicCopy: boolean;
}

export const ConversionFooterBulkSavings: React.FC<ConversionFooterBulkSavingsProps> = ({
  modules,
  productId,
  variant,
  prefersArabicCopy,
}) => {
  if (!modules['bulkSavings'] || !productId) {
    return null;
  }

  return (
    <div
      aria-label={prefersArabicCopy ? 'إضافة ختامية' : 'Footer add-on'}
      className={cx(
        'mt-4',
        variant === 'editorial'
          ? 'rounded-[1.1rem] bg-background/70 p-3'
          : variant === 'couture-minimal'
            ? 'rounded-[1rem] border border-[#f0d7d2] bg-white/90 p-3'
            : '',
      )}
      data-testid="conversion-footer"
    >
      <VolumeDiscountBadge productId={productId} quantity={1} />
    </div>
  );
};

export default ConversionFooterBulkSavings;
