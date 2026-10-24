import React from 'react';
import { useStorefrontTheme } from '../../engine/ThemeProvider';
import {
  buildElementTypographyStyle,
  type ElementTypographySettings,
} from './elementTypography';

export interface TextElementSettings extends ElementTypographySettings {
  content?: string;
  align?: 'start' | 'center' | 'end' | 'left' | 'right' | string;
  size?: 'sm' | 'md' | 'lg' | string;
  color?: string;
  className?: string;
}

export interface TextElementProps {
  section?: {
    type?: string;
    variant?: string;
    settings?: TextElementSettings;
    [key: string]: any;
  };
  settings?: TextElementSettings;
}

const TextElement: React.FC<TextElementProps> = ({ section, settings: directSettings }) => {
  const mergedSettings = { ...section?.settings, ...directSettings };
  const content = mergedSettings?.content ?? '';
  const rawAlign = String(mergedSettings?.align || 'start').trim().toLowerCase();
  const rawSize = String(mergedSettings?.size || 'md').trim().toLowerCase();
  const color = mergedSettings?.color?.trim();
  const customClass = mergedSettings?.className || '';

  // Typography size variants
  let sizeClass = 'text-sm sm:text-base leading-relaxed text-foreground/80';
  if (rawSize === 'sm') {
    sizeClass = 'text-xs sm:text-sm leading-relaxed text-muted-foreground';
  } else if (rawSize === 'lg') {
    sizeClass = 'text-base sm:text-lg leading-relaxed text-foreground/90';
  }

  // Alignment
  let alignClass = 'text-start';
  if (rawAlign === 'center') {
    alignClass = 'text-center';
  } else if (rawAlign === 'end' || rawAlign === 'right') {
    alignClass = 'text-end';
  }

  let themeContext: any = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    themeContext = useStorefrontTheme();
  } catch {
    // Safe fallback outside provider
  }

  const typoStyle = buildElementTypographyStyle(mergedSettings, content);

  const customStyle: React.CSSProperties = {
    fontFamily: themeContext?.pageStyleVars?.['--store-font-family'] || 'var(--store-font-family, inherit)',
    fontSize: themeContext?.pageStyleVars?.['--store-font-size-base'] || 'var(--store-font-size-base, inherit)',
    lineHeight: themeContext?.pageStyleVars?.['--store-line-height'] || 'var(--store-line-height, inherit)',
    fontWeight: themeContext?.pageStyleVars?.['--store-body-weight']
      ? Number(themeContext.pageStyleVars['--store-body-weight'])
      : ('var(--store-body-weight, 400)' as any),
    letterSpacing: themeContext?.pageStyleVars?.['--store-letter-spacing'] ?? '0',
    ...(color ? { color: color === 'accent' ? 'var(--store-accent, #2563eb)' : color } : {}),
    ...typoStyle,
  };

  return (
    <div
      data-storefront-element="text"
      data-element="text"
      data-text-size={rawSize}
      className={`storefront-text-element w-full whitespace-pre-line ${sizeClass} ${alignClass} ${customClass}`.trim()}
      style={customStyle}
    >
      {content}
    </div>
  );
};

export default TextElement;
