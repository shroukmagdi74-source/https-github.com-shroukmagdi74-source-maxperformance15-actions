/**
 * Utility functions for storefront studio style computation,
 * free-value conversions, Arabic numeral normalization, shadow formatting,
 * and multi-device responsive overrides resolution (Ticket 2G).
 */

import type React from "react";
import type { StudioStyleClass } from "../StudioTypes";
import { buildElementTypographyStyle } from "../../sections/elements/elementTypography";

export type StorefrontBreakpoint = "desktop" | "tablet" | "mobile";

/**
 * All styling / layout fields that can be overridden per device (Ticket 2G).
 */
export const RESPONSIVE_STYLE_FIELDS = new Set<string>([
  "paddingTop",
  "paddingBottom",
  "paddingRight",
  "paddingLeft",
  "padding",
  "marginTop",
  "marginBottom",
  "margin",
  "minHeight",
  "borderRadius",
  "gap",
  "shadow",
  "customShadow",
  "shadowX",
  "shadowY",
  "shadowBlur",
  "shadowSpread",
  "shadowOpacity",
  "shadowColor",
  "fontSize",
  "align",
  "textAlign",
  "contentAlign",
  "backgroundColor",
  "bgColor",
  "spacing",
]);

/**
 * The core 9 Per-Breakpoint styling properties targeted by Ticket 5R:
 * paddingTop, paddingBottom, paddingLeft, paddingRight,
 * marginTop, marginBottom, borderRadius, fontSize, contentAlign.
 */
export const PER_BREAKPOINT_PROPERTIES = [
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
  "marginTop",
  "marginBottom",
  "borderRadius",
  "fontSize",
  "contentAlign",
] as const;

export type PerBreakpointProperty = (typeof PER_BREAKPOINT_PROPERTIES)[number];

/**
 * Checks if a specific property is overridden for a specific device.
 */
export function isPropertyOverridden(
  settings?: Record<string, any> | null,
  property?: string | null,
  device: "tablet" | "mobile" = "mobile"
): boolean {
  if (!settings || !property) return false;
  const responsive =
    settings.responsive ||
    settings.config?.responsive ||
    settings.settings?.responsive;
  if (!responsive || typeof responsive !== "object") return false;
  const deviceOverrides = responsive[device];
  if (!deviceOverrides || typeof deviceOverrides !== "object") return false;
  const val = deviceOverrides[property];
  return val !== undefined && val !== null && val !== "";
}

/**
 * Gets the raw overridden value of a property for a device, if any.
 */
export function getPropertyOverrideValue(
  settings?: Record<string, any> | null,
  property?: string | null,
  device: "tablet" | "mobile" = "mobile"
): any {
  if (!settings || !property) return undefined;
  const responsive =
    settings.responsive ||
    settings.config?.responsive ||
    settings.settings?.responsive;
  if (!responsive || typeof responsive !== "object") return undefined;
  const deviceOverrides = responsive[device];
  if (!deviceOverrides || typeof deviceOverrides !== "object") return undefined;
  return deviceOverrides[property];
}

/**
 * Checks if a section settings object has non-empty overrides for a specific device.
 */
export function hasDeviceOverrides(
  settings?: Record<string, any> | null,
  device: "tablet" | "mobile" = "mobile"
): boolean {
  if (!settings) return false;
  const responsive =
    settings.responsive ||
    settings.config?.responsive ||
    settings.settings?.responsive;
  if (!responsive || typeof responsive !== "object") return false;
  const deviceOverrides = responsive[device];
  if (!deviceOverrides || typeof deviceOverrides !== "object") return false;
  return Object.keys(deviceOverrides).some((k) => {
    const val = deviceOverrides[k];
    return val !== undefined && val !== null && val !== "";
  });
}

/**
 * Counts how many style overrides exist for a specific device.
 */
