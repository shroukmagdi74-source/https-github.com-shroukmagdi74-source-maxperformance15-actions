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
 * DYN-1 compatible storefront price renderer.
 *
 * All number/currency work is delegated to the unified `formatMoney` helper
 * (LOCALE-1) while keeping the exact DYN-1 output contract:
 *  - EGP in an Arabic/RTL context → `"620 ج.م"` (no redundant `.00`)
 *  - anything else → `Intl` currency formatting
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

  const isRtl = typeof document !== 'undefined'
    ? (document.documentElement.dir === 'rtl' || document.documentElement.lang?.startsWith('ar'))
    : false;

  const resolvedLocale = locale || (isRtl ? 'ar-EG' : 'en-US');
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

  try {
    return formatMoney(numericAmount, {
      style: 'currency',
      currency: normalizedCurrency,
      locale: resolvedLocale,
      minimumFractionDigits: Math.min(minimumFractionDigits, maximumFractionDigits),
      maximumFractionDigits,
    });
  } catch {
    return `${normalizedCurrency} ${formatNumber(numericAmount, {
      numberLocale: digitLocale,
      minimumFractionDigits,
      maximumFractionDigits,
    })}`;
  }
};
