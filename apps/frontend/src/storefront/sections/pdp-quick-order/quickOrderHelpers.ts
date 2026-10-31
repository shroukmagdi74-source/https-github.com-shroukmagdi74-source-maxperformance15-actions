import { isValidStorefrontPhone } from '../../utils/phoneValidation';
import { getVariantAttributeLabel } from '../../utils/variants';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const translateAttributeKey = (key: string, prefersArabicCopy: boolean) => {
  const normalized = key.trim().toLowerCase();

  if (!prefersArabicCopy) {
    return getVariantAttributeLabel(key, false) || key;
  }

  if (
    normalized === 'size' ||
    normalized === 'eu size' ||
    normalized === 'shoe size'
  ) {
    return 'المقاس';
  }

  if (normalized === 'color' || normalized === 'colour') {
    return 'اللون';
  }

  return getVariantAttributeLabel(key, true) || key;
};

export const buildQuickOrderNote = ({
  alternatePhone,
  attributeSummary,
  quantityOfferLabel,
  customAttributesSummary,
}: {
  alternatePhone: string;
  attributeSummary: string;
  quantityOfferLabel: string;
  customAttributesSummary?: string;
}) => {
  const blocks: string[] = [];

  if (customAttributesSummary && customAttributesSummary.trim()) {
    blocks.push(`تفاصيل الطلب: ${customAttributesSummary.trim()}`);
  }

  if (alternatePhone.trim()) {
    blocks.push(`رقم هاتف بديل: ${alternatePhone.trim()}`);
  }

  if (attributeSummary.trim()) {
    blocks.push(`اختيار المنتج: ${attributeSummary.trim()}`);
  }

  if (quantityOfferLabel.trim()) {
    blocks.push(`العرض المحدد: ${quantityOfferLabel.trim()}`);
  }

  return blocks.join('\n');
};

export const isValidEgyptianPhone = (value: string) =>
  isValidStorefrontPhone(value);

export const inputClassName =
  'w-full rounded-[1rem] border border-border/80 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15';
