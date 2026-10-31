// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PaymentSection from '../PaymentSection';
import {
  normalizeVariant,
  parseBooleanSetting,
  parseListSetting,
} from '../payment-section/types';

// Mock dependencies
const mockCartStore = {
  items: [
    {
      id: 'item-1',
      productId: 'prod-1',
      name: 'Test Product',
      price: 250,
      quantity: 1,
      attributes: {},
    },
  ],
  getSubtotal: vi.fn(() => 250),
};

vi.mock('../../store/useCartStore', () => ({
  useCartStore: () => mockCartStore,
}));

const mockCheckoutStore = {
  paymentMethod: 'cod',
  setPaymentMethod: vi.fn(),
  formData: {
    customerName: 'Ahmed Ali',
    phone: '01012345678',
    address: '10 Cairo St',
    city: 'Nasr City',
    governorate: 'Cairo',
  },
  appliedCoupon: null,
  tierProgress: null,
};

vi.mock('../../store/useCheckoutStore', () => ({
  useCheckoutStore: (selector?: (s: any) => any) =>
    selector ? selector(mockCheckoutStore) : mockCheckoutStore,
}));

vi.mock('../../hooks/useCheckout', () => ({
  useCheckout: () => ({
    placeOrder: vi.fn(),
    isSubmitting: false,
    orderSuccess: null,
  }),
}));

vi.mock('../../engine/ThemeProvider', () => ({
  useStorefrontTheme: () => ({
    theme: { id: 'default', name: 'Default Store', direction: 'rtl' },
  }),
}));

vi.mock('../../hooks/useStorefrontSettings', () => ({
  useStorefrontSettings: () => ({
    settings: {
      companyId: 'comp-123',
      company: { name: 'Test Store', currency: 'EGP' },
      storefront: {
        settings: {
          storeName: 'Test Store',
          currency: 'EGP',
          enabledPaymentMethods: ['cod', 'card'],
        },
      },
    },
    isLoading: false,
  }),
}));

vi.mock('../../hooks/useStorefrontFacebookTracking', () => ({
  useStorefrontFacebookTracking: () => ({
    trackInitiateCheckoutEvent: vi.fn(),
  }),
}));

vi.mock('../../hooks/useCheckoutShippingQuote', () => ({
  useCheckoutShippingQuote: () => ({
    shippingCost: 50,
    freeShippingDiscount: 0,
    shippingMessage: 'الشحن 50 ج.م',
    isShippingLoading: false,
    quantityOfferFreeShippingActive: false,
    quantityOfferFreeShippingText: '',
    freeShippingActive: false,
  }),
}));

vi.mock('../../components/TierProgressBanner', () => ({
  default: () => <div data-testid="tier-banner">Tier Progress Banner</div>,
}));

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('PaymentSection (Modular Architecture)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders payment methods, summary breakdown, and confirm button', () => {
    renderWithProviders(
      <PaymentSection
        settings={{
          title: 'اختر طريقة الدفع',
          subtitle: 'ادفع عند الاستلام أو بالبطاقة',
        }}
      />,
    );

    expect(screen.getByText('اختر طريقة الدفع')).toBeDefined();
    expect(screen.getByText('ادفع عند الاستلام أو بالبطاقة')).toBeDefined();
    expect(screen.getByText('الدفع عند الاستلام')).toBeDefined();
    expect(screen.getByText('بطاقة ائتمان / خصم')).toBeDefined();
    expect(screen.getByTestId('tier-banner')).toBeDefined();
  });

  it('allows clicking on payment method to trigger selection', () => {
    renderWithProviders(
      <PaymentSection
        settings={{
          title: 'طريقة الدفع',
        }}
      />,
    );

    const cardButton = screen.getByText('بطاقة ائتمان / خصم');
    fireEvent.click(cardButton);
    expect(mockCheckoutStore.setPaymentMethod).toHaveBeenCalledWith('card');
  });

  it('tests utility helper functions for settings normalization', () => {
    expect(normalizeVariant('cards')).toBe('cards');
    expect(normalizeVariant('unknown')).toBe('standard');
    expect(normalizeVariant(undefined)).toBe('standard');

    expect(parseBooleanSetting(true, false)).toBe(true);
    expect(parseBooleanSetting('false', true)).toBe(false);
    expect(parseBooleanSetting(undefined, true)).toBe(true);

    expect(parseListSetting(['a', 'b'], [])).toEqual(['a', 'b']);
    expect(parseListSetting('item1, item2', [])).toEqual(['item1', 'item2']);
    expect(parseListSetting(undefined, ['default'])).toEqual(['default']);
  });
});