export function getDeviceOverridesCount(
  settings?: Record<string, any> | null,
  device: "tablet" | "mobile" = "mobile"
): number {
  if (!settings) return 0;
  const responsive =
    settings.responsive ||
    settings.config?.responsive ||
    settings.settings?.responsive;
  if (!responsive || typeof responsive !== "object") return 0;
  const deviceOverrides = responsive[device];
  if (!deviceOverrides || typeof deviceOverrides !== "object") return 0;
  return Object.keys(deviceOverrides).filter((k) => {
    const val = deviceOverrides[k];
    return val !== undefined && val !== null && val !== "";
  }).length;
}

/**
 * Resolves effective section settings by merging responsive device overrides
 * onto the base desktop settings according to responsive cascade:
 * - Desktop: base settings
 * - Tablet: base settings merged with responsive.tablet
 * - Mobile: base settings merged with responsive.tablet (if any), then responsive.mobile (highest priority)
 */
export function resolveEffectiveSectionSettings(
  settings?: Record<string, any> | null,
  device: StorefrontBreakpoint | "desktop" | "tablet" | "mobile" = "desktop"
): Record<string, any> {
  if (!settings) return {};

  const effective: Record<string, any> = { ...settings };
  const responsive =
    settings.responsive ||
    settings.config?.responsive ||
    settings.settings?.responsive;

  if (!responsive || typeof responsive !== "object" || device === "desktop") {
    return effective;
  }

  const tabletOverrides = responsive.tablet;
  const mobileOverrides = responsive.mobile;

  if (device === "tablet") {
    if (tabletOverrides && typeof tabletOverrides === "object") {
      Object.entries(tabletOverrides).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          effective[k] = v;
        }
      });
    }
  } else if (device === "mobile") {
    // Mobile inherits from tablet overrides if present
    if (tabletOverrides && typeof tabletOverrides === "object") {
      Object.entries(tabletOverrides).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          effective[k] = v;
        }
      });
    }
    // Mobile overrides take final precedence
    if (mobileOverrides && typeof mobileOverrides === "object") {
      Object.entries(mobileOverrides).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          effective[k] = v;
        }
      });
    }
  }

  return effective;
}

/**
 * Converts Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) to standard Latin digits (0-9).
 */
export function normalizeArabicDigits(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  const str = String(value);
  return str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
}

/**
 * Parses a free number input safely, handling Arabic numerals and empty strings.
 */
