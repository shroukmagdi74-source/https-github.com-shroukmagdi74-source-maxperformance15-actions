import React from 'react';
import { resolveSectionVariant } from '../../variants';

export interface ConversionStackProps {
  section?: {
    variant?: string;
    [key: string]: unknown;
  };
  settings?: {
    title?: string;
    subtitle?: string;
    countdownLabel?: string;
    countdownStyle?: string;
    preOrderLabel?: string;
    preOrderStyle?: string;
    lowStockLabel?: string;
    lowStockMessage?: string;
    lowStockStyle?: string;
    estimatedDeliveryLabel?: string;
    estimatedDeliveryStyle?: string;
    fakeVisitorMessage?: string;
    fakeVisitorStyle?: string;
    soldCounterMessage?: string;
    soldCounterStyle?: string;
    purchaseFomoMessage?: string;
    purchaseFomoStyle?: string;
    backInStockTitle?: string;
    backInStockDescription?: string;
    backInStockSuccessMessage?: string;
    backInStockStyle?: string;
    trustedBadgeTitle?: string;
    trustedBadgeSubtitle?: string;
    trustedBadgeItems?: string;
    trustedBadgeStyle?: string;
    contentAlign?: string;
    [key: string]: unknown;
  };
}

export type JsonRecord = Record<string, unknown>;

export const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export const asRecord = (value: unknown): JsonRecord =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};

export const parseMaybeNumber = (value: unknown): number | null => {
  if (isFiniteNumber(value)) {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const hashProductSeed = (value: string): number =>
  value.split('').reduce((total, char) => total + char.charCodeAt(0), 0);

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const parseBadgeItems = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || '').trim())
      .filter(Boolean);
  }

  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export const parseBooleanSetting = (value: unknown, fallback: boolean) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }

    if (normalized === 'false') {
      return false;
    }
  }

  return fallback;
};

export const normalizeLowStockStyle = (
  value: unknown,
): 'alert' | 'meter' | 'minimal' => {
  if (typeof value !== 'string') {
    return 'alert';
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'meter' || normalized === 'minimal') {
    return normalized;
  }

  return 'alert';
};

export const normalizeEstimatedDeliveryStyle = (
  value: unknown,
): 'card' | 'timeline' | 'pill' => {
  if (typeof value !== 'string') {
    return 'card';
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'timeline' || normalized === 'pill') {
    return normalized;
  }

  return 'card';
};

export const normalizeSoldCounterStyle = (
  value: unknown,
): 'spotlight' | 'badge' | 'minimal' => {
  if (typeof value !== 'string') {
    return 'spotlight';
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'badge' || normalized === 'minimal') {
    return normalized;
  }

  return 'spotlight';
};

export const normalizeBackInStockStyle = (
  value: unknown,
): 'panel' | 'inline' | 'accent' => {
  if (typeof value !== 'string') {
    return 'panel';
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'inline' || normalized === 'accent') {
    return normalized;
  }

  return 'panel';
};

export const normalizeCountdownStyle = (
  value: unknown,
): 'timer' | 'split' | 'minimal' => {
  if (typeof value !== 'string') {
    return 'timer';
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'split' || normalized === 'minimal') {
    return normalized;
  }

  return 'timer';
};

export const normalizeFakeVisitorStyle = (
  value: unknown,
): 'pulse' | 'ticker' | 'minimal' => {
  if (typeof value !== 'string') {
    return 'pulse';
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'ticker' || normalized === 'minimal') {
    return normalized;
  }

  return 'pulse';
};

export const normalizePurchaseFomoStyle = (
  value: unknown,
): 'alert' | 'timeline' | 'minimal' => {
  if (typeof value !== 'string') {
    return 'alert';
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'timeline' || normalized === 'minimal') {
    return normalized;
  }

  return 'alert';
};

export const interpolateTemplate = (
  template: unknown,
  tokens: Record<string, string | number>,
  fallback: string,
): string => {
  const source =
    typeof template === 'string' && template.trim().length > 0 ? template : fallback;

  return Object.entries(tokens).reduce((output, [key, value]) => {
    return output.replace(
      new RegExp(`\\{+\\s*${key}\\s*\\}+`, 'gi'),
      String(value),
    );
  }, source);
};

export const interpolateCount = (template: unknown, count: number, fallback: string): string =>
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

export const formatCountdownParts = (endsAt: string) => {
  const target = new Date(endsAt).getTime();
  if (!Number.isFinite(target)) {
    return null;
  }

  const diff = target - Date.now();
  if (diff <= 0) {
    return null;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return { days, hours, minutes };
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

export type ConversionStackVariant =
  | 'balanced'
  | 'editorial'
  | 'minimal'
  | 'seamless'
  | 'couture-minimal';

export const normalizeConversionStackVariant = (
  rawVariant: unknown,
): ConversionStackVariant =>
  resolveSectionVariant<ConversionStackVariant>('ConversionStack', rawVariant, 'balanced');

export type ConversionBlockId =
  | 'countdown'
  | 'low-stock'
  | 'delivery'
  | 'fake-visitor'
  | 'sold-counter'
  | 'purchase-fomo'
  | 'pre-order'
  | 'back-in-stock'
  | 'trusted-badges';

export type StandaloneConversionBlockId = ConversionBlockId | 'bulk-savings';

export type StandaloneConversionSectionType =
  | 'countdown'
  | 'low-stock'
  | 'delivery-proof'
  | 'viewer-counter'
  | 'sold-counter'
  | 'purchase-fomo'
  | 'pre-order'
  | 'back-in-stock'
  | 'trusted-badges'
  | 'bulk-savings';

export type UrgencyBlockId =
  | 'countdown'
  | 'low-stock'
  | 'pre-order'
  | 'sold-counter'
  | 'purchase-fomo'
  | 'fake-visitor';

export interface ConversionBlock {
  id: ConversionBlockId;
  node: React.ReactNode;
  wrapperClassName?: string;
}

export interface ConversionUrgencyBlock {
  id: UrgencyBlockId;
  dominantNode: React.ReactNode;
  secondaryNode: React.ReactNode;
}

export const URGENCY_PRIORITY: readonly UrgencyBlockId[] = [
  'countdown',
  'low-stock',
  'pre-order',
  'sold-counter',
  'purchase-fomo',
  'fake-visitor',
];

export const STANDALONE_CONVERSION_SECTION_BLOCK_MAP: Record<
  StandaloneConversionSectionType,
  StandaloneConversionBlockId
> = {
  countdown: 'countdown',
  'low-stock': 'low-stock',
  'delivery-proof': 'delivery',
  'viewer-counter': 'fake-visitor',
  'sold-counter': 'sold-counter',
  'purchase-fomo': 'purchase-fomo',
  'pre-order': 'pre-order',
  'back-in-stock': 'back-in-stock',
  'trusted-badges': 'trusted-badges',
  'bulk-savings': 'bulk-savings',
};

export const resolveStandaloneConversionBlock = (
  sectionType: unknown,
): StandaloneConversionBlockId | null => {
  if (typeof sectionType !== 'string') {
    return null;
  }

  const normalized = sectionType.trim().toLowerCase();
  return (
    STANDALONE_CONVERSION_SECTION_BLOCK_MAP[
      normalized as StandaloneConversionSectionType
    ] || null
  );
};
