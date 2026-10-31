import { isKhemetLuxeTheme as isKhemetLuxeThemeId } from '../../utils/navigationGuards';
export {
  getProductVolumeDiscounts,
  calculateVolumeDiscountPricing,
} from '../../utils/volumeDiscounts';
export {
  PDP_CHECKOUT_SECTION_ID,
  STOREFRONT_PDP_CHECKOUT_OPEN_EVENT,
  STOREFRONT_PDP_CHECKOUT_VISIBILITY_EVENT,
  STOREFRONT_BUYBOX_ID,
  STOREFRONT_PRODUCT_DESCRIPTION_ID,
  STOREFRONT_REVIEWS_SECTION_ID,
} from '../../utils/pdpCheckout';
export { formatStorefrontCurrency } from '../../utils/currency';
export { buildOptimizedStorefrontImageUrl } from '../../utils/productImages';
export { sanitizeStorefrontHtml } from '../../utils/html';
export { buildStorefrontPath } from '../../utils/paths';

export const isExternalHref = (href: string) => /^(https?:\/\/|mailto:|tel:)/i.test(href);

export const isRecord = (value: unknown): value is Record<string, any> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const parseSectionItems = (value: unknown, defaults: any[] = []): any[] => {
  if (typeof value !== 'string' || !value.trim()) {
    return defaults;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : defaults;
  } catch {
    return defaults;
  }
};

export const parseMetadataArray = <T extends Record<string, any>>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (typeof value !== 'string' || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
};

export const parseMetadataStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || '').trim())
      .filter(Boolean);
  }

  if (typeof value !== 'string' || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => String(item || '').trim())
        .filter(Boolean);
    }
  } catch {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

export const parseBooleanSetting = (value: unknown, fallback: boolean) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }

  return fallback;
};

export const parseMaybeNumber = (value: unknown): number | null => {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim()
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(parsed) ? parsed : null;
};

export const clampNumber = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const hashProductSeed = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
};

export const getOscillatingCounterValue = ({
  base,
  step,
  seed,
  floor = 1,
  maxSwing = 3,
  allowDip = true,
}: {
  base: number;
  step: number;
  seed: number;
  floor?: number;
  maxSwing?: number;
  allowDip?: boolean;
}) => {
  const normalizedBase = Math.max(floor, Math.round(base));
  if (normalizedBase <= 0) {
    return 0;
  }

  const swing = Math.max(1, Math.min(maxSwing, Math.ceil(normalizedBase * 0.2)));
  const wave = Math.sin((seed + 1) * 0.53 + step * 1.27);
  const drift = Math.cos((seed + 7) * 0.31 + step * 0.82);
  const normalized = (wave + drift + 2) / 4;
  const min = allowDip ? Math.max(floor, normalizedBase - swing) : normalizedBase;
  const max = normalizedBase + swing;

  return clampNumber(Math.round(min + normalized * (max - min)), min, max);
};

export const isProductInfoConversionModuleEnabled = (
  conversionSuiteEnabled: boolean,
  modules: Record<string, unknown> | null | undefined,
  moduleKey: 'soldCounter' | 'purchaseFomo' | 'lowStockNotice' | 'stickyAddToCart',
) => conversionSuiteEnabled && Boolean(modules?.[moduleKey]);

export const shouldProductInfoAddToCartOpenCart = (
  themeId: string | null | undefined,
  hasEmbeddedPdpCheckout: boolean,
) => !hasEmbeddedPdpCheckout || isKhemetLuxeThemeId(themeId);

export const shouldProductInfoAddToCartOpenEmbeddedCheckout = (
  themeId: string | null | undefined,
  hasEmbeddedPdpCheckout: boolean,
) => hasEmbeddedPdpCheckout && themeId !== 'khemet-luxe-eg';

export const shouldProductInfoMobileStickyOpenVariantSheet = (
  canOpenMobileVariantSheet: boolean,
  isSelectionReady: boolean,
) => canOpenMobileVariantSheet && !isSelectionReady;

export const interpolateTemplate = (
  template: unknown,
  tokens: Record<string, string | number>,
  fallback: string,
) => {
  const source =
    typeof template === 'string' && template.trim().length > 0 ? template : fallback;

  return Object.entries(tokens).reduce((output, [key, value]) => {
    return output.replace(
      new RegExp(`\\{+\\s*${key}\\s*\\}+`, 'gi'),
      String(value),
    );
  }, source);
};

export const interpolateCount = (template: unknown, count: number, fallback: string) =>
  interpolateTemplate(template, { count }, fallback);

export const resolveDirectionalCopy = ({
  value,
  englishFallback,
  arabicFallback,
  prefersArabicCopy,
}: {
  value: unknown;
  englishFallback: string;
  arabicFallback: string;
  prefersArabicCopy: boolean;
}) => {
  if (typeof value === 'string' && value.trim()) {
    const trimmedValue = value.trim();
    if (prefersArabicCopy && trimmedValue === englishFallback) {
      return arabicFallback;
    }

    return trimmedValue;
  }

  return prefersArabicCopy ? arabicFallback : englishFallback;
};

