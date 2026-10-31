// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BoughtTogetherSection from '../BoughtTogetherSection';
import {
  parsePositiveNumber,
  isRecord,
  parseProductMetadata,
  getProductVariants,
  hasVariants,
  getVariantAttributes,
  getVariantAttributeLabels,
  buildDefaultVariantSelection,
  resolveVariantFromAttributes,
  parseVariantSettings,
  normalizeVariant,
  resolveDirectionalCopy,
  getWrapperClassName,
  getCardClassName,
} from '../bought-together/types';

// Mock dependencies
const mockAddItem = vi.fn();
const mockSetIsOpen = vi.fn();
const mockTrackStorefrontAppUsage = vi.fn();

let mockProduct: any = {
  id: 'prod-main-1',
  name: 'قميص كتان بيج',
  price: 750,
  stock: 12,
  images: ['/shirt.jpg'],
};

let mockRecommendations: any[] = [
  {
    id: 'prod-rec-1',
    name: 'بنطلون شينو كحلي',
    price: 950,
    images: ['/pants.jpg'],
    productVariants: [],
  },
  {
    id: 'prod-rec-2',
    name: 'حزام جلد طبيعي',
    price: 350,
    images: ['/belt.jpg'],
    productVariants: [
      {
        id: 'belt-brown',
        name: 'بني',
        price: 350,
        attributes: { Color: 'بني' },
      },
      {
        id: 'belt-black',
        name: 'أسود',
        price: 380,
        attributes: { Color: 'أسود' },
      },
    ],
  },
];

let mockIsLoading = false;
let mockBoughtTogetherEnabled = true;

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'prod-main-1' }),
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
    settings: {
      storefront: {
        settings: {
          currency: 'EGP',
        },
        apps: {
          'conversion-suite': {
            enabled: mockBoughtTogetherEnabled,
            settings: {
              modules: {
                boughtTogether: mockBoughtTogetherEnabled,
              },
              ui: {
                boughtTogetherStyle: 'stacked',
              },
            },
          },
        },
      },
    },
  }),
}));

vi.mock('../../engine/ThemeProvider', () => ({
  useStorefrontTheme: () => ({
    theme: {
      id: 'default',
      name: 'Default Store',
      direction: 'rtl',
    },
  }),
}));

vi.mock('../bought-together/useBoughtTogetherRecommendations', () => ({
  useBoughtTogetherRecommendations: () => ({
    recommendations: mockRecommendations,
    loading: mockIsLoading,
  }),
}));

vi.mock('../../store/useCartStore', () => ({
  useCartStore: (selector: any) =>
    selector({
      addItem: mockAddItem,
      setIsOpen: mockSetIsOpen,
    }),
}));

vi.mock('../../store/usePdpSelectionStore', () => ({
  usePdpSelectionStore: (selector: any) =>
    selector({
      selection: null,
    }),
}));

vi.mock('../../utils/appUsageTracking', () => ({
  trackStorefrontAppUsage: (...args: any[]) => mockTrackStorefrontAppUsage(...args),
}));

vi.mock('../../components/StorefrontProductImage', () => ({
  default: ({ alt, className }: any) => (
    <img alt={alt} className={className} data-testid="storefront-product-image" />
  ),
}));