export function parseFreeNumber(
  value: string | number | undefined | null,
  fallback: number = 0
): number {
  if (typeof value === "number") return isNaN(value) ? fallback : value;
  if (!value) return fallback;
  const normalized = normalizeArabicDigits(value).trim();
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Converts HEX color + opacity (0..1) to rgba(...) CSS string.
 */
export function hexToRgba(hex: string, opacity: number = 1): string {
  if (!hex || typeof hex !== "string") return `rgba(0, 0, 0, ${opacity})`;
  let cleanHex = hex.trim().replace(/^#/, "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (cleanHex.length !== 6) {
    return `rgba(0, 0, 0, ${opacity})`;
  }
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const clampedOpacity = Math.max(0, Math.min(1, opacity));
  return `rgba(${r}, ${g}, ${b}, ${clampedOpacity})`;
}

export interface StudioShadowConfig {
  x: number;
  y: number;
  blur: number;
  spread: number;
  opacity: number;
  color: string;
}

export const DEFAULT_CUSTOM_SHADOW: StudioShadowConfig = {
  x: 0,
  y: 12,
  blur: 30,
  spread: 0,
  opacity: 0.25,
  color: "#000000",
};

/**
 * Builds standard CSS box-shadow string from settings.
 * Supports presets ('none', 'soft', 'card') and custom free parameters (x, y, blur, spread, opacity, color).
 */
export function buildBoxShadowString(settings?: Record<string, any> | null): string {
  if (!settings) return "none";
  const shadowMode = settings.shadow;

  if (shadowMode === "none") return "none";
  if (shadowMode === "soft") return "0px 4px 12px 0px rgba(0, 0, 0, 0.06)";
  if (shadowMode === "card") {
    return "0px 10px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)";
  }

  // If custom mode or individual shadow fields are specified
  if (
    shadowMode === "custom" ||
    settings.customShadow ||
    settings.shadowBlur !== undefined ||
    settings.shadowY !== undefined ||
    settings.shadowX !== undefined ||
    settings.shadowSpread !== undefined
  ) {
    const x = parseFreeNumber(settings.shadowX, DEFAULT_CUSTOM_SHADOW.x);
    const y = parseFreeNumber(settings.shadowY, DEFAULT_CUSTOM_SHADOW.y);
    const blur = parseFreeNumber(settings.shadowBlur, DEFAULT_CUSTOM_SHADOW.blur);
    const spread = parseFreeNumber(settings.shadowSpread, DEFAULT_CUSTOM_SHADOW.spread);
    const opacity =
      settings.shadowOpacity !== undefined
        ? Math.max(0, Math.min(1, parseFreeNumber(settings.shadowOpacity, 0.25)))
        : DEFAULT_CUSTOM_SHADOW.opacity;
    const color = settings.shadowColor || DEFAULT_CUSTOM_SHADOW.color;
    const rgba = hexToRgba(color, opacity);
    return `${x}px ${y}px ${blur}px ${spread}px ${rgba}`;
  }

  return "none";
}

/**
 * Resolves border radius to a px value.
 * Handles numeric values (e.g. 24 -> "24px"), strings ("24px"), and legacy presets.
 */
export function resolveBorderRadius(value: any): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "number") return `${value}px`;

  const str = String(value).trim();
  if (str === "none" || str === "0") return "0px";
  if (str === "small") return "8px";
  if (str === "medium") return "16px";
  if (str === "large") return "24px";
  if (str.endsWith("px") || str.endsWith("%") || str.endsWith("rem")) return str;

  const parsed = parseFreeNumber(str, NaN);
  if (!isNaN(parsed)) return `${parsed}px`;

  return undefined;
}

/**
 * Computes the unified CSS style object for a storefront section.
 * Used in both StudioSortableSection (canvas) and StorefrontSectionFrame (live storefront).
 * Supports optional deviceMode for responsive overrides resolution.
 */
