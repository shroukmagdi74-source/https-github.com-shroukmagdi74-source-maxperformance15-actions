import React from 'react';
import { Link } from 'react-router-dom';
import type { StorefrontTheme } from '../../types/theme.types';
import { buildStorefrontPath } from '../../utils/paths';

export const ARABIC_SCRIPT_PATTERN = /[\u0600-\u06FF]/;

export const STOREFRONT_RUNTIME_PHARMACY_THEME_IDS = new Set([
  'max-care-go',
  'pharmacy-demo',
]);

export const isRuntimePharmacyThemeId = (themeId?: string | null): boolean =>
  Boolean(themeId && STOREFRONT_RUNTIME_PHARMACY_THEME_IDS.has(themeId));

export const parsePositiveNumber = (value: unknown, fallback: number) => {
  const numericValue =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return fallback;
  }

  return numericValue;
};

export interface StorefrontHomeLinkProps
  extends Omit<React.ComponentProps<typeof Link>, 'reloadDocument' | 'to'> {
  forceDocumentNavigation?: boolean;
  pathname: string;
  search?: string;
  className?: string;
  children: React.ReactNode;
}

export const StorefrontHomeLink: React.FC<StorefrontHomeLinkProps> = ({
  children,
  forceDocumentNavigation = false,
  pathname,
  search = '',
  ...linkProps
}) => (
  <Link
    {...linkProps}
    to={buildStorefrontPath(pathname, '/', search)}
    reloadDocument={forceDocumentNavigation}
  >
    {children}
  </Link>
);

export const resolveStorefrontDocumentLanguage = (
  theme: StorefrontTheme,
): 'ar' | 'en' => {
  if (theme.direction === 'rtl') {
    return 'ar';
  }

  const languageHints = [
    theme.name,
    theme.header?.brandName,
    theme.header?.announcementText,
    ...(theme.header?.navigation || []).map((link) => link.label),
    ...(theme.footer?.navigation || []).flatMap((group) => [
      group.title,
      ...group.links.map((link) => link.label),
    ]),
  ]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(' ');

  return ARABIC_SCRIPT_PATTERN.test(languageHints) ? 'ar' : 'en';
};
