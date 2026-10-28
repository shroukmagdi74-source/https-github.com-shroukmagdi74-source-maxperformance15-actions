// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  DEFAULT_LOCALE_FORMAT_SETTINGS,
  formatDate,
  formatMoney,
  formatNumber,
  formatUnit,
  getLocaleFormatDefaults,
  normalizeNumberLocale,
  readLocaleFormatSettingsFromSettings,
  resetLocaleFormatDefaults,
  resolveLocaleFormatSettings,
  setLocaleFormatDefaults,
  toArabicIndicDigits,
} from "../utils/localeFormat";
import { formatStorefrontCurrency } from "../utils/currency";

const STOREFRONT_ROOT = path.resolve(process.cwd(), "src/storefront");

const readSource = (relativePath: string): string =>
  readFileSync(path.resolve(STOREFRONT_ROOT, relativePath), "utf8");

afterEach(() => {
  resetLocaleFormatDefaults();
});

describe("LOCALE-1 — storefront locale formatting", () => {
  /* ───────────── formatMoney ───────────── */

  it("1. formatMoney(1234.5, EGP, after) → «1,234.5 ج.م» (نص مطابق)", () => {
    expect(formatMoney(1234.5, { currency: "EGP", position: "after" })).toBe("1,234.5 ج.م");
  });

  it("2. الأعداد الصحيحة بدون كسور زائدة → «1,234 ج.م»", () => {
    expect(formatMoney(1234, { currency: "EGP" })).toBe("1,234 ج.م");
  });

  it("3. currencyPosition = before → «ج.م 1,234.5»", () => {
    expect(formatMoney(1234.5, { currency: "EGP", position: "before" })).toBe("ج.م 1,234.5");
  });

  it("4. قيمة غير رقمية أو null → «0 ج.م» بدون NaN", () => {
    expect(formatMoney(Number.NaN, { currency: "EGP" })).toBe("0 ج.م");
    expect(formatMoney(null, { currency: "EGP" })).toBe("0 ج.م");
  });

  it("5. أرقام عربية: 1234 بإعداد arabic-digits → «١٢٣٤ ج.م»", () => {
    expect(
      formatMoney(1234, { currency: "EGP", numberLocale: "ar-EG-arabic-digits" }),
    ).toBe("١٢٣٤ ج.م");
  });

  it("6. label مخصص للعملة (جنيه) → «1,234.5 جنيه»", () => {
    expect(formatMoney(1234.5, { currency: "EGP", symbol: "جنيه" })).toBe("1,234.5 جنيه");
  });

  it("7. currency codes غير مصرية تُكمّل برمزها اللغوي (SAR → ر.س)", () => {
    expect(formatMoney(99.9, { currency: "SAR" })).toBe("99.9 ر.س");
  });

  it("8. نمط Intl currency (توافق DYN-1) يخرج رمز العملة", () => {
    const legacy = formatMoney(1890.5, {
      currency: "EGP",
      style: "currency",
      locale: "en-US",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    expect(legacy).toContain("1,890.50");
  });

  /* ───────────── formatNumber ───────────── */

  it("9. formatNumber فواصل آلاف لاتينية → «1,234» و«1,234,567»", () => {
    expect(formatNumber(1234)).toBe("1,234");
    expect(formatNumber(1234567)).toBe("1,234,567");
  });

  it("10. formatNumber مع كسور ثابتة (2) → «1,234.50»", () => {
    expect(formatNumber(1234.5, { minimumFractionDigits: 2, maximumFractionDigits: 2 })).toBe(
      "1,234.50",
    );
  });

  it("11. أرقام عربية: 1234 → «١٢٣٤» (بدون فاصل آلاف تحت 5 خانات)", () => {
    expect(formatNumber(1234, { numberLocale: "ar-EG-arabic-digits" })).toBe("١٢٣٤");
  });

  it("12. أرقام عربية للخانات الكبيرة → «١٬٢٣٤٬٥٦٧» (فاصل عربي)", () => {
    expect(formatNumber(1234567, { numberLocale: "ar-EG-arabic-digits" })).toBe("١٬٢٣٤٬٥٦٧");
  });

  it("13. السالب يحفظ الإشارة في النمطين", () => {
    expect(formatNumber(-1234)).toBe("-1,234");
    expect(formatNumber(-1234, { numberLocale: "ar-EG-arabic-digits" })).toBe("-١٢٣٤");
  });

  it("14. toArabicIndicDigits تحوّل كل الأرقام اللاتينية", () => {
    expect(toArabicIndicDigits("0123456789")).toBe("٠١٢٣٤٥٦٧٨٩");
  });

  /* ───────────── formatUnit ───────────── */

  it("15. formatUnit(2.5, kg) متري → «2.5 كجم»", () => {
    expect(formatUnit(2.5, "kg")).toBe("2.5 كجم");
  });

  it("16. formatUnit(2.5, kg) إمبراطوري → «5.51 lb» (نسبة التحويل صحيحة)", () => {
    const imperial = formatUnit(2.5, "kg", { units: "imperial" });
    expect(imperial.endsWith(" lb")).toBe(true);
    const numeric = Number.parseFloat(imperial);
    expect(numeric).toBeCloseTo(5.5115, 2);
    expect(imperial).toBe("5.51 lb");
  });

  it("17. الوحدات الصغيرة: 500 جم → «500 جم» · إمبراطوري → «17.64 oz»", () => {
    expect(formatUnit(500, "g")).toBe("500 جم");
    expect(formatUnit(500, "g", { units: "imperial" })).toBe("17.64 oz");
  });

  it("18. الوحدات بالعربية الرقمية → «٢٫٥ كجم»", () => {
    expect(formatUnit(2.5, "kg", { numberLocale: "ar-EG-arabic-digits" })).toBe("٢٫٥ كجم");
  });

  it("19. مقاس/سعة: 30 سم · 1.5 لتر", () => {
    expect(formatUnit(30, "cm")).toBe("30 سم");
    expect(formatUnit(1.5, "l")).toBe("1.5 لتر");
  });

  /* ───────────── formatDate ───────────── */

  it("20. formatDate ميلادي يحتوي السنة الميلادية", () => {
    const gregorian = formatDate("2026-01-15", { numberLocale: "en-US", calendar: "gregorian" });
    expect(gregorian).toContain("2026");
  });

  it("21. formatDate هجري يختلف عن الميلادي ويحمل سنة هجرية", () => {
    const gregorian = formatDate("2026-01-15", { calendar: "gregorian" });
    const hijri = formatDate("2026-01-15", { calendar: "hijri" });
    expect(hijri).not.toBe(gregorian);
    expect(hijri).toMatch(/[١٢٣٤٥٦٧٨٩0-9]{3,4}/);
    expect(hijri).not.toContain("2026");
  });

  it("22. formatDate لتاريخ غير صالح → نص فارغ (بدون Invalid Date)", () => {
    expect(formatDate("not-a-date")).toBe("");
    expect(formatDate(null)).toBe("");
  });

  /* ───────────── settings resolution ───────────── */

  it("23. resolveLocaleFormatSettings يقرأ الشكل المتداخل designTokens.locale", () => {
    const resolved = resolveLocaleFormatSettings({
      locale: { numberLocale: "ar-EG-arabic-digits", currencyPosition: "before", units: "imperial" },
    });
    expect(resolved.numberLocale).toBe("ar-EG-arabic-digits");
    expect(resolved.currencyPosition).toBe("before");
    expect(resolved.units).toBe("imperial");
    expect(resolved.currency).toBe("EGP");
  });

  it("24. readLocaleFormatSettingsFromSettings يلتقط locale من إعدادات المتجر العامة", () => {
    const resolved = readLocaleFormatSettingsFromSettings(
      { storefrontSettings: { designTokens: { locale: { units: "imperial", calendar: "hijri" } } } },
    );
    expect(resolved.units).toBe("imperial");
    expect(resolved.calendar).toBe("hijri");
    expect(resolved.numberLocale).toBe(DEFAULT_LOCALE_FORMAT_SETTINGS.numberLocale);
  });

  it("25. قيم غير معروفة ترجع للافتراضي (ar-EG · after · metric · gregorian)", () => {
    const resolved = resolveLocaleFormatSettings({
      numberLocale: "klingon",
      currencyPosition: "middle",
      units: "martian",
      calendar: "mayan",
    });
    expect(resolved.numberLocale).toBe("ar-EG");
    expect(resolved.currencyPosition).toBe("after");
    expect(resolved.units).toBe("metric");
    expect(resolved.calendar).toBe("gregorian");
    expect(normalizeNumberLocale("en-US")).toBe("en-US");
  });

  /* ───────────── store wiring / DYN-1 parity ───────────── */

  it("26. setLocaleFormatDefaults يطبّق إعدادات المتجر على الدالة الموحّدة", () => {
    setLocaleFormatDefaults({ numberLocale: "ar-EG-arabic-digits", currencyPosition: "before" });
    expect(formatMoney(1234)).toBe("ج.م ١٢٣٤");
    expect(getLocaleFormatDefaults().numberLocale).toBe("ar-EG-arabic-digits");
    resetLocaleFormatDefaults();
    expect(formatMoney(1234)).toBe("1,234 ج.م");
  });

  it("27. DYN-1 parity: formatStorefrontCurrency(250, «ج.م») → «250 ج.م»", () => {
    expect(formatStorefrontCurrency(250, "ج.م")).toBe("250 ج.م");
    expect(formatStorefrontCurrency(250, "ج.م")).toBe(
      formatMoney(250, { currency: "EGP", symbol: "ج.م", position: "after" }),
    );
  });

  it("28. DYN-1 parity: كسور العملة تبقى منزلتين في السياق العربي «1,234.50 ج.م»", () => {
    document.documentElement.setAttribute("dir", "rtl");
    document.documentElement.setAttribute("lang", "ar");
    try {
      expect(formatStorefrontCurrency(1234.5, "EGP")).toBe("1,234.50 ج.م");
      expect(formatStorefrontCurrency(1234, "EGP")).toBe("1,234 ج.م");
    } finally {
      document.documentElement.removeAttribute("dir");
      document.documentElement.removeAttribute("lang");
    }
  });

  /* ───────────── unified usage (source asserts) ───────────── */

  it("29. currency.ts يفوّض كل التنسيق للدالة الموحّدة (صفر منطق يدوي)", () => {
    const currencySource = readSource("utils/currency.ts");
    expect(currencySource).toContain("from './localeFormat'");
    expect(currencySource).toContain("formatMoney(");
    expect(currencySource).not.toContain("toLocaleString(");
    expect(currencySource).not.toContain("new Intl.NumberFormat(");
  });

  it("30. قسم يعرض السعر يستخدم الدالة الموحّدة بلا تنسيق يدوي", () => {
    const priceElementSource = readSource("sections/elements/ProductPriceElement.tsx");
    const commerceHelpersSource = readSource("sections/elements/commerceElementHelpers.ts");
    const productCardSource = readSource("components/ProductCard.tsx");

    expect(commerceHelpersSource).toContain("formatStorefrontCurrency");
    expect(commerceHelpersSource).not.toContain("ج.م`");
    expect(priceElementSource).not.toContain("toFixed(");

    expect(productCardSource).toContain("formatNumber");
    expect(productCardSource).not.toContain("toLocaleString('en-US')");
  });

  it("31. المحرر: تاب الإعدادات يعرض لوحة إعدادات اللغة والأرقام", () => {
    const studioShellSource = readSource("studio/StorefrontStudioShell.tsx");
    const panelSource = readSource("studio/StudioLocaleSettingsPanel.tsx");

    expect(studioShellSource).toContain("StudioLocaleSettingsPanel");
    expect(studioShellSource).toContain('leftRailTab === "settings"');
    for (const field of ["numberLocale", "currencyPosition", "units"]) {
      expect(panelSource).toContain(field);
    }
    expect(panelSource).toContain("studio-locale-settings-panel");
  });

  it("32. الشل يزامن إعدادات المتجر مع الدالة الموحّدة", () => {
    const shellSource = readSource("StorefrontShell.tsx");
    expect(shellSource).toContain("setLocaleFormatDefaults");
    expect(shellSource).toContain("readLocaleFormatSettingsFromSettings");
  });
});
