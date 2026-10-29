import {
  DEFAULT_STOREFRONT_CURRENCY,
  formatMoney,
  formatNumber,
  getLocaleFormatDefaults,
  normalizeNumberLocale,
  normalizeStorefrontCurrency,
} from './localeFormat';

export { DEFAULT_STOREFRONT_CURRENCY, normalizeStorefrontCurrency };

/**
 * PREVIEW-1 / LOCALE-1 parity — the locale the *store* renders in.
 *
 * `formatStorefrontCurrency` used to infer the language from
 * `document.documentElement.dir|lang`, a global the shell only writes inside an
 * effect. An English store could therefore format its first prices with the
 * previous (Arabic) direction and show `1,890 ج.م` instead of `EGP 1,890.00`.
 * The shell now publishes the resolved locale here while rendering, so every
 * price is formatted for the locale of the storefront it belongs to.
 */
let activeStorefrontMoneyLocale: string | null = null;

export const setStorefrontMoneyLocale = (locale?: string | null): void => {
  const normalized = typeof locale === 'string' ? locale.trim().toLowerCase() : '';
  activeStorefrontMoneyLocale = normalized
    ? normalized.startsWith('en')
      ? 'en-US'
      : 'ar-EG'
    : null;
};

export const getStorefrontMoneyLocale = (): string | null =>
  activeStorefrontMoneyLocale;

const detectDocumentLocale = (): string | null => {
  if (typeof document === 'undefined' || !document.documentElement) {
    return null;
  }
  const dir = document.documentElement.dir;
  const lang = (document.documentElement.lang || '').toLowerCase();
  if (lang.startsWith('en')) {
    return 'en-US';
  }
  if (dir === 'rtl' || lang.startsWith('ar')) {
    return 'ar-EG';
  }
  return null;
};

/**
 * DYN-1 compatible storefront price renderer.
 *
 * All number/currency work is delegated to the unified `formatMoney` helper
 * (LOCALE-1) while keeping the exact DYN-1 output contract:
 *  - EGP in an Arabic/RTL context → `"620 ج.م"` (no redundant `.00`)
 *  - anything else → `Intl` currency formatting with the currency's own
 *    decimals (`EGP 1,890.00`, `¥1,890`)
 *
 * Locale resolution order: explicit `locale` argument → the locale the shell
 * published for this storefront → the document direction (legacy fallback).
 *
 * Store preferences (digits + symbol position) come from
 * `getLocaleFormatDefaults()`, which the shell syncs from the editor settings.
 */
export const formatStorefrontCurrency = (
  amount: number,
  currency?: string | null,
  locale?: string | null,
): string => {
  const numericAmount = Number.isFinite(amount) ? amount : 0;
  const normalizedCurrency = normalizeStorefrontCurrency(currency);

  const detectedLocale =
    locale || activeStorefrontMoneyLocale || detectDocumentLocale();
  const isRtl = detectedLocale === null || detectedLocale.startsWith('ar');
  const resolvedLocale = detectedLocale || 'en-US';
  const settings = getLocaleFormatDefaults();
  const digitLocale = settings.numberLocale === 'ar-EG-arabic-digits'
    ? normalizeNumberLocale(settings.numberLocale)
    : resolvedLocale;

  const isWholeAmount = numericAmount % 1 === 0;
  const minimumFractionDigits = isWholeAmount ? 0 : 2;
  const maximumFractionDigits = isWholeAmount ? 0 : 2;

  // In Egyptian Pound with Arabic/RTL context, render clean "620 ج.م" without redundant piaster decimals (.00)
  if (normalizedCurrency === 'EGP' && (isRtl || resolvedLocale.startsWith('ar') || currency === 'ج.م')) {
    return formatMoney(numericAmount, {
      currency: 'EGP',
      symbol: 'ج.م',
      position: settings.currencyPosition,
      locale: digitLocale,
      minimumFractionDigits,
      maximumFractionDigits,
    });
  }

  // English / LTR stores keep the currency's own decimals (`EGP 1,890.00`)
  // because `formatMoney` now defaults `style: 'currency'` to the currency's
  // minor units instead of the DYN-1 whole-amount rounding.
  try {
    return formatMoney(numericAmount, {
      style: 'currency',
      currency: normalizedCurrency,
      locale: resolvedLocale,
    });
  } catch {
    return `${normalizedCurrency} ${formatNumber(numericAmount, {
      numberLocale: digitLocale,
      minimumFractionDigits,
      maximumFractionDigits,
    })}`;
  }
};
