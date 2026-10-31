import React from 'react';
import { cn as cx } from '../../../lib/utils';
import type { ConversionStackVariant } from './types';

export interface ConversionStackHeaderProps {
  heading: string;
  subtitle: string;
  variant: ConversionStackVariant;
  headerClass: string;
  isContentCentered: boolean;
  isStandalone?: boolean;
}

export const ConversionStackHeader: React.FC<ConversionStackHeaderProps> = ({
  heading,
  subtitle,
  variant,
  headerClass,
  isContentCentered,
  isStandalone = false,
}) => {
  if (!heading && !subtitle) {
    return null;
  }

  const containerClass = isStandalone
    ? cx(
        variant === 'minimal' || variant === 'couture-minimal'
          ? 'mb-2 flex flex-col gap-1'
          : headerClass,
        isContentCentered ? 'items-center text-center' : '',
      )
    : cx(headerClass, isContentCentered ? 'items-center text-center' : '');

  const headingSizeClass = isStandalone
    ? variant === 'minimal' || variant === 'couture-minimal'
      ? 'text-base'
      : 'text-xl'
    : variant === 'minimal' || variant === 'couture-minimal'
      ? 'text-lg'
      : 'text-xl';

  return (
    <div className={containerClass}>
      {heading ? (
        <h2
          className={cx(
            headingSizeClass,
            'font-black text-foreground',
            isContentCentered ? 'mx-auto' : '',
          )}
        >
          {heading}
        </h2>
      ) : null}
      {subtitle ? (
        <p
          className={cx(
            'max-w-2xl text-sm leading-6 text-muted-foreground',
            isContentCentered ? 'mx-auto text-center' : '',
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
};

export default ConversionStackHeader;
