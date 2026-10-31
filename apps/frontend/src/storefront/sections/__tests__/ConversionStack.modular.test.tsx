// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ConversionStack from '../ConversionStack';
import {
  clamp,
  hashProductSeed,
  interpolateCount,
  interpolateTemplate,
  formatCountdownParts,
  formatDateRange,
  resolveStandaloneConversionBlock,
  resolveDirectionalCopy,
  normalizeConversionStackVariant,
  asRecord,
} from '../conversion-stack/types';

// Mock dependencies
let mockProduct: any = {
  id: 'prod-123',
  name: 'Premium Leather Jacket',
  stock: 4,
  soldCount: 42,
  socialProof: {
    soldCount: 42,
    activeCartCount: 5,
    recentPurchases: 8,
  },
  volumeDiscounts: [
    { minQuantity: 2, percentage: 10 },
    { minQuantity: 3, percentage: 15 },
  ],
};

let mockIsLoading = false;

let mockStorefrontSettings: any = {
  storefront: {
    settings: {
      currency: 'EGP',
    },
    apps: {
      'conversion-suite': {
        enabled: true,
        settings: {
          modules: {
            lowStockNotice: true,
            saleCountdown: true,
            estimatedDelivery: true,
            trustedBadges: true,
            fakeVisitorCounter: true,
            soldCounter: true,
            purchaseFomo: true,
            bulkSavings: true,
          },
          thresholds: {
            lowStockLimit: 10,
            fakeVisitorMin: 5,
            fakeVisitorMax: 20,
          },
          countdown: {
            endsAt: new Date(Date.now() + 86400000).toISOString(),
            label: 'ينتهي العرض الخاص خلال',
          },
          estimatedDelivery: {
            minDays: 2,
            maxDays: 4,
            label: 'التوصيل السريع إلى باب منزلك',
          },
          copy: {
            trustedBadgeTitle: 'تسوق بأمان 100%',
            trustedBadgeSubtitle: 'دفع عند الاستلام وضمان استبدال واسترجاع مرن',
          },
        },
      },
      'commerce-advanced': {
        enabled: true,
        settings: {
          modules: {
            preOrder: false,
          },
        },
      },
    },
  },
};

let mockTheme = {
  id: 'swan-default',
  name: 'Swan Commerce',
  direction: 'rtl',
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'prod-123' }),
  };
});

vi.mock('../../hooks/useProduct', () => ({
  useProduct: () => ({
    product: mockProduct,
    isLoading: mockIsLoading,
  }),
}));

vi.mock('../../hooks/useStorefrontSettings', () => ({
  useStorefrontSettings: () => ({
    settings: mockStorefrontSettings,
  }),
}));

vi.mock('../../engine/ThemeProvider', () => ({
  useStorefrontTheme: () => ({
    theme: mockTheme,
  }),
}));

vi.mock('../../utils/appUsageTracking', () => ({
  trackStorefrontAppUsage: vi.fn(),
}));

vi.mock('../../../utils/productPageCheckout', () => ({
  isProductPageCheckoutEnabledForProduct: () => false,
}));

