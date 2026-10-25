/* @vitest-environment jsdom */

import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import HeadingElement from '../sections/elements/HeadingElement';
import TextElement from '../sections/elements/TextElement';
import ButtonElement from '../sections/elements/ButtonElement';
import {
  buildElementTypographyStyle,
  applyElementLetterSpacing,
} from '../sections/elements/elementTypography';

describe('Storefront Ticket TYPE-2.1: letter-spacing inline and live verification', () => {
  afterEach(() => {
    cleanup();
  });

  // 1. (تكامل HeadingElement) بايلود المدير الكامل مع letterSpacing: 1
  it('1. (integration - HeadingElement) applies inline letter-spacing: 1px on payload with letterSpacing: 1', () => {
    const { container } = render(
      <HeadingElement
        settings={{
          text: 'العنوان الرئيسي الكامل',
          fontSize: 34,
          fontWeight: 800,
          color: '#ff0000',
          textDecoration: 'underline',
          letterSpacing: 1,
        }}
      />
    );

    const h2 = container.querySelector('h2') as HTMLHeadingElement;
    expect(h2).not.toBeNull();
    expect(h2.style.letterSpacing).toBe('1px');
    expect(h2.style.fontSize).toBe('34px');
    expect(h2.style.fontWeight).toBe('800');
    expect(h2.style.color).toBe('rgb(255, 0, 0)');
    expect(h2.style.textDecoration).toBe('underline');
  });

  // 2. (تكامل HeadingElement) نص عربي بدون تباعد -> 0px
  it('2. (integration - HeadingElement) sets letter-spacing: 0px for Arabic text without user letterSpacing', () => {
    const { container } = render(
      <HeadingElement
        settings={{
          fontSize: 22,
          // default text is 'عنوان رئيسي' (Arabic)
        }}
      />
    );

    const h2 = container.querySelector('h2') as HTMLHeadingElement;
    expect(h2).not.toBeNull();
    expect(h2.style.letterSpacing).toBe('0px');
    expect(h2.style.fontSize).toBe('22px');
  });

  // 3. (تكامل HeadingElement) نص إنجليزي بدون تباعد -> مفيش خاصية (empty string)
  it('3. (integration - HeadingElement) leaves letter-spacing unset for English text without user letterSpacing', () => {
    const { container } = render(
      <HeadingElement
        settings={{
          text: 'Summer Sale 2026',
          fontSize: 28,
        }}
      />
    );

    const h2 = container.querySelector('h2') as HTMLHeadingElement;
    expect(h2).not.toBeNull();
    expect(h2.style.letterSpacing).toBe('');
    expect(h2.style.fontSize).toBe('28px');
  });

  // 4. (تكامل TextElement) نص مخصص بـ letterSpacing: 2 -> 2px
  it('4. (integration - TextElement) applies letter-spacing: 2px when letterSpacing: 2 is provided', () => {
    const { container } = render(
      <TextElement
        settings={{
          content: 'نص تجريبي مع تباعد صريح',
          fontSize: 16,
          letterSpacing: 2,
        }}
      />
    );

    const textEl = container.querySelector('[data-storefront-element="text"]') as HTMLElement;
    expect(textEl).not.toBeNull();
    expect(textEl.style.letterSpacing).toBe('2px');
    expect(textEl.style.fontSize).toBe('16px');
  });

  // 5. (تكامل TextElement) نص عربي بدون تباعد -> 0px
  it('5. (integration - TextElement) sets letter-spacing: 0px for Arabic content without user letterSpacing', () => {
    const { container } = render(
      <TextElement
        settings={{
          content: 'فقرة وصفية باللغة العربية بدون تباعد مخصص',
          fontSize: 18,
        }}
      />
    );

    const textEl = container.querySelector('[data-storefront-element="text"]') as HTMLElement;
    expect(textEl).not.toBeNull();
    expect(textEl.style.letterSpacing).toBe('0px');
    expect(textEl.style.fontSize).toBe('18px');
  });

  // 6. (تكامل TextElement) نص إنجليزي بدون تباعد -> مفيش خاصية
  it('6. (integration - TextElement) leaves letter-spacing unset for English content without user letterSpacing', () => {
    const { container } = render(
      <TextElement
        settings={{
          content: 'Premium Egyptian Cotton T-Shirt',
          fontSize: 15,
        }}
      />
    );

    const textEl = container.querySelector('[data-storefront-element="text"]') as HTMLElement;
    expect(textEl).not.toBeNull();
    expect(textEl.style.letterSpacing).toBe('');
    expect(textEl.style.fontSize).toBe('15px');
  });

  // 7. (تكامل ButtonElement) زر مخصص بـ letterSpacing: 1.5 -> 1.5px
  it('7. (integration - ButtonElement) applies letter-spacing: 1.5px to anchor element', () => {
    const { container } = render(
      <ButtonElement
        settings={{
          label: 'أضف للسلة الآن',
          letterSpacing: 1.5,
        }}
      />
    );

    const anchor = container.querySelector('a') as HTMLAnchorElement;
    expect(anchor).not.toBeNull();
    expect(anchor.style.letterSpacing).toBe('1.5px');
  });

  // 8. (تكامل ButtonElement) زر إنجليزي بدون تباعد -> مفيش خاصية
  it('8. (integration - ButtonElement) leaves letter-spacing unset for English label without letterSpacing', () => {
    const { container } = render(
      <ButtonElement
        settings={{
          label: 'Order Now',
        }}
      />
    );

    const anchor = container.querySelector('a') as HTMLAnchorElement;
    expect(anchor).not.toBeNull();
    expect(anchor.style.letterSpacing).toBe('');
  });

  // 9. (وظيفة مساعدة DOM) applyElementLetterSpacing sets important priority
  it('9. (helper) applyElementLetterSpacing sets priority important to resist global RTL stylesheet resets', () => {
    const el = document.createElement('div');
    applyElementLetterSpacing(el, '1px');
    expect(el.style.letterSpacing).toBe('1px');
    expect(el.style.getPropertyPriority('letter-spacing')).toBe('important');

    applyElementLetterSpacing(el, undefined);
    expect(el.style.letterSpacing).toBe('');
  });

  // 10. (وحدة buildElementTypographyStyle) التحقق من الدقة مع الأرقام والنصوص
  it('10. (unit) buildElementTypographyStyle handles string, number, and empty values accurately', () => {
    expect(buildElementTypographyStyle({ letterSpacing: 3 }).letterSpacing).toBe('3px');
    expect(buildElementTypographyStyle({ letterSpacing: '4px' }).letterSpacing).toBe('4px');
    expect(buildElementTypographyStyle({ letterSpacing: '' }).letterSpacing).toBeUndefined();
    expect(buildElementTypographyStyle({ text: 'English' }).letterSpacing).toBeUndefined();
    expect(buildElementTypographyStyle({ text: 'عربي' }).letterSpacing).toBe('0px');
  });
});