export function buildSectionStyle(
  settings?: Record<string, any> | null,
  baseStyle?: React.CSSProperties,
  deviceMode?: StorefrontBreakpoint | "desktop" | "tablet" | "mobile",
  classes?: StudioStyleClass[]
): React.CSSProperties {
  if (!settings) return baseStyle || {};

  const resolvedClasses = classes || (Array.isArray(settings.classes) ? (settings.classes as StudioStyleClass[]) : undefined);
  const settingsWithClasses = resolvedClasses ? mergeClassStyle(settings, resolvedClasses) : settings;
  const effective = deviceMode ? resolveEffectiveSectionSettings(settingsWithClasses, deviceMode) : settingsWithClasses;
  const style: React.CSSProperties = { ...(baseStyle || {}) };

  // 1. Free Padding
  if (effective.paddingTop !== undefined && effective.paddingTop !== null) {
    style.paddingTop = `${parseFreeNumber(effective.paddingTop)}px`;
  } else if (effective.padding !== undefined && effective.padding !== null) {
    style.paddingTop = `${parseFreeNumber(effective.padding)}px`;
  }

  if (effective.paddingBottom !== undefined && effective.paddingBottom !== null) {
    style.paddingBottom = `${parseFreeNumber(effective.paddingBottom)}px`;
  } else if (effective.padding !== undefined && effective.padding !== null) {
    style.paddingBottom = `${parseFreeNumber(effective.padding)}px`;
  }

  if (effective.paddingRight !== undefined && effective.paddingRight !== null) {
    style.paddingRight = `${parseFreeNumber(effective.paddingRight)}px`;
  } else if (effective.padding !== undefined && effective.padding !== null) {
    style.paddingRight = `${parseFreeNumber(effective.padding)}px`;
  }

  if (effective.paddingLeft !== undefined && effective.paddingLeft !== null) {
    style.paddingLeft = `${parseFreeNumber(effective.paddingLeft)}px`;
  } else if (effective.padding !== undefined && effective.padding !== null) {
    style.paddingLeft = `${parseFreeNumber(effective.padding)}px`;
  }

  // 2. Free Margin
  if (effective.marginTop !== undefined && effective.marginTop !== null) {
    style.marginTop = `${parseFreeNumber(effective.marginTop)}px`;
  }
  if (effective.marginBottom !== undefined && effective.marginBottom !== null) {
    style.marginBottom = `${parseFreeNumber(effective.marginBottom)}px`;
  }

  // 3. Free Min-Height
  if (effective.minHeight !== undefined && effective.minHeight !== null) {
    const minH = parseFreeNumber(effective.minHeight);
    if (minH > 0) {
      style.minHeight = `${minH}px`;
    }
  }

  // 4. Border Radius
  const radius = resolveBorderRadius(effective.borderRadius);
  if (radius !== undefined) {
    style.borderRadius = radius;
  }

  // 5. Box Shadow
  const shadow = buildBoxShadowString(effective);
  if (shadow && shadow !== "none") {
    style.boxShadow = shadow;
  }

  // 6. Background Color
  const bg = effective.backgroundColor || effective.bgColor;
  if (bg && typeof bg === "string" && bg !== "transparent") {
    style.backgroundColor = bg;
  }

  // 7. Gap (for grid/flex layouts)
  if (effective.gap !== undefined && effective.gap !== null) {
    const gapNum = parseFreeNumber(effective.gap);
    if (gapNum > 0) {
      style.gap = `${gapNum}px`;
    }
  }

  // 8. Typography / Font Size
  if (effective.fontSize !== undefined && effective.fontSize !== null) {
    const fSize = parseFreeNumber(effective.fontSize);
    if (fSize > 0) {
      style.fontSize = `${fSize}px`;
    }
  }

  // 9. Text Alignment / Content Alignment
  const alignVal = effective.contentAlign || effective.align || effective.textAlign;
  if (alignVal) {
    if (alignVal === "start") {
      style.textAlign = "start";
    } else if (alignVal === "end") {
      style.textAlign = "end";
    } else
    if (alignVal === "center" || alignVal === "right" || alignVal === "left" || alignVal === "justify") {
      style.textAlign = alignVal as React.CSSProperties["textAlign"];
    }
  }

  // 10. Text Color
  if (effective.color && typeof effective.color === "string") {
    style.color = effective.color === "accent" ? "var(--store-accent, #2563eb)" : effective.color;
  }

  return style;
}

export interface GenerateResponsiveCssOptions {
  tabletMin?: number;
  tabletMax?: number;
  mobileMax?: number;
}

/**
 * Generates pure CSS media query declarations for responsive style overrides
 * (Ticket 5R / 5B pattern).
 * Cascades: base -> tablet -> mobile.
 */