describe('ConversionStack - Modular Storefront Suite', () => {
  beforeEach(() => {
    mockIsLoading = false;
    mockProduct = {
      id: 'prod-123',
      name: 'Premium Leather Jacket',
      stock: 4,
      soldCount: 42,
      socialProof: {
        soldCount: 42,
        activeCartCount: 5,
        recentPurchases: 8,
      },
      volumeDiscounts: [
        { minQuantity: 2, percentage: 10 },
        { minQuantity: 3, percentage: 15 },
      ],
    };
    mockTheme = {
      id: 'swan-default',
      name: 'Swan Commerce',
      direction: 'rtl',
    };
  });

  afterEach(() => {
    cleanup();
  });

  const renderConversionStack = (props: any = {}) => {
    return render(
      <MemoryRouter>
        <ConversionStack
          section={{
            id: 'conversion-stack-sec-1',
            type: 'conversion-stack',
            variant: 'balanced',
            settings: {},
          }}
          settings={{}}
          {...props}
        />
      </MemoryRouter>,
    );
  };

  describe('Pure Normalizers & Calculation Helpers', () => {
    it('clamp correctly restricts numbers within min and max', () => {
      expect(clamp(5, 10, 20)).toBe(10);
      expect(clamp(25, 10, 20)).toBe(20);
      expect(clamp(15, 10, 20)).toBe(15);
    });

    it('hashProductSeed produces deterministic positive integers', () => {
      const seed1 = hashProductSeed('prod-abc');
      const seed2 = hashProductSeed('prod-abc');
      const seed3 = hashProductSeed('prod-xyz');
      expect(seed1).toBe(seed2);
      expect(seed1).toBeGreaterThanOrEqual(0);
      expect(typeof seed3).toBe('number');
    });

    it('interpolateCount replaces {count} placeholder with string or fallback', () => {
      expect(interpolateCount('{count} عملاء', 12, 'افتراضي')).toBe('12 عملاء');
      expect(interpolateCount(undefined, 12, 'افتراضي')).toBe('افتراضي');
    });

    it('interpolateTemplate replaces multiple tokens properly', () => {
      const template = '{count} طلبات خلال {hours} ساعة';
      const output = interpolateTemplate(template, { count: 15, hours: 24 }, 'fallback');
      expect(output).toBe('15 طلبات خلال 24 ساعة');
    });

    it('formatCountdownParts calculates remaining time correctly', () => {
      const futureDate = new Date(Date.now() + 3600 * 2000).toISOString();
      const parts = formatCountdownParts(futureDate);
      expect(parts).not.toBeNull();
      if (parts) {
        expect(parts.hours).toBeGreaterThanOrEqual(0);
        expect(parts.minutes).toBeGreaterThanOrEqual(0);
      }
    });

    it('formatDateRange formats dates gracefully', () => {
      const range = formatDateRange(2, 4, 'ar-EG');
      expect(typeof range).toBe('string');
      expect(range.length).toBeGreaterThan(0);
    });

    it('resolveStandaloneConversionBlock resolves block ids correctly', () => {
      expect(resolveStandaloneConversionBlock('delivery-proof')).toBe('delivery');
      expect(resolveStandaloneConversionBlock('bulk-savings')).toBe('bulk-savings');
      expect(resolveStandaloneConversionBlock('conversion-stack')).toBeNull();
    });

    it('resolveDirectionalCopy picks Arabic when RTL', () => {
      const text = resolveDirectionalCopy({
        value: undefined,
        englishFallback: 'English',
        arabicFallback: 'عربي',
        prefersArabicCopy: true,
      });
      expect(text).toBe('عربي');
    });

    it('normalizeConversionStackVariant validates allowed variants', () => {
      expect(normalizeConversionStackVariant('couture-minimal')).toBe('couture-minimal');
      expect(normalizeConversionStackVariant('editorial')).toBe('editorial');
      expect(normalizeConversionStackVariant('unknown')).toBe('balanced');
    });

    it('asRecord safely wraps non-object values', () => {
      expect(asRecord(null)).toEqual({});
      expect(asRecord(undefined)).toEqual({});
      expect(asRecord({ key: 'val' })).toEqual({ key: 'val' });
    });
  });

  describe('Component Rendering & Behavioral Layers', () => {
    it('returns null when loading or product is null', () => {
      mockIsLoading = true;
      const { container } = renderConversionStack();
      expect(container.firstChild).toBeNull();
    });

    it('renders full conversion stack with all layers when enabled', () => {
      renderConversionStack();
      expect(screen.getByTestId('conversion-stack')).toBeDefined();

      // Urgency Ticker / Low Stock Notice
      expect(screen.getByText(/الكمية محدودة/)).toBeDefined();
      expect(screen.getByText(/4 متبقية/)).toBeDefined();

      // Estimated Delivery
      expect(screen.getByText('التوصيل السريع إلى باب منزلك')).toBeDefined();

      // Trusted Checkout Reassurance
      expect(screen.getByText('تسوق بأمان 100%')).toBeDefined();
      expect(screen.getByText('دفع عند الاستلام وضمان استبدال واسترجاع مرن')).toBeDefined();

      // Pulse Row & Layers
      expect(screen.getByTestId('conversion-pulse-row')).toBeDefined();
      expect(screen.getByTestId('conversion-urgency-ticker')).toBeDefined();
      expect(screen.getByTestId('conversion-confidence-grid')).toBeDefined();
    });

    it('renders standalone mode cleanly when section.type is delivery-proof', () => {
      renderConversionStack({
        section: {
          id: 'sec-del-1',
          type: 'delivery-proof',
          variant: 'balanced',
          settings: {},
        },
      });

      expect(screen.getByTestId('conversion-section-delivery-proof')).toBeDefined();
      expect(screen.getByText('التوصيل السريع إلى باب منزلك')).toBeDefined();
    });

    it('renders couture-minimal variant with correct stylistic structure', () => {
      renderConversionStack({
        section: {
          id: 'sec-couture-1',
          type: 'conversion-stack',
          variant: 'couture-minimal',
          settings: {},
        },
        settings: {
          title: 'ثقة وأمان المتجر',
          subtitle: 'معلومات الشحن وضمان الطلب',
        },
      });

      expect(screen.getByText('ثقة وأمان المتجر')).toBeDefined();
      expect(screen.getByText('معلومات الشحن وضمان الطلب')).toBeDefined();
    });

    it('renders volume discount footer when bulkSavings is enabled', () => {
      renderConversionStack();
      expect(screen.getByTestId('conversion-footer')).toBeDefined();
    });
  });
});
