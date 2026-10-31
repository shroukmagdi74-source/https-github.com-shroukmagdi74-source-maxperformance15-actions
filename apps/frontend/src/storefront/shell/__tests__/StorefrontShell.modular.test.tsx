/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StorefrontShell, {
  shouldStorefrontHeaderForceDocumentNavigation,
  resolveStorefrontPageLayout,
  StorefrontSectionFrame,
} from '../../StorefrontShell';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

let mockSettingsState: {
  settings: any;
  isLoading: boolean;
  error: any;
  previewThemeId?: string | null;
} = {
  settings: {
    companyId: 'comp-100',
    company: { id: 'comp-100', name: 'Test Store' },
    storefront: {
      id: 'default',
      pages: {
        home: { sections: [] },
        shop: { sections: [] },
      },
    },
    storefrontSettings: {},
  },
  isLoading: false,
  error: null,
  previewThemeId: null,
};

vi.mock('../../hooks/useStorefrontSettings', () => ({
  useStorefrontSettings: () => mockSettingsState,
}));

vi.mock('../../hooks/useCategories', () => ({
  useCategories: () => ({ categories: [], isLoading: false }),
}));

vi.mock('../../pages/ProductImageLandingPage', () => ({
  default: () => <div data-testid="landing-page-component">Product Image Landing Page</div>,
}));

vi.mock('../../pages/FunnelCodSalesPage', () => ({
  default: () => <div data-testid="funnel-page-component">Funnel COD Sales Page</div>,
}));

vi.mock('../../engine/ThemeProvider', () => ({
  StorefrontThemeProvider: ({ children }: any) => <div data-testid="theme-provider">{children}</div>,
  useStorefrontTheme: () => ({
    theme: {
      id: 'default',
      direction: 'rtl',
      tokens: {},
      pages: {
        home: { sections: [] },
      },
    },
  }),
}));

vi.mock('../../components/header/StorefrontHeader', () => ({
  default: () => <header data-testid="storefront-header">Storefront Header</header>,
  StorefrontHomeLink: () => <a href="/">Home</a>,
  resolveStorefrontDocumentLanguage: () => 'ar',
  parsePositiveNumber: (val: any) => Number(val) || 0,
  ARABIC_SCRIPT_PATTERN: /[\u0600-\u06FF]/,
  isRuntimePharmacyThemeId: () => false,
}));

vi.mock('../../components/footer/StorefrontFooter', () => ({
  default: () => <footer data-testid="storefront-footer">Storefront Footer</footer>,
}));

describe('StorefrontShell Modular Component', () => {
  afterEach(() => {
    cleanup();
    mockSettingsState = {
      settings: {
        companyId: 'comp-100',
        company: { id: 'comp-100', name: 'Test Store' },
        storefront: {
          id: 'default',
          pages: {
            home: { sections: [] },
            shop: { sections: [] },
          },
        },
        storefrontSettings: {},
      },
      isLoading: false,
      error: null,
      previewThemeId: null,
    };
  });

  it('preserves named exports', () => {
    expect(shouldStorefrontHeaderForceDocumentNavigation).toBeDefined();
    expect(resolveStorefrontPageLayout).toBeDefined();
    expect(StorefrontSectionFrame).toBeDefined();
  });

  it('renders loading skeleton when settings are loading', () => {
    mockSettingsState = {
      settings: null,
      isLoading: true,
      error: null,
    };

    const { container } = renderWithProviders(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontShell />
      </MemoryRouter>
    );

    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy();
  });

  it('renders error screen when error occurs', () => {
    mockSettingsState = {
      settings: null,
      isLoading: false,
      error: new Error('Failed to fetch storefront settings'),
    };

    renderWithProviders(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontShell />
      </MemoryRouter>
    );

    expect(screen.getByText('Error Loading Storefront')).toBeTruthy();
    expect(screen.getByText('Try Again')).toBeTruthy();
  });

  it('renders standalone product image landing page on /lp/:id route', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/lp/test-landing-123']}>
        <StorefrontShell />
      </MemoryRouter>
    );

    expect(screen.getByTestId('landing-page-component')).toBeTruthy();
  });

  it('renders standalone funnel page on /funnel/:slug route', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/funnel/summer-sale']}>
        <StorefrontShell />
      </MemoryRouter>
    );

    expect(screen.getByTestId('funnel-page-component')).toBeTruthy();
  });

  it('renders standard storefront shell with theme provider and header', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontShell />
      </MemoryRouter>
    );

    expect(screen.getByTestId('theme-provider')).toBeTruthy();
    expect(screen.getByTestId('storefront-header')).toBeTruthy();
  });
});