export const resolveDateLocale = (currency: string): string => {
  const map: Record<string, string> = {
    EGP: 'ar-EG',
    SAR: 'ar-SA',
    AED: 'ar-AE',
    KWD: 'ar-KW',
    QAR: 'ar-QA',
    BHD: 'ar-BH',
    OMR: 'ar-OM',
    JOD: 'ar-JO',
    IQD: 'ar-IQ',
    LBP: 'ar-LB',
    USD: 'en-US',
    GBP: 'en-GB',
    EUR: 'en-IE',
    CAD: 'en-CA',
    AUD: 'en-AU',
    TRY: 'tr-TR',
  };

  return map[currency?.toUpperCase()] || 'ar-EG';
};

export const formatDateRange = (minDays: number, maxDays: number, locale: string): string => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + minDays);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + maxDays);

  const formatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  });

  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
};

export const parseDetailRows = (
  value: unknown,
): Array<{ label: string; value: string }> => {
  if (typeof value !== 'string' || !value.trim()) {
    return [];
  }

  return value
    .split('\n')
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const [labelPart, ...valueParts] = row.split('|');
      return {
        label: String(labelPart || '').trim(),
        value: valueParts.join('|').trim(),
      };
    })
    .filter((row) => row.label && row.value);
};

export const parseProductMetadata = (value: unknown): Record<string, any> => {
  if (isRecord(value)) {
    return value;
  }

  if (typeof value !== 'string' || !value.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

export const parseVariantSettings = (value: unknown) => {
  const parsedValue = parseProductMetadata(value);
  const styles = isRecord(parsedValue) && isRecord(parsedValue['styles']) ? parsedValue['styles'] : {};
  const attributeImages = isRecord(parsedValue) && isRecord(parsedValue['attributeImages'])
    ? parsedValue['attributeImages']
    : {};
  const attributeColors = isRecord(parsedValue) && isRecord(parsedValue['attributeColors'])
    ? parsedValue['attributeColors']
    : {};

  return {
    styles,
    attributeImages,
    attributeColors,
  };
};

export const normalizeExternalPurchaseUrl = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (isExternalHref(trimmed)) {
    return trimmed;
  }

  if (/^[a-z0-9.-]+\.[a-z]{2,}(?:\/|$)/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return '';
};

export const translateZenCategoryLabel = (value: string): string => {
  const normalizedValue = value.trim().toLowerCase();

  switch (normalizedValue) {
    case 'plants':
    case 'plant':
      return 'نباتات';
    case 'pots':
    case 'pot':
    case 'planters':
      return 'أواني';
    case 'seeds':
    case 'seed':
      return 'بذور';
    case 'care':
    case 'plant care':
      return 'عناية بالنبات';
    case 'decor':
    case 'home decor':
      return 'ديكور طبيعي';
    case 'gifts':
    case 'gift':
      return 'هدايا طبيعية';
    case 'skincare':
      return 'عناية طبيعية';
    default:
      return value;
  }
};

export const resolveExternalProductConfig = (product: Record<string, any> | null | undefined) => {
  const metadata = parseProductMetadata(product?.['metadata']);
  const url = normalizeExternalPurchaseUrl(
    metadata['externalUrl'] ??
      metadata['affiliateUrl'] ??
      metadata['partnerUrl'] ??
      metadata['buyUrl'] ??
      metadata['productUrl'] ??
      product?.['externalUrl'] ??
      product?.['affiliateUrl'] ??
      product?.['partnerUrl'] ??
      product?.['buyUrl'] ??
      product?.['productUrl'],
  );

  return {
    url,
    label:
      typeof metadata['externalButtonLabel'] === 'string'
        ? metadata['externalButtonLabel'].trim()
        : typeof metadata['affiliateButtonLabel'] === 'string'
          ? metadata['affiliateButtonLabel'].trim()
          : typeof metadata['externalLabel'] === 'string'
            ? metadata['externalLabel'].trim()
            : typeof metadata['affiliateLabel'] === 'string'
              ? metadata['affiliateLabel'].trim()
              : '',
    vendor:
      typeof metadata['externalVendor'] === 'string'
        ? metadata['externalVendor'].trim()
        : typeof metadata['partnerName'] === 'string'
          ? metadata['partnerName'].trim()
          : typeof metadata['vendorName'] === 'string'
            ? metadata['vendorName'].trim()
            : '',
    description:
      typeof metadata['externalDescription'] === 'string'
        ? metadata['externalDescription'].trim()
        : typeof metadata['affiliateDescription'] === 'string'
          ? metadata['affiliateDescription'].trim()
          : '',
    externalOnly: Boolean(
      metadata['externalOnly'] ||
        metadata['externalAffiliateOnly'] ||
        metadata['isExternalProduct'] ||
        product?.['source'] === 'EXTERNAL' ||
        product?.['source'] === 'AFFILIATE',
    ),
  };
};

export const handleQuickScroll = (
  targetId: string,
  block: ScrollLogicalPosition = 'start',
) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const target = document.getElementById(targetId);

  if (!target) {
    if (window.location.hash !== `#${targetId}`) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}#${targetId}`,
      );
    }
    return;
  }

  const targetRect = target.getBoundingClientRect();
  const currentScrollTop = window.scrollY || window.pageYOffset || 0;
  const stickyOffset = 96;
  const nextScrollTop =
    block === 'center'
      ? currentScrollTop + targetRect.top - Math.max((window.innerHeight - targetRect.height) / 2, stickyOffset)
      : currentScrollTop + targetRect.top - stickyOffset;

  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}#${targetId}`,
  );
  window.scrollTo({
    top: Math.max(0, nextScrollTop),
    behavior: 'smooth',
  });
};

