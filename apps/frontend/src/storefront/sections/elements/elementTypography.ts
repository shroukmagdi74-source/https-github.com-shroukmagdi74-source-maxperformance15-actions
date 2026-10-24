import React from 'react';

export interface ElementTypographySettings {
  fontFamily?: string;
  fontSize?: number | string;
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

  // 2. fontSize: number -> 'px', string -> as-is
  if (settings?.fontSize !== undefined && settings?.fontSize !== null && settings?.fontSize !== '') {
    if (typeof settings.fontSize === 'number') {
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
    textOverride ??
    (typeof settings?.text === 'string'
      ? settings.text
      : typeof settings?.content === 'string'
      ? settings.content
      : typeof settings?.label === 'string'
      ? settings.label
      : '');

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
