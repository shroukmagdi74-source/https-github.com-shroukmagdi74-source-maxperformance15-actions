// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OfferBento from '../OfferBento';
import {
  parseCards,
  normalizeOfferBentoVariant,
  DEFAULT_CARDS,
  resolveOfferSignals,
} from '../offer-bento/types';

// Mock dependencies
let mockTheme = {
  id: 'default',
  name: 'Default Store',
  direction: 'rtl',
};

vi.mock('../../engine/ThemeProvider', () => ({
  useStorefrontTheme: () => ({
    theme: mockTheme,
  }),
}));

vi.mock('../../components/StorefrontProductImage', () => ({
  default: ({ alt, candidates, className }: any) => (
    <img alt={alt} src={candidates?.[0]} className={className} data-testid="storefront-product-image" />
  ),
}));

describe('OfferBento - Modular Storefront Suite', () => {
  beforeEach(() => {
    mockTheme = {
      id: 'default',
      name: 'Default Store',
      direction: 'rtl',
    };
  });

  afterEach(() => {
    cleanup();
  });

  const renderOfferBento = (props = {}) => {
    return render(
      <MemoryRouter>
        <OfferBento
          section={{
            id: 'offer-bento-sec-1',
            type: 'offer-bento',
            variant: 'category-promo',
            settings: {},
          }}
          settings={{}}
          {...props}
        />
      </MemoryRouter>,
    );
  };

  it('renders default standard bento layout with badge, title, subtitle, and cards', () => {
    renderOfferBento();

    // Default badge
    expect(screen.getByText('عروض هذا الأسبوع')).toBeDefined();
    // Default title
    expect(screen.getByText('اختيارات سريعة قبل أن تنفد الكمية')).toBeDefined();
    // Default cards
    expect(screen.getByText('الأكثر طلبًا هذا الأسبوع')).toBeDefined();
    expect(screen.getByText('وفر أكثر عند الجمع')).toBeDefined();
    expect(screen.getByText('الشحن والمتابعة قبل الدفع')).toBeDefined();
  });

  it('renders editorial-columns variant with appropriate angle labels and signals', () => {
    renderOfferBento({
      section: { variant: 'editorial-columns' },
    });

    expect(screen.getByText('اختيارات سريعة قبل أن تنفد الكمية')).toBeDefined();
    expect(screen.getByText('الأكثر طلبًا هذا الأسبوع')).toBeDefined();
    expect(screen.getByText('وفر أكثر عند الجمع')).toBeDefined();
  });

  it('renders bundle-matrix variant with package items and notes', () => {
    renderOfferBento({
      section: { variant: 'bundle-matrix' },
      settings: {
        badge: 'باقات مجمعة',
        title: 'باقات الأداء والعمل',
      },
    });

    expect(screen.getByText('باقات مجمعة')).toBeDefined();
    expect(screen.getByText('باقات الأداء والعمل')).toBeDefined();
    expect(screen.getAllByText('Bundle logic').length).toBeGreaterThan(0);
  });

  it('renders boutique-duo variant with 2 cards', () => {
    renderOfferBento({
      section: { variant: 'boutique-duo' },
      settings: {
        cards: [
          {
            title: 'مجموعة الصيف الراقية',
            subtitle: 'تصاميم صيفية أنيقة وخفيفة',
            link: '/summer',
          },
          {
            title: 'حقائب جلدية فاخرة',
            subtitle: 'جلد طبيعي وصناعة يدوية',
            link: '/bags',
          },
        ],
      },
    });

    expect(screen.getByText('مجموعة الصيف الراقية')).toBeDefined();
    expect(screen.getByText('حقائب جلدية فاخرة')).toBeDefined();
  });

  it('renders campaign-stack variant with primary lead card and secondary stacked items', () => {
    renderOfferBento({
      section: { variant: 'campaign-stack' },
      settings: {
        cards: [
          {
            title: 'العرض الأسبوعي الأكبر',
            subtitle: 'خصومات مميزة على جميع المنتجات الأساسية',
            link: '/special-offer',
            label: 'توفير استثنائي',
          },
          {
            title: 'حذاء كلاسيك أبيض',
            subtitle: 'أعلى تقييم للشهر الحالي',
            link: '/shoes/classic',
          },
        ],
      },
    });

    expect(screen.getByText('العرض الأسبوعي الأكبر')).toBeDefined();
    expect(screen.getByText('حذاء كلاسيك أبيض')).toBeDefined();
  });

  it('renders district-market layout when district-market theme is active', () => {
    mockTheme = {
      id: 'district-market',
      name: 'District Market Store',
      direction: 'rtl',
    };

    renderOfferBento({
      settings: {
        cards: [
          {
            title: 'توصيل مجاني لطلبات السوبرماركت',
            subtitle: 'استمتع بشحن مجاني عند الشراء بأكثر من 500 جنيه',
            link: '/free-delivery',
            stat: 'توصيل خلال ساعة',
          },
        ],
      },
    });

    expect(screen.getByText('توصيل مجاني لطلبات السوبرماركت')).toBeDefined();
    expect(screen.getAllByText('توصيل خلال ساعة').length).toBeGreaterThan(0);
  });

  it('validates card parser, variant normalizer, and signal helpers', () => {
    // Normalizer
    expect(normalizeOfferBentoVariant('editorial-columns')).toBe('editorial-columns');
    expect(normalizeOfferBentoVariant('bundle-matrix')).toBe('bundle-matrix');
    expect(normalizeOfferBentoVariant('boutique-duo')).toBe('boutique-duo');
    expect(normalizeOfferBentoVariant('invalid-variant')).toBe('category-promo');

    // Parser with piped string
    const pipedCards = parseCards(`عرض اليوم | باقة التوفير | وفر 20% | تسوق الآن | /deals`);
    expect(pipedCards.length).toBe(1);
    expect(pipedCards[0].title).toBe('باقة التوفير');
    expect(pipedCards[0].subtitle).toBe('وفر 20%');

    // Parser fallback
    const fallbackCards = parseCards(null);
    expect(fallbackCards).toEqual(DEFAULT_CARDS);

    // Signals resolver
    const signals = resolveOfferSignals(
      {
        title: 'عرض شحن مجاني واستبدال',
        subtitle: 'ثقة وأمان',
        link: '/trust',
      },
      0,
    );
    expect(signals.length).toBeGreaterThan(0);
  });
});
