/**
 * LOCALE-1 — Unified locale formatting for the storefront.
 *
 * Pure helpers (no React, no IO) built on the built-in `Intl` APIs:
 *  - formatMoney  → currency amount, respecting position + digit locale
 *  - formatNumber → grouped numbers + optional Arabic-Indic digits
 *  - formatUnit   → metric / imperial units (kg, g, cm, m, l, ml)
 *  - formatDate   → Gregorian / Hijri dates
 *
 * Store-level preferences live in the editor (Settings tab) under
 * `designTokens.locale` and are resolved by `readLocaleFormatSettingsFromSettings`.
 * `setLocaleFormatDefaults` publishes those preferences to the module-level
 * defaults so every section that already renders a price through
 * `utils/currency.ts` picks them up without prop drilling.
 */

export const DEFAULT_STOREFRONT_CURRENCY = 'EGP';

export type StorefrontNumberLocale = 'ar-EG' | 'ar-EG-arabic-digits' | 'en-US';
export type StorefrontCurrencyPosition = 'before' | 'after';
export type StorefrontUnitSystem = 'metric' | 'imperial';
export type StorefrontCalendar = 'gregorian' | 'hijri';

export interface LocaleFormatSettings {
  numberLocale: StorefrontNumberLocale;
  currencyPosition: StorefrontCurrencyPosition;
  units: StorefrontUnitSystem;
  calendar: StorefrontCalendar;
  currency: string;
}

export type LocaleFormatSettingsInput = Partial<{
  numberLocale: string | null;
  currencyPosition: string | null;
  units: string | null;
  calendar: string | null;
  currency: string | null;
  /** Nested editor shape: `designTokens.locale` */
  locale: Record<string, unknown> | null;
}>;

export const DEFAULT_LOCALE_FORMAT_SETTINGS: LocaleFormatSettings = {
  numberLocale: 'ar-EG',
  currencyPosition: 'after',
  units: 'metric',
  calendar: 'gregorian',
  currency: DEFAULT_STOREFRONT_CURRENCY,
};

/** Arabic-Indic digits used by the `ar-EG-arabic-digits` number locale. */
const ARABIC_INDIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const ARABIC_INDIC_GROUP = '٬';
const ARABIC_INDIC_DECIMAL = '٫';

/** Spoken currency labels for the storefront's supported currencies. */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  EGP: 'ج.م',
  SAR: 'ر.س',
  AED: 'د.إ',
  QAR: 'ر.ق',
  KWD: 'د.ك',
  BHD: 'د.ب',
  OMR: 'ر.ع',
  JOD: 'د.أ',
  MAD: 'د.م',
  TND: 'د.ت',
  DZD: 'د.ج',
  IQD: 'د.ع',
  LYD: 'د.ل',
  SDG: 'ج.س',
  YER: 'ر.ي',
  USD: '$',
  EUR: '€',
  GBP: '£',
  TRY: '₺',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const readString = (source: unknown, key: string): string => {
  if (!isRecord(source)) return '';
  const value = source[key];
  return typeof value === 'string' ? value.trim() : '';
};

export const normalizeStorefrontCurrency = (currency?: string | null): string => {
  const normalized = typeof currency === 'string' ? currency.trim().toUpperCase() : '';
  if (
    normalized === 'ج.م' ||
    normalized === 'جنيه مصري' ||
    normalized === 'جنيه' ||
    normalized === 'LE' ||
    normalized === 'L.E' ||
    normalized === 'EGP'
  ) {
    return 'EGP';
  }
  return normalized || DEFAULT_STOREFRONT_CURRENCY;
};

export const normalizeNumberLocale = (
  value?: string | null,
): StorefrontNumberLocale => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (normalized === 'ar-eg-arabic-digits' || normalized === 'arabic-digits' || normalized === 'arab') {
    return 'ar-EG-arabic-digits';
  }
  if (normalized === 'en-us' || normalized === 'en' || normalized === 'latin') {
    return 'en-US';
  }
  return DEFAULT_LOCALE_FORMAT_SETTINGS.numberLocale;
};

export const normalizeCurrencyPosition = (
  value?: string | null,
): StorefrontCurrencyPosition => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return normalized === 'before' || normalized === 'prefix' ? 'before' : 'after';
};

export const normalizeUnitSystem = (value?: string | null): StorefrontUnitSystem => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return normalized === 'imperial' ? 'imperial' : 'metric';
};

export const normalizeCalendar = (value?: string | null): StorefrontCalendar => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return normalized === 'hijri' || normalized === 'islamic' ? 'hijri' : 'gregorian';
};