export function generateResponsiveCss(
  settings?: Record<string, any> | null,
  selector?: string | null,
  options: GenerateResponsiveCssOptions = {}
): string | null {
  if (!settings || !selector) return null;
  const responsive =
    settings.responsive ||
    settings.config?.responsive ||
    settings.settings?.responsive;
  if (!responsive || typeof responsive !== "object") return null;

  const tabletOverrides = responsive.tablet;
  const mobileOverrides = responsive.mobile;

  const hasTablet = Boolean(
    tabletOverrides &&
      typeof tabletOverrides === "object" &&
      Object.keys(tabletOverrides).length > 0
  );
  const hasMobile = Boolean(
    mobileOverrides &&
      typeof mobileOverrides === "object" &&
      Object.keys(mobileOverrides).length > 0
  );

  if (!hasTablet && !hasMobile) return null;

  const tabletMin = options.tabletMin ?? 768;
  const tabletMax = options.tabletMax ?? 1023.98;
  const mobileMax = options.mobileMax ?? 767.98;

  const buildDeclarations = (device: "tablet" | "mobile"): string[] => {
    const effective = resolveEffectiveSectionSettings(settings, device);
    const decls: string[] = [];

    // Padding
    if (effective.paddingTop !== undefined && effective.paddingTop !== null) {
      decls.push(`padding-top: ${parseFreeNumber(effective.paddingTop)}px !important;`);
    } else if (effective.padding !== undefined && effective.padding !== null) {
      decls.push(`padding-top: ${parseFreeNumber(effective.padding)}px !important;`);
    }

    if (effective.paddingBottom !== undefined && effective.paddingBottom !== null) {
      decls.push(`padding-bottom: ${parseFreeNumber(effective.paddingBottom)}px !important;`);
    } else if (effective.padding !== undefined && effective.padding !== null) {
      decls.push(`padding-bottom: ${parseFreeNumber(effective.padding)}px !important;`);
    }

    if (effective.paddingLeft !== undefined && effective.paddingLeft !== null) {
      decls.push(`padding-left: ${parseFreeNumber(effective.paddingLeft)}px !important;`);
    } else if (effective.padding !== undefined && effective.padding !== null) {
      decls.push(`padding-left: ${parseFreeNumber(effective.padding)}px !important;`);
    }

    if (effective.paddingRight !== undefined && effective.paddingRight !== null) {
      decls.push(`padding-right: ${parseFreeNumber(effective.paddingRight)}px !important;`);
    } else if (effective.padding !== undefined && effective.padding !== null) {
      decls.push(`padding-right: ${parseFreeNumber(effective.padding)}px !important;`);
    }

    // Margin
    if (effective.marginTop !== undefined && effective.marginTop !== null) {
      decls.push(`margin-top: ${parseFreeNumber(effective.marginTop)}px !important;`);
    }
    if (effective.marginBottom !== undefined && effective.marginBottom !== null) {
      decls.push(`margin-bottom: ${parseFreeNumber(effective.marginBottom)}px !important;`);
    }

    // Border Radius
    const radius = resolveBorderRadius(effective.borderRadius);
    if (radius !== undefined) {
      decls.push(`border-radius: ${radius} !important;`);
    }

    // Font Size
    if (effective.fontSize !== undefined && effective.fontSize !== null) {
      const fSize = parseFreeNumber(effective.fontSize);
      if (fSize > 0) {
        decls.push(`font-size: ${fSize}px !important;`);
      }
    }

    // Content Alignment / Text Alignment
    const align = effective.contentAlign || effective.align || effective.textAlign;
    if (align) {
      if (align === "center" || align === "right" || align === "left" || align === "justify") {
        decls.push(`text-align: ${align} !important;`);
      } else if (align === "start") {
        decls.push(`text-align: start !important;`);
      } else if (align === "end") {
        decls.push(`text-align: end !important;`);
      }
    }

    return decls;
  };

  const rules: string[] = [];

  if (hasTablet) {
    const tabletDecls = buildDeclarations("tablet");
    if (tabletDecls.length > 0) {
      rules.push(
        `@media (min-width: ${tabletMin}px) and (max-width: ${tabletMax}px) {\n  ${selector} {\n    ${tabletDecls.join(
          "\n    "
        )}\n  }\n}`
      );
    }
  }

  if (hasMobile) {
    const mobileDecls = buildDeclarations("mobile");
    if (mobileDecls.length > 0) {
      rules.push(
        `@media (max-width: ${mobileMax}px) {\n  ${selector} {\n    ${mobileDecls.join(
          "\n    "
        )}\n  }\n}`
      );
    }
  }

  return rules.length > 0 ? rules.join("\n") : null;
}

/**
 * Converts a style/settings object into an array of clean CSS declaration strings.
 */
