/**
 * a11yAudit.ts
 * Pure Accessibility (A11y) auditor for MaxP Storefront Studio pages.
 * Evaluates:
 * 1. WCAG AA contrast ratio (4.5:1 normal, 3:1 large text)
 * 2. Missing image alt attributes
 * 3. Heading hierarchy (h1 -> h2 -> h3, single h1 per page, no skipped levels)
 * 4. Interactive buttons without accessible labels
 * 5. Touch target dimensions (< 40px)
 */

export interface ColorRGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

const NAMED_COLORS: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  green: "#008000",
  blue: "#0000ff",
  gray: "#808080",
  grey: "#808080",
  darkgray: "#a9a9a9",
  lightgray: "#d3d3d3",
  silver: "#c0c0c0",
  yellow: "#ffff00",
  cyan: "#00ffff",
  magenta: "#ff00ff",
  orange: "#ffa500",
  purple: "#800080",
  navy: "#000080",
  teal: "#008080",
  transparent: "rgba(0,0,0,0)",
};

/**
 * Parses any hex, rgb, rgba, or named color into RGBA components (0-255 for RGB, 0-1 for A).
 */
export function parseColor(color: string | undefined | null): ColorRGBA | null {
  if (!color || typeof color !== "string") return null;
  const trimmed = color.trim().toLowerCase();
  if (!trimmed) return null;

  if (NAMED_COLORS[trimmed]) {
    return parseColor(NAMED_COLORS[trimmed]);
  }

  // Hex color (#rgb, #rgba, #rrggbb, #rrggbbaa)
  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      const r = parseInt((hex[0] ?? "0") + (hex[0] ?? "0"), 16);
      const g = parseInt((hex[1] ?? "0") + (hex[1] ?? "0"), 16);
      const b = parseInt((hex[2] ?? "0") + (hex[2] ?? "0"), 16);
      return { r, g, b, a: 1 };
    }
    if (hex.length === 4) {
      const r = parseInt((hex[0] ?? "0") + (hex[0] ?? "0"), 16);
      const g = parseInt((hex[1] ?? "0") + (hex[1] ?? "0"), 16);
      const b = parseInt((hex[2] ?? "0") + (hex[2] ?? "0"), 16);
      const a = parseInt((hex[3] ?? "0") + (hex[3] ?? "0"), 16) / 255;
      return { r, g, b, a };
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b, a: 1 };
    }
    if (hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const a = parseInt(hex.slice(6, 8), 16) / 255;
      return { r, g, b, a };
    }
    return null;
  }

  // rgb / rgba format
  const rgbMatch = trimmed.match(/^rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (rgbMatch) {
    const r = Math.min(255, Math.max(0, parseInt(rgbMatch[1] ?? "0", 10)));
    const g = Math.min(255, Math.max(0, parseInt(rgbMatch[2] ?? "0", 10)));
    const b = Math.min(255, Math.max(0, parseInt(rgbMatch[3] ?? "0", 10)));
    const a = rgbMatch[4] !== undefined ? Math.min(1, Math.max(0, parseFloat(rgbMatch[4]))) : 1;
    return { r, g, b, a };
  }

  return null;
}