/** Reads a flat or nested (`locale` key) editor payload into settings. */
export const resolveLocaleFormatSettings = (
  input?: LocaleFormatSettingsInput | null,
): LocaleFormatSettings => {
  const nested = isRecord(input) && isRecord((input as LocaleFormatSettingsInput).locale)
    ? ((input as LocaleFormatSettingsInput).locale as Record<string, unknown>)
    : null;
  const pick = (key: string): string => {
    const direct = readString(input, key);
    if (direct) return direct;
    return readString(nested, key);
  };

  return {
    numberLocale: normalizeNumberLocale(pick('numberLocale') || DEFAULT_LOCALE_FORMAT_SETTINGS.numberLocale),
    currencyPosition: normalizeCurrencyPosition(
      pick('currencyPosition') || DEFAULT_LOCALE_FORMAT_SETTINGS.currencyPosition,
    ),
    units: normalizeUnitSystem(pick('units') || DEFAULT_LOCALE_FORMAT_SETTINGS.units),
    calendar: normalizeCalendar(pick('calendar') || DEFAULT_LOCALE_FORMAT_SETTINGS.calendar),
    currency: pick('currency') || DEFAULT_LOCALE_FORMAT_SETTINGS.currency,
  };
};

/**
 * Extracts locale preferences from any of the shapes the storefront receives:
 * public settings (`storefrontSettings.designTokens`), runtime settings
 * (`storefront.designTokens`) or the theme object.
 */
export const readLocaleFormatSettingsFromSettings = (
  ...sources: unknown[]
): LocaleFormatSettings => {
  for (const source of sources) {
    if (!isRecord(source)) continue;
    const candidates: unknown[] = [
      (source as Record<string, unknown>).locale,
      (source as Record<string, any>).designTokens?.locale,
      (source as Record<string, any>).storefront?.designTokens?.locale,
      (source as Record<string, any>).storefront?.settings?.locale,
      (source as Record<string, any>).storefrontSettings?.designTokens?.locale,
      (source as Record<string, any>).settings?.locale,
      (source as Record<string, any>).theme?.designTokens?.locale,
      (source as Record<string, any>).theme?.global?.locale,
    ];
    for (const candidate of candidates) {
      if (isRecord(candidate)) {
        return resolveLocaleFormatSettings(candidate as LocaleFormatSettingsInput);
      }
    }
  }
  return { ...DEFAULT_LOCALE_FORMAT_SETTINGS };
};

/* ───────────────────────── runtime defaults ───────────────────────── */

let runtimeLocaleFormatSettings: LocaleFormatSettings = { ...DEFAULT_LOCALE_FORMAT_SETTINGS };

export const setLocaleFormatDefaults = (
  input?: LocaleFormatSettingsInput | LocaleFormatSettings | null,
): LocaleFormatSettings => {
  runtimeLocaleFormatSettings = {
    ...runtimeLocaleFormatSettings,
    ...resolveLocaleFormatSettings(input as LocaleFormatSettingsInput),
  };
  return runtimeLocaleFormatSettings;
};

export const getLocaleFormatDefaults = (): LocaleFormatSettings => ({
  ...runtimeLocaleFormatSettings,
});

export const resetLocaleFormatDefaults = (): void => {
  runtimeLocaleFormatSettings = { ...DEFAULT_LOCALE_FORMAT_SETTINGS };
};

/* ───────────────────────── digit helpers ───────────────────────── */

export const toArabicIndicDigits = (value: string): string =>
  value.replace(/[0-9]/g, (digit) => ARABIC_INDIC_DIGITS[Number(digit)] ?? digit);

export const toLatinDigits = (value: string): string => {
  let output = '';
  for (const char of value) {
    const index = ARABIC_INDIC_DIGITS.indexOf(char);
    output += index >= 0 ? String(index) : char;
  }
  return output.replace(new RegExp(ARABIC_INDIC_GROUP, 'g'), ',')
    .replace(new RegExp(ARABIC_INDIC_DECIMAL, 'g'), '.');
};

const isArabicDigitLocale = (settings: LocaleFormatSettings): boolean =>
  settings.numberLocale === 'ar-EG-arabic-digits';

const buildIntlLocale = (
  settings: LocaleFormatSettings,
  calendar?: StorefrontCalendar,
): string => {
  const base = settings.numberLocale === 'en-US' ? 'en-US' : 'ar-EG';
  const numbersystem = isArabicDigitLocale(settings) ? 'arab' : 'latn';
  const gregorian = calendar === 'hijri' ? 'islamic-umalqura' : 'gregory';
  return `${base}-u-ca-${gregorian}-nu-${numbersystem}`;
};