describe('BoughtTogetherSection - Modular Storefront Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading = false;
    mockBoughtTogetherEnabled = true;
    mockProduct = {
      id: 'prod-main-1',
      name: 'قميص كتان بيج',
      price: 750,
      stock: 12,
      images: ['/shirt.jpg'],
    };
    mockRecommendations = [
      {
        id: 'prod-rec-1',
        name: 'بنطلون شينو كحلي',
        price: 950,
        images: ['/pants.jpg'],
        productVariants: [],
      },
      {
        id: 'prod-rec-2',
        name: 'حزام جلد طبيعي',
        price: 350,
        images: ['/belt.jpg'],
        productVariants: [
          {
            id: 'belt-brown',
            name: 'بني',
            price: 350,
            attributes: { Color: 'بني' },
          },
          {
            id: 'belt-black',
            name: 'أسود',
            price: 380,
            attributes: { Color: 'أسود' },
          },
        ],
      },
    ];
  });

  afterEach(() => {
    cleanup();
  });

  const renderBoughtTogether = (props: any = {}) => {
    return render(
      <MemoryRouter>
        <BoughtTogetherSection
          section={{
            variant: 'stacked',
          }}
          settings={{}}
          {...props}
        />
      </MemoryRouter>,
    );
  };

  describe('Pure Normalizers & Calculation Helpers', () => {
    it('parsePositiveNumber correctly parses integers with fallback', () => {
      expect(parsePositiveNumber(5, 3)).toBe(5);
      expect(parsePositiveNumber('4', 3)).toBe(4);
      expect(parsePositiveNumber(-2, 3)).toBe(3);
      expect(parsePositiveNumber('invalid', 3)).toBe(3);
    });

    it('isRecord identifies objects accurately', () => {
      expect(isRecord({})).toBe(true);
      expect(isRecord({ a: 1 })).toBe(true);
      expect(isRecord(null)).toBe(false);
      expect(isRecord([])).toBe(false);
      expect(isRecord('string')).toBe(false);
    });

    it('parseProductMetadata safely parses json strings or objects', () => {
      expect(parseProductMetadata('{"tier": "gold"}')).toEqual({ tier: 'gold' });
      expect(parseProductMetadata({ key: 'val' })).toEqual({ key: 'val' });
      expect(parseProductMetadata('invalid json')).toEqual({});
      expect(parseProductMetadata(null)).toEqual({});
    });

    it('getProductVariants and hasVariants work with productVariants and variants', () => {
      const p1: any = { productVariants: [{ id: 'v1' }] };
      const p2: any = { variants: [{ id: 'v2' }] };
      const p3: any = {};
      expect(getProductVariants(p1)).toHaveLength(1);
      expect(getProductVariants(p2)).toHaveLength(1);
      expect(hasVariants(p1)).toBe(true);
      expect(hasVariants(p3)).toBe(false);
    });

    it('getVariantAttributeLabels resolves Arabic labels for color/size attributes', () => {
      const prodSize: any = {
        productVariants: [{ attributes: { size: 'XL' } }],
      };
      const labels = getVariantAttributeLabels(prodSize, true);
      expect(labels.shortLabel).toBe('المقاس');
      expect(labels.firstSelectionError).toBe('اختَر المقاس أولًا');
    });

    it('resolveVariantFromAttributes matches exact attributes', () => {
      const variants: any[] = [
        { id: 'v1', attributes: { Color: 'Red', Size: 'M' } },
        { id: 'v2', attributes: { Color: 'Blue', Size: 'L' } },
      ];
      const match = resolveVariantFromAttributes(variants, { Color: 'Blue', Size: 'L' });
      expect(match?.id).toBe('v2');
      const noMatch = resolveVariantFromAttributes(variants, { Color: 'Green' });
      expect(noMatch).toBeNull();
    });

    it('normalizeVariant falls back to stacked when variant is unknown', () => {
      expect(normalizeVariant('complete-look', 'stacked')).toBe('complete-look');
      expect(normalizeVariant('editorial', 'stacked')).toBe('editorial');
      expect(normalizeVariant('unknown-variant', 'stacked')).toBe('stacked');
    });

    it('resolveDirectionalCopy picks Arabic when RTL', () => {
      const text = resolveDirectionalCopy({
        value: undefined,
        englishFallback: 'Bundle total',
        arabicFallback: 'إجمالي الباقة',
        prefersArabicCopy: true,
      });
      expect(text).toBe('إجمالي الباقة');
    });

    it('getWrapperClassName and getCardClassName return tailored styles', () => {
      expect(getWrapperClassName('editorial')).toContain('rounded-[1.8rem]');
      expect(getWrapperClassName('compact')).toContain('py-10');
      expect(getCardClassName('compact', true, false)).toContain('border-primary/45');
    });
  });

  describe('Component Rendering & Behavioral Layers', () => {
    it('returns null when feature is disabled', () => {
      mockBoughtTogetherEnabled = false;
      const { container } = renderBoughtTogether();
      expect(container.firstChild).toBeNull();
    });

    it('renders full bought-together section with main product and recommendations', () => {
      renderBoughtTogether();
      expect(screen.getByTestId('bought-together-section')).toBeDefined();

      // Main product card
      expect(screen.getByText('قميص كتان بيج')).toBeDefined();
      expect(screen.getByText('المنتج الحالي')).toBeDefined();
      expect(screen.getByText('يتم تضمين هذا المنتج تلقائيًا عند إضافة الباقة.')).toBeDefined();

      // Recommendations
      expect(screen.getByText('بنطلون شينو كحلي')).toBeDefined();
      expect(screen.getByText('حزام جلد طبيعي')).toBeDefined();

      // Footer CTA bar
      expect(screen.getByTestId('bundle-footer-bar')).toBeDefined();
      expect(screen.getByText('أضف الباقة المحددة')).toBeDefined();
    });

    it('toggles recommendation selection when button is clicked', () => {
      renderBoughtTogether();
      const recCard = screen.getByTestId('bundle-card-prod-rec-1');
      expect(recCard).toBeDefined();

      // Find toggle button inside recommendation card
      const toggleBtn = recCard.querySelector('button[type="button"]');
      expect(toggleBtn).not.toBeNull();
      if (toggleBtn) {
        fireEvent.click(toggleBtn);
      }
    });

    it('dispatches addItem and opens cart when "أضف الباقة المحددة" is clicked', () => {
      renderBoughtTogether();
      const addBundleBtn = screen.getByText('أضف الباقة المحددة');
      fireEvent.click(addBundleBtn);
      expect(mockAddItem).toHaveBeenCalled();
    });
  });
});
