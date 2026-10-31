/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PdpQuickOrderForm from '../../PdpQuickOrderForm';

// Mock Product
const mockProduct = {
  id: 'prod-456',
  name: 'تيشيرت قطن فاخر',
  price: 450,
  comparePrice: 600,
  stock: 20,
  trackInventory: true,
  hasVariants: false,
  imageUrl: 'https://example.com/shirt.jpg',
};

// Mock Theme
vi.mock('../../../engine/ThemeProvider', () => ({
  useStorefrontTheme: () => ({
    theme: {
      id: 'default',
      direction: 'rtl',
      tokens: { colors: { primary: '220 90% 50%' } },
    },
  }),
}));

// Mock Storefront Settings
vi.mock('../../../hooks/useStorefrontSettings', () => ({
  useStorefrontSettings: () => ({
    settings: {
      company: { id: 'comp-123', currency: 'EGP' },
      storefront: {
        settings: {
          currency: 'EGP',
          designTokens: {},
          walletPaymentSettings: {
            enabled: true,
            walletNumber: '01012345678',
            recipientName: 'MaxP Store',
            discountEnabled: true,
            discountPercent: 5,
          },
        },
        storefrontFeatures: {
          enabledPaymentMethods: ['cod', 'wallet', 'card'],
        },
      },
    },
  }),
}));

// Mock Facebook Tracking
vi.mock('../../../hooks/useStorefrontFacebookTracking', () => ({
  useStorefrontFacebookTracking: () => ({
    trackAddToCartEvent: vi.fn(),
    trackInitiateCheckoutEvent: vi.fn(),
  }),
}));

// Mock Ip Governorate Detection
vi.mock('../../../hooks/useIpGovernorateDetection', () => ({
  useIpGovernorateDetection: () => ({}),
}));

afterEach(() => {
  cleanup();
});

describe('PdpQuickOrderForm Modular Component (Batch 641)', () => {
  it('renders standard quick order form fields', () => {
    render(
      <MemoryRouter>
        <PdpQuickOrderForm product={mockProduct as any} />
      </MemoryRouter>,
    );

    expect(screen.getByText('يرجى إدخال معلوماتك لإكمال الطلب')).toBeTruthy();
    expect(screen.getByPlaceholderText('مثال: محمد أحمد')).toBeTruthy();
    expect(screen.getAllByPlaceholderText('01xxxxxxxxx').length).toBeGreaterThanOrEqual(1);
  });

  it('renders payment method options including COD, Wallet, and Card', () => {
    render(
      <MemoryRouter>
        <PdpQuickOrderForm product={mockProduct as any} />
      </MemoryRouter>,
    );

    expect(screen.getByText('الدفع عند الاستلام')).toBeTruthy();
    expect(screen.getByText('الدفع بالمحفظة')).toBeTruthy();
    expect(screen.getByText(/بطاقة بنكية \/ فيزا/)).toBeTruthy();
  });

  it('renders redline auto car model inputs when variant is redline-auto', () => {
    render(
      <MemoryRouter>
        <PdpQuickOrderForm
          product={mockProduct as any}
          sectionSettings={{ formVariant: 'redline-auto' }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('نوع وموديل وسنة صنع السيارة')).toBeTruthy();
    expect(screen.getByText('تفصيل بالمللي')).toBeTruthy();
    expect(
      screen.getByPlaceholderText('مثال: هيونداي إلنترا CN7 موديل 2022، كيا سبورتاج 2020'),
    ).toBeTruthy();
  });

  it('triggers form validation on submission when fields are empty', () => {
    render(
      <MemoryRouter>
        <PdpQuickOrderForm product={mockProduct as any} />
      </MemoryRouter>,
    );

    const submitBtn = screen.getByText('اشتر الآن');
    expect(submitBtn).toBeTruthy();
    fireEvent.click(submitBtn);

    expect(screen.getByText('يرجى إدخال الاسم بالكامل.')).toBeTruthy();
    expect(screen.getByText('يرجى إدخال رقم الهاتف.')).toBeTruthy();
  });
});
