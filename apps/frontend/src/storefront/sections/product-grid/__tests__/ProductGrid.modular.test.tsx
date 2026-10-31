/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProductGrid from '../../ProductGrid';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

const mockProducts = [
  {
    id: 'prod-1',
    name: 'حذاء كلاسيكي أنيق',
    slug: 'classic-shoes',
    price: 850,
    comparePrice: 1200,
    stock: 15,
    images: [{ url: 'https://example.com/shoe.jpg' }],
    category: { id: 'cat-1', name: 'أحذية' },
  },
  {
    id: 'prod-2',
    name: 'حقيبة يد جلدية',
    slug: 'leather-bag',
    price: 1200,
    comparePrice: 1500,
    stock: 5,
    images: [{ url: 'https://example.com/bag.jpg' }],
    category: { id: 'cat-2', name: 'حقائب' },
  },
];

let mockProductsState: {
  products: any[];
  isLoading: boolean;
  error: any;
  pagination: any;
} = {
  products: mockProducts,
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 12, total: 2, pages: 1 },
};

vi.mock('../../../engine/ThemeProvider', () => ({
  useStorefrontTheme: () => ({
    theme: {
      id: 'default',
      direction: 'rtl',
      tokens: { colors: { primary: '220 90% 50%' } },
    },
  }),
}));

vi.mock('../../../hooks/useStorefrontSettings', () => ({
  useStorefrontSettings: () => ({
    settings: {
      company: { id: 'comp-1', currency: 'EGP' },
      storefront: {
        settings: {
          currency: 'EGP',
        },
      },
    },
  }),
}));

vi.mock('../../../hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [
      { id: 'cat-1', name: 'أحذية', slug: 'shoes' },
      { id: 'cat-2', name: 'حقائب', slug: 'bags' },
    ],
    isLoading: false,
  }),
}));

vi.mock('../../../hooks/useProducts', () => ({
  useProducts: () => mockProductsState,
}));

describe('ProductGrid Modular Component', () => {
  afterEach(() => {
    cleanup();
    mockProductsState = {
      products: mockProducts,
      isLoading: false,
      error: null,
      pagination: { page: 1, limit: 12, total: 2, pages: 1 },
    };
  });

  it('renders standard product grid with products', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/']}>
        <ProductGrid settings={{ title: 'أحدث التشكيلات' }} />
      </MemoryRouter>
    );

    expect(screen.getByText('أحدث التشكيلات')).toBeTruthy();
    expect(screen.getByText('حذاء كلاسيكي أنيق')).toBeTruthy();
    expect(screen.getByText('حقيبة يد جلدية')).toBeTruthy();
  });

  it('renders loading skeleton when isLoading is true', () => {
    mockProductsState = {
      products: [],
      isLoading: true,
      error: null,
      pagination: { page: 1, limit: 12, total: 0, pages: 0 },
    };

    const { container } = renderWithProviders(
      <MemoryRouter initialEntries={['/']}>
        <ProductGrid settings={{ title: 'جاري التحميل' }} />
      </MemoryRouter>
    );

    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders error state when error occurs', () => {
    mockProductsState = {
      products: [],
      isLoading: false,
      error: new Error('Network Connection Error'),
      pagination: { page: 1, limit: 12, total: 0, pages: 0 },
    };

    renderWithProviders(
      <MemoryRouter initialEntries={['/']}>
        <ProductGrid settings={{ title: 'أحدث المنتجات' }} />
      </MemoryRouter>
    );

    expect(screen.getByText('Failed to Load Products')).toBeTruthy();
    expect(screen.getByText('Network Connection Error')).toBeTruthy();
  });

  it('renders empty state when no products found', () => {
    mockProductsState = {
      products: [],
      isLoading: false,
      error: null,
      pagination: { page: 1, limit: 12, total: 0, pages: 0 },
    };

    renderWithProviders(
      <MemoryRouter initialEntries={['/']}>
        <ProductGrid
          settings={{
            title: 'المنتجات',
            emptyStateTitle: 'لا توجد منتجات حالياً',
            emptyStateDescription: 'جرب البحث بكلمات أخرى',
            clearButtonText: 'إعادة ضبط الفلاتر',
          }}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('لا توجد منتجات حالياً')).toBeTruthy();
    expect(screen.getByText('جرب البحث بكلمات أخرى')).toBeTruthy();
    expect(screen.getByText('إعادة ضبط الفلاتر')).toBeTruthy();
  });

  it('renders butcher atelier variant correctly', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/']}>
        <ProductGrid
          settings={{
            title: 'تقطيعات اللحم الفاخرة',
            variant: 'butcher-atelier-grid',
          }}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('BLACK LABEL')).toBeTruthy();
    expect(screen.getByText('تقطيعات اللحم الفاخرة')).toBeTruthy();
    expect(screen.getByText('حذاء كلاسيكي أنيق')).toBeTruthy();
  });

  it('renders pagination bar when pages > 1', () => {
    mockProductsState = {
      products: mockProducts,
      isLoading: false,
      error: null,
      pagination: { page: 1, limit: 2, total: 6, pages: 3 },
    };

    renderWithProviders(
      <MemoryRouter initialEntries={['/shop?page=1']}>
        <ProductGrid settings={{ title: 'المتجر' }} />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('صفحات المنتجات')).toBeTruthy();
    expect(screen.getByText('التالي')).toBeTruthy();
  });
});

