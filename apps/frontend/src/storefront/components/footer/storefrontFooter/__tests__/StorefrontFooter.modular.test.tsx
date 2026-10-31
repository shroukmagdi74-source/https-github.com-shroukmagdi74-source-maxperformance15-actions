// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import StorefrontFooter from '../../StorefrontFooter';

let mockTheme: any = {
  id: 'default',
  name: 'Default Store',
  direction: 'rtl',
  header: { brandName: 'Default Store' },
  footer: {
    description: 'وصف المتجر التجريبي',
    copyrightText: '© 2026 جميع الحقوق محفوظة',
    navigation: [
      {
        title: 'عن المتجر',
        links: [{ label: 'من نحن', to: '/about' }],
      },
    ],
  },
};

let mockSettings: any = {
  company: { id: 'comp_1', name: 'MaxP Company' },
  storefront: { settings: { storeName: 'MaxP Shop' } },
};

vi.mock('../../../../engine/ThemeProvider', () => ({
  useStorefrontTheme: () => ({
    theme: mockTheme,
  }),
}));

vi.mock('../../../../hooks/useStorefrontSettings', () => ({
  useStorefrontSettings: () => ({
    settings: mockSettings,
  }),
}));

vi.mock('../../../GracefulFooter', () => ({
  default: () => <div data-testid="graceful-footer">Graceful Footer</div>,
}));

vi.mock('../../AutomotiveFooter', () => ({
  default: (props: any) => (
    <div data-testid="automotive-footer">Automotive Footer: {props.displayStoreName}</div>
  ),
}));

describe('StorefrontFooter Modular Suite', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders standard footer with store name and payment badges', () => {
    mockTheme = {
      id: 'default',
      name: 'Default Store',
      direction: 'rtl',
      footer: {
        description: 'وصف المتجر التجريبي',
        copyrightText: '© 2026 جميع الحقوق محفوظة',
      },
    };

    render(
      <MemoryRouter>
        <StorefrontFooter />
      </MemoryRouter>,
    );

    expect(screen.getByText(/MaxP Shop/i)).toBeDefined();
    expect(screen.getByTestId('storefront-payment-badges')).toBeDefined();
    expect(screen.getByText(/InstaPay/i)).toBeDefined();
  });

  it('renders GracefulFooter when theme is soft-graceful', () => {
    mockTheme = {
      id: 'soft-graceful',
      name: 'Soft Graceful',
      direction: 'ltr',
    };

    render(
      <MemoryRouter>
        <StorefrontFooter />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('graceful-footer')).toBeDefined();
  });

  it('renders AutomotiveFooter when theme is redline-auto', () => {
    mockTheme = {
      id: 'redline-auto',
      name: 'Redline Auto',
      direction: 'rtl',
      footer: {},
    };

    render(
      <MemoryRouter>
        <StorefrontFooter />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('automotive-footer')).toBeDefined();
  });

  it('renders MensGroomingFooter when theme is mens-grooming-pro', () => {
    mockTheme = {
      id: 'mens-grooming-pro',
      name: 'Mens Grooming Pro',
      direction: 'rtl',
      footer: {
        copyrightText: 'Mens Grooming Pro Copyright',
      },
    };

    render(
      <MemoryRouter>
        <StorefrontFooter />
      </MemoryRouter>,
    );

    expect(screen.getByText(/MaxP Shop Copyright/i)).toBeDefined();
  });

  it('renders ButcherAtelierFooter when footer variant is butcher-atelier', () => {
    mockTheme = {
      id: 'butcher-theme',
      name: 'Butcher Shop',
      direction: 'rtl',
      footer: {
        variant: 'butcher-atelier',
        description: 'أجود أنواع اللحوم الطازجة',
      },
    };

    render(
      <MemoryRouter>
        <StorefrontFooter />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Premium butcher shop/i)).toBeDefined();
    expect(screen.getByText(/أجود أنواع اللحوم الطازجة/i)).toBeDefined();
  });

  it('renders PcHubFooter when theme is pc-hub-eg', () => {
    mockTheme = {
      id: 'pc-hub-eg',
      name: 'PC Hub',
      direction: 'rtl',
      footer: {
        description: 'متجر بي سي هاب المتخصص',
      },
    };

    render(
      <MemoryRouter>
        <StorefrontFooter />
      </MemoryRouter>,
    );

    expect(screen.getByText(/العودة للأعلى/i)).toBeDefined();
    expect(screen.getByText(/متجر بي سي هاب المتخصص/i)).toBeDefined();
  });

  it('renders custom columns when globalFooter prop is provided', () => {
    mockTheme = {
      id: 'default',
      name: 'Default Store',
      direction: 'rtl',
      footer: {},
    };

    const globalFooter = {
      columns: [
        {
          title: 'خدماتنا الخاصة',
          links: [{ label: 'شحن سريع', href: '/fast-shipping' }],
        },
      ],
      copyright: 'حقوق مخصصة 2026',
      showPaymentBadges: false,
    };

    render(
      <MemoryRouter>
        <StorefrontFooter globalFooter={globalFooter} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/خدماتنا الخاصة/i)).toBeDefined();
    expect(screen.getByText(/شحن سريع/i)).toBeDefined();
    expect(screen.getByText(/حقوق مخصصة 2026/i)).toBeDefined();
    expect(screen.queryByTestId('storefront-payment-badges')).toBeNull();
  });
});
