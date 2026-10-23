/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { StorefrontHead, __resetStorefrontHeadStateForTests__ } from '../engine/StorefrontHead';

// Shared mocks
let currentThemeMock: any = null;
let currentSettingsMock: any = null;

vi.mock('../engine/ThemeProvider', () => ({
  useStorefrontTheme: () => ({
    theme: currentThemeMock,
  }),
}));

vi.mock('../hooks/useStorefrontSettings', () => ({
  useStorefrontSettings: () => ({
    settings: currentSettingsMock,
  }),
}));

describe('Ticket PAGE-1.3: Storefront SEO Application, Proof Marker & Multi-Source Diagnosis', () => {
  beforeEach(() => {
    __resetStorefrontHeadStateForTests__();
    document.title = 'max-p';
    document.documentElement.removeAttribute('data-seo-applied');
    document.documentElement.removeAttribute('data-storefront-seo');
    document.head.querySelectorAll('meta, link[rel="canonical"]').forEach((el) => el.remove());

    currentThemeMock = {
      id: 'modern-minimal',
      name: 'max-p',
      direction: 'rtl',
      tokens: { colors: {}, typography: {}, shape: {} },
      header: { brandName: 'max-p' },
      pages: {
        home: {
          id: 'home',
          title: 'الرئيسية',
          sections: [{ key: 'hero-1', type: 'hero-banner' }],
        },
      },
    };

    currentSettingsMock = {
      company: {
        id: 'comp-1',
        name: 'max-p',
        slug: 'max-p',
        currency: 'EGP',
        settings: { description: 'الوصف الأصلي للمتجر' },
      },
      storefront: {
        themeId: 'modern-minimal',
        settings: {
          storeName: 'متجر max-p',
          currency: 'EGP',
        },
        designTokens: {
          pages: {
            home: {
              seo: {
                title: 'عروض الصيف — متجر max-p',
                description: 'أقوى وأفضل عروض وتخفيضات الصيف الحصرية في متجر max-p',
                noindex: true,
                canonical: 'https://max-p.maxp.online/summer-deals',
                ogImage: 'https://max-p.maxp.online/og-summer.jpg',
              },
            },
          },
        },
      },
    };
  });

  afterEach(() => {
    cleanup();
    __resetStorefrontHeadStateForTests__();
    document.documentElement.removeAttribute('data-seo-applied');
    document.documentElement.removeAttribute('data-storefront-seo');
  });

  // Test 1: Title application and data-seo-applied proof marker
  it('1. applies page title and marks documentElement with data-seo-applied="1"', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontHead />
      </MemoryRouter>
    );

    expect(document.title).toBe('عروض الصيف — متجر max-p');
    expect(document.documentElement.getAttribute('data-seo-applied')).toBe('1');
    expect(document.documentElement.getAttribute('data-storefront-seo')).toBe('home');
  });

  // Test 2: Robots meta tag with noindex: true sets noindex, nofollow
  it('2. sets meta[name="robots"] to "noindex, nofollow" when seo.noindex is true', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontHead />
      </MemoryRouter>
    );

    const robotsEl = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    expect(robotsEl).not.toBeNull();
    expect(robotsEl?.getAttribute('content')).toBe('noindex, nofollow');
  });

  // Test 3: Robots meta tag with noindex: false sets index, follow, max-image-preview:large
  it('3. sets meta[name="robots"] to "index, follow, max-image-preview:large" when seo.noindex is false', () => {
    currentSettingsMock.storefront.designTokens.pages.home.seo.noindex = false;

    render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontHead />
      </MemoryRouter>
    );

    const robotsEl = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    expect(robotsEl).not.toBeNull();
    expect(robotsEl?.getAttribute('content')).toBe('index, follow, max-image-preview:large');
  });

  // Test 4: Description meta tag applied from saved page seo
  it('4. sets meta[name="description"] to the saved page description', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontHead />
      </MemoryRouter>
    );

    const descEl = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    expect(descEl).not.toBeNull();
    expect(descEl?.getAttribute('content')).toBe('أقوى وأفضل عروض وتخفيضات الصيف الحصرية في متجر max-p');
  });

  // Test 5: Canonical URL tag applied from saved seo.canonical
  it('5. sets link[rel="canonical"] to saved canonical URL', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontHead />
      </MemoryRouter>
    );

    const canonicalEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    expect(canonicalEl).not.toBeNull();
    expect(canonicalEl?.getAttribute('href')).toBe('https://max-p.maxp.online/summer-deals');
  });

  // Test 6: OpenGraph and Twitter card tags applied correctly
  it('6. applies og:title, og:description, og:image, and twitter tags from seo', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontHead />
      </MemoryRouter>
    );

    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    const ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
    const twitterCard = document.querySelector<HTMLMetaElement>('meta[name="twitter:card"]');
    const twitterImage = document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]');

    expect(ogTitle?.getAttribute('content')).toBe('عروض الصيف — متجر max-p');
    expect(ogDesc?.getAttribute('content')).toBe('أقوى وأفضل عروض وتخفيضات الصيف الحصرية في متجر max-p');
    expect(ogImage?.getAttribute('content')).toBe('https://max-p.maxp.online/og-summer.jpg');
    expect(twitterCard?.getAttribute('content')).toBe('summary_large_image');
    expect(twitterImage?.getAttribute('content')).toBe('https://max-p.maxp.online/og-summer.jpg');
  });

  // Test 7: Page without SEO falls back to default store metadata
  it('7. falls back to default store metadata on pages without custom seo', () => {
    render(
      <MemoryRouter initialEntries={['/shop']}>
        <StorefrontHead />
      </MemoryRouter>
    );

    expect(document.title).toBe('المتجر | متجر max-p');
    const robotsEl = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    expect(robotsEl?.getAttribute('content')).toBe('index, follow, max-image-preview:large');
    expect(document.documentElement.getAttribute('data-seo-applied')).toBe('1');
    expect(document.documentElement.getAttribute('data-storefront-seo')).toBe('shop');
  });

  // Test 8: Unmount cleanup restores previous DOM head state and removes proof marker
  it('8. restores original document.title and meta tags upon unmount', () => {
    document.title = 'Initial Storefront Page';
    const initRobots = document.createElement('meta');
    initRobots.setAttribute('name', 'robots');
    initRobots.setAttribute('content', 'index, follow');
    document.head.appendChild(initRobots);

    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontHead />
      </MemoryRouter>
    );

    expect(document.title).toBe('عروض الصيف — متجر max-p');
    expect(document.documentElement.getAttribute('data-seo-applied')).toBe('1');

    unmount();

    expect(document.title).toBe('Initial Storefront Page');
    expect(document.documentElement.getAttribute('data-seo-applied')).toBeNull();
    const finalRobots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    expect(finalRobots?.getAttribute('content')).toBe('index, follow');
  });

  // Test 9: Props override context directly (used by StorefrontShell) even when theme is null/loading
  it('9. applies SEO immediately from settings prop even when theme is null', () => {
    currentThemeMock = null; // theme is still resolving asynchronously
    currentSettingsMock = null; // context settings not yet available

    const explicitSettings = {
      company: { name: 'max-p' },
      storefront: {
        settings: { storeName: 'متجر max-p' },
        designTokens: {
          pages: {
            home: {
              seo: {
                title: 'عروض الصيف المباشرة — متجر max-p',
                noindex: true,
                description: 'عروض حصرية مباشرة من الإعدادات',
              },
            },
          },
        },
      },
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontHead settings={explicitSettings} activePageKey="home" />
      </MemoryRouter>
    );

    expect(document.title).toBe('عروض الصيف المباشرة — متجر max-p');
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    expect(robots?.getAttribute('content')).toBe('noindex, nofollow');
    expect(document.documentElement.getAttribute('data-seo-applied')).toBe('1');
  });
});
