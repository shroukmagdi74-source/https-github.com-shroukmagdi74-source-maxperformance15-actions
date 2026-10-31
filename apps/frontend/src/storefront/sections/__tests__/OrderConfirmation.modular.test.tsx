// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OrderConfirmation, { resolveShippingLocation } from '../OrderConfirmation';

// Mock dependencies
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
      storefront: { settings: { storeName: 'Test Store', currency: 'EGP' } },
    },
    isLoading: false,
  }),
}));

vi.mock('../../hooks/useStorefrontFacebookTracking', () => ({
  useStorefrontFacebookTracking: () => ({
    browserTrackingEnabled: true,
    trackPurchaseEvent: vi.fn(),
    trackAddToCartEvent: vi.fn(),
  }),
}));

vi.mock('../../store/useCartStore', () => ({
  useCartStore: () => ({
    addItem: vi.fn(),
  }),
  buildCartItemId: ({ id, productId }: any) => `${productId || id}-cart-id`,
}));

vi.mock('../../components/PostPurchaseUpsellBlock', () => ({
  default: () => <div data-testid="upsell-block">Post Purchase Upsell</div>,
}));

vi.mock('../../components/OrderStepTimeline', () => ({
  default: ({ currentStep }: any) => <div data-testid="order-timeline">Timeline: {currentStep}</div>,
}));

const renderWithProviders = (ui: React.ReactElement, initialEntry = '/order-confirmation?orderNumber=ORD-999') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('OrderConfirmation (Modular Coordinator)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders default confirmation screen with order number and header', () => {
    renderWithProviders(
      <OrderConfirmation
        settings={{
          title: 'تم تأكيد طلبك!',
          description: 'شكرًا لطلبك، نحن نجهز شحنتك الآن.',
        }}
      />,
      '/order-confirmation?orderNumber=ORD-999',
    );

    expect(screen.getByText('تم تأكيد طلبك!')).toBeDefined();
    expect(screen.getByText('شكرًا لطلبك، نحن نجهز شحنتك الآن.')).toBeDefined();
    expect(screen.getByText('#ORD-999')).toBeDefined();
    expect(screen.getByTestId('order-timeline')).toBeDefined();
  });

  it('renders order confirmation with custom action text and upsell block', () => {
    renderWithProviders(
      <OrderConfirmation
        settings={{
          continueShoppingText: 'العودة للمتجر',
          showRecommended: true,
        }}
      />,
      '/order-confirmation?orderId=ORD-12345',
    );

    expect(screen.getByText('العودة للمتجر')).toBeDefined();
    expect(screen.getByTestId('upsell-block')).toBeDefined();
  });

  it('verifies resolveShippingLocation helper backward compatibility', () => {
    expect(resolveShippingLocation('')).toBe('');
    expect(resolveShippingLocation(null)).toBe('');
    expect(resolveShippingLocation('Cairo, Downtown, Building 5')).toBe('Cairo, Downtown, Building 5');
    
    // JSON stringified address
    const jsonAddress = JSON.stringify({
      governorate: 'القاهرة',
      city: 'مدينة نصر',
      street: 'شارع عباس العقاد',
    });
    expect(resolveShippingLocation(jsonAddress)).toBe('القاهرة, مدينة نصر, شارع عباس العقاد');

    // Object address
    const objAddress = {
      address: '15 Tahrir Square, Cairo',
    };
    expect(resolveShippingLocation(objAddress)).toBe('15 Tahrir Square, Cairo');
  });
});
