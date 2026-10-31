import type { CatalogPriceRangeValue } from '../../utils/catalogFilters';
import { formatStorefrontCurrency } from '../../utils/currency';

export interface FiltersSidebarProps {
  settings?: {
    title?: string;
    subtitle?: string;
    badge?: string;
    mobileTitle?: string;
    mobileSubtitle?: string;
    mobileApplyText?: string;
    mobileResetText?: string;
    showSearch?: boolean;
    searchLabel?: string;
    searchPlaceholder?: string;
    searchButtonText?: string;
    showSort?: boolean;
    sortLabel?: string;
    showCategories?: boolean;
    categoryLabel?: string;
    showPriceFilter?: boolean;
    simpleCatalog?: boolean;
    categoryStyle?: 'list' | 'dropdown';
    priceLabel?: string;
    allProductsLabel?: string;
    clearButtonText?: string;
    showMobileLabel?: string;
    hideMobileLabel?: string;
    showSizeFilter?: boolean;
    [key: string]: unknown;
  };
}

export const isShopIndexRoute = (pathname: string): boolean =>
  pathname.replace(/\/+$/, '').endsWith('/shop');

export type ElegantLuxePriceRangeValue =
  | 'under-1500'
  | '1500-3000'
  | '3000-4500'
  | 'over-4500';

export type KhemetLuxePriceRangeValue =
  | 'under-2000'
  | '2000-2500'
  | '2500-3000'
  | 'over-3000';

export type SidebarPriceRangeValue =
  | CatalogPriceRangeValue
  | ElegantLuxePriceRangeValue
  | KhemetLuxePriceRangeValue;

export interface SidebarPriceRangeOption {
  value: SidebarPriceRangeValue;
  label: string;
  minPrice?: number;
  maxPrice?: number;
}

export const ELEGANT_LUXE_PRICE_RANGES: Array<{
  value: ElegantLuxePriceRangeValue;
  minPrice?: number;
  maxPrice?: number;
}> = [
  { value: 'under-1500', maxPrice: 1500 },
  { value: '1500-3000', minPrice: 1500, maxPrice: 3000 },
  { value: '3000-4500', minPrice: 3000, maxPrice: 4500 },
  { value: 'over-4500', minPrice: 4500 },
];

export const KHEMET_LUXE_PRICE_RANGES: Array<{
  value: KhemetLuxePriceRangeValue;
  minPrice?: number;
  maxPrice?: number;
}> = [
  { value: 'under-2000', maxPrice: 2000 },
  { value: '2000-2500', minPrice: 2000, maxPrice: 2500 },
  { value: '2500-3000', minPrice: 2500, maxPrice: 3000 },
  { value: 'over-3000', minPrice: 3000 },
];

export const formatPriceRangeLabel = (
  option: Pick<SidebarPriceRangeOption, 'minPrice' | 'maxPrice'>,
  currency: string,
  locale: string,
  direction: 'rtl' | 'ltr',
) => {
  if (option.minPrice === undefined && option.maxPrice !== undefined) {
    return direction === 'rtl'
      ? `أقل من ${formatStorefrontCurrency(option.maxPrice, currency, locale)}`
      : `Under ${formatStorefrontCurrency(option.maxPrice, currency, locale)}`;
  }

  if (option.minPrice !== undefined && option.maxPrice !== undefined) {
    return `${formatStorefrontCurrency(option.minPrice, currency, locale)} - ${formatStorefrontCurrency(option.maxPrice, currency, locale)}`;
  }

  if (option.minPrice !== undefined) {
    return direction === 'rtl'
      ? `أكثر من ${formatStorefrontCurrency(option.minPrice, currency, locale)}`
      : `Over ${formatStorefrontCurrency(option.minPrice, currency, locale)}`;
  }

  return '';
};

export const parsePriceParam = (value: string | null): number | null => {
  if (value === null || value.trim() === '') {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

export const getElegantLuxePriceRangeOptions = (
  currency: string,
  locale: string,
  direction: 'rtl' | 'ltr',
): SidebarPriceRangeOption[] =>
  ELEGANT_LUXE_PRICE_RANGES.map((option) => ({
    ...option,
    label: formatPriceRangeLabel(option, currency, locale, direction),
  }));

export const getKhemetLuxePriceRangeOptions = (
  currency: string,
  locale: string,
  direction: 'rtl' | 'ltr',
): SidebarPriceRangeOption[] =>
  KHEMET_LUXE_PRICE_RANGES.map((option) => ({
    ...option,
    label: formatPriceRangeLabel(option, currency, locale, direction),
  }));

export const resolveSidebarPriceRangeValue = (
  searchParams: URLSearchParams,
  options: SidebarPriceRangeOption[],
): SidebarPriceRangeValue | null => {
  const minPrice = parsePriceParam(searchParams.get('minPrice'));
  const maxPrice = parsePriceParam(searchParams.get('maxPrice'));
  const match = options.find(
    (option) =>
      (option.minPrice ?? null) === minPrice && (option.maxPrice ?? null) === maxPrice,
  );

  return match?.value ?? null;
};