/**
 * Calculates WCAG 2.1 relative luminance for linearized sRGB.
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const rs = r / 255;
  const gs = g / 255;
  const bs = b / 255;

  const rLinear = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
  const gLinear = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
  const bLinear = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculates contrast ratio between two colors according to WCAG 2.1 specifications:
 * (L1 + 0.05) / (L2 + 0.05)
 * Returns a number rounded to 2 decimal places (e.g. 4.48, 21.0).
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const c1 = parseColor(color1);
  const c2 = parseColor(color2);

  if (!c1 || !c2) return 1;

  // Handle alpha blending against white by default if alpha < 1
  const blend = (c: ColorRGBA, bgR = 255, bgG = 255, bgB = 255): { r: number; g: number; b: number } => {
    return {
      r: Math.round(c.r * c.a + bgR * (1 - c.a)),
      g: Math.round(c.g * c.a + bgG * (1 - c.a)),
      b: Math.round(c.b * c.a + bgB * (1 - c.a)),
    };
  };

  const solid1 = blend(c1);
  const solid2 = blend(c2, solid1.r, solid1.g, solid1.b);

  const l1 = getRelativeLuminance(solid1.r, solid1.g, solid1.b);
  const l2 = getRelativeLuminance(solid2.r, solid2.g, solid2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 100) / 100;
}

export interface A11yIssue {
  id: string;
  type: "contrast" | "alt" | "heading-order" | "button-label" | "touch-target";
  severity: "warn" | "fail";
  message: string;
  sectionKey?: string;
  sectionLabel?: string;
  ratio?: number;
  expectedRatio?: number;
  details?: Record<string, unknown>;
}

export interface A11yAuditResult {
  passed: boolean;
  issues: A11yIssue[];
  summary: {
    totalChecked: number;
    errorsCount: number;
    warningsCount: number;
    contrastChecks: number;
    missingAltCount: number;
    headingIssuesCount: number;
    unlabeledButtonsCount: number;
    smallTouchTargetsCount: number;
  };
}

export interface AuditA11yParams {
  sections?: any[];
  defaultBg?: string;
  defaultText?: string;
}

/**
 * Audits all storefront sections for WCAG accessibility compliance.
 */
