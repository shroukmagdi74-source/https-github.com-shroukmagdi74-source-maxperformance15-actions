// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MemoStorefrontHeader from '../components/header/StorefrontHeader';
import StorefrontFooter from '../components/footer/StorefrontFooter';
import { StudioHeaderFooterPanel } from '../studio/StudioHeaderFooterPanel';
import { StorefrontThemeProvider } from '../engine/ThemeProvider';
import { storefrontSettingsService } from '../../services/storefrontSettingsService';
import { fetchStorefrontSettings } from '../hooks/useStorefrontSettings';
import { apiClient } from '../../services/apiClient';
import * as storefrontApiModule from '../../utils/storefrontApi';

const MOCK_THEME: any = {
  id: 'modern-minimal',
  name: 'Modern Minimal',
  direction: 'rtl',
  header: {
    brandName: 'Default Theme Brand',
    showSearch: true,
    navigation: [
      { label: 'الرئيسية القديمة', to: '/' },
    ],
  },
  footer: {
    copyrightText: '© 2026 Default Theme. All rights reserved.',
    navigation: [],
  },
  tokens: {
    colors: {
      primary: '#2b6cf6',
      background: '#ffffff',
      foreground: '#111827',
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

describe('Ticket HF-1.1: Public Storefront Config & Header/Footer Visitor Binding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  // ─────────────────────────────────────────────────────────────
  // 1. Service: Fallback to public endpoint when visitor is unauthenticated
  // ─────────────────────────────────────────────────────────────
  it('1. storefrontSettingsService.getSettings() uses public endpoint when visitor has no auth token', async () => {
    // Ensure no token exists
    window.localStorage.removeItem('accessToken');
    window.localStorage.removeItem('token');

    const publicSettingsPayload = {
      themeId: 'modern-minimal',
      companySlug: 'my-store',
      storeName: 'متجر الزائر العام',
      designTokens: {
        global: {
          header: {
            menu: [{ id: '1', label: 'تسوق الآن', href: '/shop' }],
          },
        },
      },
    };

    const getPublicSpy = vi
      .spyOn(storefrontSettingsService, 'getPublicSettings')
      .mockResolvedValueOnce({
        success: true,
        data: publicSettingsPayload as any,
      });

    const res = await storefrontSettingsService.getSettings('company-123', { force: true });
    expect(getPublicSpy).toHaveBeenCalledWith('company-123', true);
    expect(res.data.storeName).toBe('متجر الزائر العام');
    expect((res.data.designTokens as any)?.global?.header?.menu?.[0]?.label).toBe('تسوق الآن');
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Service: Fallback to public endpoint when authed request returns 401
  // ─────────────────────────────────────────────────────────────
  it('2. storefrontSettingsService.getSettings() falls back to public endpoint on 401 Unauthorized', async () => {
    window.localStorage.setItem('accessToken', 'expired-token');

    vi.spyOn(apiClient, 'get').mockRejectedValueOnce({
      response: { status: 401, data: { message: 'Unauthorized' } },
    });

    const publicSettingsPayload = {
      themeId: 'modern-minimal',
      companySlug: 'unauth-store',
      storeName: 'متجر عام بدون دخول',
      designTokens: {
        global: {
          header: {
            logoText: 'شعار عام للزوار',
            menu: [{ id: '1', label: 'تسوق الآن', href: '/shop' }],
          },
        },
      },
    };

    const getPublicSpy = vi
      .spyOn(storefrontSettingsService, 'getPublicSettings')
      .mockResolvedValueOnce({
        success: true,
        data: publicSettingsPayload as any,
      });

    const res = await storefrontSettingsService.getSettings('company-456', { force: true });
    expect(getPublicSpy).toHaveBeenCalled();
    expect(res.data.storeName).toBe('متجر عام بدون دخول');
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Hook: fetchStorefrontSettings merges public global designTokens for unauthenticated visitor
  // ─────────────────────────────────────────────────────────────
  it('3. fetchStorefrontSettings merges public header and footer tokens into storefront settings', async () => {
    vi.spyOn(storefrontApiModule, 'storefrontFetch').mockResolvedValueOnce({
      success: true,
      data: {
        company: { id: 'c-test', name: 'Original Name' },
        storefront: {
          themeId: 'modern-minimal',
          designTokens: {
            global: {
              header: {
                sticky: true,
              },
            },
          },
        },
      },
    });

    vi.spyOn(storefrontSettingsService, 'getPublicSettings').mockResolvedValueOnce({
      success: true,
      data: {
        companyId: 'c-test',
        storeName: 'Store',
        designTokens: {
          global: {
            header: {
              logoText: 'لوجو الزوار',
              menu: [{ id: 'm1', label: 'تسوق الآن', href: '/shop' }],
            },
            footer: {
              copyright: '© 2026 حقوق الزوار محفوظة.',
            },
          },
        },
      } as any,
    });

    const result = await fetchStorefrontSettings();
    const globalHeader = (result.storefront?.designTokens as any)?.global?.header;
    const globalFooter = (result.storefront?.designTokens as any)?.global?.footer;

    expect(globalHeader.logoText).toBe('لوجو الزوار');
    expect(globalHeader.menu[0].label).toBe('تسوق الآن');
    expect(globalHeader.sticky).toBe(true); // preserved
    expect(globalFooter.copyright).toBe('© 2026 حقوق الزوار محفوظة.');
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Runtime: Unauthenticated Visitor renders custom menu "تسوق الآن" and announcement bar
  // ─────────────────────────────────────────────────────────────
  it('4. Visitor storefront renders custom header menu ("تسوق الآن") and announcement bar from public tokens', () => {
    const publicHeader = {
      logoText: 'ماكس بي ستور للزوار',
      showSearch: true,
      announcement: {
        enabled: true,
        text: 'خصم 20% لجميع زوار المتجر الجدد!',
        bg: '#000000',
        fg: '#ffffff',
      },
      menu: [
        { id: '1', label: 'تسوق الآن', href: '/shop' },
        { id: '2', label: 'أحدث المنتجات', href: '/new' },
      ],
    };

    const Wrapper = createTestWrapper();
    render(
      <Wrapper>
        <MemoStorefrontHeader search={mockSearch} globalHeader={publicHeader} />
      </Wrapper>
    );

    // Visitor sees the custom logo text and navigation menu
    expect(screen.getByText('ماكس بي ستور للزوار')).toBeTruthy();
    expect(screen.getByText('تسوق الآن')).toBeTruthy();
    expect(screen.getByText('أحدث المنتجات')).toBeTruthy();

    // Visitor sees the announcement bar
    const announcement = screen.getByTestId('storefront-announcement-bar');
    expect(announcement).toBeTruthy();
    expect(announcement.textContent).toContain('خصم 20% لجميع زوار المتجر الجدد!');
  });

  // ─────────────────────────────────────────────────────────────
  // 5. Runtime: Unauthenticated Visitor renders custom footer copyright
  // ─────────────────────────────────────────────────────────────
  it('5. Visitor storefront renders custom footer copyright and columns without auth', () => {
    const publicFooter = {
      columns: [
        {
          id: 'c1',
          title: 'روابط هامة للزائر',
          links: [{ label: 'تتبع الطلب', href: '/track' }],
        },
      ],
      copyright: '© 2026 جميع الحقوق محفوظة لمتجر ماكس بي الرسمي.',
      showPaymentBadges: true,
    };

    const Wrapper = createTestWrapper();
    render(
      <Wrapper>
        <StorefrontFooter globalFooter={publicFooter} />
      </Wrapper>
    );

    expect(screen.getByText('روابط هامة للزائر')).toBeTruthy();
    expect(screen.getByText('تتبع الطلب')).toBeTruthy();
    expect(screen.getByText('© 2026 جميع الحقوق محفوظة لمتجر ماكس بي الرسمي.')).toBeTruthy();
    expect(screen.getByTestId('storefront-payment-badges')).toBeTruthy();
  });

  // ─────────────────────────────────────────────────────────────
  // 6. Studio: Announcement text & color inputs are ALWAYS visible, even when enabled = false
  // ─────────────────────────────────────────────────────────────
  it('6. StudioHeaderFooterPanel renders announcement text and color inputs unconditionally', () => {
    let currentTokens: Record<string, unknown> = {
      global: {
        header: {
          announcement: {
            enabled: false, // OFF by default
            text: 'نص إعلان محفوظ مسبقًا',
            bg: '#ff5500',
            fg: '#ffffff',
          },
          menu: [],
        },
        footer: {
          columns: [],
          social: [],
          copyright: 'حقوق محفوظة',
        },
      },
    };

    const handleChange = vi.fn((next) => {
      currentTokens = next;
    });

    render(
      <StudioHeaderFooterPanel
        designTokens={currentTokens}
        onChange={handleChange}
        onClose={vi.fn()}
      />
    );

    // Switch is unchecked
    const enabledSwitch = screen.getByTestId('hf-announcement-enabled') as HTMLInputElement;
    expect(enabledSwitch.checked).toBe(false);

    // CRITICAL: Inputs MUST be rendered even though enabled is false!
    const textInput = screen.getByTestId('hf-announcement-text') as HTMLInputElement;
    expect(textInput).toBeTruthy();
    expect(textInput.value).toBe('نص إعلان محفوظ مسبقًا');

    const bgInput = screen.getByTestId('hf-announcement-bg') as HTMLInputElement;
    expect(bgInput).toBeTruthy();
    expect(bgInput.value).toBe('#ff5500');

    // Editing text while switch is OFF updates state cleanly
    fireEvent.change(textInput, { target: { value: 'إعلان معدل أثناء الإيقاف' } });
    expect(handleChange).toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────────────────────
  // 7. Studio: Footer copyright and column fields are rendered and editable unconditionally
  // ─────────────────────────────────────────────────────────────
  it('7. StudioHeaderFooterPanel renders footer copyright and allows direct editing', () => {
    let currentTokens: Record<string, unknown> = {
      global: {
        header: { menu: [] },
        footer: {
          columns: [],
          social: [],
          copyright: '© {year} متجرنا الأصلي',
          showPaymentBadges: true,
        },
      },
    };

    const handleChange = vi.fn((next) => {
      currentTokens = next;
    });

    render(
      <StudioHeaderFooterPanel
        designTokens={currentTokens}
        onChange={handleChange}
        onClose={vi.fn()}
      />
    );

    // Switch to Footer tab
    fireEvent.click(screen.getByRole('button', { name: /الفوتر/i }));

    const copyrightInput = screen.getByTestId('hf-copyright-text') as HTMLInputElement;
    expect(copyrightInput).toBeTruthy();
    expect(copyrightInput.value).toBe('© {year} متجرنا الأصلي');

    fireEvent.change(copyrightInput, { target: { value: '© {year} حقوق جديدة محدثة' } });
    expect(handleChange).toHaveBeenCalled();
  });
});