const groupLatinDigits = (digits: string): string =>
  digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** Arabic-Indic digits with CLDR's `minimumGroupingDigits = 2` behaviour. */
const formatArabicIndicInteger = (digits: string): string =>
  toArabicIndicDigits(digits.length >= 5 ? groupLatinDigits(digits) : digits).replace(
    /,/g,
    ARABIC_INDIC_GROUP,
  );

/* ───────────────────────── formatNumber ───────────────────────── */

export interface FormatNumberOptions {
  numberLocale?: string | null;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;
}

export const formatNumber = (
  value: number | string | null | undefined,
  options: FormatNumberOptions = {},
): string => {
  const numeric = Number(value);
  const amount = Number.isFinite(numeric) ? numeric : 0;
  const settings = resolveLocaleFormatSettings({
    ...getLocaleFormatDefaults(),
    numberLocale: options.numberLocale ?? getLocaleFormatDefaults().numberLocale,
  });
  const minimumFractionDigits = Math.max(0, options.minimumFractionDigits ?? 0);
  const maximumFractionDigits = Math.max(
    minimumFractionDigits,
    options.maximumFractionDigits ?? Math.max(minimumFractionDigits, 2),
  );
  const useGrouping = options.useGrouping ?? true;

  if (isArabicDigitLocale(settings)) {
    const raw = new Intl.NumberFormat('en-US', {
      minimumFractionDigits,
      maximumFractionDigits,
      useGrouping: false,
    }).format(amount);
    const [integerPart, fractionPart] = raw.split('.');
    const integerText = useGrouping
      ? formatArabicIndicInteger(integerPart.replace('-', ''))
      : toArabicIndicDigits(integerPart.replace('-', ''));
    const sign = amount < 0 ? '-' : '';
    return fractionPart
      ? `${sign}${integerText}${ARABIC_INDIC_DECIMAL}${toArabicIndicDigits(fractionPart)}`
      : `${sign}${integerText}`;
  }

  return new Intl.NumberFormat(buildIntlLocale(settings), {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping,
  })
    .format(amount)
    // Drop bidi control marks (LRM/RLM/ALM) so negative values stay plain text.
    .replace(/[\u200e\u200f\u061c]/g, "");
};

/* ───────────────────────── formatMoney ───────────────────────── */

export type FormatMoneyStyle = 'symbol' | 'currency';

export interface FormatMoneyOptions extends FormatNumberOptions {
  currency?: string | null;
  locale?: string | null;
  position?: StorefrontCurrencyPosition | string | null;
  symbol?: string | null;
  calendar?: StorefrontCalendar | string | null;
  style?: FormatMoneyStyle;
}

const resolveMoneySettings = (options: FormatMoneyOptions): LocaleFormatSettings => {
  const defaults = getLocaleFormatDefaults();
  return resolveLocaleFormatSettings({
    ...defaults,
    currency: options.currency ?? defaults.currency,
    currencyPosition: options.position ?? defaults.currencyPosition,
    numberLocale: options.locale ?? options.numberLocale ?? defaults.numberLocale,
    units: defaults.units,
    calendar: options.calendar ?? defaults.calendar,
  });
};

export const formatMoney = (
  value: number | string | null | undefined,
  options: FormatMoneyOptions = {},
): string => {
  const numeric = Number(value);
  const amount = Number.isFinite(numeric) ? numeric : 0;
  const settings = resolveMoneySettings(options);
  const currency = normalizeStorefrontCurrency(options.currency ?? settings.currency);
  const minimumFractionDigits = Math.max(0, options.minimumFractionDigits ?? 0);
  const maximumFractionDigits = Math.max(
    minimumFractionDigits,
    options.maximumFractionDigits ?? Math.max(minimumFractionDigits, 2),
  );

  if (options.style === 'currency') {
    try {
      return new Intl.NumberFormat(buildIntlLocale(settings), {
        style: 'currency',
        currency,
        minimumFractionDigits,
        maximumFractionDigits,
        useGrouping: options.useGrouping ?? true,
      }).format(amount);
    } catch {
      return `${currency} ${formatNumber(amount, {
        numberLocale: settings.numberLocale,
        minimumFractionDigits,
        maximumFractionDigits,
      })}`;
    }
  }

  const symbol = (options.symbol || CURRENCY_SYMBOLS[currency] || currency).trim();
  const amountText = formatNumber(amount, {
    numberLocale: settings.numberLocale,
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping: options.useGrouping,
  });

  return settings.currencyPosition === 'before'
    ? `${symbol} ${amountText}`
    : `${amountText} ${symbol}`;
};

