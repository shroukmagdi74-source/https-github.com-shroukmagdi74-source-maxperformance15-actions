// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ElessiMainBuybox } from '../sections/product-info/buyboxes/ElessiMainBuybox';
import type { ProductInfoController } from '../sections/product-info/productInfoTypes';
import { STOREFRONT_SECTION_MANIFEST } from '../sections/manifest';
import { parseBooleanSetting } from '../sections/product-info/productInfoHelpers';

describe('PDP-TOGGLES-1: ElessiMainBuybox trust badges and size guide toggles', () => {
  afterEach(() => {
    cleanup();
  });

  const createMockCtrl = (overrides?: Partial<ProductInfoController>): ProductInfoController => {
    return {
      id: 'prod-test-1',
      variant: 'elessi-buybox',
      theme: { id: 'khemet-luxe-eg', name: 'Khemet Luxe' } as any,
      product: {
        id: 'test-product-1',
        name: 'فستان صيفي مريح',
        price: 950,
        originalPrice: 1200,
        discount: 20,
        productVariants: [],
        images: ['/test.jpg'],
        imageUrl: '/test.jpg',
      } as any,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      currency: 'ج.م',
      homePath: '/',
      shopPath: '/shop',
      prefersArabicCopy: true,
      usesCommerceHeaderLabel: false,
      activePrice: 950,
      activeComparePrice: 1200,
      displayPrice: '950 ج.م',
      originalPrice: '1,200 ج.م',
      discount: 20,
      effectivePrice: 950,
      selectedVariant: null,
      selectedAttributes: {},
      setSelectedAttributes: vi.fn(),
      variantSettings: {} as any,
      isStrictlyOutOfStock: false,
      stockStatusLabel: 'متوفر',
      selectedOptionSummary: '',
      inventoryCountdownText: '',
      quantity: 1,
      setQuantity: vi.fn(),
      handleAddToCart: vi.fn(),
      handleBuyNow: vi.fn(),
      handleShareAction: vi.fn(),
      addToCartText: 'أضف للسلة',
      buyNowText: 'اشتري الآن',
      addToCartButtonClassName: '',
      buyNowButtonClassName: '',
      descriptionTitle: 'الوصف',
      shippingTitle: 'الشحن والإرجاع',
      shippingText: 'تفاصيل الشحن',
      shippingInteraction: 'accordion',
      sizeGuideInteraction: 'modal',
      guaranteesTitle: 'الضمانات',
      guaranteesSubtitle: 'تسوق بأمان',
      guaranteeItems: [],
      guaranteeStyle: 'minimal',
      showGuarantees: true,
      showTrustBadges: true,
      showSizeGuide: true,
      canOpenSizeGuide: false,
      sizeGuideText: 'دليل المقاسات',
      rawSizeGuideHref: '/size-guide',
      isExternalSizeGuideHref: false,
      sizeGuideDialog: <div data-testid="size-guide-dialog">محتوى دليل المقاسات</div>,
      shippingPolicyDialog: null,
      questionDialog: null,
      openQuestionModal: vi.fn(),
      openShippingModal: vi.fn(),
      openSizeGuideModal: vi.fn(),
      isSoldCounterEnabled: false,
      isPurchaseFomoEnabled: false,
      isLowStockNoticeEnabled: false,
      isStickyAddToCartEnabled: false,
      showStickyCta: false,
      currentViewerCount: 10,
      recentSalesCount: 15,
      stockLevelCount: 5,
      saleCountdown: null,
      cashbackPreview: null,
      isAirlume: false,
      isNovaMobile: false,
      isCairoStride: false,
      isFakhama: false,
      isZenOrganic: false,
      isIntruderNft: false,
      isMenShoesEg: false,
      isBiteRush: false,
      isCutlineClub: false,
      isLegacyDefaultOld: false,
      isElessiPackTheme: true,
      isPcHubCommandSpecs: false,
      isWomenStyleLedger: false,
      isWomenUtilityRail: false,
      isStyleStoreUtilityRail: false,
      isGracefulInfo: false,
      isVelaFashionDirectBuybox: false,
      isAtelierBuybox: false,
      isButcherAtelier: false,
      isWomenProductInfoVariant: false,
      isPerfumeScentBrief: false,
      isElessiBagBuybox: false,
      isElessiBuybox: true,
      isElessiSpecBuybox: false,
      isElessiGarageBuybox: false,
      isElessiGiftBuybox: false,
      isElessiPetBuybox: false,
      isElessiWatchBuybox: false,
      isElessiCareBuybox: false,
      isElessiOrganicBuybox: false,
      isElessiPlantBuybox: false,
      isElessiBikeBuybox: false,
      isElessiDigitalBuybox: false,
      isRedlineAuto: false,
      isAnyElessiBuybox: true,
      isKhemetInlineQuickOrderBuybox: false,
      externalProductConfig: { url: '', label: '', vendor: '', description: '', externalOnly: false },
      externalOnlyProduct: false,
      showExternalAffiliateCta: false,
      renderExternalPurchaseCta: vi.fn(),
      renderAmazonBuyCta: vi.fn(),
      specs: [],
      shortDescription: 'فستان صيفي خفيف من القطن الطبيعي',
      descriptionPreviewText: 'فستان صيفي خفيف',
      safeDescription: 'فستان صيفي خفيف',
      breadcrumbHomeLabel: 'الرئيسية',
      breadcrumbShopLabel: 'المتجر',
      productCategoryLabel: 'فساتين',
      productTagValues: [],
      reviewsAverageRating: 5,
      reviewsCount: 12,
      shouldRenderStandaloneBuyBox: true,
      shouldRenderPrimaryBuyBox: true,
      isCartOpen: false,
      hasEmbeddedPdpCheckout: false,
      commonVariantSelector: (
        <div data-testid="common-variant-selector">
          <span>المقاس واللون</span>
        </div>
      ),
      commonActions: (
        <div data-testid="common-actions">
          <button>أضف إلى السلة</button>
        </div>
      ),
      commonHeader: <h1>فستان صيفي مريح</h1>,
      commonPrice: <div>950 ج.م</div>,
      ...overrides,
    };
  };

  describe('showTrustBadges acceptance criteria', () => {
    it('renders trust badges when showTrustBadges is true', () => {
      const mockCtrl = createMockCtrl({ showTrustBadges: true });
      render(
        <MemoryRouter>
          <ElessiMainBuybox ctrl={mockCtrl} />
        </MemoryRouter>
      );

      expect(screen.getByText('شحن 48 ساعة')).toBeInTheDocument();
      expect(screen.getByText('معاينة وقياس مع المندوب')).toBeInTheDocument();
      expect(screen.getByText('استبدال 14 يوم')).toBeInTheDocument();
    });

    it('renders trust badges by default when showTrustBadges is undefined', () => {
      const mockCtrl = createMockCtrl({ showTrustBadges: undefined as any });
      render(
        <MemoryRouter>
          <ElessiMainBuybox ctrl={mockCtrl} />
        </MemoryRouter>
      );

      expect(screen.getByText('شحن 48 ساعة')).toBeInTheDocument();
      expect(screen.getByText('معاينة وقياس مع المندوب')).toBeInTheDocument();
      expect(screen.getByText('استبدال 14 يوم')).toBeInTheDocument();
    });

    it('hides trust badges completely from DOM when showTrustBadges is false', () => {
      const mockCtrl = createMockCtrl({ showTrustBadges: false });
      render(
        <MemoryRouter>
          <ElessiMainBuybox ctrl={mockCtrl} />
        </MemoryRouter>
      );

      expect(screen.queryByText('شحن 48 ساعة')).toBeNull();
      expect(screen.queryByText('معاينة وقياس مع المندوب')).toBeNull();
      expect(screen.queryByText('استبدال 14 يوم')).toBeNull();
    });

    it('respects showTrustBadges prop override when passed directly to ElessiMainBuybox', () => {
      const mockCtrl = createMockCtrl({ showTrustBadges: true });
      render(
        <MemoryRouter>
          <ElessiMainBuybox ctrl={mockCtrl} showTrustBadges={false} />
        </MemoryRouter>
      );

      expect(screen.queryByText('شحن 48 ساعة')).toBeNull();
      expect(screen.queryByText('معاينة وقياس مع المندوب')).toBeNull();
      expect(screen.queryByText('استبدال 14 يوم')).toBeNull();
    });
  });

  describe('showSizeGuide acceptance criteria', () => {
    it('does not render size guide dialog when canOpenSizeGuide is false', () => {
      const mockCtrl = createMockCtrl({ canOpenSizeGuide: false });
      render(
        <MemoryRouter>
          <ElessiMainBuybox ctrl={mockCtrl} />
        </MemoryRouter>
      );

      expect(screen.queryByTestId('size-guide-dialog')).toBeNull();
    });

    it('renders size guide dialog when canOpenSizeGuide is true', () => {
      const mockCtrl = createMockCtrl({ canOpenSizeGuide: true });
      render(
        <MemoryRouter>
          <ElessiMainBuybox ctrl={mockCtrl} />
        </MemoryRouter>
      );

      expect(screen.getByTestId('size-guide-dialog')).toBeInTheDocument();
    });
  });

  describe('manifest definitions', () => {
    it('declares showTrustBadges and showSizeGuide in product-info manifest fields', () => {
      const productInfoManifest = STOREFRONT_SECTION_MANIFEST['product-info'];
      expect(productInfoManifest).toBeDefined();

      const fields = productInfoManifest.fields || [];
      const trustBadgesField = fields.find((f) => f.key === 'showTrustBadges');
      const sizeGuideField = fields.find((f) => f.key === 'showSizeGuide');

      expect(trustBadgesField).toBeDefined();
      expect(trustBadgesField?.type).toBe('select');
      expect(trustBadgesField?.options).toEqual([
        { label: 'نعم', value: 'true' },
        { label: 'لا', value: 'false' },
      ]);

      expect(sizeGuideField).toBeDefined();
      expect(sizeGuideField?.type).toBe('select');
      expect(sizeGuideField?.options).toEqual([
        { label: 'نعم', value: 'true' },
        { label: 'لا', value: 'false' },
      ]);
    });
  });

  describe('controller logic evaluation', () => {
    it('correctly evaluates boolean settings for showSizeGuide and showTrustBadges', () => {
      // Default / undefined -> true
      expect(parseBooleanSetting(undefined, true)).toBe(true);
      expect(parseBooleanSetting(null, true)).toBe(true);
      expect(parseBooleanSetting('true', true)).toBe(true);
      expect(parseBooleanSetting(true, true)).toBe(true);

      // Explicit false -> false
      expect(parseBooleanSetting('false', true)).toBe(false);
      expect(parseBooleanSetting(false, true)).toBe(false);

      // canOpenSizeGuide calculation:
      const rawSizeGuideHref = '/size-guide';
      const productSizeGuide = null;

      // When showSizeGuide is false, canOpenSizeGuide must be false even if rawSizeGuideHref exists
      const showSizeGuideDisabled = parseBooleanSetting(false, true);
      const canOpenWhenDisabled =
        showSizeGuideDisabled !== false && Boolean(rawSizeGuideHref || productSizeGuide);
      expect(canOpenWhenDisabled).toBe(false);

      // When showSizeGuide is 'false' (string from select), canOpenSizeGuide must be false
      const showSizeGuideStringDisabled = parseBooleanSetting('false', true);
      const canOpenWhenStringDisabled =
        showSizeGuideStringDisabled !== false && Boolean(rawSizeGuideHref || productSizeGuide);
      expect(canOpenWhenStringDisabled).toBe(false);

      // When showSizeGuide is true or undefined, canOpenSizeGuide evaluates to true
      const showSizeGuideDefault = parseBooleanSetting(undefined, true);
      const canOpenWhenDefault =
        showSizeGuideDefault !== false && Boolean(rawSizeGuideHref || productSizeGuide);
      expect(canOpenWhenDefault).toBe(true);
    });
  });
});
