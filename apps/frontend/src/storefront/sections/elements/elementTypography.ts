import React from 'react';

export interface ClampFontSizeConfig {
  min: number | string;
  vw: number | string;
  max: number | string;
}

export function formatClampFontSize(
  clamp?: ClampFontSizeConfig | string | null
): string | null {
  if (!clamp) return null;
  if (typeof clamp === "string") {
    const trimmed = clamp.trim();
    if (trimmed.startsWith("clamp(")) return trimmed;
    return null;
  }
  if (typeof clamp !== "object") return null;

  const minRaw = clamp.min;
  const vwRaw = clamp.vw;
  const maxRaw = clamp.max;

  if (minRaw === undefined || vwRaw === undefined || maxRaw === undefined) {
    return null;
  }

  const formatPart = (val: number | string, defaultUnit: string): string => {
    if (typeof val === "number") return `${val}${defaultUnit}`;
    const str = String(val).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString()).trim();
    if (/^-?\d+(\.\d+)?$/.test(str)) {
      return `${str}${defaultUnit}`;
    }
    return str;
  };

  const minStr = formatPart(minRaw, "px");
  const vwStr = formatPart(vwRaw, "vw");
  const maxStr = formatPart(maxRaw, "px");

  return `clamp(${minStr}, ${vwStr}, ${maxStr})`;
}

export interface ElementTypographySettings {
  fontFamily?: string;
  fontSize?: number | string | ClampFontSizeConfig;
  fontWeight?: number | string;
  lineHeight?: number | string;
  letterSpacing?: number | string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | string;
  textDecoration?: 'none' | 'underline' | 'line-through' | string;
  textAlign?: 'start' | 'center' | 'end' | 'left' | 'right' | string;
  fontStyle?: 'normal' | 'italic' | string;
  color?: string;
  text?: string;
  content?: string;
  label?: string;
  [key: string]: any;
}

const ARABIC_CHAR_REGEX = /[\u0600-\u06FF]/;

/**
 * Builds CSSProperties for element typography based on ticket TYPE-2 requirements.
 * - fontFamily: any string as-is
 * - fontSize: number -> 'px', string -> as-is (pure numeric string also converted to 'px')
 * - fontWeight: 100..900 (stringified)
 * - lineHeight: number < 3 -> relative unit as-is (e.g. "1.6"), otherwise 'px' (e.g. "28px")
 * - letterSpacing: number -> 'px'; Arabic text defaults to '0px' when not specified by user; user-provided value is always respected
 * - textTransform: none/uppercase/lowercase/capitalize
 * - textDecoration: none/underline/line-through
 * - textAlign: start/center/end/left/right
 * - fontStyle: normal/italic
 * - color: trims and preserves accent resolution; NEVER changes default when empty/undefined
 */