export function styleObjectToCssDeclarations(styleObj?: Record<string, any> | null): string[] {
  if (!styleObj || typeof styleObj !== "object") return [];
  const decls: string[] = [];

  for (const [key, rawVal] of Object.entries(styleObj)) {
    if (rawVal === undefined || rawVal === null || rawVal === "") continue;
    if (["id", "name", "classId", "customClass", "type", "key", "sectionKey", "classes", "states", "responsive"].includes(key)) {
      continue;
    }

    if (key === "backgroundColor" || key === "bgColor") {
      decls.push(`background-color: ${rawVal};`);
    } else if (key === "color") {
      decls.push(`color: ${rawVal};`);
    } else if (key === "borderColor") {
      decls.push(`border-color: ${rawVal};`);
    } else if (key === "borderWidth") {
      decls.push(`border-width: ${typeof rawVal === "number" ? `${rawVal}px` : rawVal};`);
    } else if (key === "borderStyle") {
      decls.push(`border-style: ${rawVal};`);
    } else if (key === "borderRadius") {
      const r = resolveBorderRadius(rawVal);
      if (r) decls.push(`border-radius: ${r};`);
    } else if (key === "shadow" || key === "boxShadow") {
      if (typeof rawVal === "string" && rawVal !== "custom") {
        const shadowStr =
          rawVal === "none"
            ? "none"
            : rawVal === "soft"
            ? "0px 4px 12px 0px rgba(0, 0, 0, 0.06)"
            : rawVal === "card"
            ? "0px 10px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)"
            : rawVal;
        decls.push(`box-shadow: ${shadowStr};`);
      } else if (typeof rawVal === "object") {
        decls.push(`box-shadow: ${buildBoxShadowString(rawVal)};`);
      }
    } else if (key === "fontSize") {
      const fNum = parseFreeNumber(rawVal);
      if (fNum > 0) decls.push(`font-size: ${fNum}px;`);
    } else if (key === "fontWeight") {
      decls.push(`font-weight: ${rawVal};`);
    } else if (key === "lineHeight") {
      const lh = typeof rawVal === "number" && rawVal >= 3 ? `${rawVal}px` : String(rawVal);
      decls.push(`line-height: ${lh};`);
    } else if (key === "letterSpacing") {
      decls.push(`letter-spacing: ${typeof rawVal === "number" ? `${rawVal}px` : rawVal};`);
    } else if (key === "paddingTop") {
      decls.push(`padding-top: ${parseFreeNumber(rawVal)}px;`);
    } else if (key === "paddingBottom") {
      decls.push(`padding-bottom: ${parseFreeNumber(rawVal)}px;`);
    } else if (key === "paddingLeft") {
      decls.push(`padding-left: ${parseFreeNumber(rawVal)}px;`);
    } else if (key === "paddingRight") {
      decls.push(`padding-right: ${parseFreeNumber(rawVal)}px;`);
    } else if (key === "padding") {
      decls.push(`padding: ${typeof rawVal === "number" ? `${rawVal}px` : rawVal};`);
    } else if (key === "marginTop") {
      decls.push(`margin-top: ${parseFreeNumber(rawVal)}px;`);
    } else if (key === "marginBottom") {
      decls.push(`margin-bottom: ${parseFreeNumber(rawVal)}px;`);
    } else if (key === "margin") {
      decls.push(`margin: ${typeof rawVal === "number" ? `${rawVal}px` : rawVal};`);
    } else if (key === "minHeight") {
      const mh = parseFreeNumber(rawVal);
      if (mh > 0) decls.push(`min-height: ${mh}px;`);
    } else if (key === "gap") {
      const g = parseFreeNumber(rawVal);
      if (g > 0) decls.push(`gap: ${g}px;`);
    } else if (key === "opacity") {
      decls.push(`opacity: ${rawVal};`);
    } else if (key === "transform") {
      decls.push(`transform: ${rawVal};`);
    } else if (key === "outline") {
      decls.push(`outline: ${rawVal};`);
    } else if (key === "transition") {
      decls.push(`transition: ${rawVal};`);
    } else if (key === "cursor") {
      decls.push(`cursor: ${rawVal};`);
    } else if (key === "textAlign" || key === "align" || key === "contentAlign") {
      decls.push(`text-align: ${rawVal};`);
    } else if (key === "textDecoration") {
      decls.push(`text-decoration: ${rawVal};`);
    } else if (key === "textTransform") {
      decls.push(`text-transform: ${rawVal};`);
    } else if (key === "customCss") {
      decls.push(String(rawVal));
    } else if (typeof rawVal === "string" || typeof rawVal === "number") {
      const kebab = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      decls.push(`${kebab}: ${rawVal};`);
    }
  }

  return decls;
}

