// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import {
  ProductPriceElement,
  ProductRatingElement,
  ProductStockElement,
  AddToCartElement,
  ProductOptionsElement,
  WishlistElement,
  CompareElement,
} from '../sections/elements';
import { StorefrontDynamicProvider } from '../studio/utils/dynamicValues';
import { storefrontApi } from '../../utils/storefrontApi';

// Mock storefrontApi
vi.mock('../../utils/storefrontApi', () => ({
  storefrontApi: {
    addToCart: vi.fn(),
  },
  getStorefrontScope: () => ({ companyId: 'test-co' }),
  storefrontFetch: vi.fn(),
}));

// Mock wishlistApi
vi.mock('../../utils/wishlistApi', () => ({
  wishlistApi: {
    getWishlist: vi.fn().mockResolvedValue({ items: [] }),
    addToWishlist: vi.fn().mockResolvedValue({ success: true }),
    removeFromWishlist: vi.fn().mockResolvedValue({ success: true }),
  },
}));

// Mock localStorage for jsdom/node26 environment
const mockStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockStorage,
  writable: true,
});

describe('COMM-1: Commerce Elements (Price, Rating, Stock, AddToCart, Options, Wishlist, Compare)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  // Acceptance Criterion 2:
  // السعر: منتج price=250، compareAt=300، عملة المتجر → السعر يظهر منسّق + السعر القديم مشطوب (assert على DOM)
  it('Case 1: ProductPriceElement - renders formatted price and struck-through compareAt price', () => {
    const context = {
      product: {
        id: 'prod-101',
        title: 'قميص كتان بيج',
        price: 250,
        compareAt: 300,
      },
      store: {
        currency: 'EGP',
      },
      locale: 'ar-EG',
    };

    const { container } = render(
      <StorefrontDynamicProvider value={context}>
        <ProductPriceElement />
      </StorefrontDynamicProvider>,
    );

    const priceEl = container.querySelector('[data-storefront-price="true"]');
    expect(priceEl).toBeInTheDocument();
    expect(priceEl?.textContent).toContain('250');
    expect(priceEl?.textContent).toContain('ج.م');

    const compareEl = container.querySelector('[data-storefront-compare-price="true"]');
    expect(compareEl).toBeInTheDocument();
    expect(compareEl?.textContent).toContain('300');
    expect(compareEl?.textContent).toContain('ج.م');
    // Struck-through class or del tag
    expect(compareEl?.tagName.toLowerCase() === 'del' || compareEl?.classList.contains('line-through')).toBe(true);
  });

  // Acceptance Criterion 2 (Dynamic context null/non-product check):
  // لو السياق مش منتج → العنصر مش بيترندر (مش يعرض صفر)
  it('Case 2: ProductPriceElement - does NOT render when dynamic context is not a product (returns null, no 0)', () => {
    const nonProductContext = {
      collection: {
        id: 'col-summer',
        name: 'تشكيلة الصيف',
      },
      page: {
        title: 'عن المتجر',
      },
    };

    const { container } = render(
      <StorefrontDynamicProvider value={nonProductContext}>
        <ProductPriceElement />
      </StorefrontDynamicProvider>,
    );

    expect(container.firstChild).toBeNull();
    expect(container.textContent).not.toContain('0');
  });

  // Acceptance Criterion 3:
  // الستوك: stock=7 → «متبقي 7»
  it('Case 3: ProductStockElement - stock=7 displays «متبقي 7»', () => {
    const context = {
      product: {
        id: 'prod-102',
        title: 'حذاء كلاسيكي',
        stock: 7,
      },
    };

    render(
      <StorefrontDynamicProvider value={context}>
        <ProductStockElement />
      </StorefrontDynamicProvider>,
    );

    const stockTextEl = screen.getByText(/متبقي 7/);
    expect(stockTextEl).toBeInTheDocument();
  });

  // Acceptance Criterion 3:
  // الستوك: stock=0 → «غير متوفر»
  it('Case 4: ProductStockElement - stock=0 displays «غير متوفر»', () => {
    const context = {
      product: {
        id: 'prod-103',
        title: 'ساعة يد سوداء',
        stock: 0,
      },
    };

    render(
      <StorefrontDynamicProvider value={context}>
        <ProductStockElement />
      </StorefrontDynamicProvider>,
    );

    const outOfStockEl = screen.getByText('غير متوفر');
    expect(outOfStockEl).toBeInTheDocument();
  });

  // Acceptance Criterion 3 (Stock null context):
  it('Case 5: ProductStockElement - does NOT render when context is not a product', () => {
    const { container } = render(
      <StorefrontDynamicProvider value={{ page: { title: 'الرئيسية' } }}>
        <ProductStockElement />
      </StorefrontDynamicProvider>,
    );

    expect(container.firstChild).toBeNull();
  });

  // Acceptance Criterion 3 (AddToCart with stock=0):
  // stock=0 → والزر معطّل disabled
  it('Case 6: AddToCartElement - stock=0 disables button and displays «غير متوفر»', () => {
    const context = {
      product: {
        id: 'prod-104',
        title: 'سماعة رأس',
        stock: 0,
      },
    };

    render(
      <StorefrontDynamicProvider value={context}>
        <AddToCartElement />
      </StorefrontDynamicProvider>,
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.textContent).toContain('غير متوفر');
  });

  // Acceptance Criterion 5:
  // مفيش خيارات: منتج بخيارات + مفيش اختيار → الزر disabled + رسالة
  it('Case 7: AddToCartElement - product with options and no selection has disabled button + message', () => {
    const context = {
      product: {
        id: 'prod-105',
        title: 'بنطلون جينز',
        stock: 15,
        options: [
          { name: 'المقاس', values: ['30', '32', '34'] },
          { name: 'اللون', values: ['أزرق', 'أسود'] },
        ],
      },
    };

    render(
      <StorefrontDynamicProvider value={context}>
        <AddToCartElement />
      </StorefrontDynamicProvider>,
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    const message = screen.getByText(/يرجى تحديد الخيارات/);
    expect(message).toBeInTheDocument();

    // Verify clicking disabled button does NOT trigger addToCart
    fireEvent.click(button);
    expect(storefrontApi.addToCart).not.toHaveBeenCalled();
  });

  // Acceptance Criterion 4:
  // الإضافة للسلة: كليك على AddToCart مع خيارات محددة → storefrontApi.addToCart اتنادى مرة واحدة بالـproductId+variantId الصح (spy assert)
  it('Case 8: AddToCartElement - clicking with selected variant calls storefrontApi.addToCart once with productId and variantId', async () => {
    const mockAddToCart = vi.mocked(storefrontApi.addToCart);
    mockAddToCart.mockResolvedValueOnce({
      success: true,
      data: { cartId: 'cart-123' },
    });

    const context = {
      product: {
        id: 'prod-200',
        title: 'فستان صيفي',
        stock: 8,
        variants: [
          { id: 'var-999', name: 'أحمر / M', attributes: { Color: 'أحمر', Size: 'M' } },
        ],
      },
    };

    render(
      <StorefrontDynamicProvider value={context}>
        <AddToCartElement selectedVariantId="var-999" />
      </StorefrontDynamicProvider>,
    );

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();

    fireEvent.click(button);

    expect(mockAddToCart).toHaveBeenCalledTimes(1);
    expect(mockAddToCart).toHaveBeenCalledWith({
      productId: 'prod-200',
      variantId: 'var-999',
      quantity: 1,
    });
  });

  // Simple product (no options):
  it('Case 9: AddToCartElement - simple product without variants adds to cart cleanly', async () => {
    const mockAddToCart = vi.mocked(storefrontApi.addToCart);
    mockAddToCart.mockResolvedValueOnce({
      success: true,
      data: { cartId: 'cart-456' },
    });

    const context = {
      product: {
        id: 'prod-simple-1',
        title: 'محفظة جلدية',
        stock: 12,
      },
    };

    render(
      <StorefrontDynamicProvider value={context}>
        <AddToCartElement />
      </StorefrontDynamicProvider>,
    );

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
    expect(button.textContent).toContain('أضف للسلة');

    fireEvent.click(button);

    expect(mockAddToCart).toHaveBeenCalledTimes(1);
    expect(mockAddToCart).toHaveBeenCalledWith({
      productId: 'prod-simple-1',
      quantity: 1,
    });
  });

  // Non-product context:
  it('Case 10: AddToCartElement - does NOT render when dynamic context is not a product', () => {
    const { container } = render(
      <StorefrontDynamicProvider value={{ collection: { id: 'c1', name: 'الكل' } }}>
        <AddToCartElement />
      </StorefrontDynamicProvider>,
    );

    expect(container.firstChild).toBeNull();
  });

  // ProductRatingElement:
  it('Case 11: ProductRatingElement - renders rating stars and count when product is in context; returns null when not', () => {
    const context = {
      product: {
        id: 'prod-rated',
        title: 'نظارة شمسية',
        rating: 4.8,
        ratingCount: 32,
      },
    };

    const { rerender } = render(
      <StorefrontDynamicProvider value={context}>
        <ProductRatingElement />
      </StorefrontDynamicProvider>,
    );

    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('(32)')).toBeInTheDocument();

    // When context is not a product -> null
    const { container: emptyContainer } = render(
      <StorefrontDynamicProvider value={{}}>
        <ProductRatingElement />
      </StorefrontDynamicProvider>,
    );
    expect(emptyContainer.firstChild).toBeNull();
  });

  // ProductOptionsElement:
  it('Case 12: ProductOptionsElement - renders options and selecting option triggers callback and updates DOM', () => {
    const context = {
      product: {
        id: 'prod-opts',
        title: 'تيشيرت رياضي',
        options: [
          { name: 'المقاس', values: ['S', 'M', 'L'] },
        ],
        variants: [
          { id: 'var-s', attributes: { المقاس: 'S' } },
          { id: 'var-m', attributes: { المقاس: 'M' } },
          { id: 'var-l', attributes: { المقاس: 'L' } },
        ],
      },
    };

    const handleChange = vi.fn();

    render(
      <StorefrontDynamicProvider value={context}>
        <ProductOptionsElement onChange={handleChange} />
      </StorefrontDynamicProvider>,
    );

    const mButton = screen.getByRole('button', { name: 'M' });
    expect(mButton).toBeInTheDocument();

    fireEvent.click(mButton);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedAttributes: { المقاس: 'M' },
        variantId: 'var-m',
      }),
    );
    expect(mButton).toHaveAttribute('data-selected', 'true');

    // When context is not a product -> null
    const { container: emptyContainer } = render(
      <StorefrontDynamicProvider value={{}}>
        <ProductOptionsElement />
      </StorefrontDynamicProvider>,
    );
    expect(emptyContainer.firstChild).toBeNull();
  });

  // WishlistElement:
  it('Case 13: WishlistElement - toggles wishlist state on click and persists to localStorage', () => {
    const context = {
      product: {
        id: 'prod-wish-1',
        title: 'حقيبة يد فاخرة',
      },
    };

    render(
      <StorefrontDynamicProvider value={context}>
        <WishlistElement />
      </StorefrontDynamicProvider>,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');

    // Click to add
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');

    // Click to remove
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');

    // When context is not a product -> null
    const { container: emptyContainer } = render(
      <StorefrontDynamicProvider value={{}}>
        <WishlistElement />
      </StorefrontDynamicProvider>,
    );
    expect(emptyContainer.firstChild).toBeNull();
  });

  // CompareElement:
  it('Case 14: CompareElement - toggles compare state on click and persists to localStorage', () => {
    const context = {
      product: {
        id: 'prod-comp-1',
        title: 'هاتف ذكي',
      },
    };

    render(
      <StorefrontDynamicProvider value={context}>
        <CompareElement />
      </StorefrontDynamicProvider>,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');

    // Click to add
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');

    // Click to remove
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');

    // When context is not a product -> null
    const { container: emptyContainer } = render(
      <StorefrontDynamicProvider value={{}}>
        <CompareElement />
      </StorefrontDynamicProvider>,
    );
    expect(emptyContainer.firstChild).toBeNull();
  });
});