export function auditA11y(params: AuditA11yParams): A11yAuditResult {
  const { sections = [], defaultBg = "#ffffff", defaultText = "#111827" } = params;
  const issues: A11yIssue[] = [];

  let contrastChecks = 0;
  let missingAltCount = 0;
  let headingIssuesCount = 0;
  let unlabeledButtonsCount = 0;
  let smallTouchTargetsCount = 0;

  const headingsList: Array<{
    level: number;
    text: string;
    sectionKey: string;
    sectionLabel: string;
  }> = [];

  sections.forEach((sec, idx) => {
    const sectionKey = sec?.key || sec?.id || `section-${idx}`;
    const type = typeof sec === "string" ? sec : sec?.type || `قسم ${idx + 1}`;
    const settings = typeof sec === "object" && sec !== null ? sec.settings || sec : {};
    const label = sec?.label || type;

    // 1. Contrast Ratio Checks
    const secBg = settings.backgroundColor || settings.bgColor || settings.background || defaultBg;
    const secText = settings.textColor || settings.color || settings.titleColor || settings.headingColor || defaultText;

    if (typeof secBg === "string" && typeof secText === "string") {
      contrastChecks++;
      const isLarge = settings.isLargeText !== undefined
        ? Boolean(settings.isLargeText)
        : Boolean(type === "hero" || (typeof settings.fontSize === "number" && settings.fontSize >= 24));
      const expectedRatio = isLarge ? 3.0 : 4.5;
      const ratio = calculateContrastRatio(secText, secBg);

      if (ratio < expectedRatio) {
        issues.push({
          id: `contrast-${sectionKey}`,
          type: "contrast",
          severity: "fail",
          ratio,
          expectedRatio,
          sectionKey,
          sectionLabel: label,
          message: `فشل التباين: نسبة التباين (${ratio}:1) بين النص (${secText}) والخلفية (${secBg}) في "${label}" أقل من الحد الأدنى المطلوب (${expectedRatio}:1) وفق معايير WCAG AA.`,
          details: { textColor: secText, backgroundColor: secBg, ratio, expectedRatio },
        });
      }
    }

    // Check button contrast if explicit
    const btnBg = settings.buttonBg || settings.buttonBackground || settings.buttonColor;
    const btnText = settings.buttonTextColor || settings.buttonTextColour;
    if (typeof btnBg === "string" && typeof btnText === "string") {
      contrastChecks++;
      const ratio = calculateContrastRatio(btnText, btnBg);
      if (ratio < 4.5) {
        issues.push({
          id: `btn-contrast-${sectionKey}`,
          type: "contrast",
          severity: "fail",
          ratio,
          expectedRatio: 4.5,
          sectionKey,
          sectionLabel: label,
          message: `فشل التباين في الزر: نسبة التباين (${ratio}:1) للزر في "${label}" أقل من 4.5:1.`,
          details: { buttonBg: btnBg, buttonTextColor: btnText, ratio },
        });
      }
    }

    // 2. Images Missing Alt
    const directImage = settings.image || settings.imageUrl || settings.backgroundImage || settings.bannerUrl || settings.heroImage;
    if (directImage && typeof directImage === "string" && directImage.trim()) {
      const alt = settings.alt || settings.imageAlt || settings.altText;
      if (!alt || !String(alt).trim()) {
        missingAltCount++;
        issues.push({
          id: `alt-${sectionKey}-direct`,
          type: "alt",
          severity: "fail",
          sectionKey,
          sectionLabel: label,
          message: `صورة بدون نص بديل (alt text) في "${label}" — النصوص البديلة إلزامية لتقنيات قراءة الشاشة.`,
        });
      }
    }

    if (Array.isArray(settings.items)) {
      settings.items.forEach((item: any, itemIdx: number) => {
        if (item && (item.image || item.imageUrl || item.src)) {
          const itemAlt = item.alt || item.imageAlt || item.altText;
          if (!itemAlt || !String(itemAlt).trim()) {
            missingAltCount++;
            issues.push({
              id: `alt-${sectionKey}-item-${itemIdx}`,
              type: "alt",
              severity: "fail",
              sectionKey,
              sectionLabel: label,
              message: `العنصر ${itemIdx + 1} في "${label}" يحتوي على صورة بدون نص بديل (alt).`,
            });
          }
        }
      });
    }

    // 3. Headings extraction
    const rawLevel = settings.headingLevel || settings.level || settings.tag;
    const hasHeading = Boolean(settings.title || settings.heading || settings.headline);
    let level: number | null = null;

    if (typeof rawLevel === "string") {
      const match = rawLevel.toLowerCase().match(/^h([1-6])$/);
      if (match && match[1]) {
        level = parseInt(match[1], 10);
      }
    } else if (typeof rawLevel === "number" && rawLevel >= 1 && rawLevel <= 6) {
      level = rawLevel;
    } else if (hasHeading) {
      // Inferred level
      if (type === "hero" || type === "banner" || idx === 0) {
        level = 1;
      } else {
        level = 2;
      }
    }

    if (level !== null && hasHeading) {
      headingsList.push({
        level,
        text: String(settings.title || settings.heading || settings.headline || ""),
        sectionKey,
        sectionLabel: label,
      });
    }

    // 4. Buttons without label
    const hasButtonLink = Boolean(settings.buttonLink || settings.ctaLink || settings.buttonUrl);
    const hasButtonExplicit = Boolean(settings.showButton || settings.hasButton || type === "cta" || type === "button");
    if (hasButtonLink || hasButtonExplicit) {
      const btnLabel = settings.buttonText || settings.ctaText || settings.buttonLabel || settings.label || settings.text || settings.ariaLabel;
      if (!btnLabel || !String(btnLabel).trim()) {
        unlabeledButtonsCount++;
        issues.push({
          id: `btn-label-${sectionKey}`,
          type: "button-label",
          severity: "fail",
          sectionKey,
          sectionLabel: label,
          message: `زر تفاعلي بدون تسمية نصية أو aria-label في "${label}" — يتعذر على قارئات الشاشة التعرف على وظيفته.`,
        });
      }
    }

    // Check nested items for buttons
    if (Array.isArray(settings.items)) {
      settings.items.forEach((item: any, itemIdx: number) => {
        if (item && (item.buttonLink || item.ctaLink || item.isButton)) {
          const itemBtnLabel = item.buttonText || item.ctaText || item.buttonLabel || item.label || item.text || item.ariaLabel;
          if (!itemBtnLabel || !String(itemBtnLabel).trim()) {
            unlabeledButtonsCount++;
            issues.push({
              id: `btn-label-${sectionKey}-item-${itemIdx}`,
              type: "button-label",
              severity: "fail",
              sectionKey,
              sectionLabel: label,
              message: `الزر في العنصر ${itemIdx + 1} في "${label}" يفتقر إلى تسمية نصية واضحة أو aria-label.`,
            });
          }
        }
      });
    }

    // 5. Touch Targets < 40px
    const targetSizeToCheck = settings.buttonHeight ?? settings.minHeight ?? settings.targetSize ?? settings.touchTargetSize ?? settings.buttonSize;
    if (targetSizeToCheck !== undefined && targetSizeToCheck !== null) {
      const numSize = typeof targetSizeToCheck === "number"
        ? targetSizeToCheck
        : parseFloat(String(targetSizeToCheck).replace("px", ""));

      if (!isNaN(numSize) && numSize > 0 && numSize < 40) {
        smallTouchTargetsCount++;
        issues.push({
          id: `touch-target-${sectionKey}`,
          type: "touch-target",
          severity: "warn",
          sectionKey,
          sectionLabel: label,
          message: `هدف اللمس أصغر من 40px في "${label}" (الحجم: ${numSize}px) — معايير سهولة الاستخدام تتطلب 40px على الأقل.`,
          details: { size: numSize, minRecommended: 40 },
        });
      }
    }
  });

  // Evaluate Heading Order and H1 Count
  const h1s = headingsList.filter((h) => h.level === 1);
  if (h1s.length === 0 && sections.length > 0) {
    headingIssuesCount++;
    issues.push({
      id: "heading-order-no-h1",
      type: "heading-order",
      severity: "warn",
      message: "لا يوجد عنوان رئيسي H1 في الصفحة — يجب توفير عنوان H1 رئيسي واحد لضبط تسلسل الوصول.",
    });
  } else if (h1s.length > 1) {
    headingIssuesCount++;
    issues.push({
      id: "heading-order-multi-h1",
      type: "heading-order",
      severity: "warn",
      message: `تكرار عنوان H1: الصفحة تحتوي على ${h1s.length} عناوين H1، ويُفضل وجود عنوان رئيسي H1 واحد فقط.`,
      sectionKey: h1s[1]?.sectionKey,
      sectionLabel: h1s[1]?.sectionLabel,
    });
  }

  // Check skipped levels in sequence (e.g. h1 -> h3 without h2)
  for (let i = 0; i < headingsList.length - 1; i++) {
    const current = headingsList[i]!;
    const next = headingsList[i + 1]!;
    if (next.level > current.level + 1) {
      headingIssuesCount++;
      issues.push({
        id: `heading-order-skip-${i}`,
        type: "heading-order",
        severity: "warn",
        sectionKey: next.sectionKey,
        sectionLabel: next.sectionLabel,
        message: `تجاوز مستوى العناوين: تم الانتقال من H${current.level} إلى H${next.level} مباشرة دون H${current.level + 1} في "${next.sectionLabel}".`,
        details: { fromLevel: current.level, toLevel: next.level },
      });
    }
  }

  const errorsCount = issues.filter((i) => i.severity === "fail").length;
  const warningsCount = issues.filter((i) => i.severity === "warn").length;

  return {
    passed: errorsCount === 0,
    issues,
    summary: {
      totalChecked: sections.length,
      errorsCount,
      warningsCount,
      contrastChecks,
      missingAltCount,
      headingIssuesCount,
      unlabeledButtonsCount,
      smallTouchTargetsCount,
    },
  };
}