/**
 * Generates page-level scoped CSS for all defined classes and their pseudo-states (hover, focus, active).
 * (Ticket CLASSES-1).
 */
export function generateClassesCss(classes?: StudioStyleClass[] | null): string {
  if (!classes || !Array.isArray(classes) || classes.length === 0) return "";

  const rules: string[] = [];

  for (const c of classes) {
    if (!c || !c.id) continue;
    const cid = String(c.id).trim();
    if (!cid) continue;

    // Normal / Base class rules
    const baseDecls = styleObjectToCssDeclarations(c.settings || {});
    if (baseDecls.length > 0) {
      rules.push(`[data-sf-class="${cid}"] {\n  ${baseDecls.join("\n  ")}\n}`);
    }

    // State rules: hover, focus, active
    const states = c.states;
    if (states && typeof states === "object") {
      if (states.hover && typeof states.hover === "object") {
        const hoverDecls = styleObjectToCssDeclarations(states.hover);
        if (hoverDecls.length > 0) {
          rules.push(`[data-sf-class="${cid}"]:hover {\n  ${hoverDecls.join("\n  ")}\n}`);
        }
      }
      if (states.focus && typeof states.focus === "object") {
        const focusDecls = styleObjectToCssDeclarations(states.focus);
        if (focusDecls.length > 0) {
          rules.push(`[data-sf-class="${cid}"]:focus {\n  ${focusDecls.join("\n  ")}\n}`);
        }
      }
      if (states.active && typeof states.active === "object") {
        const activeDecls = styleObjectToCssDeclarations(states.active);
        if (activeDecls.length > 0) {
          rules.push(`[data-sf-class="${cid}"]:active {\n  ${activeDecls.join("\n  ")}\n}`);
        }
      }
    }
  }

  return rules.join("\n\n");
}

/**
 * Merges class settings onto section settings:
 * Class settings are applied first, and inline section settings take ultimate precedence upon conflict.
 * (Ticket CLASSES-1).
 */
export function mergeClassStyle(
  sectionSettings?: Record<string, any> | null,
  classes?: StudioStyleClass[] | null
): Record<string, any> {
  if (!sectionSettings) return {};
  if (!classes || !Array.isArray(classes) || classes.length === 0) return { ...sectionSettings };

  const classId = sectionSettings.classId || sectionSettings.customClass;
  if (!classId) return { ...sectionSettings };

  const matchedClass = classes.find((c) => c && c.id === classId);
  if (!matchedClass) return { ...sectionSettings };

  // 1. Base settings: class settings first, then section settings override
  const merged: Record<string, any> = {
    ...(matchedClass.settings || {}),
    ...sectionSettings,
  };

  // 2. Responsive overrides cascade: class responsive merged before section responsive
  const classResp = matchedClass.settings?.responsive;
  const sectionResp = sectionSettings.responsive;
  if (classResp || sectionResp) {
    merged.responsive = {
      ...(classResp || {}),
      ...(sectionResp || {}),
      tablet: {
        ...(classResp?.tablet || {}),
        ...(sectionResp?.tablet || {}),
      },
      mobile: {
        ...(classResp?.mobile || {}),
        ...(sectionResp?.mobile || {}),
      },
    };
  }

  return merged;
}

/**
 * Computes element style merging assigned class styles before element inline styles.
 * (Ticket CLASSES-1).
 */
