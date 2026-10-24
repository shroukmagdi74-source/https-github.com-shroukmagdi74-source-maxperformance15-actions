/* @vitest-environment jsdom */

import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import {
  buildElementTypographyStyle,
} from '../sections/elements/elementTypography';
import HeadingElement from '../sections/elements/HeadingElement';
import TextElement from '../sections/elements/TextElement';
import ButtonElement from '../sections/elements/ButtonElement';

describe('Storefront Ticket TYPE-2: Typography for Elements', () => {
  afterEach(() => {
    cleanup();
  });

  // 1. fontSize: 20 -> "20px" & "1.5rem" -> "1.5rem"
  it('1. converts numeric fontSize to "px" and preserves string units as-is', () => {
    const numStyle = buildElementTypographyStyle({ fontSize: 20 });
    expect(numStyle.fontSize).toBe('20px');

    const strStyle = buildElementTypographyStyle({ fontSize: '1.5rem' });
    expect(strStyle.fontSize).toBe('1.5rem');
  });

  // 2. fontWeight: 700 -> "700"
  it('2. converts numeric fontWeight 700 to "700"', () => {
    const style = buildElementTypographyStyle({ fontWeight: 700 });
    expect(style.fontWeight).toBe('700');
  });

  // 3. lineHeight: 1.6 -> "1.6" & 28 -> "28px"
  it('3. converts lineHeight < 3 to relative unit and >= 3 to "px"', () => {
    const relativeStyle = buildElementTypographyStyle({ lineHeight: 1.6 });
    expect(relativeStyle.lineHeight).toBe('1.6');

    const pxStyle = buildElementTypographyStyle({ lineHeight: 28 });
    expect(pxStyle.lineHeight).toBe('28px');
  });

  // 4. letterSpacing: 2 -> "2px"
  it('4. converts numeric letterSpacing 2 to "2px"', () => {
    const style = buildElementTypographyStyle({ letterSpacing: 2 });
    expect(style.letterSpacing).toBe('2px');
  });

  // 5. نص عربي بدون letterSpacing -> "0px"
  it('5. sets letterSpacing to "0px" for Arabic text when letterSpacing is not specified', () => {
    const styleWithTextInSettings = buildElementTypographyStyle({ text: 'عنوان تجريبي للمتجر' });
    expect(styleWithTextInSettings.letterSpacing).toBe('0px');

    const styleWithTextOverride = buildElementTypographyStyle({}, 'أهلاً وسهلاً');
    expect(styleWithTextOverride.letterSpacing).toBe('0px');
  });

  // 6. نص عربي بـletterSpacing:1 -> "1px" (يحترم المستخدم)
  it('6. respects user-provided letterSpacing: 1 ("1px") even for Arabic text', () => {
    const style = buildElementTypographyStyle({
      text: 'عنوان عربي مخصص',
      letterSpacing: 1,
    });
    expect(style.letterSpacing).toBe('1px');
  });

  // 7. نص إنجليزي بدون letterSpacing -> مفيش letterSpacing
  it('7. does not add letterSpacing for English text when not specified', () => {
    const style = buildElementTypographyStyle({ text: 'Summer Sale 2026' });
    expect(style.letterSpacing).toBeUndefined();
    expect('letterSpacing' in style).toBe(false);
  });

  // 8. textTransform + textDecoration + fontStyle + color تُترجم صح
  it('8. correctly translates textTransform, textDecoration, fontStyle, and color', () => {
    const style = buildElementTypographyStyle({
      textTransform: 'uppercase',
      textDecoration: 'underline',
      fontStyle: 'italic',
      color: '#ff0000',
    });
    expect(style.textTransform).toBe('uppercase');
    expect(style.textDecoration).toBe('underline');
    expect(style.fontStyle).toBe('italic');
    expect(style.color).toBe('#ff0000');
  });

  // 9. الحقول الفاضية -> الناتج {} (أو بدون الخصائص دي)
  it('9. returns an empty object {} when settings are empty or undefined', () => {
    const emptyStyle = buildElementTypographyStyle({});
    expect(Object.keys(emptyStyle)).toHaveLength(0);

    const undefinedStyle = buildElementTypographyStyle(undefined);
    expect(Object.keys(undefinedStyle)).toHaveLength(0);

    const emptyFieldsStyle = buildElementTypographyStyle({
      fontFamily: '',
      color: '',
      fontSize: '',
    });
    expect(Object.keys(emptyFieldsStyle)).toHaveLength(0);
  });

  // 10. (تكامل) HeadingElement بيرندر style فيه font-size من settings
  it('10. (integration) HeadingElement renders style with fontSize from settings', () => {
    render(
      <HeadingElement
        settings={{
          text: 'عنوان التكامل الرئيسي',
          fontSize: 34,
          fontWeight: 800,
          color: '#ff0000',
        }}
      />
    );

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeDefined();
    expect(heading.style.fontSize).toBe('34px');
    expect(heading.style.fontWeight).toBe('800');
    expect(heading.style.color).toBe('rgb(255, 0, 0)');
    // Default Arabic text without explicit letterSpacing must have letter-spacing: 0px
    expect(heading.style.letterSpacing).toBe('0px');
  });

  // 11. (تكامل) HeadingElement مع معايير قبول المدير
  it('11. (acceptance) HeadingElement matches manager criteria for fontSize:34, fontWeight:800, color:#ff0000 and Arabic 0px letterSpacing', () => {
    render(
      <HeadingElement
        settings={{
          text: 'أفضل العروض الحصرية',
          fontSize: 34,
          fontWeight: 800,
          color: '#ff0000',
        }}
      />
    );

    const heading = screen.getByRole('heading');
    expect(heading.style.fontSize).toBe('34px');
    expect(heading.style.fontWeight).toBe('800');
    expect(heading.style.color).toBe('rgb(255, 0, 0)');
    expect(heading.style.letterSpacing).toBe('0px');
  });

  // 12. (تكامل) TextElement renders custom typography properties
  it('12. (integration) TextElement renders custom typography properties correctly', () => {
    render(
      <TextElement
        settings={{
          content: 'فقرة وصفية باللغة العربية',
          fontSize: 18,
          lineHeight: 1.7,
          fontStyle: 'italic',
        }}
      />
    );

    const textEl = screen.getByText('فقرة وصفية باللغة العربية');
    expect(textEl).toBeDefined();
    expect(textEl.style.fontSize).toBe('18px');
    expect(textEl.style.lineHeight).toBe('1.7');
    expect(textEl.style.fontStyle).toBe('italic');
    expect(textEl.style.letterSpacing).toBe('0px');
  });

  // 13. (تكامل) ButtonElement renders typography and preserves default accent color when color is omitted
  it('13. (integration) ButtonElement renders custom typography and preserves accent color when color is omitted', () => {
    render(
      <ButtonElement
        settings={{
          label: 'اشتر الآن',
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: 2,
        }}
      />
    );

    const buttonLink = screen.getByRole('link', { name: 'اشتر الآن' });
    expect(buttonLink).toBeDefined();
    expect(buttonLink.style.fontSize).toBe('16px');
    expect(buttonLink.style.fontWeight).toBe('700');
    expect(buttonLink.style.letterSpacing).toBe('2px');
    // Color should remain default #ffffff for primary variant
    expect(buttonLink.style.color).toBe('rgb(255, 255, 255)');
  });

  // 14. (تكامل) ButtonElement custom color overrides default color
  it('14. (integration) ButtonElement custom color overrides default color when provided', () => {
    render(
      <ButtonElement
        settings={{
          label: 'تواصل معنا',
          color: '#10b981',
        }}
      />
    );

    const buttonLink = screen.getByRole('link', { name: 'تواصل معنا' });
    expect(buttonLink).toBeDefined();
    expect(buttonLink.style.color).toBe('rgb(16, 185, 129)');
  });
});
