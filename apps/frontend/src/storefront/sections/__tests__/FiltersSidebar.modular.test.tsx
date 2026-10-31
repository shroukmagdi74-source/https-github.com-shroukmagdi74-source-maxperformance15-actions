// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import FiltersSidebar from '../FiltersSidebar';
import {
  isShopIndexRoute,
  parsePriceParam,
  formatPriceRangeLabel,
  getElegantLuxePriceRangeOptions,
  getKhemetLuxePriceRangeOptions,
  resolveSidebarPriceRangeValue,
} from '../filters-sidebar/types';

// Mock dependencies
let mockCategories = [
  { id: 'cat-shoes', name: 'أحذية رياضية', slug: 'shoes' },
  { id: 'cat-shirts', name: 'قمصان', slug: 'shirts' },
];

let mockTheme = {
  id: 'default',
  name: 'Default Store',
  direction: 'rtl' as const,
};

let mockStorefrontSettings: any = {
  storefront: {
    settings: {
      currency: 'EGP',
    },
  },
};

vi.mock('../../hooks/useCategories', () => ({
  useCategories: () => ({
    categories: mockCategories,
    isLoading: false,
  }),
}));

vi.mock('../../hooks/useStorefrontSettings', () => ({
  useStorefrontSettings: () => ({
    settings: mockStorefrontSettings,
  }),
}));

vi.mock('../../engine/ThemeProvider', () => ({
  useStorefrontTheme: () => ({
    theme: mockTheme,
  }),
}));

describe('FiltersSidebar - Modular Storefront Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCategories = [
      { id: 'cat-shoes', name: 'أحذية رياضية', slug: 'shoes' },
      { id: 'cat-shirts', name: 'قمصان', slug: 'shirts' },
    ];
    mockTheme = {
      id: 'default',
      name: 'Default Store',
      direction: 'rtl' as const,
    };
    mockStorefrontSettings = {
      storefront: {
        settings: {
          currency: 'EGP',
        },
      },
    };
  });

  afterEach(() => {
    cleanup();
  });

  const renderFiltersSidebar = (props: any = {}, initialUrl = '/shop') => {
    return render(
      <MemoryRouter initialEntries={[initialUrl]}>
        <Routes>
          <Route path="/shop" element={<FiltersSidebar {...props} />} />
          <Route path="/" element={<FiltersSidebar {...props} />} />
        </Routes>
      </MemoryRouter>,
    );
  };

  describe('Pure Normalizers & Price Range Helpers', () => {
    it('isShopIndexRoute accurately identifies shop index paths', () => {
      expect(isShopIndexRoute('/shop')).toBe(true);
      expect(isShopIndexRoute('/shop/')).toBe(true);
      expect(isShopIndexRoute('/product/123')).toBe(false);
      expect(isShopIndexRoute('/cart')).toBe(false);
    });

    it('parsePriceParam parses numeric strings or returns null', () => {
      expect(parsePriceParam('1500')).toBe(1500);
      expect(parsePriceParam('0')).toBe(0);
      expect(parsePriceParam('')).toBeNull();
      expect(parsePriceParam(null)).toBeNull();
      expect(parsePriceParam('abc')).toBeNull();
    });

    it('formatPriceRangeLabel handles under, range, and over labels', () => {
      const underLabel = formatPriceRangeLabel({ maxPrice: 1000 }, 'EGP', 'ar-EG', 'rtl');
      expect(underLabel).toContain('أقل من');

      const betweenLabel = formatPriceRangeLabel(
        { minPrice: 1000, maxPrice: 2000 },
        'EGP',
        'en-US',
        'ltr',
      );
      expect(betweenLabel).toContain('-');

      const overLabel = formatPriceRangeLabel({ minPrice: 2000 }, 'EGP', 'ar-EG', 'rtl');
      expect(overLabel).toContain('أكثر من');
    });

    it('getElegantLuxePriceRangeOptions and getKhemetLuxePriceRangeOptions generate formatted lists', () => {
      const elegantOptions = getElegantLuxePriceRangeOptions('EGP', 'ar-EG', 'rtl');
      expect(elegantOptions.length).toBeGreaterThan(0);
      expect(elegantOptions[0].value).toBe('under-1500');

      const khemetOptions = getKhemetLuxePriceRangeOptions('EGP', 'ar-EG', 'rtl');
      expect(khemetOptions.length).toBeGreaterThan(0);
      expect(khemetOptions[0].value).toBe('under-2000');
    });

    it('resolveSidebarPriceRangeValue resolves matched option value', () => {
      const options = getElegantLuxePriceRangeOptions('EGP', 'ar-EG', 'rtl');
      const params = new URLSearchParams('minPrice=1500&maxPrice=3000');
      const resolved = resolveSidebarPriceRangeValue(params, options);
      expect(resolved).toBe('1500-3000');
    });
  });

  describe('Component Rendering & Behavioral Layers', () => {
    it('renders standard filter sidebar with search, sort, categories, and price', () => {
      renderFiltersSidebar({
        settings: {
          showSearch: true,
          showSort: true,
          showCategories: true,
          showPriceFilter: true,
        },
      });

      expect(screen.getByTestId('filters-sidebar')).toBeDefined();
      expect(screen.getAllByTestId('filters-sidebar-search').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('filters-sidebar-sort').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('filters-sidebar-categories').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('filters-sidebar-price').length).toBeGreaterThan(0);
    });

    it('allows searching within products', () => {
      renderFiltersSidebar({
        settings: {
          showSearch: true,
        },
      });

      const searchInputs = screen.getAllByRole('searchbox');
      expect(searchInputs.length).toBeGreaterThan(0);
      fireEvent.change(searchInputs[0], { target: { value: 'حذاء' } });
      expect((searchInputs[0] as HTMLInputElement).value).toBe('حذاء');
    });

    it('allows clicking category filters', () => {
      renderFiltersSidebar({
        settings: {
          showCategories: true,
        },
      });

      const categoryButtons = screen.getAllByText('أحذية رياضية');
      expect(categoryButtons.length).toBeGreaterThan(0);
      fireEvent.click(categoryButtons[0]);
    });

    it('renders simple catalog view when settings.simpleCatalog is true', () => {
      renderFiltersSidebar({
        settings: {
          simpleCatalog: true,
          showCategories: true,
          showPriceFilter: true,
        },
      });

      expect(screen.getByTestId('filters-simple-catalog')).toBeDefined();
    });

    it('renders mobile bar and opens mobile drawer on click', () => {
      renderFiltersSidebar({
        settings: {
          showCategories: true,
        },
      });

      const mobileBar = screen.getByTestId('filters-mobile-bar');
      expect(mobileBar).toBeDefined();

      const toggleBtn = mobileBar.querySelector('button');
      if (toggleBtn) {
        fireEvent.click(toggleBtn);
        expect(screen.getByTestId('filters-mobile-drawer')).toBeDefined();
      }
    });
  });
});
