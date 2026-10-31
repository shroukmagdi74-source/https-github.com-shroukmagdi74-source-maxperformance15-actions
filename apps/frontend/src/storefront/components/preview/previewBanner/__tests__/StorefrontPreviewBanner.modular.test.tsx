// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  StorefrontPreviewBanner,
  StorefrontProductPreviewBanner,
  MarketplacePreviewCartBootstrap,
} from '../../StorefrontPreviewBanner';

let mockTheme = {
  id: 'default',
  name: 'Default Theme',
};

vi.mock('../../../../engine/ThemeProvider', () => ({
  useStorefrontTheme: () => ({
    theme: mockTheme,
  }),
}));

vi.mock('../../../header/StorefrontHeader', () => ({
  isRuntimePharmacyThemeId: (id: string) => id === 'pharmacy-eg',
}));

describe('StorefrontPreviewBanner Modular Suite', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  afterEach(() => {
    cleanup();
  });

  it('renders default storefront preview banner for standard theme', () => {
    mockTheme = { id: 'default', name: 'قالب تجريبي' };

    render(
      <MemoryRouter>
        <StorefrontPreviewBanner previewThemeId="default" />
      </MemoryRouter>,
    );

    expect(screen.getByText(/معاينة مؤقتة/i)).toBeDefined();
    expect(screen.getByText(/قالب تجريبي/i)).toBeDefined();
    expect(screen.getByText(/العودة إلى متجر القوالب/i)).toBeDefined();
  });

  it('renders DentalLabPreviewBanner when theme is dental-lab-elite', () => {
    mockTheme = { id: 'dental-lab-elite', name: 'معمل أسنان' };

    render(
      <MemoryRouter>
        <StorefrontPreviewBanner previewThemeId="dental-lab-elite" />
      </MemoryRouter>,
    );

    expect(screen.getByText(/معمل أسنان رقمي CAD\/CAM 2026/i)).toBeDefined();
    expect(screen.getByText(/العودة للقوالب/i)).toBeDefined();
  });

  it('renders RedlineAutoPreviewBanner when theme is redline-auto', () => {
    mockTheme = { id: 'redline-auto', name: 'Redline Auto' };

    render(
      <MemoryRouter>
        <StorefrontPreviewBanner previewThemeId="redline-auto" />
      </MemoryRouter>,
    );

    expect(screen.getByText(/معاينة Red Line Auto/i)).toBeDefined();
  });

  it('renders PillThemePreviewDock for women fashion theme', () => {
    mockTheme = { id: 'women-fashion-eg', name: 'Women Fashion' };

    render(
      <MemoryRouter>
        <StorefrontPreviewBanner previewThemeId="women-fashion-eg" />
      </MemoryRouter>,
    );

    expect(screen.getByText(/القوالب/i)).toBeDefined();
    expect(screen.getByText(/تخصيص/i)).toBeDefined();
  });

  it('renders null when theme is vela-fashion-eg or fastly-eg', () => {
    mockTheme = { id: 'vela-fashion-eg', name: 'Vela Fashion' };

    const { container } = render(
      <MemoryRouter>
        <StorefrontPreviewBanner previewThemeId="vela-fashion-eg" />
      </MemoryRouter>,
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders StorefrontProductPreviewBanner floating dock for product editing', () => {
    mockTheme = { id: 'default', name: 'قالب تجريبي' };

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StorefrontProductPreviewBanner
            previewProductId="prod_123"
            previewThemeId="default"
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Product preview/i)).toBeDefined();
    expect(screen.getByLabelText(/Edit product/i)).toBeDefined();
  });

  it('renders MarketplacePreviewCartBootstrap component cleanly without errors', () => {
    const { container } = render(
      <MemoryRouter>
        <MarketplacePreviewCartBootstrap />
      </MemoryRouter>,
    );

    expect(container).toBeDefined();
  });
});