export function buildElementStyle(
  settings?: Record<string, any> | null,
  classes?: StudioStyleClass[] | null,
  baseStyle?: React.CSSProperties,
  textOverride?: string
): React.CSSProperties {
  if (!settings && !textOverride) return baseStyle || {};

  const merged = classes ? mergeClassStyle(settings, classes) : (settings || {});
  const style: React.CSSProperties = { ...(baseStyle || {}) };

  // Typography
  const typo = buildElementTypographyStyle(merged, textOverride);
  Object.assign(style, typo);

  // Background and appearance
  const bg = merged.backgroundColor || merged.bgColor;
  if (bg && typeof bg === "string" && bg !== "transparent") {
    style.backgroundColor = bg;
  }
  if (merged.color && typeof merged.color === "string") {
    style.color = merged.color === "accent" ? "var(--store-accent, #2563eb)" : merged.color;
  }
  const radius = resolveBorderRadius(merged.borderRadius);
  if (radius !== undefined) {
    style.borderRadius = radius;
  }
  const shadow = buildBoxShadowString(merged);
  if (shadow && shadow !== "none") {
    style.boxShadow = shadow;
  }
  if (merged.paddingTop !== undefined) style.paddingTop = `${parseFreeNumber(merged.paddingTop)}px`;
  if (merged.paddingBottom !== undefined) style.paddingBottom = `${parseFreeNumber(merged.paddingBottom)}px`;
  if (merged.paddingLeft !== undefined) style.paddingLeft = `${parseFreeNumber(merged.paddingLeft)}px`;
  if (merged.paddingRight !== undefined) style.paddingRight = `${parseFreeNumber(merged.paddingRight)}px`;
  if (merged.marginTop !== undefined) style.marginTop = `${parseFreeNumber(merged.marginTop)}px`;
  if (merged.marginBottom !== undefined) style.marginBottom = `${parseFreeNumber(merged.marginBottom)}px`;

  return style;
}

/**
 * All properties considered 'style' for copy/paste style operations (Ticket CLASSES-1).
 */
export const STYLE_PROPERTIES_TO_COPY = new Set<string>([
  "backgroundColor",
  "bgColor",
  "borderRadius",
  "shadow",
  "customShadow",
  "shadowX",
  "shadowY",
  "shadowBlur",
  "shadowSpread",
  "shadowOpacity",
  "shadowColor",
  "paddingTop",
  "paddingBottom",
  "paddingRight",
  "paddingLeft",
  "padding",
  "marginTop",
  "marginBottom",
  "margin",
  "minHeight",
  "gap",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "align",
  "textAlign",
  "contentAlign",
  "color",
  "customCss",
  "classId",
  "customClass",
  "responsive",
]);

/**
 * Copies only style properties from a section settings object without copying content or structural keys.
 */
export function copySectionStyle(settings?: Record<string, any> | null): Record<string, any> {
  if (!settings || typeof settings !== "object") return {};
  const stylePayload: Record<string, any> = {};

  for (const key of Object.keys(settings)) {
    if (STYLE_PROPERTIES_TO_COPY.has(key)) {
      const val = settings[key];
      if (val !== undefined && val !== null) {
        stylePayload[key] = JSON.parse(JSON.stringify(val));
      }
    }
  }

  return stylePayload;
}

/**
 * Applies copied style properties onto target section settings without altering target content or structural keys.
 */
export function pasteSectionStyle(
  targetSettings?: Record<string, any> | null,
  copiedStyle?: Record<string, any> | null
): Record<string, any> {
  const target = { ...(targetSettings || {}) };
  if (!copiedStyle || typeof copiedStyle !== "object") return target;

  for (const [k, v] of Object.entries(copiedStyle)) {
    if (STYLE_PROPERTIES_TO_COPY.has(k) && v !== undefined) {
      target[k] = JSON.parse(JSON.stringify(v));
    }
  }

  return target;
}