/* ───────────────────────── formatUnit ───────────────────────── */

export const STOREFRONT_UNITS = ['kg', 'g', 'cm', 'm', 'l', 'ml'] as const;
export type StorefrontUnit = (typeof STOREFRONT_UNITS)[number];

interface UnitDefinition {
  metricLabel: string;
  imperialFactor: number;
  imperialLabel: string;
  maximumFractionDigits: number;
}

const UNIT_DEFINITIONS: Record<StorefrontUnit, UnitDefinition> = {
  kg: { metricLabel: 'كجم', imperialFactor: 2.2046226218, imperialLabel: 'lb', maximumFractionDigits: 2 },
  g: { metricLabel: 'جم', imperialFactor: 0.0352739619, imperialLabel: 'oz', maximumFractionDigits: 2 },
  cm: { metricLabel: 'سم', imperialFactor: 0.3937007874, imperialLabel: 'in', maximumFractionDigits: 2 },
  m: { metricLabel: 'م', imperialFactor: 3.280839895, imperialLabel: 'ft', maximumFractionDigits: 2 },
  l: { metricLabel: 'لتر', imperialFactor: 0.2641720524, imperialLabel: 'gal', maximumFractionDigits: 2 },
  ml: { metricLabel: 'مل', imperialFactor: 0.0338140227, imperialLabel: 'fl oz', maximumFractionDigits: 2 },
};

export interface FormatUnitOptions {
  units?: StorefrontUnitSystem | string | null;
  numberLocale?: string | null;
  maximumFractionDigits?: number;
}

export const normalizeUnit = (unit: string | null | undefined): StorefrontUnit | null => {
  const normalized = typeof unit === 'string' ? unit.trim().toLowerCase() : '';
  const aliases: Record<string, StorefrontUnit> = {
    kg: 'kg',
    kilo: 'kg',
    kilogram: 'kg',
    كجم: 'kg',
    كيلو: 'kg',
    g: 'g',
    gram: 'g',
    جم: 'g',
    جرام: 'g',
    cm: 'cm',
    سم: 'cm',
    m: 'm',
    meter: 'm',
    metre: 'm',
    متر: 'm',
    l: 'l',
    liter: 'l',
    litre: 'l',
    لتر: 'l',
    ml: 'ml',
    milliliter: 'ml',
    مل: 'ml',
  };
  return aliases[normalized] ?? null;
};

export const formatUnit = (
  value: number | string | null | undefined,
  unit: string | null | undefined,
  options: FormatUnitOptions = {},
): string => {
  const numeric = Number(value);
  const amount = Number.isFinite(numeric) ? numeric : 0;
  const resolvedUnit = normalizeUnit(unit);
  const settings = resolveLocaleFormatSettings({
    ...getLocaleFormatDefaults(),
    units: options.units ?? getLocaleFormatDefaults().units,
    numberLocale: options.numberLocale ?? getLocaleFormatDefaults().numberLocale,
  });

  if (!resolvedUnit) {
    return formatNumber(amount, { numberLocale: settings.numberLocale });
  }

  const definition = UNIT_DEFINITIONS[resolvedUnit];
  const maximumFractionDigits = Math.max(
    0,
    options.maximumFractionDigits ?? definition.maximumFractionDigits,
  );

  if (settings.units === 'imperial') {
    const converted = amount * definition.imperialFactor;
    return `${formatNumber(converted, {
      numberLocale: settings.numberLocale,
      minimumFractionDigits: 0,
      maximumFractionDigits,
    })} ${definition.imperialLabel}`;
  }

  return `${formatNumber(amount, {
    numberLocale: settings.numberLocale,
    minimumFractionDigits: 0,
    maximumFractionDigits,
  })} ${definition.metricLabel}`;
};

/* ───────────────────────── formatDate ───────────────────────── */

export type FormatDateStyle = 'short' | 'medium' | 'long' | 'full';

export interface FormatDateOptions {
  numberLocale?: string | null;
  calendar?: StorefrontCalendar | string | null;
  dateStyle?: FormatDateStyle;
}

export const formatDate = (
  value: Date | string | number | null | undefined,
  options: FormatDateOptions = {},
): string => {
  if (value === null || value === undefined || value === '') return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const settings = resolveLocaleFormatSettings({
    ...getLocaleFormatDefaults(),
    numberLocale: options.numberLocale ?? getLocaleFormatDefaults().numberLocale,
    calendar: options.calendar ?? getLocaleFormatDefaults().calendar,
  });

  try {
    return new Intl.DateTimeFormat(buildIntlLocale(settings, settings.calendar), {
      dateStyle: options.dateStyle ?? 'medium',
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
};
