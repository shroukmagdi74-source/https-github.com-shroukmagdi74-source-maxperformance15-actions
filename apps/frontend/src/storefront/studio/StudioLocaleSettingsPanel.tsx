import React, { useMemo } from "react";
import {
  GlobeAltIcon,
  ArrowsRightLeftIcon,
  ScaleIcon,
  CalendarDaysIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  DEFAULT_LOCALE_FORMAT_SETTINGS,
  formatDate,
  formatMoney,
  formatUnit,
  resolveLocaleFormatSettings,
  type StorefrontCalendar,
  type StorefrontCurrencyPosition,
  type StorefrontNumberLocale,
  type StorefrontUnitSystem,
} from "../utils/localeFormat";

/**
 * LOCALE-1 — store locale settings (Settings tab).
 *
 * Writes to `designTokens.locale` so the storefront runtime can resolve the
 * same preferences through `readLocaleFormatSettingsFromSettings`.
 */
export interface StudioLocaleSettingsPanelProps {
  designTokens?: Record<string, unknown>;
  onUpdateThemeTokens?: (nextTokens: Record<string, unknown>) => void;
  onClose?: () => void;
  currency?: string;
}

interface LocaleOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

const NUMBER_LOCALE_OPTIONS: LocaleOption<StorefrontNumberLocale>[] = [
  { value: "ar-EG", label: "عربي (أرقام لاتينية)", hint: "1,234.5" },
  { value: "ar-EG-arabic-digits", label: "عربي (أرقام عربية)", hint: "١٢٣٤٫٥" },
  { value: "en-US", label: "English (US)", hint: "1,234.5" },
];

const CURRENCY_POSITION_OPTIONS: LocaleOption<StorefrontCurrencyPosition>[] = [
  { value: "after", label: "بعد الرقم", hint: "1,234 ج.م" },
  { value: "before", label: "قبل الرقم", hint: "ج.م 1,234" },
];

const UNIT_OPTIONS: LocaleOption<StorefrontUnitSystem>[] = [
  { value: "metric", label: "متري (كجم · سم · لتر)", hint: "2.5 كجم" },
  { value: "imperial", label: "إمبراطوري (lb · in · gal)", hint: "5.51 lb" },
];

const CALENDAR_OPTIONS: LocaleOption<StorefrontCalendar>[] = [
  { value: "gregorian", label: "ميلادي", hint: "Gregorian" },
  { value: "hijri", label: "هجري", hint: "Hijri" },
];

