export const DEFAULT_STOREFRONT_CURRENCY = 'EGP';

export const normalizeStorefrontCurrency = (currency?: string | null): string => {
  const normalized = typeof currency === 'string' ? currency.trim().toUpperCase() : '';
  if (normalized === 'ج.م' || normalized === 'جنيه مصري' || normalized === 'LE' || normalized === 'L.E') {
    return 'EGP';
  }
  return normalized || DEFAULT_STOREFRONT_CURRENCY;
};

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

  // In Egyptian Pound with Arabic/RTL context, render clean "620 ج.م" without redundant piaster decimals (.00)
  if (normalizedCurrency === 'EGP' && (isRtl || resolvedLocale.startsWith('ar') || currency === 'ج.م')) {
    const formattedNum = numericAmount % 1 === 0
      ? numericAmount.toLocaleString('en-US')
      : numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${formattedNum} ج.م`;
  }

  try {
    return new Intl.NumberFormat(resolvedLocale, {
      style: 'currency',
      currency: normalizedCurrency,
      maximumFractionDigits: numericAmount % 1 === 0 ? 0 : 2,
    }).format(numericAmount);
  } catch {
    return `${normalizedCurrency} ${numericAmount.toFixed(numericAmount % 1 === 0 ? 0 : 2)}`;
  }
};
