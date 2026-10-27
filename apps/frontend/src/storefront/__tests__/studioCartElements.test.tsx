// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Bypass persist middleware in jsdom unit tests to eliminate Node 26 experimental localStorage collision
vi.mock('zustand/middleware', async (importOriginal) => {
  const actual = await importOriginal<typeof import('zustand/middleware')>();
  return {
    ...actual,
    persist: (config: any) => (set: any, get: any, api: any) => config(set, get, api),
  };
});

// Mock storefront settings hook
vi.mock('../hooks/useStorefrontSettings', () => ({
  useStorefrontSettings: () => ({
    settings: {
      company: { id: 'comp-xyz', currency: 'EGP' },
      storefront: { settings: { currency: 'EGP' } },
    },
    isLoading: false,
  }),
}));

// Mock shipping quote hook
vi.mock('../hooks/useCheckoutShippingQuote', () => ({
  useCheckoutShippingQuote: () => ({
    shippingCost: 0,
    shippingMessage: '',
    isShippingLoading: false,
    freeShippingActive: false,
  }),
}));

import {
  CartItemsElement,
  CartTotalsElement,
  CheckoutButtonElement,
  CouponElement,
} from '../sections/elements';
import { useCartStore } from '../store/useCartStore';
import { useCheckoutStore } from '../store/useCheckoutStore';
import { storefrontApi } from '../../utils/storefrontApi';
import { ComponentRegistry } from '../engine/ComponentRegistry';