export function buildElementTypographyStyle(
  settings?: ElementTypographySettings,
  textOverride?: string,
): React.CSSProperties {
  const style: React.CSSProperties = {};
  if (!settings && !textOverride) {
    return style;
  }

  // 1. fontFamily: any string as-is
  if (typeof settings?.fontFamily === 'string') {
    const trimmed = settings.fontFamily.trim();
    if (trimmed !== '') {
      style.fontFamily = trimmed;
    }
  }

  // 2. fontSize: number -> 'px', string -> as-is, object with min/vw/max -> clamp(...)
  if (settings?.fontSize !== undefined && settings?.fontSize !== null && settings?.fontSize !== '') {
    if (typeof settings.fontSize === 'object') {
      const clampStr = formatClampFontSize(settings.fontSize as any);
      if (clampStr) {
        style.fontSize = clampStr;
      }
    } else if (typeof settings.fontSize === 'number') {
      style.fontSize = `${settings.fontSize}px`;
    } else if (typeof settings.fontSize === 'string') {
      const trimmed = settings.fontSize.trim();
      if (trimmed !== '') {
        if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
          style.fontSize = `${trimmed}px`;
        } else {
          style.fontSize = trimmed;
        }
      }
    }
  }

  // 3. fontWeight: 100..900
  if (settings?.fontWeight !== undefined && settings?.fontWeight !== null && settings?.fontWeight !== '') {
    const fwStr = String(settings.fontWeight).trim();
    if (fwStr !== '') {
      style.fontWeight = fwStr;
    }
  }

  // 4. lineHeight: number < 3 -> relative (as-is), >= 3 -> 'px'
  if (settings?.lineHeight !== undefined && settings?.lineHeight !== null && settings?.lineHeight !== '') {
    if (typeof settings.lineHeight === 'number') {
      if (settings.lineHeight < 3) {
        style.lineHeight = String(settings.lineHeight);
      } else {
        style.lineHeight = `${settings.lineHeight}px`;
      }
    } else if (typeof settings.lineHeight === 'string') {
      const trimmed = settings.lineHeight.trim();
      if (trimmed !== '') {
        if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
          const num = Number(trimmed);
          if (num < 3) {
            style.lineHeight = trimmed;
          } else {
            style.lineHeight = `${trimmed}px`;
          }
        } else {
          style.lineHeight = trimmed;
        }
      }
    }
  }

  // Determine text content for Arabic check
  const textContent =
    (typeof textOverride === 'string' && textOverride.trim() !== ''
      ? textOverride
      : (typeof settings?.text === 'string' && settings.text.trim() !== ''
        ? settings.text
        : (typeof settings?.content === 'string' && settings.content.trim() !== ''
          ? settings.content
          : (typeof settings?.label === 'string' && settings.label.trim() !== ''
            ? settings.label
            : ''))));

  const isArabicText = ARABIC_CHAR_REGEX.test(textContent);

  // 5. letterSpacing: number -> 'px', with Arabic default rule
  const hasUserLetterSpacing =
    settings?.letterSpacing !== undefined &&
    settings?.letterSpacing !== null &&
    settings?.letterSpacing !== '';

  if (hasUserLetterSpacing) {
    if (typeof settings!.letterSpacing === 'number') {
      style.letterSpacing = `${settings!.letterSpacing}px`;
    } else if (typeof settings!.letterSpacing === 'string') {
      const trimmed = settings!.letterSpacing.trim();
      if (trimmed !== '') {
        if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
          style.letterSpacing = `${trimmed}px`;
        } else {
          style.letterSpacing = trimmed;
        }
      }
    }
  } else if (isArabicText) {
    style.letterSpacing = '0px';
  }

  // 6. textTransform: none/uppercase/lowercase/capitalize
  if (typeof settings?.textTransform === 'string') {
    const trimmed = settings.textTransform.trim().toLowerCase();
    if (trimmed !== '') {
      style.textTransform = trimmed as React.CSSProperties['textTransform'];
    }
  }

  // 7. textDecoration: none/underline/line-through
  if (typeof settings?.textDecoration === 'string') {
    const trimmed = settings.textDecoration.trim().toLowerCase();
    if (trimmed !== '') {
      style.textDecoration = trimmed as React.CSSProperties['textDecoration'];
    }
  }

  // 8. textAlign: start/center/end
  if (typeof settings?.textAlign === 'string') {
    const trimmed = settings.textAlign.trim().toLowerCase();
    if (trimmed !== '') {
      style.textAlign = trimmed as React.CSSProperties['textAlign'];
    }
  }

  // 9. fontStyle: normal/italic
  if (typeof settings?.fontStyle === 'string') {
    const trimmed = settings.fontStyle.trim().toLowerCase();
    if (trimmed !== '') {
      style.fontStyle = trimmed as React.CSSProperties['fontStyle'];
    }
  }

  // 10. color: never modify default accent when empty/undefined
  if (typeof settings?.color === 'string') {
    const trimmed = settings.color.trim();
    if (trimmed !== '') {
      style.color = trimmed === 'accent' ? 'var(--store-accent, #2563eb)' : trimmed;
    }
  }

  return style;
}

/**
 * Applies letter-spacing with 'important' priority to a DOM element,
 * protecting against global CSS resets such as `[dir="rtl"] * { letter-spacing: normal !important; }`.
 */
export function applyElementLetterSpacing(
  node: HTMLElement | null,
  letterSpacing?: string | number,
): void {
  if (!node) return;
  if (letterSpacing !== undefined && letterSpacing !== null && letterSpacing !== '') {
    const val = typeof letterSpacing === 'number' ? `${letterSpacing}px` : String(letterSpacing);
    node.style.setProperty('letter-spacing', val, 'important');
  } else {
    node.style.removeProperty('letter-spacing');
  }
}

/**
 * React hook that returns a ref callback to synchronize letter-spacing with !important priority
 * on the DOM element, ensuring compatibility with RTL global stylesheets and computed style inspections.
 */
export function useElementTypographyRef(letterSpacing?: string | number) {
  const nodeRef = React.useRef<HTMLElement | null>(null);

  const refCallback = React.useCallback(
    (node: HTMLElement | null) => {
      nodeRef.current = node;
      if (node) {
        applyElementLetterSpacing(node, letterSpacing);
      }
    },
    [letterSpacing],
  );

  React.useEffect(() => {
    if (nodeRef.current) {
      applyElementLetterSpacing(nodeRef.current, letterSpacing);
    }
  }, [letterSpacing]);

  return refCallback;
}