export const StudioLocaleSettingsPanel: React.FC<StudioLocaleSettingsPanelProps> = ({
  designTokens,
  onUpdateThemeTokens,
  onClose,
  currency,
}) => {
  const rawLocale = (designTokens?.locale as Record<string, unknown> | undefined) || {};
  const settings = useMemo(
    () =>
      resolveLocaleFormatSettings({
        ...DEFAULT_LOCALE_FORMAT_SETTINGS,
        ...rawLocale,
        currency: currency || (rawLocale.currency as string) || DEFAULT_LOCALE_FORMAT_SETTINGS.currency,
      }),
    [rawLocale, currency],
  );

  const updateLocale = (patch: Record<string, unknown>) => {
    if (!onUpdateThemeTokens) return;
    const nextLocale = { ...rawLocale, ...patch };
    onUpdateThemeTokens({ ...(designTokens || {}), locale: nextLocale });
  };

  const resetLocale = () => {
    if (!onUpdateThemeTokens) return;
    onUpdateThemeTokens({
      ...(designTokens || {}),
      locale: {
        numberLocale: DEFAULT_LOCALE_FORMAT_SETTINGS.numberLocale,
        currencyPosition: DEFAULT_LOCALE_FORMAT_SETTINGS.currencyPosition,
        units: DEFAULT_LOCALE_FORMAT_SETTINGS.units,
        calendar: DEFAULT_LOCALE_FORMAT_SETTINGS.calendar,
      },
    });
  };

  const previewMoney = formatMoney(1234.5, settings);
  const previewUnit = formatUnit(2.5, "kg", settings);
  const previewDate = formatDate("2026-01-15", settings);

  const renderOptions = <T extends string>(
    field: string,
    options: LocaleOption<T>[],
    current: T,
    onChange: (value: T) => void,
  ) => (
    <div className="grid gap-1.5" data-locale-field={field}>
      {options.map((option) => {
        const active = option.value === current;
        return (
          <button
            key={option.value}
            type="button"
            data-testid={`locale-${field}-${option.value}`}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`flex items-center justify-between rounded-xl border px-2.5 py-1.5 text-start transition-all ${
              active
                ? "border-primary bg-primary/10 text-foreground shadow-xs"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            <span className="text-[11px] font-bold">{option.label}</span>
            {option.hint && (
              <span className="font-mono text-[10px] text-muted-foreground" dir="ltr">
                {option.hint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <section
      className="flex h-full w-full flex-col overflow-y-auto bg-card/95 p-3 text-foreground"
      data-testid="studio-locale-settings-panel"
      aria-label="إعدادات اللغة والأرقام"
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-black">
          <GlobeAltIcon className="h-4 w-4 text-primary" />
          <span>اللغة والأرقام والعملة</span>
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="إغلاق"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <p className="mb-3 text-[10px] leading-relaxed text-muted-foreground">
        كل الأسعار والأرقام والوحدات في الأقسام بتُنسّق من هنا بإعداد واحد موحّد
        (LOCALE-1) — بدون أي تنسيق يدوي داخل الأقسام.
      </p>

      <div className="mb-3 rounded-2xl border border-border/80 bg-background/60 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
            معاينة مباشرة
          </span>
          <button
            type="button"
            onClick={resetLocale}
            className="rounded-lg border border-border px-2 py-0.5 text-[10px] font-bold text-muted-foreground hover:bg-muted"
          >
            افتراضي
          </button>
        </div>
        <div className="space-y-1 text-[12px] font-bold" dir="rtl">
          <div data-testid="locale-preview-money">السعر: {previewMoney}</div>
          <div data-testid="locale-preview-unit">الوزن: {previewUnit}</div>
          <div data-testid="locale-preview-date">التاريخ: {previewDate}</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-border/80 bg-background/50 p-3">
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-black">
            <ArrowsRightLeftIcon className="h-3.5 w-3.5 text-primary" />
            <span>أرقام وفواصل الآلاف</span>
          </h3>
          {renderOptions("numberLocale", NUMBER_LOCALE_OPTIONS, settings.numberLocale, (value) =>
            updateLocale({ numberLocale: value }),
          )}
        </div>

        <div className="rounded-2xl border border-border/80 bg-background/50 p-3">
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-black">
            <ScaleIcon className="h-3.5 w-3.5 text-primary" />
            <span>موضع رمز العملة</span>
          </h3>
          {renderOptions(
            "currencyPosition",
            CURRENCY_POSITION_OPTIONS,
            settings.currencyPosition,
            (value) => updateLocale({ currencyPosition: value }),
          )}
        </div>

        <div className="rounded-2xl border border-border/80 bg-background/50 p-3">
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-black">
            <ScaleIcon className="h-3.5 w-3.5 text-primary" />
            <span>نظام الوحدات</span>
          </h3>
          {renderOptions("units", UNIT_OPTIONS, settings.units, (value) =>
            updateLocale({ units: value }),
          )}
        </div>

        <div className="rounded-2xl border border-border/80 bg-background/50 p-3">
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-black">
            <CalendarDaysIcon className="h-3.5 w-3.5 text-primary" />
            <span>التقويم</span>
          </h3>
          {renderOptions("calendar", CALENDAR_OPTIONS, settings.calendar, (value) =>
            updateLocale({ calendar: value }),
          )}
        </div>
      </div>
    </section>
  );
};

export default StudioLocaleSettingsPanel;