// Mock storefrontApi
vi.mock('../../utils/storefrontApi', () => ({
  storefrontApi: {
    updateCartItem: vi.fn().mockResolvedValue({ success: true }),
    removeCartItem: vi.fn().mockResolvedValue({ success: true }),
    validateCoupon: vi.fn().mockResolvedValue({
      data: {
        coupon: {
          code: 'SAVE20',
          name: 'خصم 20 جنيه',
          discountAmount: 20,
        },
      },
    }),
    calculateShipping: vi.fn().mockResolvedValue({ data: { price: 30 } }),
  },
  getStorefrontScope: () => ({ companyId: 'test-co' }),
  storefrontFetch: vi.fn(),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('CHECKOUT-1: Cart & Checkout Elements for Custom Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.setState({ items: [], isOpen: false });
    useCheckoutStore.setState({
      formData: {
        customerName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        governorate: '',
      },
      paymentMethod: 'cod',
      appliedCoupon: null,
      pendingCouponCode: null,
      tierProgress: null,
    });
  });

  afterEach(() => {
    cleanup();
  });

  // Acceptance Criterion 2:
  // سلة fixture ببندين (100 + 50) + شحن 30 → CartTotals يعرض 180 (assert بالرقم)
  it('Case 1: CartTotalsElement - 2 items fixture (100 + 50) + shipping 30 displays 180', () => {
    useCartStore.setState({
      items: [
        {
          id: 'item-1',
          productId: 'prod-100',
          name: 'قميص قطن',
          price: 100,
          quantity: 1,
        },
        {
          id: 'item-2',
          productId: 'prod-50',
          name: 'كاب صيفي',
          price: 50,
          quantity: 1,
        },
      ],
    });

    const { container } = renderWithProviders(<CartTotalsElement shippingCost={30} currency="EGP" />);

    // Assert that the total element is present
    const totalEl = screen.getByTestId('cart-total-value');
    expect(totalEl).toBeInTheDocument();

    // Assert by exact number 180
    expect(totalEl.getAttribute('data-value')).toBe('180');
    expect(totalEl.textContent).toContain('180');
    expect(container.textContent).toContain('180');

    // Also assert subtotal 150 and shipping 30
    const subtotalEl = screen.getByTestId('cart-subtotal-value');
    expect(subtotalEl.textContent).toContain('150');
    const shippingEl = screen.getByTestId('cart-shipping-value');
    expect(shippingEl.textContent).toContain('30');
  });

  // Acceptance Criterion 3:
  // تعديل كمية من CartItems → updateCartItem اتنادى بالقيمة الجديدة (spy)
  it('Case 2: CartItemsElement - quantity update calls storefrontApi.updateCartItem with new value (spy)', async () => {
    const updateSpy = vi.spyOn(storefrontApi, 'updateCartItem');

    useCartStore.setState({
      items: [
        {
          id: 'item-101',
          productId: 'prod-shirt',
          name: 'تي شيرت كلاسيك',
          price: 120,
          quantity: 1,
          variantId: 'var-red-l',
        },
      ],
    });

    renderWithProviders(<CartItemsElement />);

    const increaseBtn = screen.getByTestId('increase-quantity');
    expect(increaseBtn).toBeInTheDocument();

    // Click increment (+)
    fireEvent.click(increaseBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledTimes(1);
    });

    expect(updateSpy).toHaveBeenCalledWith(
      'prod-shirt',
      expect.objectContaining({
        quantity: 2,
        variantId: 'var-red-l',
      }),
    );

    // Verify local store was also updated
    expect(useCartStore.getState().items[0]?.quantity).toBe(2);
  });

  // Acceptance Criterion 4:
  // سلة فاضية → رسالة واضحة + صفر أزرار (assert)
  it('Case 3: CartItemsElement - empty cart displays clear message and ZERO buttons', () => {
    useCartStore.setState({ items: [] });

    const { container } = renderWithProviders(<CartItemsElement />);

    // Clear empty message must be rendered
    const emptyMsg = screen.getByTestId('cart-empty-message');
    expect(emptyMsg).toBeInTheDocument();
    expect(emptyMsg.textContent).toContain('سلة التسوق فارغة');

    // Assert ZERO buttons in DOM
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(0);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  // Acceptance Criterion 4 for CartTotalsElement:
  // سلة فاضية في CartTotalsElement -> رسالة توضيحية وصفر أزرار وليس صفراً صامتاً
  it('Case 4: CartTotalsElement - empty cart displays clear empty state and zero buttons (not silent 0 EGP)', () => {
    useCartStore.setState({ items: [] });

    const { container } = renderWithProviders(<CartTotalsElement />);

    const emptyNotice = screen.getByTestId('cart-totals-empty');
    expect(emptyNotice).toBeInTheDocument();
    expect(emptyNotice.textContent).toContain('فارغة');

    // Total value element should not be rendered as silent active total
    expect(screen.queryByTestId('cart-total-value')).toBeNull();

    // Zero buttons
    expect(container.querySelectorAll('button').length).toBe(0);
  });

  // Acceptance Criterion 4 for CheckoutButtonElement:
  // زر الشيك أوت يختفي تماماً عند السلة الفارغة (صفر أزرار)
  it('Case 5: CheckoutButtonElement - hides completely when cart is empty (zero buttons)', () => {
    useCartStore.setState({ items: [] });

    const { container } = renderWithProviders(<CheckoutButtonElement />);

    expect(screen.queryByTestId('checkout-button')).toBeNull();
    expect(container.querySelectorAll('button').length).toBe(0);
  });

  it('Case 6: CheckoutButtonElement - renders when cart has items and triggers checkout action', () => {
    useCartStore.setState({
      items: [
        {
          id: 'item-201',
          productId: 'prod-hoodie',
          name: 'سويت شيرت',
          price: 250,
          quantity: 1,
        },
      ],
    });

    const onCheckoutSpy = vi.fn();
    renderWithProviders(<CheckoutButtonElement onCheckout={onCheckoutSpy} />);

    const btn = screen.getByTestId('checkout-button');
    expect(btn).toBeInTheDocument();
    expect(btn.textContent).toContain('إتمام الطلب');

    fireEvent.click(btn);
    expect(onCheckoutSpy).toHaveBeenCalledTimes(1);
  });

  it('Case 7: CartItemsElement - removing an item calls store.removeItem and storefrontApi.removeCartItem', async () => {
    const removeSpy = vi.spyOn(storefrontApi, 'removeCartItem');

    useCartStore.setState({
      items: [
        {
          id: 'item-301',
          productId: 'prod-shoes',
          name: 'حذاء رياضي',
          price: 400,
          quantity: 1,
        },
      ],
    });

    renderWithProviders(<CartItemsElement />);

    const removeBtn = screen.getByTestId('remove-item');
    expect(removeBtn).toBeInTheDocument();

    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(removeSpy).toHaveBeenCalledWith('prod-shoes', null);
    });

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('Case 8: CouponElement - applying coupon calls validateCoupon and updates state; removing clears it', async () => {
    useCartStore.setState({
      items: [
        {
          id: 'item-401',
          productId: 'prod-dress',
          name: 'فستان صيفي',
          price: 150,
          quantity: 1,
        },
      ],
    });

    const validateSpy = vi.spyOn(storefrontApi, 'validateCoupon');

    renderWithProviders(<CouponElement companyId="comp-xyz" />);

    const input = screen.getByTestId('coupon-input');
    const applyBtn = screen.getByTestId('apply-coupon-button');

    fireEvent.change(input, { target: { value: 'SAVE20' } });
    fireEvent.click(applyBtn);

    await waitFor(() => {
      expect(validateSpy).toHaveBeenCalledWith('comp-xyz', 'SAVE20', 150);
    });

    // Coupon applied state card should be visible
    await waitFor(() => {
      expect(screen.getByTestId('applied-coupon-code')).toHaveTextContent('SAVE20');
    });

    // Remove coupon
    const removeCouponBtn = screen.getByTestId('remove-coupon-button');
    fireEvent.click(removeCouponBtn);

    expect(useCheckoutStore.getState().appliedCoupon).toBeNull();
    expect(screen.getByTestId('coupon-input')).toBeInTheDocument();
  });

  it('Case 9: CartTotalsElement - correctly applies discount from coupon', () => {
    // 2 items: 100 + 50 = 150. Shipping: 30. Discount: 20. Total = 160.
    useCartStore.setState({
      items: [
        { id: 'i1', productId: 'p1', name: 'بند 1', price: 100, quantity: 1 },
        { id: 'i2', productId: 'p2', name: 'بند 2', price: 50, quantity: 1 },
      ],
    });

    useCheckoutStore.setState({
      appliedCoupon: {
        code: 'DISC20',
        discountAmount: 20,
      },
    });

    renderWithProviders(<CartTotalsElement shippingCost={30} currency="EGP" />);

    const totalEl = screen.getByTestId('cart-total-value');
    expect(totalEl.getAttribute('data-value')).toBe('160');
    expect(totalEl.textContent).toContain('160');

    const discountEl = screen.getByTestId('cart-discount-value');
    expect(discountEl.textContent).toContain('20');
  });

  it('Case 10: ComponentRegistry - maps all four checkout element types', () => {
    expect(ComponentRegistry['cart-items']).toBeDefined();
    expect(ComponentRegistry['cart-totals']).toBeDefined();
    expect(ComponentRegistry['checkout-button']).toBeDefined();
    expect(ComponentRegistry['coupon']).toBeDefined();
  });
});
