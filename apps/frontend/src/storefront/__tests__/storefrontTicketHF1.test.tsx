// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MemoStorefrontHeader from '../components/header/StorefrontHeader';
import StorefrontFooter from '../components/footer/StorefrontFooter';
import {
  StudioHeaderFooterPanel,
  type StorefrontGlobalTokens,
} from '../studio/StudioHeaderFooterPanel';
import { StorefrontThemeProvider } from '../engine/ThemeProvider';

const MOCK_THEME: any = {
  id: 'modern-minimal',
  name: 'Modern Minimal',
  direction: 'rtl',
  header: {
    brandName: 'Default Brand',
    showSearch: true,
    navigation: [
      { label: 'الرئيسية القديمة', to: '/' },
      { label: 'المتجر القديم', to: '/shop' },
    ],
  },
  footer: {
    copyrightText: '© 2026 Default Brand. All rights reserved.',
    navigation: [
      {
        title: 'روابط المتجر',
        links: [
          { label: 'المنتجات', to: '/shop' },
        ],
      },
    ],
  },
  tokens: {
    colors: {
      primary: '#2b6cf6',
      background: '#ffffff',
      foreground: '#111827',
    },
    typography: {
      headingFont: 'Cairo',
      bodyFont: 'Cairo',
      baseSize: '16px',
    },
  },
  pages: {
    home: { sections: [] },
  },
};

const mockSearch: any = {
  query: '',
  setQuery: vi.fn(),
  results: [],
  isLoading: false,
  isOpen: false,
  setIsOpen: vi.fn(),
};

