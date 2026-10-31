import type { Product, ProductVariant } from '../../hooks/useProducts';
import { resolveSectionVariant } from '../../variants';

export interface BoughtTogetherSectionProps {
  section?: {
    variant?: string;
    [key: string]: unknown;
  };
  settings?: {
    title?: string;
    subtitle?: string;
    limit?: number | string;
    addBundleText?: string;
    totalLabel?: string;
    currentProductLabel?: string;
    recommendationLabel?: string;
    quickAddText?: string;
    chooseOptionsText?: string;
    bundleVariantHint?: string;
    contentAlign?: string;
    [key: string]: unknown;
  };
}

export type BoughtTogetherVariant =
  | 'stacked'
  | 'compact'
  | 'editorial'
  | 'complete-look'
  | 'pairing-rail'
  | 'gift-pairings';

export const BOUGHT_TOGETHER_SECTION_FAMILY = 'BoughtTogetherSection';

export const parsePositiveNumber = (value: unknown, fallback: number) => {
  const numericValue =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return fallback;
  }

  return Math.round(numericValue);
};

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const parseProductMetadata = (value: unknown): Record<string, unknown> => {
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

export const getProductVariants = (product: Product): ProductVariant[] =>
  product.productVariants || product.variants || [];

export const hasVariants = (product: Product) => Boolean(getProductVariants(product).length);

export const SIZE_ATTRIBUTE_KEYS = new Set(['size', 'sizes', 'الحجم', 'المقاس', 'المقاسات']);
export const COLOR_ATTRIBUTE_KEYS = new Set([
  'color',
  'colors',
  'colour',
  'colours',
  'لون',
  'اللون',
  'الالوان',
  'الألوان',
  'الوان',
  'ألوان',
]);

export const getVariantAttributes = (variant: ProductVariant): Record<string, string> => {
  if (isRecord(variant.attributes)) {
    return variant.attributes as Record<string, string>;
  }
  return {};
};

export const getVariantAttributeLabels = (
  product: Product,
  prefersArabicCopy: boolean,
): {
  shortLabel: string;
  selectionHint: string;
  firstSelectionError: string;
  completionErrorPrefix: string;
} => {
  const attributeKeys = Array.from(
    new Set(
      getProductVariants(product).flatMap((variant) =>
        Object.keys(getVariantAttributes(variant)).map((key) => key.trim().toLowerCase()),
      ),
    ),
  );
  const hasSize = attributeKeys.some((key) => SIZE_ATTRIBUTE_KEYS.has(key));
  const hasColor = attributeKeys.some((key) => COLOR_ATTRIBUTE_KEYS.has(key));

  if (prefersArabicCopy) {
    if (hasSize && !hasColor) {
      return {
        shortLabel: 'المقاس',
        selectionHint: 'اختاري المقاس لكل إضافة من نفس الكارت قبل إضافة الباقة.',
        firstSelectionError: 'اختَر المقاس أولًا',
        completionErrorPrefix: 'أكمل اختيار المقاس لـ',
      };
    }

    if (hasColor && !hasSize) {
      return {
        shortLabel: 'اللون',
        selectionHint: 'اختاري اللون لكل إضافة من نفس الكارت قبل إضافة الباقة.',
        firstSelectionError: 'اختَر اللون أولًا',
        completionErrorPrefix: 'أكمل اختيار اللون لـ',
      };
    }

    return {
      shortLabel: 'اللون أو المقاس',
      selectionHint: 'اختَر اللون أو المقاس لكل إضافة من نفس الكارت قبل إضافة الباقة.',
      firstSelectionError: 'اختَر اللون أو المقاس أولًا',
      completionErrorPrefix: 'أكمل اختيار اللون أو المقاس لـ',
    };
  }

  if (hasSize && !hasColor) {
    return {
      shortLabel: 'size',
      selectionHint: 'Choose the size for each add-on from the same card before adding the bundle.',
      firstSelectionError: 'Select the size first',
      completionErrorPrefix: 'Finish choosing the size for',
    };
  }

  if (hasColor && !hasSize) {
    return {
      shortLabel: 'color',
      selectionHint: 'Choose the color for each add-on from the same card before adding the bundle.',
      firstSelectionError: 'Select the color first',
      completionErrorPrefix: 'Finish choosing the color for',
    };
  }

  return {
    shortLabel: 'color or size',
    selectionHint: 'Choose the color or size for each add-on from the same card before adding the bundle.',
    firstSelectionError: 'Select the color or size first',
    completionErrorPrefix: 'Finish choosing the color or size for',
  };
};

export const buildDefaultVariantSelection = (product: Product): Record<string, string> => {
  const firstVariant = getProductVariants(product)[0];
  return firstVariant ? getVariantAttributes(firstVariant) : {};
};

export const resolveVariantFromAttributes = (
  variants: ProductVariant[],
  attributes: Record<string, string>,
) => {
  if (!variants.length || Object.keys(attributes).length === 0) {
    return null;
  }

  return (
    variants.find((variant) => {
      const variantAttributes = getVariantAttributes(variant);
      const variantEntries = Object.entries(variantAttributes);

      return (
        variantEntries.length === Object.keys(attributes).length &&
        variantEntries.every(([key, value]) => attributes[key] === value)
      );
    }) || null
  );
};

export const parseVariantSettings = (
  product: Product,
): {
  styles?: Record<string, unknown> | null;
  attributeImages?: Record<string, unknown> | null;
  attributeColors?: Record<string, unknown> | null;
} | null => {
  const metadata = parseProductMetadata(product.metadata);
  const variantSettings = isRecord(metadata['variantSettings'])
    ? metadata['variantSettings']
    : {};

  const styles = isRecord(variantSettings['styles']) ? variantSettings['styles'] : null;
  const attributeImages = isRecord(variantSettings['attributeImages'])
    ? variantSettings['attributeImages']
    : null;
  const attributeColors = isRecord(variantSettings['attributeColors'])
    ? variantSettings['attributeColors']
    : null;

  if (!styles && !attributeImages && !attributeColors) {
    return null;
  }

  return {
    styles,
    attributeImages,
    attributeColors,
  };
};

export const normalizeVariant = (
  value: unknown,
  fallback: BoughtTogetherVariant,
): BoughtTogetherVariant => {
  return resolveSectionVariant<BoughtTogetherVariant>(
    BOUGHT_TOGETHER_SECTION_FAMILY,
    value,
    fallback,
  );
};

export const resolveDirectionalCopy = ({
  value,
  englishFallback,
  arabicFallback,
  prefersArabicCopy,
  legacyEnglishValues = [],
}: {
  value: unknown;
  englishFallback: string;
  arabicFallback: string;
  prefersArabicCopy: boolean;
  legacyEnglishValues?: string[];
}) => {
  if (typeof value === 'string' && value.trim()) {
    const trimmedValue = value.trim();
    if (
      prefersArabicCopy &&
      (trimmedValue === englishFallback || legacyEnglishValues.includes(trimmedValue))
    ) {
      return arabicFallback;
    }

    return trimmedValue;
  }

  return prefersArabicCopy ? arabicFallback : englishFallback;
};

export const getWrapperClassName = (variant: BoughtTogetherVariant) => {
  switch (variant) {
    case 'compact':
      return 'rounded-[1.2rem] border border-border bg-background py-10';
    case 'editorial':
      return 'rounded-[1.8rem] border border-border bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--secondary)/0.28))] py-12 shadow-[0_28px_90px_-60px_hsl(var(--primary)/0.35)]';
    case 'complete-look':
      return 'rounded-[2rem] border border-[#ead9d8] bg-[linear-gradient(180deg,#fffdfc_0%,#fff7f4_100%)] py-12 shadow-[0_30px_96px_-68px_rgba(107,33,49,0.18)]';
    case 'pairing-rail':
      return 'rounded-[1.7rem] border border-[#ead9d8] bg-[#fffdfb] py-10 shadow-[0_22px_70px_-62px_rgba(107,33,49,0.12)]';
    case 'gift-pairings':
      return 'rounded-[1.8rem] border border-[#eadfd7] bg-[linear-gradient(180deg,#fffdfa_0%,#fff8f4_100%)] py-10 shadow-[0_24px_72px_-60px_rgba(61,41,44,0.16)]';
    default:
      return 'rounded-[1.5rem] border border-border bg-card py-12';
  }
};

export const getCardClassName = (
  variant: BoughtTogetherVariant,
  selected: boolean,
  disabled: boolean,
) => {
  const stateClassName = disabled
    ? 'opacity-75'
    : selected
      ? 'border-primary/45 shadow-[0_16px_40px_-24px_hsl(var(--primary)/0.25)] ring-1 ring-primary/25'
      : 'border-border/80 hover:border-primary/30';

  switch (variant) {
    case 'compact':
      return `rounded-2xl border bg-card p-3 sm:p-4 transition-all duration-300 ${stateClassName}`;
    case 'editorial':
      return `rounded-[1.5rem] border bg-card/95 p-3.5 sm:p-5 transition-all duration-300 ${stateClassName}`;
    case 'complete-look':
      return `rounded-[1.5rem] border bg-gradient-to-b from-card to-card/60 p-3.5 sm:p-5 shadow-[0_20px_50px_-36px_rgba(107,33,49,0.12)] transition-all duration-300 ${stateClassName}`;
    case 'pairing-rail':
      return `rounded-[1.35rem] border bg-card p-3 sm:p-4 shadow-[0_14px_36px_-34px_rgba(107,33,49,0.12)] transition-all duration-300 ${stateClassName}`;
    case 'gift-pairings':
      return `rounded-[1.4rem] border bg-gradient-to-b from-card to-card/60 p-3.5 sm:p-4 shadow-[0_16px_40px_-34px_rgba(61,41,44,0.14)] transition-all duration-300 ${stateClassName}`;
    default:
      return `rounded-[1.4rem] border bg-card p-3.5 sm:p-5 transition-all duration-300 ${stateClassName}`;
  }
};