function createTestWrapper(initialTheme: any = MOCK_THEME) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <StorefrontThemeProvider initialTheme={initialTheme}>
            {children}
          </StorefrontThemeProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('Storefront Ticket HF-1: Header & Footer Studio & Runtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // 1. Backward Compatibility Test
  it('1. Backward compatibility: renders default theme header & footer cleanly when global tokens are absent', () => {
    const Wrapper = createTestWrapper();
    render(
      <Wrapper>
        <MemoStorefrontHeader search={mockSearch} />
        <StorefrontFooter />
      </Wrapper>
    );

    // Default theme name appears
    expect(screen.getAllByText('Modern Minimal').length).toBeGreaterThan(0);
  });

  // 2. Menu Navigation Update
  it('2. Menu update: changing global.header.menu updates navigation items in StorefrontHeader', () => {
    const globalHeader = {
      menu: [
        { id: '1', label: 'تسوق الآن', href: '/shop' },
        { id: '2', label: 'العروض الحصرية', href: '/sale' },
      ],
    };

    const Wrapper = createTestWrapper();
    render(
      <Wrapper>
        <MemoStorefrontHeader search={mockSearch} globalHeader={globalHeader} />
      </Wrapper>
    );

    // New labels appear
    expect(screen.getByText('تسوق الآن')).toBeTruthy();
    expect(screen.getByText('العروض الحصرية')).toBeTruthy();
    // Old theme nav is replaced by the custom global menu
    expect(screen.queryByText('الرئيسية القديمة')).toBeNull();
  });

  // 3. Footer Links Addition
  it('3. Footer links: adding links in global.footer.columns renders them in StorefrontFooter', () => {
    const globalFooter = {
      columns: [
        {
          id: 'c1',
          title: 'خدمة العملاء',
          links: [
            { label: 'سياسة الاستبدال', href: '/returns' },
            { label: 'الشحن والتوصيل', href: '/shipping' },
          ],
        },
      ],
    };

    const Wrapper = createTestWrapper();
    render(
      <Wrapper>
        <StorefrontFooter globalFooter={globalFooter} />
      </Wrapper>
    );

    expect(screen.getByText('خدمة العملاء')).toBeTruthy();
    expect(screen.getByText('سياسة الاستبدال')).toBeTruthy();
    expect(screen.getByText('الشحن والتوصيل')).toBeTruthy();
  });

  // 4. Announcement Bar Toggle & Customization
  it('4. Announcement bar: renders with custom colors when enabled, hides completely when disabled', () => {
    const enabledHeader = {
      announcement: {
        text: 'شحن مجاني لجميع الطلبات اليوم فقط!',
        bg: '#ff5500',
        fg: '#ffffff',
        enabled: true,
      },
      menu: [],
    };

    const Wrapper = createTestWrapper();
    const { rerender } = render(
      <Wrapper>
        <MemoStorefrontHeader search={mockSearch} globalHeader={enabledHeader} />
      </Wrapper>
    );

    const banner = screen.getByTestId('storefront-announcement-bar');
    expect(banner).toBeTruthy();
    expect(banner.textContent).toContain('شحن مجاني لجميع الطلبات اليوم فقط!');

    // Now disable announcement bar
    const disabledHeader = {
      announcement: {
        text: 'شحن مجاني لجميع الطلبات اليوم فقط!',
        bg: '#ff5500',
        fg: '#ffffff',
        enabled: false,
      },
      menu: [],
    };

    rerender(
      <Wrapper>
        <MemoStorefrontHeader search={mockSearch} globalHeader={disabledHeader} />
      </Wrapper>
    );

    expect(screen.queryByTestId('storefront-announcement-bar')).toBeNull();
  });

  // 5. Sticky Header Toggle
  it('5. Sticky toggle: disables sticky positioning when sticky is false', () => {
    const nonStickyHeader = {
      sticky: false,
      menu: [],
    };

    const Wrapper = createTestWrapper();
    render(
      <Wrapper>
        <MemoStorefrontHeader search={mockSearch} globalHeader={nonStickyHeader} />
      </Wrapper>
    );

    // Style tag overriding sticky or relative header is injected
    const styleTags = Array.from(document.querySelectorAll('style'));
    const hasOverride = styleTags.some((s) => s.textContent?.includes('position: relative !important'));
    expect(hasOverride).toBe(true);
  });

  // 6. Text Logo & Search Visibility
  it('6. Text logo & Search toggle: logoText replaces default store name, and showSearch=false hides search', () => {
    const customHeader = {
      logoText: 'بوتيك فينيسيا الفاخر',
      showSearch: false,
      menu: [],
    };

    const Wrapper = createTestWrapper();
    render(
      <Wrapper>
        <MemoStorefrontHeader search={mockSearch} globalHeader={customHeader} />
      </Wrapper>
    );

    // Custom logoText is displayed
    expect(screen.getByText('بوتيك فينيسيا الفاخر')).toBeTruthy();
    // Search button is hidden
    expect(screen.queryByRole('button', { name: /search|بحث/i })).toBeNull();
  });

  // 7. Payment Badges & Custom Copyright
  it('7. Payment badges & Copyright: custom copyright and payment badges toggle', () => {
    const customFooter = {
      columns: [],
      social: [],
      copyright: '© {year} جميع الحقوق محفوظة لشركة ماكس بي.',
      showPaymentBadges: true,
    };

    const Wrapper = createTestWrapper();
    const { rerender } = render(
      <Wrapper>
        <StorefrontFooter globalFooter={customFooter} />
      </Wrapper>
    );

    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`© ${currentYear} جميع الحقوق محفوظة لشركة ماكس بي`))).toBeTruthy();
    expect(screen.getByTestId('storefront-payment-badges')).toBeTruthy();

    // Disable payment badges
    rerender(
      <Wrapper>
        <StorefrontFooter globalFooter={{ ...customFooter, showPaymentBadges: false }} />
      </Wrapper>
    );

    expect(screen.queryByTestId('storefront-payment-badges')).toBeNull();
  });

  // 8. Studio Header/Footer Panel: Max Limits & Editing Actions
  it('8. StudioHeaderFooterPanel: enforces limits (menu <= 8, columns <= 4) and handles editing', () => {
    let currentTokens: Record<string, unknown> = {
      global: {
        header: {
          logoText: 'متجري',
          sticky: true,
          showSearch: true,
          announcement: { enabled: false, text: '' },
          menu: [
            { id: '1', label: 'رابط 1', href: '/1' },
            { id: '2', label: 'رابط 2', href: '/2' },
            { id: '3', label: 'رابط 3', href: '/3' },
            { id: '4', label: 'رابط 4', href: '/4' },
            { id: '5', label: 'رابط 5', href: '/5' },
            { id: '6', label: 'رابط 6', href: '/6' },
            { id: '7', label: 'رابط 7', href: '/7' },
          ],
        },
        footer: {
          columns: [
            { id: 'col1', title: 'عمود 1', links: [] },
            { id: 'col2', title: 'عمود 2', links: [] },
            { id: 'col3', title: 'عمود 3', links: [] },
            { id: 'col4', title: 'عمود 4', links: [] },
          ],
          social: [],
          copyright: '',
          showPaymentBadges: true,
        },
      },
    };

    const handleChange = vi.fn((next) => {
      currentTokens = next;
    });
    const handleClose = vi.fn();

    const { rerender } = render(
      <StudioHeaderFooterPanel
        designTokens={currentTokens}
        onChange={handleChange}
        onClose={handleClose}
      />
    );

    expect(screen.getByTestId('studio-header-footer-panel')).toBeTruthy();

    // Menu count is 7/8, add button is enabled
    const addMenuBtn = screen.getByTestId('hf-add-menu-item') as HTMLButtonElement;
    expect(addMenuBtn.disabled).toBe(false);
    fireEvent.click(addMenuBtn);
    expect(handleChange).toHaveBeenCalled();

    // Now re-render with 8 menu items
    const headerWith8 = {
      ...(currentTokens.global as any).header,
      menu: [
        ...(currentTokens.global as any).header.menu,
        { id: '8', label: 'رابط 8', href: '/8' },
      ],
    };
    currentTokens = {
      ...currentTokens,
      global: { ...(currentTokens.global as any), header: headerWith8 },
    };

    rerender(
      <StudioHeaderFooterPanel
        designTokens={currentTokens}
        onChange={handleChange}
        onClose={handleClose}
      />
    );

    // At 8 menu items, add button is disabled
    const addMenuBtn8 = screen.getByTestId('hf-add-menu-item') as HTMLButtonElement;
    expect(addMenuBtn8.disabled).toBe(true);

    // Switch to Footer tab
    fireEvent.click(screen.getByRole('button', { name: /الفوتر/i }));

    // Footer columns are already 4/4, add column button is disabled
    const addColBtn = screen.getByTestId('hf-add-column') as HTMLButtonElement;
    expect(addColBtn.disabled).toBe(true);

    // Change social link for Facebook
    const fbInput = screen.getByTestId('hf-social-facebook');
    fireEvent.change(fbInput, { target: { value: 'https://facebook.com/mystore' } });
    expect(handleChange).toHaveBeenCalled();
  });
});
